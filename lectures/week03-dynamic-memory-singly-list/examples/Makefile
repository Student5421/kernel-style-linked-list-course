# Week 03 lecture examples
#   make          build every example
#   make clean    remove the executables
#
# dangling_local.c is built by hand on purpose (see the comment in the file).

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = memory_map malloc_basics book_factory sll_manual sll_book

all: $(PROGRAMS)

memory_map: memory_map.c
	$(CC) $(CFLAGS) memory_map.c -o memory_map

malloc_basics: malloc_basics.c
	$(CC) $(CFLAGS) malloc_basics.c -o malloc_basics

book_factory: book_factory.c
	$(CC) $(CFLAGS) book_factory.c -o book_factory

sll_manual: sll_manual.c
	$(CC) $(CFLAGS) sll_manual.c -o sll_manual

sll_book: sll_book.c
	$(CC) $(CFLAGS) sll_book.c -o sll_book

clean:
	rm -rf $(PROGRAMS) dangling_local *.dSYM

.PHONY: all clean
