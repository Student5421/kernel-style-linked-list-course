# Week 05 lecture examples
#   make          build every example
#   make clean    remove the executables

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = first_member intrusive_book multi_list

all: $(PROGRAMS)

first_member: first_member.c
	$(CC) $(CFLAGS) first_member.c -o first_member

intrusive_book: intrusive_book.c
	$(CC) $(CFLAGS) intrusive_book.c -o intrusive_book

multi_list: multi_list.c
	$(CC) $(CFLAGS) multi_list.c -o multi_list

clean:
	rm -rf $(PROGRAMS) *.dSYM

.PHONY: all clean
