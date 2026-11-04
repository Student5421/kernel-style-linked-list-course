# Week 05 lecture examples
#   make          build every example
#   make clean    remove the executables

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = dll_book

all: $(PROGRAMS)

dll_book: dll_book.c
	$(CC) $(CFLAGS) dll_book.c -o dll_book

clean:
	rm -rf $(PROGRAMS) *.dSYM

.PHONY: all clean
