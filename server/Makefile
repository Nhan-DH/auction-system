CC = gcc
CFLAGS = -Wall -Wextra -O2 -Isrc
LDFLAGS = -lm

SRC = src/main.c \
      src/server.c \
      src/network/message.c \
      src/utils/cJSON.c

OBJ = $(SRC:.c=.o)
TARGET = auction_server

all: $(TARGET)

$(TARGET): $(OBJ)
	$(CC) $(OBJ) -o $@ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ) $(TARGET)

.PHONY: all clean
