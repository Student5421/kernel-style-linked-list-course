# Week 08 demo: the same shape as the final project's starter Makefile.

CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGET = stats_demo

SRCS = main.c stats.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET) preprocessor_demo book-module

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Header dependencies. While this line is commented out,
# editing stats.h does NOT rebuild anything. Uncomment it to fix that.
# main.o stats.o: stats.h

preprocessor_demo: preprocessor_demo.c
	$(CC) $(CFLAGS) preprocessor_demo.c -o preprocessor_demo

book-module:
	$(MAKE) -C book-module all

run: all
	./$(TARGET) < numbers.txt
	./preprocessor_demo
	$(MAKE) -C book-module run

clean:
	rm -rf $(OBJS) $(TARGET) preprocessor_demo preprocessor_demo.i *.dSYM
	$(MAKE) -C book-module clean

.PHONY: all run clean book-module
