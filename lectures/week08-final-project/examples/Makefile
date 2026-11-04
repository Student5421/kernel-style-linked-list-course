# Week 08 demo: the same shape as the final project's starter Makefile.

CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGET = stats_demo

SRCS = main.c stats.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Header dependencies. While this line is commented out,
# editing stats.h does NOT rebuild anything. Uncomment it to fix that.
# main.o stats.o: stats.h

run: $(TARGET)
	./$(TARGET) < numbers.txt

clean:
	rm -rf $(OBJS) $(TARGET) *.dSYM

.PHONY: all run clean
