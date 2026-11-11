# Week 07 lecture examples
#   make          build every example
#   make run     run every example with prepared input
#   make test     run the file-based tests (input redirection + diff)
#   make clean    remove the executables and generated files

CC = gcc
CFLAGS = -Wall -Wextra -std=c11

PROGRAMS = stdio_streams count_chars library_io input_demo stream_copy \
           binary_position line_parse

all: $(PROGRAMS)

stdio_streams: stdio_streams.c
	$(CC) $(CFLAGS) stdio_streams.c -o stdio_streams

count_chars: count_chars.c
	$(CC) $(CFLAGS) count_chars.c -o count_chars

library_io: library_io.c
	$(CC) $(CFLAGS) library_io.c -o library_io

input_demo: input_demo.c
	$(CC) $(CFLAGS) input_demo.c -o input_demo

stream_copy: stream_copy.c
	$(CC) $(CFLAGS) stream_copy.c -o stream_copy

binary_position: binary_position.c
	$(CC) $(CFLAGS) binary_position.c -o binary_position

line_parse: line_parse.c
	$(CC) $(CFLAGS) line_parse.c -o line_parse

run: all
	./stdio_streams
	./count_chars books.txt
	./input_demo < input.txt
	./library_io books.txt saved.txt
	./stream_copy
	./binary_position
	./line_parse

test: input_demo library_io
	./input_demo < input.txt > actual.txt
	diff expected.txt actual.txt
	./library_io books.txt saved.txt
	./library_io saved.txt saved2.txt
	diff saved.txt saved2.txt
	@echo "all tests passed"

clean:
	rm -rf $(PROGRAMS) actual.txt saved.txt saved2.txt out.txt err.txt *.dSYM

.PHONY: all run test clean
