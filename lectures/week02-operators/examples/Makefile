# Week 02 lecture examples
#   make          build every example
#   make clean    remove the executables
#
# precedence_traps.c is built by hand on purpose (see the comment in the file).

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = pointer_exprs arith_logic bit_flags macro_parens

all: $(PROGRAMS)

pointer_exprs: pointer_exprs.c
	$(CC) $(CFLAGS) pointer_exprs.c -o pointer_exprs

arith_logic: arith_logic.c
	$(CC) $(CFLAGS) arith_logic.c -o arith_logic

bit_flags: bit_flags.c
	$(CC) $(CFLAGS) bit_flags.c -o bit_flags

macro_parens: macro_parens.c
	$(CC) $(CFLAGS) macro_parens.c -o macro_parens

clean:
	rm -rf $(PROGRAMS) precedence_traps *.dSYM

.PHONY: all clean
