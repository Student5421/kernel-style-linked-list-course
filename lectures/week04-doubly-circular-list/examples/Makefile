# Week 04 lecture examples
#   make          build every example
#   make run      run every safe example with fixed input
#   make clean    remove the executables

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = dll_book clist_book invariant_modes

all: $(PROGRAMS)

dll_book: dll_book.c
	$(CC) $(CFLAGS) dll_book.c -o dll_book

clist_book: clist_book.c
	$(CC) $(CFLAGS) clist_book.c -o clist_book

invariant_modes: invariant_modes.c
	$(CC) $(CFLAGS) invariant_modes.c -o invariant_modes

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n=== %s ===\n' "$$program"; \
		./$$program; \
	done

clean:
	rm -rf $(PROGRAMS) *.dSYM

.PHONY: all run clean
