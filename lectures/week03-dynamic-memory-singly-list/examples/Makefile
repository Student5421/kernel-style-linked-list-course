# Week 03 lecture examples
#   make          build every example
#   make run      run every safe example with fixed input
#   make clean    remove the executables
#
# dangling_local.c is built by hand on purpose (see the comment in the file).

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = memory_map malloc_basics book_factory sll_manual sll_book \
           realloc_catalog dynamic_matrix owned_title

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

realloc_catalog: realloc_catalog.c
	$(CC) $(CFLAGS) realloc_catalog.c -o realloc_catalog

dynamic_matrix: dynamic_matrix.c
	$(CC) $(CFLAGS) dynamic_matrix.c -o dynamic_matrix

owned_title: owned_title.c
	$(CC) $(CFLAGS) owned_title.c -o owned_title

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n=== %s ===\n' "$$program"; \
		./$$program; \
	done

clean:
	rm -rf $(PROGRAMS) dangling_local *.dSYM

.PHONY: all run clean
