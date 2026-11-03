# Week 04 lecture examples
#   make          build every example
#   make clean    remove the executables

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = sll_manual sll_book

all: $(PROGRAMS)

sll_manual: sll_manual.c
	$(CC) $(CFLAGS) sll_manual.c -o sll_manual

sll_book: sll_book.c
	$(CC) $(CFLAGS) sll_book.c -o sll_book

clean:
	rm -rf $(PROGRAMS) *.dSYM

.PHONY: all clean
