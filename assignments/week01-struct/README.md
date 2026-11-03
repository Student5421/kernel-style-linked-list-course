# Week 01 — Struct

## Learning Objectives

- Group related data into one object with `struct`.
- Understand how a `struct` variable and a pointer to it are related.
- Know when to use `.` and when to use `->`.

## Assignment

In `starter/assignment_01.c`, use `struct student` to store one student's information and print it.

Your program must include:

- ID
- Name
- Score
- Changing a value through a pointer to the student

## Requirements

- Use `struct student`.
- Do not use an array of students.
- Use both `.` and `->`, each where it fits.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_01.c -o week01
./week01
```

## Checklist

- [ ] I stored the student's information.
- [ ] I printed the student's information.
- [ ] I changed a value through a pointer.
- [ ] There are no compiler warnings.

## Makefile

```bash
cd starter
make
./week01
make clean
```
