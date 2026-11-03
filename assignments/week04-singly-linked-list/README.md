# Week 04 — Singly Linked List

## Learning Objectives

- Build a linked list from nodes and pointers.
- Traverse the list by following `next` pointers.
- Write the basic operations: insert, search, and delete.

## Assignment

Use `struct node` in `starter/assignment_04.c` to write a singly linked list.

Write at least these operations:

- Insert
- Search by ID
- Delete by ID
- Print

## Requirements

- Every node has a `next` pointer.
- When the list is empty, `head == NULL`.
- When you delete a node that you created with `malloc()`, `free()` it.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_04.c -o week04
./week04
```

## Checklist

- [ ] Insert
- [ ] Search
- [ ] Delete
- [ ] Print
- [ ] Every deleted node is freed with `free()`

## Makefile

```bash
cd starter
make
./week04
make clean
```
