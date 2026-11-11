# Supplementary Pointers Revisited demos: make, make run, make clean
CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = pass_by_value array_arithmetic void_pointer pointer_declarations \
           matrix_arguments function_callbacks complex_declarations

all: $(PROGRAMS)

%: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $< $(LDFLAGS) $(LDLIBS) -o $@

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n=== %s ===\n' "$$program"; \
		./$$program; \
	done

clean:
	rm -f $(PROGRAMS)
	rm -rf $(PROGRAMS:=.dSYM)

.PHONY: all run clean
