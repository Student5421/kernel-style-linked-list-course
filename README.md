# C Programming — Kernel-style Linked List

Learn the core ideas of C step by step. At the end, you build a **Student Management System** with a **kernel-style linked list**.

## Learning Path

```text
Struct
  ↓
Pointer
  ↓
Operators & Precedence
  ↓
Dynamic Memory
  ↓
Singly Linked List
  ↓
Doubly Linked List
  ↓
Circular Doubly Linked List
  ↓
Intrusive Linked List
  ↓
offsetof()
  ↓
container_of()
  ↓
File I/O
  ↓
Student Management System
```

## Weekly Assignments

| Week | Topic | Main Concepts |
|---|---|---|
| 1 | Struct | `struct`, pointer |
| 2 | Operators & Precedence | precedence, short-circuit, bit flags |
| 3 | Dynamic Memory | `malloc()`, `free()`, heap |
| 4 | Singly Linked List | `next`, traversal |
| 5 | Doubly Linked List | `prev`, `next` |
| 6 | Circular Doubly Linked List | sentinel, circular invariant |
| 7 | Intrusive Linked List | embedded `list_head` |
| 8 | `container_of()` | `offsetof()`, pointer arithmetic |
| 9 | File I/O | `fopen()`, `fgets()`, `fprintf()` |
| 10 | Final Project | Student Management System |

Read each week's `README.md` first, then start the assignment in `starter/`.

## Start Here

- [Week 01 — Struct](assignments/week01-struct/)
- [Week 02 — Operators and Precedence](assignments/week02-operators/)
- [Week 03 — Dynamic Memory](assignments/week03-dynamic-memory/)
- [Week 04 — Singly Linked List](assignments/week04-singly-linked-list/)
- [Week 05 — Doubly Linked List](assignments/week05-doubly-linked-list/)
- [Week 06 — Circular Doubly Linked List](assignments/week06-circular-list/)
- [Week 07 — Intrusive Linked List](assignments/week07-intrusive-list/)
- [Week 08 — `container_of()`](assignments/week08-container-of/)
- [Week 09 — File I/O](assignments/week09-file-io/)
- [Week 10 — Final Project](assignments/week10-final-project/)

## Lecture Notes

The lecture notes for each week (a 3-hour session, including the lab) are in [`lectures/`](lectures/). You can build each week's demo code with `make` in `lectures/weekNN-*/examples/`. The slides are `weekNN-slides.pptx` in each week's folder.

## General Rules

1. Write C11 code.
2. Check the compiler warnings from `gcc -Wall -Wextra -std=c11`.
3. Always `free()` memory from `malloc()` at the right time.
4. Do not use an array of students in the final project.
5. Do not use a separate `struct node` in the final project.
6. The final project uses a **circular doubly linked list + intrusive list**.
7. Use `container_of()` in the final project.
8. Before you submit, always check that the program compiles and works.

## Final Project

All requirements for the final project are in `assignments/week10-final-project/README.md`.

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```
