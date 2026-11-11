# Week 06 lecture examples
#   make                     build every example
#   make run                 run every example without interactive input
#   make container_of_demo.i see the preprocessor output (macros expanded)
#   make clean               remove the executables and .i files

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = layout pointer_arith container_of_demo list_macros \
           byte_representation bitfield_layout

all: $(PROGRAMS)

layout: layout.c
	$(CC) $(CFLAGS) layout.c -o layout

pointer_arith: pointer_arith.c
	$(CC) $(CFLAGS) pointer_arith.c -o pointer_arith

container_of_demo: container_of_demo.c
	$(CC) $(CFLAGS) container_of_demo.c -o container_of_demo

list_macros: list_macros.c
	$(CC) $(CFLAGS) list_macros.c -o list_macros

byte_representation: byte_representation.c
	$(CC) $(CFLAGS) byte_representation.c -o byte_representation

bitfield_layout: bitfield_layout.c
	$(CC) $(CFLAGS) bitfield_layout.c -o bitfield_layout

container_of_demo.i: container_of_demo.c
	$(CC) -E container_of_demo.c -o container_of_demo.i

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n=== %s ===\n' "$$program"; \
		./$$program; \
	done

clean:
	rm -rf $(PROGRAMS) container_of_demo.i *.dSYM

.PHONY: all run clean
