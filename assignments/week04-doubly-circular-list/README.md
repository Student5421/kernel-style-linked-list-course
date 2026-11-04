# Week 05 — Doubly Linked List

## Learning Objectives

- Keep `next` and `prev` correct at the same time.
- Write forward and backward traversal.
- When you delete a node, fix the links on both sides of it.

## Assignment

Complete `starter/assignment_05.c` to write a doubly linked list.

## Requirements

- Every node has both `next` and `prev`.
- Write Forward Print.
- Write Backward Print.
- When you delete a node, fix the links of the nodes before and after it.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_05.c -o week05
./week05
```

## Checklist

- [ ] The `next` links are correct.
- [ ] The `prev` links are correct.
- [ ] Forward traversal works.
- [ ] Backward traversal works.
- [ ] The links are still correct after a delete.
- [ ] All nodes are freed with `free()` before the program ends.

## Makefile

```bash
cd starter
make
./week05
make clean
```
