CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGETS = week03a week03b

all: $(TARGETS)

week03a: assignment_03a.c
	$(CC) $(CFLAGS) assignment_03a.c -o week03a

week03b: assignment_03b.c
	$(CC) $(CFLAGS) assignment_03b.c -o week03b

clean:
	rm -f $(TARGETS)
