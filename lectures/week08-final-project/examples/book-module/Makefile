# Complete header dependencies, alongside the intentionally incomplete stats demo.
CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGET = book_demo
OBJS = main.o book.o report.o

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $(OBJS) $(LDLIBS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

main.o: main.c book.h report.h
book.o: book.c book.h
report.o: report.c report.h book.h

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(OBJS) $(TARGET)
	rm -rf $(TARGET).dSYM

.PHONY: all run clean
