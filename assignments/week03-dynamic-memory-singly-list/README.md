# Week 03 — Dynamic Memory and Singly Linked List

This week has two assignments. Do **03A** first: the singly linked list in **03B** is built from heap-allocated nodes.

## Learning Objectives

- Understand the difference between the stack and the heap.
- Create a student at run time with `malloc()`, and release it with `free()`.
- Build a linked list from nodes and pointers.
- Traverse the list by following `next` pointers.
- Write the basic operations: insert, search, and delete.

## Assignment 03A — Dynamic Memory

In `starter/assignment_03a.c`, use `malloc()` to create one student at run time, store its information, and print it.

### Requirements

1. Allocate the memory with `malloc(sizeof(*student))`, the idiom from the lecture (`malloc(sizeof(struct student))` also works).
2. Check whether `malloc()` failed.
3. Store the student's information and print it.
4. Always `free()` the memory before the program ends.

### Checklist

- [ ] I used `malloc()`.
- [ ] I handled allocation failure.
- [ ] I used a pointer to the student.
- [ ] I called `free()`.
- [ ] There are no compiler warnings.

## Assignment 03B — Singly Linked List

Use `struct node` in `starter/assignment_03b.c` to write a singly linked list.

Write at least these operations:

- Insert
- Search by ID
- Delete by ID
- Print

### Requirements

- Every node has a `next` pointer.
- When the list is empty, `head == NULL`.
- When you delete a node that you created with `malloc()`, `free()` it.
- Free the whole list before the program ends.

### Checklist

- [ ] Insert
- [ ] Search
- [ ] Delete
- [ ] Print
- [ ] Every deleted node is freed with `free()`
- [ ] All nodes are freed with `free()` before the program ends

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_03a.c -o week03a
./week03a
gcc -Wall -Wextra -std=c11 assignment_03b.c -o week03b
./week03b
```

## Makefile

`make` builds both programs.

```bash
cd starter
make
./week03a
./week03b
make clean
```
