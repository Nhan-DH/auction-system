#ifndef SERVER_H
#define SERVER_H

#define DEFAULT_PORT 5000
#define BACKLOG 20

typedef struct {
    int port;
} ServerConfig;

/**
 * Khởi tạo socket và chạy event loop dùng select() I/O Multiplexing
 */
int start_server(const ServerConfig *config);

#endif // SERVER_H
