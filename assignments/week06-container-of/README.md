# Week 06 — `container_of()`

## Learning Objectives

- Understand how `offsetof()` finds the offset of a struct member.
- Understand how to get the original `struct student *` from only a `list_head *`.
- Explain the pointer arithmetic inside `container_of()`.

## Assignment

Understand and use this macro from `starter/assignment_06.c`:

```c
#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))
```

Starting from only the address of `student.list`, get back the address of the whole `student` object. Then print its ID and score.

## Key Idea

```text
student
+----------------+
| id             |
| name           |
| score          |
| list  <--------+---- list pointer
+----------------+
       ^
       |
  offsetof(struct student, list)
```

`container_of()` takes the address of `list` and subtracts the member's offset. The result is the start address of the container, the `student`.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_06.c -o week06
./week06
```

## Checklist

- [ ] I can explain what `offsetof()` means.
- [ ] I used `container_of()` myself.
- [ ] I got a `student *` from a `list_head *`.
- [ ] I did not use a separate mapping table.

## Makefile

```bash
cd starter
make
./week06
make clean
```
