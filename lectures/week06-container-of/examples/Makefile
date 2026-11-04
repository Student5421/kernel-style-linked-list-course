# Week 06 lecture examples
#   make                     build every example
#   make container_of_demo.i see the preprocessor output (macros expanded)
#   make clean               remove the executables and .i files

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = layout pointer_arith container_of_demo list_macros

all: $(PROGRAMS)

layout: layout.c
	$(CC) $(CFLAGS) layout.c -o layout

pointer_arith: pointer_arith.c
	$(CC) $(CFLAGS) pointer_arith.c -o pointer_arith

container_of_demo: container_of_demo.c
	$(CC) $(CFLAGS) container_of_demo.c -o container_of_demo

list_macros: list_macros.c
	$(CC) $(CFLAGS) list_macros.c -o list_macros

container_of_demo.i: container_of_demo.c
	$(CC) -E container_of_demo.c -o container_of_demo.i

clean:
	rm -rf $(PROGRAMS) container_of_demo.i *.dSYM

.PHONY: all clean
