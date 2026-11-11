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

## Reference PDF Placement

The seven reference PDFs from **C Programming Part 2** are stored beside the
weekly lecture decks below. Their original chapter numbers identify the source
material, not this course's week numbers. The existing eight-week linked-list
sequence determines when to use each topic. The PDFs retain their original
contents and filenames.

| Reference PDF | Pages | Primary location | Main use |
|---|---:|---|---|
| [01. Pointers Revisited](week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf) | 51 | Week 01 | Address, indirection, and pointer parameters first; revisit arrays, `**`, and callbacks later. |
| [05. Structures, Unions and Enums](week01-struct/%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf) | 49 | Week 01 | Structure values and member access first; allocation, unions, and tagged variants later. |
| [03. Strings](week02-operators/%5BSlide%5D%2003.%20Strings.pdf) | 82 | Week 02 | Character arrays, pointer traversal, and string operations before allocating and linking books. |
| [06. Low Level Operations](week02-operators/%5BSlide%5D%2006.%20Low%20Level%20Operations.pdf) | 25 | Week 02 | Bitwise operators, precedence, and flags; revisit bit-fields and byte order in Week 06. |
| [02. Dynamic Memory Allocation](week03-dynamic-memory-singly-list/%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf) | 30 | Week 03 | Storage layout, allocation, release, failure handling, and dangling pointers. |
| [04. File IO](week07-file-io/%5BSlide%5D%2004.%20File%20IO.pdf) | 62 | Week 07 | Streams, file lifetime, text parsing, and persistence; binary I/O and positioning as extensions. |
| [07. Writing Large Programs](week08-final-project/%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf) | 41 | Week 08 | Separate compilation, headers, shared declarations, and modules; use macro excerpts earlier. |

Each reference PDF is stored in exactly one lecture directory: the most closely
related teaching week listed above. Other weeks link to that single copy when
revisiting selected pages. The pointer and structure PDFs already placed in
Week 01 and the source copies in the sibling `C Programming Part 2/` folder
are preserved.

### Reading order and revisits

Page ranges below are **one-based PDF page numbers**, which match the printed
slide numbers. They are selected reading alongside the course decks, not a
requirement to present every page in a single session. Each week's notes link
the relevant PDFs and existing runnable examples.

