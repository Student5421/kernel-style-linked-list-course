# Week 01 lecture examples
#   make          build every example
#   make clean    remove the executables
#
# warnings.c is built by hand on purpose (see the comment in the file).

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = struct_basics pointer_basics struct_pointer

all: $(PROGRAMS)

struct_basics: struct_basics.c
	$(CC) $(CFLAGS) struct_basics.c -o struct_basics

pointer_basics: pointer_basics.c
	$(CC) $(CFLAGS) pointer_basics.c -o pointer_basics

struct_pointer: struct_pointer.c
	$(CC) $(CFLAGS) struct_pointer.c -o struct_pointer

clean:
	rm -rf $(PROGRAMS) warnings *.dSYM

.PHONY: all clean
