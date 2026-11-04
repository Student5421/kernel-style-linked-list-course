# Week 04 — Doubly Linked and Circular Lists

This week has two assignments. Do **04A** first: **04B** keeps the two links of 04A and replaces every `NULL` end with a sentinel.

## Learning Objectives

- Keep `next` and `prev` correct at the same time.
- Write forward and backward traversal.
- When you delete a node, fix the links on both sides of it.
- Understand a circular list that uses a sentinel instead of `NULL`.
- Understand the invariant of the empty list.

## Assignment 04A — Doubly Linked List

Complete `starter/assignment_04a.c` to write a doubly linked list.

### Requirements

- Every node has both `next` and `prev`.
- Write Forward Print.
- Write Backward Print.
- When you delete a node, fix the links of the nodes before and after it.

### Checklist

- [ ] The `next` links are correct.
- [ ] The `prev` links are correct.
- [ ] Forward traversal works.
- [ ] Backward traversal works.
- [ ] The links are still correct after a delete.
- [ ] All nodes are freed with `free()` before the program ends.

## Assignment 04B — Circular Doubly Linked List

Starting from `starter/assignment_04b.c`, write a **circular doubly linked list that uses a sentinel `head`**.

### Empty List Invariant

In an empty list, these conditions must always be true:

```c
head.next == &head;
head.prev == &head;
```

When you traverse the list, the node after the last node is `&head`, not `NULL`.

### Requirements

- Use a sentinel `head`.
- Keep both `next` and `prev` correct.
- Write Insert and Delete.
- Write forward and backward traversal.
- Always test the empty list and a list with one element.

### Checklist

- [ ] The empty-list invariant always holds.
- [ ] `next` and `prev` are correct after Insert.
- [ ] `next` and `prev` are correct after Delete.
- [ ] Forward traversal works.
- [ ] Backward traversal works.
- [ ] All nodes are freed with `free()` before the program ends.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_04a.c -o week04a
./week04a
gcc -Wall -Wextra -std=c11 assignment_04b.c -o week04b
./week04b
```

## Makefile

`make` builds both programs.

```bash
cd starter
make
./week04a
./week04b
make clean
```