| Week | Selected reference reading | Teaching purpose |
|---|---|---|
| [01](week01-struct/#reference-slide-reading) | Pointers pp. 3-12; Structures pp. 3-22, 24-30; Strings pp. 3-14 as a short reference for `title[]`. Enums pp. 40-45 are an optional preview. | Build tools, book records, value copying, pointer parameters, and null-terminated title storage. |
| [02](week02-operators/#reference-slide-reading) | Strings pp. 3-14, 26-34, 49-63, 74-81; Low Level pp. 2-19; Pointers pp. 13-16, 20-23, 27-39; Large Programs pp. 8-10, 14-15. | Read pointer expressions and loops, understand strings and arrays, set/test flags, and parenthesize macros. Matrix interfaces and extra library functions are extensions. |
| [03](week03-dynamic-memory-singly-list/#reference-slide-reading) | Dynamic Memory pp. 2-27, optionally 28-29; Pointers pp. 17-19, 25-26; Structures p. 23; Strings pp. 13-14, 49-60, 68-72. | Establish allocation and ownership before creating linked-list nodes; distinguish copies of arrays from copies of pointer values. |
| [04](week04-doubly-circular-list/#reference-slide-reading) | Dynamic Memory pp. 25-27; Pointers pp. 25-26; Large Programs pp. 16-18. | Review lifetime and changing a head pointer, then use conditional compilation with invariant checks. The existing linked-list deck is primary. |
| [05](week05-intrusive-list/#reference-slide-reading) | Structures pp. 21-27; Pointers pp. 17-19; Dynamic Memory pp. 25-27. | Review embedded members, generic object pointers, and one owner before intrusive lists. The existing linked-list deck is primary. |
| [06](week06-container-of/#reference-slide-reading) | Low Level pp. 20-24; Pointers pp. 13-19; Strings pp. 68-72; Large Programs pp. 6-10, 14-18. Optional: Structures pp. 32-47, Pointers pp. 41-50, Large Programs pp. 11-13, 19-20. | Connect layout and byte arithmetic to `offsetof()` and `container_of()`; revisit bit-fields, byte order, macros, and optional variants/callbacks. |
| [07](week07-file-io/#reference-slide-reading) | File IO pp. 3-52, 61; Strings pp. 15-25, 37-48, 64-67, 73; Low Level pp. 22-24. File IO pp. 53-60 are optional binary/positioning extensions. | Read and parse complete lines, manage streams, and persist payload data rather than live pointer values. |
| [08](week08-final-project/#reference-slide-reading) | Large Programs pp. 21-40; pp. 3-20 as preprocessor review. Revisit File IO pp. 17-29, 41-61 as needed. | Split the final project into interfaces and implementations, link it, and integrate input and persistence. |

Weeks 03-06 retain the course's own list lectures: the reference PDFs supply
language prerequisites and do not replace singly, doubly, circular, or intrusive
list instruction. Historical/nonportable code in the reference PDFs should be
discussed alongside the C11 notes and runnable examples; for example, use
`fgets()` for the Strings slides' `gets()` comparison.

## Conventions

- **Live demo** marks code to run in class. Every demo is in that week's `examples/` directory.
- **In-class exercises** and **exit quizzes** have their answers in collapsed `<details>` blocks.
- **Lecture demos use `struct book`, and assignments use `struct student`.** The notes show the mechanism; students carry it over to their own code in the lab. Assignment deliverables (for example search, delete, and backward traversal) are left as design exercises.
- All demo code is C11 and builds with `gcc -Wall -Wextra -std=c11` and **zero warnings**. The exceptions are three files that exist to show warnings: `week01-struct/examples/warnings.c`, `week02-operators/examples/precedence_traps.c`, and `week03-dynamic-memory-singly-list/examples/dangling_local.c`. Their Makefiles do not build them.
- The Week 02 assignment starter produces three warnings **on purpose**. Fixing them is part of the task.

## Building the Examples

```bash
make -C lectures                                # build all eight weeks
make -C lectures run                            # run all demos with prepared input
make -C lectures clean                          # clean all eight weeks
make -C lectures/week01-struct/examples          # build one week's demos
make -C lectures/week01-struct/examples run      # run core demos and both PDF supplements
make -C lectures/week01-struct/examples clean    # remove the executables
make -C lectures/week07-file-io/examples test    # Week 07: run the file-based tests
```

The [Week 01 example guide](week01-struct/examples/README.md) includes supplements
for **Pointers Revisited** and **Structures, Unions and Enums**. Their READMEs map
the runnable code to the reference PDF pages and suggest when to revisit each
topic during Weeks 01, 02, 03, and 06.

### Examples added from the reference PDFs

The later weeks have their own example guides with PDF page mappings, expected
observations, and short prediction/modification exercises. Each week's `make`
builds the examples and `make run` supplies fixed arguments or prepared input,
so all demos can be run without typing at the keyboard.

| Week | Example guide | Added focus |
|---|---|---|
| 02 | [Strings and bit operations](week02-operators/examples/README.md) | Writable string storage, capacity checks, comparisons/search, pointer scans and command-line arguments, packed bit fields. |
| 03 | [Allocation and ownership](week03-dynamic-memory-singly-list/examples/README.md) | Safe resizing, runtime matrix allocation and cleanup, owned title replacement and append. |
| 04 | [Invariants and build modes](week04-doubly-circular-list/examples/README.md) | Always-on validation versus `assert()`, `NDEBUG`, and conditional diagnostics. |
| 05 | [Borrowed intrusive membership](week05-intrusive-list/examples/README.md) | Link membership and payload ownership with books owned outside the list. |
| 06 | [Layout and representation](week06-container-of/examples/README.md) | Object bytes and byte order, overlap-aware copying, and bit-fields versus addressable members. |
| 07 | [Streams, parsing, and positioning](week07-file-io/examples/README.md) | Line/block copying, binary records with an explicit format, file positions, and validated line parsing. |
| 08 | [Preprocessing and complete modules](week08-final-project/examples/README.md) | Macro expansion and conditional compilation, guarded interfaces, one shared definition, private helpers, and header dependencies. |

The Week 08 `stats_demo` keeps its intentional header-dependency exercise;
the additional module example shows a complete working build beside it.
Compiler flags are not prerequisites, so use `-B` when changing them:

```bash
make -B -C lectures CFLAGS='-std=c11 -Wall -Wextra -Wpedantic -Werror'
make -C lectures run
make -C lectures clean
```

The outputs shown in the notes were captured on macOS (Apple Clang, GNU Make 3.81). Addresses change from run to run. On Linux, gcc words some messages differently, and newer GNU Make quotes names as `'name'` instead of `` `name' ``.
