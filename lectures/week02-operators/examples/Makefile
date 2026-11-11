# Week 02 lecture examples
#   make          build every example
#   make run      run every example with fixed, noninteractive arguments
#   make clean    remove the executables
#
# precedence_traps.c is built by hand on purpose (see the comment in the file).

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = pointer_exprs arith_logic bit_flags macro_parens \
           string_storage string_capacity string_search string_scan_argv packed_book_flags

all: $(PROGRAMS)

pointer_exprs: pointer_exprs.c
	$(CC) $(CFLAGS) pointer_exprs.c -o pointer_exprs

arith_logic: arith_logic.c
	$(CC) $(CFLAGS) arith_logic.c -o arith_logic

bit_flags: bit_flags.c
	$(CC) $(CFLAGS) bit_flags.c -o bit_flags

macro_parens: macro_parens.c
	$(CC) $(CFLAGS) macro_parens.c -o macro_parens

string_storage: string_storage.c
	$(CC) $(CFLAGS) string_storage.c -o string_storage

string_capacity: string_capacity.c
	$(CC) $(CFLAGS) string_capacity.c -o string_capacity

string_search: string_search.c
	$(CC) $(CFLAGS) string_search.c -o string_search

string_scan_argv: string_scan_argv.c
	$(CC) $(CFLAGS) string_scan_argv.c -o string_scan_argv

packed_book_flags: packed_book_flags.c
	$(CC) $(CFLAGS) packed_book_flags.c -o packed_book_flags

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n=== %s ===\n' "$$program"; \
		if [ "$$program" = string_scan_argv ]; then \
			./$$program 'C Programming 2' '' 'Linux 6'; \
		else \
			./$$program; \
		fi; \
	done

clean:
	rm -rf $(PROGRAMS) precedence_traps *.dSYM

.PHONY: all run clean
