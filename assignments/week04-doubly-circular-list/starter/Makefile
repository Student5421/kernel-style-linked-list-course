CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGETS = week04a week04b

all: $(TARGETS)

week04a: assignment_04a.c
	$(CC) $(CFLAGS) assignment_04a.c -o week04a

week04b: assignment_04b.c
	$(CC) $(CFLAGS) assignment_04b.c -o week04b

clean:
	rm -f $(TARGETS)
