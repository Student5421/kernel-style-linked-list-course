# Supplementary examples from Structures, Unions and Enums.
CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = struct_values nested_catalog dynamic_struct_copy union_storage \
           enum_status tagged_union

all: $(PROGRAMS)

%: %.c
	$(CC) $(CFLAGS) $< -o $@

run: all
	@set -e; for program in $(PROGRAMS); do \
		printf '\n== %s ==\n' "$$program"; \
		./$$program; \
	done

clean:
	rm -f $(PROGRAMS)
	rm -rf $(PROGRAMS:=.dSYM)

.PHONY: all run clean
