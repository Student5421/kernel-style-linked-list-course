# C Programming — Linked Lists

Learn the core ideas of C step by step. At the end, you build a **Student Management System** on an **intrusive circular doubly linked list**.

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
| 3 | Dynamic Memory and Singly Linked List | `malloc()`, `free()`, heap, `next`, traversal |
| 4 | Doubly Linked and Circular Lists | `prev`, `next`, sentinel, circular invariant |
| 5 | Intrusive Linked List | embedded `list_head` |
| 6 | `container_of()` | `offsetof()`, pointer arithmetic |
| 7 | File I/O | `fopen()`, `fgets()`, `fprintf()` |
| 8 | Final Project | Student Management System |

Read each week's `README.md` first, then start the assignment in `starter/`. Weeks 03 and 04 each have two assignments, A and B.

## Start Here

- [Week 01 — Struct](assignments/week01-struct/)
- [Week 02 — Operators and Precedence](assignments/week02-operators/)
- [Week 03 — Dynamic Memory and Singly Linked List](assignments/week03-dynamic-memory-singly-list/)
- [Week 04 — Doubly Linked and Circular Lists](assignments/week04-doubly-circular-list/)
- [Week 05 — Intrusive Linked List](assignments/week05-intrusive-list/)
- [Week 06 — `container_of()`](assignments/week06-container-of/)
- [Week 07 — File I/O](assignments/week07-file-io/)
- [Week 08 — Final Project](assignments/week08-final-project/)

## Lecture Notes

The lecture notes for each week, including the lab, are in [`lectures/`](lectures/). You can build each week's demo code with `make` in `lectures/weekNN-*/examples/`. The slides are `weekNN-slides.pptx` in each week's folder.

The seven reference PDFs from **C Programming Part 2** are also placed beside
the relevant weekly decks. See the [PDF placement and reading map](lectures/README.md#reference-pdf-placement)
for primary locations and page ranges to revisit in later weeks.

Each week's example guide maps its demos to the reference PDF pages. Build or
run all eight weeks with `make -C lectures` or `make -C lectures run`;
`make -C lectures clean` removes the generated programs.

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

All requirements for the final project are in `assignments/week08-final-project/README.md`.

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```
