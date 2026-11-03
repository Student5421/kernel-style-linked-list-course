# Lecture Notes

These are the English lecture notes for **C Programming — Kernel-style Linked List**. Each week is one **3-hour session that includes the lab**: roughly 90 minutes of lecture and live coding, a 10-minute break, 60 minutes of hands-on lab on that week's assignment, and a 10-minute wrap-up.

## Weekly Sessions

| Week | Lecture notes | Slides | Demo code | Assignment | Makefile topic |
|---|---|---|---|---|---|
| 1 | [Build Tools, Makefile, and `struct`](week01-struct/) | [week01-slides.pptx](week01-struct/week01-slides.pptx) | [examples](week01-struct/examples/) | [Week 01](../assignments/week01-struct/) | `gcc` flags, rules, `make` / `make clean`, variables, `.PHONY` |
| 2 | [Operators and Precedence](week02-operators/) | [week02-slides.pptx](week02-operators/week02-slides.pptx) | [examples](week02-operators/examples/) | [Week 02](../assignments/week02-operators/) | |
| 3 | [Dynamic Memory](week03-dynamic-memory/) | [week03-slides.pptx](week03-dynamic-memory/week03-slides.pptx) | [examples](week03-dynamic-memory/examples/) | [Week 03](../assignments/week03-dynamic-memory/) | |
| 4 | [Singly Linked List](week04-singly-linked-list/) | [week04-slides.pptx](week04-singly-linked-list/week04-slides.pptx) | [examples](week04-singly-linked-list/examples/) | [Week 04](../assignments/week04-singly-linked-list/) | flags are not prerequisites: `make -B` |
| 5 | [Doubly Linked List](week05-doubly-linked-list/) | [week05-slides.pptx](week05-doubly-linked-list/week05-slides.pptx) | [examples](week05-doubly-linked-list/examples/) | [Week 05](../assignments/week05-doubly-linked-list/) | |
| 6 | [Circular Doubly Linked List](week06-circular-list/) | [week06-slides.pptx](week06-circular-list/week06-slides.pptx) | [examples](week06-circular-list/examples/) | [Week 06](../assignments/week06-circular-list/) | `-DNDEBUG` and `assert()` |
| 7 | [Intrusive Linked List](week07-intrusive-list/) | [week07-slides.pptx](week07-intrusive-list/week07-slides.pptx) | [examples](week07-intrusive-list/examples/) | [Week 07](../assignments/week07-intrusive-list/) | |
| 8 | [`offsetof()` and `container_of()`](week08-container-of/) | [week08-slides.pptx](week08-container-of/week08-slides.pptx) | [examples](week08-container-of/examples/) | [Week 08](../assignments/week08-container-of/) | `gcc -E` to see macro expansion |
| 9 | [File I/O](week09-file-io/) | [week09-slides.pptx](week09-file-io/week09-slides.pptx) | [examples](week09-file-io/examples/) | [Week 09](../assignments/week09-file-io/) | a `test` target with `diff` |
| 10 | [Multi-file Programs and the Final Project](week10-final-project/) | [week10-slides.pptx](week10-final-project/week10-slides.pptx) | [examples](week10-final-project/examples/) | [Final Project](../assignments/week10-final-project/) | `$(SRCS:.c=.o)`, `%.o: %.c`, `$@ $^ $<`, header dependencies |

## Standard Session Template (Weeks 02–09)

| Time | Segment |
|---|---|
| 0:00 – 0:10 | Review of last week (warm-up questions) |
| 0:10 – 0:55 | Part 1 — lecture + live demo |
| 0:55 – 1:05 | Break |
| 1:05 – 1:50 | Part 2 — lecture + live coding |
| 1:50 – 2:50 | Lab — the week's assignment, with a test plan and stretch goals |
| 2:50 – 3:00 | Wrap-up — key takeaways and exit quiz |

Week 01 spends more of its time on the toolchain and the Makefile. Week 10 adds a part on multi-file builds and runs a 70-minute lab as a project kickoff.

The slide decks are generated from [`slides/`](slides/); see its README to rebuild them after editing.

## Conventions

- **Live demo** marks code to run in class. Every demo is in that week's `examples/` directory.
- **In-class exercises** and **exit quizzes** have their answers in collapsed `<details>` blocks.
- **Lecture demos use `struct book`, and assignments use `struct student`.** The notes show the mechanism; students carry it over to their own code in the lab. Assignment deliverables (for example search, delete, and backward traversal) are left as design exercises.
- All demo code is C11 and builds with `gcc -Wall -Wextra -std=c11` and **zero warnings**. The exceptions are three files that exist to show warnings: `week01-struct/examples/warnings.c`, `week02-operators/examples/precedence_traps.c`, and `week03-dynamic-memory/examples/dangling_local.c`. Their Makefiles do not build them.
- The Week 02 assignment starter produces three warnings **on purpose**. Fixing them is part of the task.

## Building the Examples

```bash
make -C lectures/week01-struct/examples          # build one week's demos
make -C lectures/week01-struct/examples clean    # remove the executables
make -C lectures/week09-file-io/examples test    # Week 09: run the file-based tests
```

The outputs shown in the notes were captured on macOS (Apple Clang, GNU Make 3.81). Addresses change from run to run. On Linux, gcc words some messages differently, and newer GNU Make quotes names as `'name'` instead of `` `name' ``.
