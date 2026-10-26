#include "message.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#define MAX_PAYLOAD_SIZE (10 * 1024 * 1024) // Giới hạn 10MB phòng chống DoS

int send_exact(int sockfd, const char *buf, int n) {
    int total_sent = 0;
    while (total_sent < n) {
        int sent = send(sockfd, buf + total_sent, n - total_sent, 0);
        if (sent <= 0) {
            return -1; // Socket đóng hoặc lỗi mạng
        }
        total_sent += sent;
    }
    return total_sent;
}

int recv_exact(int sockfd, char *buf, int n) {
    int total_recvd = 0;
    while (total_recvd < n) {
        int recvd = recv(sockfd, buf + total_recvd, n - total_recvd, 0);
        if (recvd <= 0) {
            return -1; // Client ngắt kết nối hoặc lỗi
        }
        total_recvd += recvd;
    }
    return total_recvd;
}

int send_message(int sockfd, const char *json_str) {
    if (!json_str) return -1;

    uint32_t len = (uint32_t)strlen(json_str);
    uint32_t net_len = htonl(len); // Chuyển sang Big-Endian (Network Byte Order)

    // Bước 1: Gửi 4 bytes độ dài (Framing Header)
    if (send_exact(sockfd, (const char *)&net_len, 4) < 0) {
        return -1;
    }

    // Bước 2: Gửi toàn bộ nội dung JSON
    if (send_exact(sockfd, json_str, len) < 0) {
        return -1;
    }

    return 0;
}

char* recv_message(int sockfd) {
    uint32_t net_len = 0;

    // Bước 1: Đọc chính xác 4 bytes độ dài từ stream
    if (recv_exact(sockfd, (char *)&net_len, 4) <= 0) {
        return NULL; // Client ngắt kết nối hoặc lỗi
    }

    uint32_t payload_len = ntohl(net_len); // Chuyển về Host Byte Order

    if (payload_len == 0 || payload_len > MAX_PAYLOAD_SIZE) {
        fprintf(stderr, "[ERROR] Payload size khong hop le: %u bytes\n", payload_len);
        return NULL;
    }

    // Bước 2: Cấp phát bộ nhớ đủ để chứa payload + null terminator
    char *payload = (char *)malloc(payload_len + 1);
    if (!payload) {
        perror("[ERROR] Malloc that bai");
        return NULL;
    }

    // Bước 3: Đọc chính xác payload_len bytes
    if (recv_exact(sockfd, payload, payload_len) <= 0) {
        free(payload);
        return NULL;
    }

    payload[payload_len] = '\0';
    return payload;
}

int send_json_response(int sockfd, const char *action, const char *status, const char *message, cJSON *data) {
    cJSON *root = cJSON_CreateObject();
    if (!root) return -1;

    cJSON_AddStringToObject(root, "action", action ? action : "RESPONSE");
    cJSON_AddStringToObject(root, "status", status ? status : "OK");
    if (message) {
        cJSON_AddStringToObject(root, "message", message);
    }
    if (data) {
        cJSON_AddItemToObject(root, "data", data);
    }

    char *json_str = cJSON_PrintUnformatted(root);
    int ret = -1;
    if (json_str) {
        ret = send_message(sockfd, json_str);
        free(json_str);
    }
    cJSON_Delete(root);
    return ret;
}
