# Week 08 — Multi-file Programs and the Final Project

| | |
|---|---|
| **Session** | Lecture + live coding + project lab |
| **Assignment** | [Week 08 — Final Project: Student Management System](../../assignments/week08-final-project/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous** | [Week 07](../week07-file-io/) |

## Reference slide reading

Use [Writing Large Programs](%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf)
(41 pages). All page numbers below are one-based PDF pages. The primary
reading is **pp. 21-40**, in this teaching order:

1. Review the build pipeline on pp. 22-23, then split responsibilities and
   share declarations using pp. 24-31.
2. Apply include guards from pp. 35-37 before building the multi-file
   [`examples/`](examples/) program. Connect pp. 38-40 on modules, cohesion,
   and coupling to the project's list/student/menu layers.
3. Read pp. 32-34 on `extern` as declaration/definition background; the final
   project's list head still belongs in `main()`.

See the [example guide](examples/README.md) for preprocessor experiments
and a complete book module; run `make -C examples run`. The stats dependency
exercise remains available.

Use **pp. 3-20** as a preprocessor recap: pp. 3-7 introduce directives and
constants, pp. 8-15 explain macro expansion and pitfalls, and pp. 16-20 cover
conditional compilation and diagnostics. Review operators before macros and
function prototypes before sharing interfaces.

Revisit [File I/O](../week07-file-io/%5BSlide%5D%2004.%20File%20IO.pdf)
**pp. 17-29, 41-52, 61** for file lifetime, input, parsing, and buffering, and
the [Week 03 ownership notes](../week03-dynamic-memory-singly-list/README.md)
before implementing creation, deletion, and cleanup.

At pp. 17-18, `#ifdef DEBUG` remains true when `DEBUG` is defined as `0`;
`#if DEBUG` tests its numeric value. Include guards prevent repeated inclusion
within one translation unit; they do not fix duplicate external definitions
across separately compiled files.

## Learning Objectives

By the end of this session you can:

1. Split a program into headers (interfaces) and source files (implementations), with include guards.
2. Compile each `.c` file separately and link the object files, by hand and with `make`.
3. Tell a compile error from a link error, and fix both.
4. Read every line of the final project's Makefile: `$(SRCS:.c=.o)`, `%.o: %.c`, `$@`, `$^`, `$<`.
5. Explain why editing a header does not trigger a rebuild with the starter Makefile, and fix it.
6. Apply Week 07's robust input handling and file-based testing to the project.
7. Lay out the final project in three layers with clear responsibilities.

---

## 0. Review: the Whole Course in One Struct

```c
struct list_head {              /* Week 04: next + prev, circular, with a sentinel */
    struct list_head *next;
    struct list_head *prev;
};

struct student {                /* Week 01: a struct.  Week 03: created with malloc() */
    int id;
    char name[20];              /* at most 19 characters + '\0'                          */
    int score;
    struct list_head list;      /* Week 05: the links live inside the object             */
};

struct student *s = container_of(pos, struct student, list);   /* Week 06 */
```

Ask the class: for each line, which week explained it, and what bug does it prevent?

---

## 1. Programs Made of Several `.c` Files

### 1.1 Why split a program?

- **Separation of concerns.** `list.c` knows only `struct list_head`, `student.c` knows students, and `main.c` talks to the user.
- **Readability.** Each file is short enough to understand on its own.
- **Faster rebuilds.** Change `student.c`, and only `student.c` is recompiled.
- **Reuse.** Your `list.c` works unchanged for any struct that embeds a `list_head`.

### 1.2 The final project's files

```text
main.c      ──#include──►  student.h  ──#include──►  list.h
student.c   ──#include──►  student.h  (and through it, list.h)
list.c      ──#include──►  list.h
```

| File | Contains |
|---|---|
| `list.h` | `struct list_head`, `container_of()`, list function prototypes |
| `list.c` | `list_init()`, `list_add()`, `list_del()` |
| `student.h` | `struct student`, student function prototypes |
| `student.c` | `student_create()`, `student_find()`, `student_delete()`, printing, counting, freeing |
| `main.c` | The menu loop and user input |

### 1.3 What goes in a header, and what does not

| Put in a `.h` (the interface) | Put in a `.c` (the implementation) |
|---|---|
| `struct` definitions that several files need | Function **definitions** (the bodies) |
| Function **prototypes** (declarations) | `static` helper functions used only in that file |
| Macros such as `container_of()` | Variables |
| An include guard | |

**Never define a function or a variable in a header.** Every `.c` that includes the header gets its own copy, and the linker reports a *duplicate symbol*.

`#include "list.h"` (quotes) searches your project directory first. `#include <stdio.h>` (angle brackets) searches only the system directories.

### 1.4 Include guards

`main.c` includes `list.h` (through `student.h`), and might include it directly too. Without a guard, `struct list_head` is defined twice:

```text
./list.h:4:8: error: redefinition of 'list_head'      (list.h with its guard deleted)
```

The starter's headers already use the standard guard:

```c
#ifndef LIST_H
#define LIST_H

/* ... contents ... */

#endif
```

The first inclusion defines `LIST_H`. Every later inclusion finds it already defined and skips the whole file.

### 1.5 Separate compilation and linking

```text
main.c    ──gcc -c──►  main.o    ┐
list.c    ──gcc -c──►  list.o    ├── gcc (link) ──►  student_manager
student.c ──gcc -c──►  student.o ┘
```

By hand:

```bash
gcc -Wall -Wextra -std=c11 -c main.c    -o main.o
gcc -Wall -Wextra -std=c11 -c list.c    -o list.o
gcc -Wall -Wextra -std=c11 -c student.c -o student.o
gcc -Wall -Wextra -std=c11 -o student_manager main.o list.o student.o
```

- `-c` means "compile only, don't link". The result is an **object file** (`.o`): machine code with unresolved references to functions in other files.
- The final command **links** the object files, connecting each call to its definition.
- `gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager` does all four steps at once, but it recompiles everything every time.

### 1.6 Compile errors vs. link errors

| | Compile error | Link error |
|---|---|---|
| When | Compiling **one** `.c` file | Combining the `.o` files |
| Typical message | `main.c:12:5: error: ...` (has a file and line) | macOS ld: `Undefined symbols for architecture arm64: "_list_add"`<br>GNU ld (Linux): `undefined reference to 'list_add'` |
| | | macOS ld: `duplicate symbol '_f' in: a.o b.o`<br>GNU ld (Linux): `multiple definition of 'f'` |
| Typical cause | Syntax, types, missing `#include` | A `.c` file not compiled or not linked; a name misspelled between prototype and definition; a function defined in a header |

**Live demo:** link the multi-file example **without** `stats.c`:

```bash
cd lectures/week08-final-project/examples
gcc -Wall -Wextra -std=c11 main.c -o broken
```

```text
Undefined symbols for architecture arm64:
  "_stats_add", referenced from:
      _main in main-8f203c.o
  "_stats_init", referenced from:
      _main in main-8f203c.o
  "_stats_print", referenced from:
      _main in main-8f203c.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

On Linux, GNU ld reports the same three symbols as `undefined reference to 'stats_init'`, and so on.

`main.c` compiled fine, because the prototypes in `stats.h` satisfied the compiler. Only the linker noticed that the definitions were missing.

### 1.7 `static` functions are file-private

```c
static void print_menu(void)     /* in main.c: other files cannot call it */
```

Mark every helper that is not part of a header's interface as `static`. Then it cannot clash with a same-named function in another file, and readers know it is only used in this file.

---

## 2. The Final Project's Makefile, Line by Line

[`assignments/week08-final-project/starter/Makefile`](../../assignments/week08-final-project/starter/Makefile), unchanged:

```make
CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGET = student_manager

SRCS = main.c list.c student.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean
```

| Line | Meaning |
|---|---|
| `SRCS = main.c list.c student.c` | The list of source files. |
| `OBJS = $(SRCS:.c=.o)` | **Substitution reference:** the same list with `.c` replaced by `.o`, giving `main.o list.o student.o`. |
| `$(TARGET): $(OBJS)` | The executable depends on all three object files. |
| `$(CC) $(CFLAGS) -o $@ $^` | Link: `$@` is the target, `$^` is all the prerequisites. |
| `%.o: %.c` | **Pattern rule:** "any `X.o` is built from `X.c`". One rule serves all three files. |
| `$(CC) $(CFLAGS) -c $< -o $@` | Compile: `$<` is the **first** prerequisite (`X.c`), `$@` is `X.o`. |
| `clean` | Removes the object files and the executable. |
| `.PHONY: all clean` | `all` and `clean` are actions, not files (Week 01, §2.6). |

### 2.1 Automatic variables

| Variable | Means | In `$(TARGET): $(OBJS)` | In `%.o: %.c` (building `list.o`) |
|---|---|---|---|
| `$@` | the target | `student_manager` | `list.o` |
| `$^` | all prerequisites | `main.o list.o student.o` | `list.c` |
| `$<` | the first prerequisite | `main.o` | `list.c` |

### 2.2 Watching incremental builds

**Live demo** — [`examples/`](examples/) has the same Makefile shape with `main.c`, `stats.c`, and `stats.h`:

```bash
cd lectures/week08-final-project/examples
make
```

```text
gcc -Wall -Wextra -std=c11 -c main.c -o main.o
gcc -Wall -Wextra -std=c11 -c stats.c -o stats.o
gcc -Wall -Wextra -std=c11 -o stats_demo main.o stats.o
```

```bash
touch stats.c
make
```

```text
gcc -Wall -Wextra -std=c11 -c stats.c -o stats.o
gcc -Wall -Wextra -std=c11 -o stats_demo main.o stats.o
```

Only `stats.o` was recompiled, and then everything was relinked. `main.o` was reused.

`make run` runs the program with `numbers.txt` as its input:

```text
== Score statistics ==
count   : 5
min/max : 64 / 99
average : 82.00
```

### 2.3 The header gotcha

**Live demo:** change the title macro in `stats.h`:

```c
#define STATS_TITLE "Exam statistics"
```

```bash
make
```

```text
make: Nothing to be done for `all'.
```

```text
== Score statistics ==       ← the OLD title: the program was not rebuilt
```

Why? The rule `%.o: %.c` says `stats.o` depends on `stats.c` only. `make` has no idea that `stats.c` includes `stats.h`.

This is more dangerous than a stale title. Suppose you add a member to `struct student` in `student.h` and also edit `main.c`. Then only `main.o` is rebuilt. `main.o` and `student.o` now disagree about the **layout** of `struct student`, and `container_of()` returns pointers computed with the wrong offset. You get corrupted data with no error message.

**Fix 1 (always works):** after editing any header, run

```bash
make clean && make
```

**Fix 2 (better): list the header dependencies.** A rule with no recipe just adds prerequisites, and the pattern rule still supplies the recipe. In `examples/Makefile`, uncomment:

```make
main.o stats.o: stats.h
```

For the final project:

```make
main.o: student.h list.h
student.o: student.h list.h
list.o: list.h
```

`$<` is still the `.c` file, because the pattern rule's prerequisite comes first.

> **Going further (optional):** `gcc -MMD -MP` writes a `.d` file listing each object's headers, and `-include $(OBJS:.o=.d)` in the Makefile reads them, so dependencies are generated automatically. If you use it, also delete the `.d` files in `clean`.

---

## 3. Project Architecture and Test Plan

### 3.1 Three layers

```text
+--------------------------------------------------------------+
| main.c      menu loop, reading input, printing messages      |  uses: student API
+--------------------------------------------------------------+
| student.c   create / find / delete / print / count / free    |  uses: list API, container_of()
+--------------------------------------------------------------+
| list.c      list_init / list_add / list_del                  |  knows ONLY struct list_head
+--------------------------------------------------------------+
```

Each layer calls only the layer directly below it. If `list.c` ever mentions `struct student`, the design is broken.

### 3.2 Responsibilities

These come from the [project specification](../../assignments/week08-final-project/README.md):

| Function | Does | Does **not** |
|---|---|---|
| `list_init(head)` | `head->next = head->prev = head` | |
| `list_add(new, head)` | Insert `new` right after `head` | allocate anything |
| `list_del(entry)` | Make the neighbors point at each other | **`free()`** |
| `student_create(id, name, score)` | `malloc()`, fill in fields, initialize `list` | insert into the list |
| `student_find(head, id)` | Traverse with `container_of()`, return the student or `NULL` | print |
| `student_delete(head, id)` | find → `list_del()` → `free()`, return success/failure | |
| `student_free_all(head)` | Safe traversal: unlink and free every student | leave `head` dangling: it must end as an empty ring |

- `head` is a **local variable in `main()`**. The spec forbids global storage.
- `list_add()` inserts at the **front**, so a forward print shows the newest student first. If you prefer insertion order, add a `list_add_tail()` to `list.c` (Week 05), since the starter's function set is a recommended design, not a limit.

### 3.3 The "Add Student" flow

```text
read ID ──► valid? (positive integer) ──no──► "Error: Invalid input."
   │yes
   ▼
student_find(&head, id) != NULL ? ──yes──► "Error: Student ID already exists."
   │no
   ▼
read name (≤ 19 chars), read score ──► 0 ≤ score ≤ 100 ? ──no──► error message
   │yes
   ▼
s = student_create(id, name, score) ──► NULL? ──► "Error: out of memory"
   │
   ▼
list_add(&s->list, &head)
```

Check for a duplicate **before** asking for the name and score, so the user is not asked to type data that will be thrown away.

### 3.4 Input handling and testing

Apply Week 07 directly:

- Check every `scanf()` return value **before** using the variable, and discard the rest of a bad line ([Week 07, §2.5](../week07-file-io/README.md#25-robust-keyboard-input-with-scanf)).
- Read the name with `"%19s"` for `char name[20]`.
- Handle `EOF` in the menu and in the middle of "Add": free everything and exit normally.
- Replay tests with `./student_manager < test1.txt`, and compare with `diff` ([Week 07, §2.6](../week07-file-io/README.md#26-testing-with-files)).

For the final project, each test file is the sequence of keys you would press. For example, assuming the duplicate check comes right after the ID (§3.3), this adds a student, tries a duplicate, prints, and exits:

```text
1
1
Alice
95
1
1
4
7
```

Test cases to cover:

| Area | Cases |
|---|---|
| Empty list | Print forward/backward, count, search, delete |
| Add | Normal add; duplicate ID; ID ≤ 0; score < 0 or > 100; name longer than 19 characters |
| Delete | First, middle, last, only student; ID not found |
| Order | Forward is exactly the reverse of backward |
| Input | Letters instead of numbers in the menu and in each field; end of input (EOF) in the middle of "Add" |
| Exit | With 0 students and with several. Afterwards `head` is an empty ring. |

Check for leaks by reasoning, as in Week 03: every `student_create()` must be matched by exactly one `free()`, either in `student_delete()` or in `student_free_all()`. While developing, a temporary live-student counter makes this visible.

---

## 4. Lab — Project Kickoff

Task: [assignments/week08-final-project/README.md](../../assignments/week08-final-project/README.md). Read the whole specification first.

| Milestone | Goal | Done when |
|---|---|---|
| **M0** | Copy `starter/` into your submission directory (`<student_id>_<name>/`). Run `make` and `./student_manager`, then choose 7. | The untouched starter builds with zero warnings and exits cleanly. |
| **M1** | `list.c`: `list_init()`, `list_add()`, `list_del()` (from Week 06, Lab C). | A temporary test adds two `list_head`s and checks `head.next`/`head.prev`. |
| **M2** | `student_create()`, `student_print()`, `student_print_all()`, `student_count()`. | Menu 4 and 6 work on students added by temporary code in `main()`. |
| **M3** | Menu 1 (Add): input validation, `student_find()` duplicate check. | Adding, duplicates, and bad input behave as the spec says. |
| **M4** | Menu 2, 3, 5: `student_delete()`, search, `student_print_reverse()`. | The test cases in §3.4 pass. |
| M5 (at home) | `student_free_all()` with a safe traversal. Handle EOF and invalid input everywhere. | Exit leaves `head` as an empty ring, and no input crashes the program. |
| M6 (at home) | Header dependencies in the Makefile, test input files, and the README. | Everything in the final checklist is ticked. |

Rebuild after **every** function. Never write more than about 20 lines without compiling.

---

## 5. Wrap-up

### Submission checklist

From [docs/submission.md](../../docs/submission.md) and the [final checklist](../../assignments/week08-final-project/README.md#12-final-checklist):

- [ ] `main.c`, `list.h`, `list.c`, `student.h`, `student.c`, `Makefile`, `README.md`. No executable, no `.o` files (`make clean`).
- [ ] Builds with `gcc -Wall -Wextra -std=c11` and **zero warnings**.
- [ ] No student array, no `struct node`, no mapping table, no global student storage.
- [ ] Every student is created with `malloc()` and freed exactly once.
- [ ] `container_of()` is used to go from `list_head *` to `student *`.
- [ ] `head->next == head && head->prev == head` holds at start and at exit.
- [ ] The README covers: how to run it, the features, the data structures, why a circular doubly linked list, what an intrusive list is, how `container_of()` works, and the problems you solved.

### Key takeaways

- Headers declare, and `.c` files define. Include guards prevent double definitions.
- `gcc -c` compiles one file, and linking connects the pieces. A link error means a definition is missing (or duplicated), not a syntax problem.
- `$(SRCS:.c=.o)`, `%.o: %.c`, `$@`, `$^`, and `$<` let one short Makefile build any number of files.
- `make` knows only the dependencies you tell it. After editing a header, `make clean && make`, or list the headers as prerequisites.
- Check every `scanf()` return value, give every `%s` a width, and test with `< input.txt`.

### Final quiz

1. You edited `student.h` and `make` says *Nothing to be done*. Why, and what do you do?
2. In `$(TARGET): $(OBJS)`, what do `$@` and `$^` expand to?
3. `main.c` compiles, but linking reports `undefined reference to 'student_find'`. Name two possible causes.
4. Why is `scanf("%s", name)` dangerous, and what do you write instead?
5. Which layer is allowed to call `free()` on a student: `list.c`, `student.c`, or `main.c`?

<details>
<summary>Answers</summary>

1. The pattern rule makes each `.o` depend only on its `.c`, so `make` does not know about the header. Run `make clean && make`, or add the header prerequisites to the Makefile.
2. `student_manager`, and `main.o list.o student.o`.
3. `student.c` was not compiled or linked (for example, it is missing from `SRCS`), or the function's name is misspelled in `student.c`, or it is defined `static` there. (A mismatched signature is a compile error instead, *conflicting types*, because `student.c` includes `student.h`.)
4. A name longer than the array overflows it. Use `scanf("%19s", name)` for `char name[20]`.
5. `student.c` (in `student_delete()` and `student_free_all()`). `list.c` must never free, and `main.c` goes through the student API.

</details>

Good luck with the project.
