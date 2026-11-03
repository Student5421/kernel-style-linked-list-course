# Week 06 — Circular Doubly Linked List

## Learning Objectives

- Understand a circular list that uses a sentinel instead of `NULL`.
- Understand the invariant of the empty list.
- Write insertion and traversal for a circular doubly linked list.

## Assignment

Starting from `starter/assignment_06.c`, write a **circular doubly linked list that uses a sentinel `head`**.

## Empty List Invariant

In an empty list, these conditions must always be true:

```c
head.next == &head;
head.prev == &head;
```

When you traverse the list, the node after the last node is `&head`, not `NULL`.

## Requirements

- Use a sentinel `head`.
- Keep both `next` and `prev` correct.
- Write Insert and Delete.
- Write forward and backward traversal.
- Always test the empty list and a list with one element.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_06.c -o week06
./week06
```

## Checklist

- [ ] The empty-list invariant always holds.
- [ ] `next` and `prev` are correct after Insert.
- [ ] `next` and `prev` are correct after Delete.
- [ ] Forward traversal works.
- [ ] Backward traversal works.
- [ ] All nodes are freed with `free()` before the program ends.

## Makefile

```bash
cd starter
make
./week06
make clean
```
