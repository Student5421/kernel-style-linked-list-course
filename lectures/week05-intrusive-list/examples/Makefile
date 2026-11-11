# Week 05 lecture examples
#   make          build every example
#   make run      run every safe example with fixed input
#   make clean    remove the executables

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = first_member intrusive_book multi_list borrowed_catalog

all: $(PROGRAMS)

first_member: first_member.c
	$(CC) $(CFLAGS) first_member.c -o first_member

intrusive_book: intrusive_book.c
	$(CC) $(CFLAGS) intrusive_book.c -o intrusive_book

multi_list: multi_list.c
	$(CC) $(CFLAGS) multi_list.c -o multi_list

borrowed_catalog: borrowed_catalog.c
	$(CC) $(CFLAGS) borrowed_catalog.c -o borrowed_catalog

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n=== %s ===\n' "$$program"; \
		./$$program; \
	done

clean:
	rm -rf $(PROGRAMS) *.dSYM

.PHONY: all run clean
