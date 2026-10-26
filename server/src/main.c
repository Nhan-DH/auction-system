#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include "server.h"

int main(int argc, char *argv[]) {
    // Bỏ qua SIGPIPE để tránh server bị crash khi client bất ngờ ngắt socket khi server đang send
    signal(SIGPIPE, SIG_IGN);

    ServerConfig config;
    config.port = DEFAULT_PORT;

    if (argc >= 2) {
        config.port = atoi(argv[1]);
        if (config.port <= 0 || config.port > 65535) {
            fprintf(stderr, "Port khong hop le: %s. Su dung port mac dinh: %d\n", argv[1], DEFAULT_PORT);
            config.port = DEFAULT_PORT;
        }
    }

    if (start_server(&config) != 0) {
        fprintf(stderr, "Server ket thuc voi loi.\n");
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
