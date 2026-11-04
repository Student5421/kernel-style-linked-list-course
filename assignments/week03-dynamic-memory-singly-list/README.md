# Week 03 — Dynamic Memory

## Learning Objectives

- Understand the difference between the stack and the heap.
- Create a student at run time with `malloc()`.
- Release dynamic memory with `free()`.

## Assignment

In `starter/assignment_03.c`, use `malloc()` to create one student at run time, store its information, and print it.

## Requirements

1. Allocate the memory like this: `malloc(sizeof(struct student))`.
2. Check whether `malloc()` failed.
3. Store the student's information and print it.
4. Always `free()` the memory before the program ends.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_03.c -o week03
./week03
```

## Checklist

- [ ] I used `malloc()`.
- [ ] I handled allocation failure.
- [ ] I used a pointer to the student.
- [ ] I called `free()`.
- [ ] There are no compiler warnings.

## Makefile

```bash
cd starter
make
./week03
make clean
```
