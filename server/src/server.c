#include "server.h"
#include "network/message.h"
#include "utils/cJSON.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <time.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/select.h>

/**
 * Xử lý yêu cầu nghiệp vụ nhận được từ client
 */
static void handle_client_request(int client_fd, const char *raw_json) {
    cJSON *json = cJSON_Parse(raw_json);
    if (!json) {
        fprintf(stderr, "[WARN] JSON parse error tu fd=%d: %s\n", client_fd, raw_json);
        send_json_response(client_fd, "ERROR", "FAIL", "Invalid JSON format", NULL);
        return;
    }

    cJSON *action_item = cJSON_GetObjectItem(json, "action");
    const char *action = action_item ? action_item->valuestring : "";

    printf("[DISPATCH] client_fd=%d, action=%s\n", client_fd, action);

    if (strcmp(action, "PING") == 0) {
        // Phản hồi PONG để kiểm tra thông mạng
        cJSON *data = cJSON_CreateObject();
        cJSON_AddNumberToObject(data, "server_time", (double)time(NULL));
        cJSON_AddStringToObject(data, "client_socket", "connected");
        send_json_response(client_fd, "PONG", "OK", "Server is alive and healthy!", data);
    } else {
        // Các action khác (sẽ mở rộng sang auth_handler, room_handler, ...)
        cJSON *data = cJSON_CreateObject();
        cJSON_AddStringToObject(data, "received_action", action);
        send_json_response(client_fd, "RESPONSE", "OK", "Action received by C Server", data);
    }

    cJSON_Delete(json);
}

int start_server(const ServerConfig *config) {
    int server_fd, new_fd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    int opt = 1;

    // 1. Tạo TCP Socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("[FATAL] socket() failed");
        return -1;
    }

    // 2. SO_REUSEADDR cho phép tái sử dụng port ngay lập tức khi restart server
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("[WARN] setsockopt(SO_REUSEADDR) failed");
    }

    // 3. Bind địa chỉ & port
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // Lắng nghe trên mọi interface
    server_addr.sin_port = htons(config->port);

    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("[FATAL] bind() failed");
        close(server_fd);
        return -1;
    }

    // 4. Listen
    if (listen(server_fd, BACKLOG) < 0) {
        perror("[FATAL] listen() failed");
        close(server_fd);
        return -1;
    }

    printf("=====================================================\n");
    printf("  AUCTION C SERVER (I/O Multiplexing - select())\n");
    printf("  Port: %d\n", config->port);
    printf("  Listening for incoming TCP connections...\n");
    printf("=====================================================\n");

    // 5. Khởi tạo fd_set cho select()
    fd_set master_fds;
    fd_set read_fds;
    FD_ZERO(&master_fds);
    FD_ZERO(&read_fds);

    FD_SET(server_fd, &master_fds);
    int max_fd = server_fd;

    // 6. Main Event Loop
    while (1) {
        read_fds = master_fds; // Sao chép tập fds vì select() sẽ làm biến đổi read_fds

        // Cài đặt timeout 1 giây cho select (dùng để đếm ngược timer đấu giá)
        struct timeval timeout;
        timeout.tv_sec = 1;
        timeout.tv_usec = 0;

        int activity = select(max_fd + 1, &read_fds, NULL, NULL, &timeout);

        if (activity < 0) {
            if (errno == EINTR) continue; // Bị ngắt bởi signal, tiếp tục vòng lặp
            perror("[ERROR] select() failed");
            break;
        }

        // --- Hook cập nhật Timer đấu giá mỗi 1 giây ---
        // (Sẽ gọi check_auction_timers() ở các bước sau)

        if (activity == 0) {
            // Hết 1 giây mà không có socket nào có sự kiện I/O
            continue;
        }

        // Duyệt qua các socket để tìm socket có dữ liệu
        for (int i = 0; i <= max_fd; i++) {
            if (!FD_ISSET(i, &read_fds)) continue;

            // TRƯỜNG HỢP 1: Có kết nối mới từ Client
            if (i == server_fd) {
                new_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
                if (new_fd < 0) {
                    perror("[ERROR] accept() failed");
                    continue;
                }

                char client_ip[INET_ADDRSTRLEN];
                inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, sizeof(client_ip));
                printf("[NEW CLIENT] Ket noi moi tu %s:%d -> fd=%d\n", client_ip, ntohs(client_addr.sin_port), new_fd);

                FD_SET(new_fd, &master_fds);
                if (new_fd > max_fd) {
                    max_fd = new_fd;
                }
            }
            // TRƯỜNG HỢP 2: Client cũ gửi dữ liệu đến
            else {
                // Đọc message hoàn chỉnh bằng cơ chế xử lý truyền dòng
                char *msg = recv_message(i);

                if (msg == NULL) {
                    // Client ngắt kết nối hoặc có lỗi socket
                    printf("[DISCONNECT] Client fd=%d da ngat ket noi\n", i);
                    close(i);
                    FD_CLR(i, &master_fds);

                    // Thu gọn max_fd nếu socket vừa đóng chính là max_fd
                    if (i == max_fd) {
                        while (max_fd > server_fd && !FD_ISSET(max_fd, &master_fds)) {
                            max_fd--;
                        }
                    }
                } else {
                    printf("[RECV fd=%d] %s\n", i, msg);
                    handle_client_request(i, msg);
                    free(msg); // Giải phóng chuỗi đã malloc trong recv_message
                }
            }
        }
    }

    close(server_fd);
    return 0;
}
