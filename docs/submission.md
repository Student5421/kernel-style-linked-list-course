# Submission Guide

## Submission Structure

We suggest this structure for your final project submission:

```text
<student_id>_<name>/
├── main.c
├── list.h
├── list.c
├── student.h
├── student.c
├── Makefile
└── README.md
```

## Requirements

- Include every required source file.
- The code must compile with `gcc -Wall -Wextra -std=c11`.
- Do not submit the executable.
- Do not use an external linked list library.
- Do not use an array of students.
- Do not use a separate `struct node`.
- Create each student with `malloc()`.
- Call `free()` at the right time, so that there are no memory leaks.
- Use `container_of()` to get a `student *` from a `list_head *`.

## What to Put in Your README

1. How to run the program
2. The features you implemented
3. The data structures you used
4. Why you used a circular doubly linked list
5. What an intrusive linked list is
6. How `container_of()` works
7. The problems you met while implementing, and how you solved them

## Check Before You Submit

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

The build must show no warnings.
