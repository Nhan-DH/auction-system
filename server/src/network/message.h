#ifndef MESSAGE_H
#define MESSAGE_H

#include <stdint.h>
#include "../utils/cJSON.h"

/**
 * Gửi chính xác n bytes qua socket (xử lý buffer đầy / partial write)
 */
int send_exact(int sockfd, const char *buf, int n);

/**
 * Đọc chính xác n bytes từ socket (xử lý xé gói / partial read)
 */
int recv_exact(int sockfd, char *buf, int n);

/**
 * Gửi một message hoàn chỉnh qua socket theo định dạng:
 * [4 bytes length (uint32_t Network Byte Order)][JSON string]
 */
int send_message(int sockfd, const char *json_str);

/**
 * Đọc một message hoàn chỉnh từ socket.
 * Trả về chuỗi JSON (đã kết thúc bằng '\0'). Caller phải gọi free() sau khi dùng xong.
 * Trả về NULL nếu client ngắt kết nối hoặc có lỗi.
 */
char* recv_message(int sockfd);

/**
 * Tiện ích gửi nhanh phản hồi JSON dạng:
 * { "action": action, "status": status, "message": message, "data": data }
 */
int send_json_response(int sockfd, const char *action, const char *status, const char *message, cJSON *data);

#endif // MESSAGE_H
