# Lecture Notes

These are the English lecture notes for **C Programming — Linked Lists**. Each week is one session that includes the lab: lecture and live coding, then hands-on lab on that week's assignment, then a short wrap-up. Weeks 03 and 04 each cover two topics and have two assignments, A and B.

## Weekly Sessions

| Week | Lecture notes | Slides | Demo code | Assignment | Makefile topic |
|---|---|---|---|---|---|
| 1 | [Build Tools, Makefile, and `struct`](week01-struct/) | [week01-slides.pptx](week01-struct/week01-slides.pptx) | [examples](week01-struct/examples/) | [Week 01](../assignments/week01-struct/) | `gcc` flags, rules, `make` / `make clean`, variables, `.PHONY` |
| 2 | [Operators and Precedence](week02-operators/) | [week02-slides.pptx](week02-operators/week02-slides.pptx) | [examples](week02-operators/examples/) | [Week 02](../assignments/week02-operators/) | |
| 3 | [Dynamic Memory and Singly Linked List](week03-dynamic-memory-singly-list/) | [week03-slides.pptx](week03-dynamic-memory-singly-list/week03-slides.pptx) | [examples](week03-dynamic-memory-singly-list/examples/) | [Week 03 (03A, 03B)](../assignments/week03-dynamic-memory-singly-list/) | flags are not prerequisites: `make -B` |
| 4 | [Doubly Linked and Circular Lists](week04-doubly-circular-list/) | [week04-slides.pptx](week04-doubly-circular-list/week04-slides.pptx) | [examples](week04-doubly-circular-list/examples/) | [Week 04 (04A, 04B)](../assignments/week04-doubly-circular-list/) | `-DNDEBUG` and `assert()` |
| 5 | [Intrusive Linked List](week05-intrusive-list/) | [week05-slides.pptx](week05-intrusive-list/week05-slides.pptx) | [examples](week05-intrusive-list/examples/) | [Week 05](../assignments/week05-intrusive-list/) | |
| 6 | [`offsetof()` and `container_of()`](week06-container-of/) | [week06-slides.pptx](week06-container-of/week06-slides.pptx) | [examples](week06-container-of/examples/) | [Week 06](../assignments/week06-container-of/) | `gcc -E` to see macro expansion |
| 7 | [File I/O](week07-file-io/) | [week07-slides.pptx](week07-file-io/week07-slides.pptx) | [examples](week07-file-io/examples/) | [Week 07](../assignments/week07-file-io/) | a `test` target with `diff` |
| 8 | [Multi-file Programs and the Final Project](week08-final-project/) | [week08-slides.pptx](week08-final-project/week08-slides.pptx) | [examples](week08-final-project/examples/) | [Final Project](../assignments/week08-final-project/) | `$(SRCS:.c=.o)`, `%.o: %.c`, `$@ $^ $<`, header dependencies |

## Session Structure

Each session follows the same order:

1. Review of last week (warm-up questions)
2. Lecture parts with live demos and live coding (Parts 1–2; Parts 1–4 in Weeks 03 and 04)
3. Lab — the week's assignment, with a test plan and stretch goals
4. Wrap-up — key takeaways and exit quiz

Week 01 spends more of its time on the toolchain and the Makefile. Week 08 adds a part on multi-file builds and runs the lab as a project kickoff.

The slide decks are generated from [`slides/`](slides/); see its README to rebuild them after editing.

## Conventions

- **Live demo** marks code to run in class. Every demo is in that week's `examples/` directory.
- **In-class exercises** and **exit quizzes** have their answers in collapsed `<details>` blocks.
- **Lecture demos use `struct book`, and assignments use `struct student`.** The notes show the mechanism; students carry it over to their own code in the lab. Assignment deliverables (for example search, delete, and backward traversal) are left as design exercises.
- All demo code is C11 and builds with `gcc -Wall -Wextra -std=c11` and **zero warnings**. The exceptions are three files that exist to show warnings: `week01-struct/examples/warnings.c`, `week02-operators/examples/precedence_traps.c`, and `week03-dynamic-memory-singly-list/examples/dangling_local.c`. Their Makefiles do not build them.
- The Week 02 assignment starter produces three warnings **on purpose**. Fixing them is part of the task.

## Building the Examples

```bash
make -C lectures/week01-struct/examples          # build one week's demos
make -C lectures/week01-struct/examples clean    # remove the executables
make -C lectures/week07-file-io/examples test    # Week 07: run the file-based tests
```

The outputs shown in the notes were captured on macOS (Apple Clang, GNU Make 3.81). Addresses change from run to run. On Linux, gcc words some messages differently, and newer GNU Make quotes names as `'name'` instead of `` `name' ``.
