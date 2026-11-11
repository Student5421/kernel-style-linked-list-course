# Week 01 lecture examples
#   make              build the core demos and both PDF supplements
#   make supplements  build only the PDF supplements
#   make run          build and run every example
#   make clean        remove the executables in all three directories
#
# warnings.c is built by hand on purpose (see the comment in the file).

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = struct_basics pointer_basics struct_pointer

all: $(PROGRAMS) supplements

struct_basics: struct_basics.c
	$(CC) $(CFLAGS) struct_basics.c -o struct_basics

pointer_basics: pointer_basics.c
	$(CC) $(CFLAGS) pointer_basics.c -o pointer_basics

struct_pointer: struct_pointer.c
	$(CC) $(CFLAGS) struct_pointer.c -o struct_pointer

supplements:
	$(MAKE) -C pointers-revisited
	$(MAKE) -C structures-unions-enums

run: all
	./struct_basics
	./pointer_basics
	./struct_pointer
	$(MAKE) -C pointers-revisited run
	$(MAKE) -C structures-unions-enums run

clean:
	$(MAKE) -C pointers-revisited clean
	$(MAKE) -C structures-unions-enums clean
	rm -rf $(PROGRAMS) warnings *.dSYM

.PHONY: all supplements run clean
