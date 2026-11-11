# Week 01 — Build Tools, Makefile, and `struct`

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 01 — Struct](../../assignments/week01-struct/) |
| **Demo code** | [`examples/`](examples/) |
| **Next week** | [Week 02 — Operators and Precedence](../week02-operators/) |

## Reference slide reading

The two PDFs already beside this week's deck are the starting references:

- [Pointers Revisited](%5BSlide%5D%2001.%20Pointers%20Revisited.pdf), pp. 3-12:
  addresses, dereferencing, `NULL`, and passing a pointer value. Run
  [`pointer_basics.c`](examples/pointer_basics.c) and
  [`struct_pointer.c`](examples/struct_pointer.c) after the toolchain introduction.
- [Structures, Unions and Enums](%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf),
  pp. 3-22 and 24-30: tags, initialization, assignment, parameter/return values,
  and nested members. Start with [`struct_basics.c`](examples/struct_basics.c);
  nesting and return-value examples are extensions. Enums (pp. 40-45) may be a
  short preview for Week 02's masks.
- [Strings](../week02-operators/%5BSlide%5D%2003.%20Strings.pdf), pp. 3-14:
  use as a brief reference for `char title[32]`, the terminating `\0`, and the
  difference between an array and a pointer to a string literal.

Save the allocation example (Structures p. 23) and pointer-to-pointer work
(Pointers pp. 25-26) for Week 03. Array interfaces fit Week 02; union storage,
tagged variants, callbacks, and complex declarations are later extensions.
The [course reading map](../README.md#reference-pdf-placement) gives their
week-by-week placement. Page numbers throughout are one-based PDF pages.

## Learning Objectives

By the end of this session you can:

1. Compile and run a C program with `gcc -Wall -Wextra -std=c11`.
2. Read a compiler warning and find the line it points to.
3. Explain the parts of a Makefile rule: target, prerequisites, recipe.
4. Build, run, and clean every weekly assignment with `make` and `make clean`.
5. Write a small Makefile from scratch.
6. Define and initialize a `struct` and access its members with `.`.
7. Use a pointer to a struct with `->`, and explain why passing a pointer lets a function change the caller's data.

---

## 0. Course Introduction

### 0.1 Where we are going

In eight weeks you will build a **Student Management System** on top of this linked list design:

```c
struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;   /* the list lives *inside* the object */
};
```

Today almost nothing in this snippet will make sense. By Week 06 you will be able to explain every line, and why there is no `struct node` anywhere.

### 0.2 Roadmap

| Week | Topic | The question we answer |
|---|---|---|
| 1 | Build tools, `struct`, pointers | How do I build a program, and how do I group data? |
| 2 | Operators and precedence | What does `*p->next` or `flags & MASK == 0` really mean? |
| 3 | Dynamic memory and singly linked list | How do I create objects at run time, and how do I chain them together? |
| 4 | Doubly linked list and circular list with a sentinel | How do I walk backwards, delete in O(1), and get rid of every `NULL` special case? |
| 5 | Intrusive linked list | Why put the links *inside* the data? |
| 6 | `offsetof()` and `container_of()` | How do I get the object back from its links? |
| 7 | File I/O | How do I save the list and load it again? |
| 8 | Final project | Putting it all together |

### 0.3 How the repository is organized

```text
README.md                                   course overview and weekly plan
assignments/weekNN-<topic>/README.md        the task for the week
assignments/weekNN-<topic>/starter/         where you write code (assignment_NN.c + Makefile)
lectures/weekNN-<topic>/README.md           these lecture notes
lectures/weekNN-<topic>/weekNN-slides.pptx  the slides
lectures/weekNN-<topic>/examples/           the code shown in class
lectures/slides/                            the sources the slides are generated from
docs/                                       project overview, grading, and submission rules
```

Weeks 03 and 04 have two parts, A and B, so their starter directories hold `assignment_NNa.c` and `assignment_NNb.c`. The final project's starter holds several files (`main.c`, `list.c`, `list.h`, `student.c`, `student.h`) instead of one `assignment_NN.c`.

### 0.4 Ground rules

- All code is C11 and must compile **without warnings** using `-Wall -Wextra -std=c11`.
- Every `malloc()` must be matched by a `free()` (starting in Week 03).
- **Lecture demos use `struct book`. Assignments use `struct student`.** Carrying an idea from one to the other is part of the exercise.

---

## 1. From Source Code to a Running Program

### 1.1 Setting up a toolchain

| Platform | Install | Notes |
|---|---|---|
| Linux (Ubuntu/Debian) | `sudo apt install build-essential` | Installs `gcc` and `make`. |
| macOS | `xcode-select --install` | The `gcc` command is actually Apple Clang. Same flags, slightly different message wording. |
| Windows | Install WSL (Ubuntu), then follow the Linux row | Work inside the WSL terminal. |

Check that both tools are available:

```bash
gcc --version
make --version
```

### 1.2 The compilation pipeline

One `gcc` command runs four stages:

```text
 hello.c ──► preprocessor ──► compiler ──► assembler ──► linker ──► hello
 source      #include,        C → asm      asm → .o      + libc     executable
             #define
```

> Later you will stop `gcc` after single stages: `-E` in Week 06, to see what a macro expands to, and `-c` in Week 08, to compile several `.c` files separately.

### 1.3 The command we use in this course

```bash
gcc -Wall -Wextra -std=c11 assignment_01.c -o week01
```

| Part | Meaning |
|---|---|
| `gcc` | The compiler driver. |
| `-Wall` | Enable the common warnings. |
| `-Wextra` | Enable more warnings than `-Wall` alone (unused parameters, signed/unsigned comparisons, …). |
| `-std=c11` | Compile as ISO C11. |
| `assignment_01.c` | Input source file(s). |
| `-o week01` | Name of the output executable. Without `-o` you get `a.out`. |

### 1.4 Running the program

```bash
./week01
echo $?      # exit status of the last command: 0 means success
```

Why `./`? The shell looks for commands only in the directories listed in `PATH`, and the current directory is not one of them. `./week01` means "the file `week01` in *this* directory".

### 1.5 Warnings are bugs waiting to happen

**Live demo** — [`examples/warnings.c`](examples/warnings.c):

```c
int main(void)
{
    int score = 95;
    int unused;

    printf("score = %s\n", score);
    return 0;
}
```

```bash
gcc -Wall -Wextra -std=c11 warnings.c -o warnings
```

```text
warnings.c:16:28: warning: format specifies type 'char *' but the argument has type 'int' [-Wformat]
warnings.c:14:9: warning: unused variable 'unused' [-Wunused-variable]
2 warnings generated.
```

How to read a diagnostic:

```text
warnings.c : 16 : 28 : warning : format specifies type ...   [-Wformat]
   file      line  col  severity  what is wrong                which flag found it
```

- gcc words the message differently from clang, but the `file:line:column` shape is the same.
- **A warning does not stop the build.** The executable is still produced, and this one will print garbage or crash. That is exactly why we treat warnings as bugs.
- Fix the **first** diagnostic first. Later ones are often caused by the first.

> **Starter-code idiom.** The starter files contain lines like `(void)student;`. That line uses the variable without doing anything, which silences the *unused variable* warning. Delete it once your code actually uses the variable.

---

## 2. `make` and Makefiles

### 2.1 Why `make`?

- Typing `gcc -Wall -Wextra -std=c11 assignment_01.c -o week01` every time is slow and error-prone.
- In Week 08 the project has `main.c`, `list.c`, and `student.c`. You only want to recompile what changed.
- A Makefile *documents* how to build the project. Anyone can clone the repository and type `make`.

Every starter directory in this course already contains a Makefile. Today you learn to read it, use it, and write one yourself.

### 2.2 Anatomy of a rule

```make
target: prerequisites
	recipe
```

| Part | Meaning |
|---|---|
| **target** | The file to build, e.g. `week01`. It can also be the name of an action, e.g. `clean`. |
| **prerequisites** | Files the target depends on, e.g. `assignment_01.c`. |
| **recipe** | Shell command(s) that build the target. **Every recipe line must start with a TAB character, not spaces.** |

`make` runs the recipe when:

- the target file does not exist, **or**
- any prerequisite is **newer** than the target (compared by modification time).

### 2.3 Step 1 — the smallest useful Makefile

[`examples/makefile-steps/Makefile.step1`](examples/makefile-steps/Makefile.step1):

```make
hello: hello.c
	gcc -Wall -Wextra -std=c11 hello.c -o hello
```

**Live demo** (inside `examples/makefile-steps/`):

```bash
make -f Makefile.step1      # -f picks the file; normally make reads "Makefile"
./hello
make -f Makefile.step1      # second time: nothing to do
touch hello.c               # pretend we edited hello.c
make -f Makefile.step1      # rebuilds
```

```text
$ make -f Makefile.step1
gcc -Wall -Wextra -std=c11 hello.c -o hello
$ make -f Makefile.step1
make: `hello' is up to date.
```

How `make` decides:

```text
hello.c  modified 10:05   hello  built 10:03   → prerequisite is newer → rebuild
hello.c  modified 10:05   hello  built 10:06   → target is newer       → nothing to do
```

> In class you can also copy each step to a file named `Makefile` (`cp Makefile.step1 Makefile`) and type plain `make`.

### 2.4 Step 2 — `all` and `clean`

[`Makefile.step2`](examples/makefile-steps/Makefile.step2):

```make
all: hello

hello: hello.c
	gcc -Wall -Wextra -std=c11 hello.c -o hello

clean:
	rm -f hello
```

- `make` with no arguments builds the **first** target in the file, the *default goal*. By convention it is named `all`.
- `all` has no recipe. It only says "to finish `all`, `hello` must be up to date".
- `make clean` builds the target `clean`. Its recipe deletes the build results. No file named `clean` is ever created, so `clean` names an action rather than a file.

```bash
make -f Makefile.step2          # same as: make -f Makefile.step2 all
make -f Makefile.step2 clean    # rm -f hello
```

### 2.5 Step 3 — variables (this is your starter Makefile)

Here is the starter Makefile from [`assignments/week01-struct/starter/Makefile`](../../assignments/week01-struct/starter/Makefile), unchanged:

```make
CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGET = week01

all: $(TARGET)

$(TARGET): assignment_01.c
	$(CC) $(CFLAGS) assignment_01.c -o $(TARGET)

clean:
	rm -f $(TARGET)
```

| Line | Meaning |
|---|---|
| `CC = gcc` | Variable: which compiler to use. `CC` is the conventional name. |
| `CFLAGS = -Wall -Wextra -std=c11` | Variable: flags for the C compiler. `CFLAGS` is the conventional name. |
| `TARGET = week01` | Variable: the name of the executable. |
| `all: $(TARGET)` | Default goal. `$(TARGET)` expands to `week01`. |
| `$(TARGET): assignment_01.c` | `week01` depends on `assignment_01.c`. |
| `$(CC) $(CFLAGS) assignment_01.c -o $(TARGET)` (TAB-indented) | Expands to `gcc -Wall -Wextra -std=c11 assignment_01.c -o week01`, the exact command from Part 1. |
| `clean:` / `rm -f $(TARGET)` | Delete the executable. |

Use `make -n` (dry run) to print the commands **without** running them. On a tree that is already built it only says *Nothing to be done*, so clean first:

```text
$ make clean
rm -f week01
$ make -n
gcc -Wall -Wextra -std=c11 assignment_01.c -o week01
```

The starter Makefiles for Weeks 02, 05, 06, and 07 have exactly this shape. Only the executable name (`TARGET = week02`, …) and the source file (`assignment_02.c`, …) change. Read one and you have read them all. Weeks 03 and 04 have two parts, A and B, so their Makefiles build two programs: for example `TARGETS = week03a week03b`, `all: $(TARGETS)`, and one rule per program. `make` builds both, and `make clean` removes both.

### 2.6 Step 4 — `.PHONY` and a `run` target

**Live demo — the problem** (in `examples/makefile-steps/`, with the Step 3 Makefile, which has no `.PHONY`):

```bash
touch clean                    # accidentally create a file named "clean"
make -f Makefile.step3 clean
```

```text
make: `clean' is up to date.
```

Nothing was deleted. `make` saw a *file* called `clean` with no prerequisites, decided it was up to date, and skipped the recipe. (Run `rm clean` afterwards.)

**The fix:** declare action targets as *phony*, meaning they are not files.

[`Makefile.step4`](examples/makefile-steps/Makefile.step4):

```make
CC = gcc
CFLAGS = -Wall -Wextra -std=c11
TARGET = hello

all: $(TARGET)

$(TARGET): hello.c
	$(CC) $(CFLAGS) hello.c -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)

.PHONY: all run clean
```

- `make run` first makes sure `hello` is up to date, then runs it, so it is build-and-run in one command.
- The Week 01–07 starter Makefiles do **not** declare `.PHONY`. They work fine as long as you never create a file named `all` or `clean`. The Week 08 starter Makefile does declare it. You may add `.PHONY` (and `run`) to your own Makefiles.

### 2.7 Common errors

| What you see | Cause | Fix |
|---|---|---|
| `Makefile:2: *** missing separator.  Stop.` | A recipe line starts with spaces instead of a TAB. | Replace the spaces with one TAB. `cat -et Makefile` shows a TAB as `^I`. |
| `make: *** No targets specified and no makefile found.  Stop.` | You are in the wrong directory. | `cd` into the `starter/` directory, or use `make -C <dir>`. |
| `make: *** No rule to make target 'assignment_01.c', needed by 'week01'.  Stop.` | A prerequisite file does not exist (typo, wrong directory). | Check file names with `ls`. |
| `make: 'week01' is up to date.` / `Nothing to be done for 'all'.` | Not an error. Nothing changed since the last build. | Edit a source file, or `make clean && make`. |
| Compiler errors, then `make: *** [week01] Error 1` | `gcc` failed, so `make` stopped. | Scroll **up** and fix the first compiler error. |

> **Editor tip.** VS Code keeps TABs in files named `Makefile` automatically. In Vim, use `:set noexpandtab`. If an editor converts TABs to spaces, you get *missing separator*.

> GNU Make 3.81 (the version on macOS) quotes names as `` `week01' ``. Newer versions print `'week01'`. The meaning is the same.

### 2.8 Your workflow for every week

```bash
cd assignments/week01-struct/starter
make             # build
./week01         # run
# ... edit assignment_01.c ...
make             # rebuilds only because assignment_01.c changed
make clean       # remove the executable before you commit
```

From the repository root, without `cd`:

```bash
make -C assignments/week01-struct/starter
```

### 2.9 Cheat sheet

| Command | Effect |
|---|---|
| `make` | Build the default goal (the first target, usually `all`). |
| `make clean` | Run the `clean` recipe. |
| `make -n` | Print the commands without running them. |
| `make -C dir` | Run `make` as if you were in `dir`. |
| `make -f file` | Use `file` instead of `Makefile`. |

`make -B` and overriding variables (`make CFLAGS=...`) come in Week 03.

---

## 3. Grouping Data with `struct`

### 3.1 Why `struct`?

Without `struct`, one book is three unrelated variables:

```c
int book1_id = 1;
char book1_title[32] = "The C Programming Language";
int book1_year = 1978;
/* book2_id, book2_title, book2_year, ... */
```

Nothing tells the compiler (or the reader) that these belong together. You cannot pass "a book" to a function or return one. A `struct` groups them into a single object.

### 3.2 Defining a struct type

```c
struct book {
    int id;
    char title[32];
    int year;
};              /* ← this semicolon is required */
```

- The type name is the two words `struct book`.
- The definition creates **no variable**. It only describes a layout.
- The core linked-list examples keep the word `struct` visible so you always know you are dealing with a structure. The [structure supplement](examples/structures-unions-enums/) also demonstrates `typedef` alias syntax used in the reference PDF; an alias does not create a distinct type.

### 3.3 Creating and initializing variables

```c
struct book b1 = { 1, "The C Programming Language", 1978 };          /* positional  */
struct book b2 = { .id = 2, .title = "Linux Kernel Development",
                   .year = 2010 };                                   /* designated  */
struct book b3 = {0};                                                /* all zero    */
struct book b4;                                                      /* GARBAGE!    */
```

- **Designated initializers** (C99) name each member. They are easier to read and do not break when members are reordered. Prefer them.
- Members you do not mention in an initializer are set to zero.
- A local variable without an initializer (`b4`) contains whatever bytes were already in memory. Never read it before you assign it.

### 3.4 Accessing members with `.`

```c
b1.year = 1988;
printf("%d %s %d\n", b1.id, b1.title, b1.year);
```

### 3.5 Strings inside a struct

`char title[32]` holds **at most 31 characters** plus the terminating `'\0'`. Likewise, the assignment's `char name[20]` holds at most 19 characters.

```c
b1.title = "New Title";                                   /* ERROR: arrays cannot be assigned */
strcpy(b1.title, "New Title");                            /* OK only if it surely fits        */
snprintf(b1.title, sizeof(b1.title), "%s", some_string);  /* bounded copy: never overflows     */
```

### 3.6 Struct assignment copies everything

```c
b3 = b1;          /* copies id, all 32 bytes of title, and year */
b3.id = 3;        /* b1 is not affected                         */
```

After the copy, `b1` and `b3` are two independent objects. Contrast this with pointers in Part 4.

### 3.7 A first look at memory layout

```text
struct book b1;                          sizeof(struct book) == 40

offset   0        4                                   36       40
         +--------+-----------------------------------+--------+
         |   id   |            title[32]              |  year  |
         +--------+-----------------------------------+--------+
```

Members are stored **in declaration order**. The compiler may insert unused *padding* bytes between members. We study offsets and padding in Week 06, because they are the key to `container_of()`.

**Live demo** — [`examples/struct_basics.c`](examples/struct_basics.c):

```bash
cd lectures/week01-struct/examples
make
./struct_basics
```

```text
b1: id=1 title="The C Programming Language" year=1978
b2: id=2 title="Linux Kernel Development" year=2010
b3: id=0 title="" year=0
after copy:
b1: id=1 title="The C Programming Language" year=1978
b3: id=3 title="A Copy of K&R" year=1978
sizeof(struct book) = 40 bytes
strlen(b1.title)    = 26 characters
```

---

## 4. Pointers and Structs

### 4.1 Pointer recap

```text
        x                         p
   +----------+             +--------------+
   |    10    |  ◄───────── | address of x |
   +----------+             +--------------+
   address 0x...568
```

```c
int x = 10;
int *p = &x;     /* &x : "the address of x"            */
*p = 20;         /* *p : "the object p points to" → x  */
int *q = NULL;   /* NULL : points nowhere. Never *q.   */
```

Print addresses with `%p` and a `(void *)` cast: `printf("%p\n", (void *)p);`

**Live demo** — [`examples/pointer_basics.c`](examples/pointer_basics.c).

### 4.2 Pointer to a struct

```c
struct book book = { .id = 1, .title = "Operating Systems", .year = 2010 };
struct book *p = &book;

(*p).year = 2024;   /* follow the pointer, then select the member */
p->year   = 2024;   /* exactly the same, easier to read            */
```

**Precedence trap:** `*p.year` means `*(p.year)` and does not compile (*"did you mean to use '->'?"*). Rules like this are next week's topic.

| You have … | Use | Example |
|---|---|---|
| a struct variable | `.` | `book.year` |
| a pointer to a struct | `->` | `p->year` |

### 4.3 Passing structs to functions

```c
static void set_year_by_value(struct book b, int year)     /* b is a COPY       */
{
    b.year = year;
    printf("  inside set_year_by_value: b.year = %d\n", b.year);
}

static void set_year_by_pointer(struct book *b, int year)  /* b points to ORIGINAL */
{
    b->year = year;
}

static void print_book(const struct book *b)               /* read-only access  */
{
    printf("[%d] %s (%d)\n", b->id, b->title, b->year);
}
```

```text
 main()                          set_year_by_value(book, 1999)
 +-------------------+           +-------------------+
 | book  year=2010   |  copy ──► | b     year=1999   |   ← the copy changes,
 +-------------------+           +-------------------+     then disappears
          ▲
          |                      set_year_by_pointer(&book, 2024)
          |                      +-------------------+
          +──────────────────────| b = &book         |   ← writes go to main's book
                                 +-------------------+
```

- Passing by value copies the whole struct, which is expensive for large structs and cannot change the caller's object.
- Passing a pointer is cheap, and the function can modify the original.
- Add `const` when the function only reads. The compiler then stops you from modifying the struct by accident.

**Live demo** — [`examples/struct_pointer.c`](examples/struct_pointer.c):

```text
book.year = 2010
(*p).year = 2010
p->year   = 2010
  inside set_year_by_value: b.year = 1999
after set_year_by_value:   [1] Operating Systems (2010)
after set_year_by_pointer: [1] Operating Systems (2024)
&book       = 0x16b886540
&book.id    = 0x16b886540
&book.title = 0x16b886544
&book.year  = 0x16b886564
```

Look at the last four lines. `&book` and `&book.id` are the **same address**, and each member sits at a fixed distance from the start. Remember this for Week 06.

### 4.4 Looking ahead

A struct can contain a pointer to its own type:

```c
struct node {
    struct book data;
    struct node *next;   /* points to another struct node */
};
```

That one idea is the whole linked list. We get there in Week 03.

### 4.5 Supplemental examples from the reference PDFs

The [example guide](examples/README.md) extends the core demos with two reference
sets. Each set includes independent runnable programs, PDF page mappings, and
short prediction/modification exercises.

| Reference | Examples | Main additions |
|---|---|---|
| `[Slide] 01. Pointers Revisited.pdf` | [Pointer supplement](examples/pointers-revisited/) | Pointer parameters and `**`, array arithmetic and `sizeof`, `void *`, pointer/array declarations, 2D arrays, function pointers, and complex declarations. |
| `[Slide] 05. Structures, Unions and Enums.pdf` | [Structure supplement](examples/structures-unions-enums/) | Structure return values and aliases, nested structures and arrays, shallow/deep copying, union storage, enums, and tagged unions. |

Use these throughout the course: pointer expressions fit Week 02, allocation and
ownership fit Week 03, and layout and generic callbacks fit Week 06. The core
Week 01 lab remains the starting point.

```bash
make -C lectures/week01-struct/examples supplements
make -C lectures/week01-struct/examples/pointers-revisited run
make -C lectures/week01-struct/examples/structures-unions-enums run
```

---

## 5. Lab

### Lab A — Write a Makefile from scratch

1. Create a scratch directory **outside** the repository and a `hello.c` that prints your name.
2. Without copying, write a `Makefile` that has:
   - variables `CC`, `CFLAGS`, `TARGET`
   - targets `all`, `run`, `clean`
   - a `.PHONY` line
3. Verify each behavior:

   ```bash
   make            # builds
   make            # "Nothing to be done for 'all'"
   touch hello.c
   make            # rebuilds
   make run        # builds if needed, then runs
   make clean      # removes the executable
   ```

4. **Break it on purpose.** Replace the TAB before a recipe with four spaces, run `make`, and read the error. Run `cat -et Makefile` to see the difference (`^I` is a TAB), then fix it.
5. **Bonus:** `touch clean`, then run `make clean` with and without the `.PHONY` line.

**Checkpoint:** show `make run` output to the instructor or TA.

### Lab B — Week 01 assignment

Task: [assignments/week01-struct/README.md](../../assignments/week01-struct/README.md)

1. Build the untouched starter first, so you know the toolchain works:

   ```bash
   cd assignments/week01-struct/starter
   make
   ./week01        # prints nothing yet, which is expected
   ```

2. Read the `TODO` comment in `assignment_01.c`.
3. Store one student's ID, name, and score, then print them.
4. Create a `struct student *` that points to the student. Change a value **through the pointer** and print again.
5. Use `.` on the variable and `->` on the pointer. Do not use an array of students.
6. Remove the `(void)student;` line once the variable is used, and rebuild until there are **zero warnings**.
7. `make clean` before you commit.

Self-check:

- Does your name copy stay within 19 characters?
- If you moved printing into a function, does it take `const struct student *`?

---

## 6. Wrap-up

### Key takeaways

- `gcc -Wall -Wextra -std=c11 main.c -o prog` compiles a program. Warnings do **not** stop the build, so you must stop at them.
- A Makefile rule is `target: prerequisites` plus a **TAB**-indented recipe. `make` rebuilds a target only when a prerequisite is newer.
- `make` builds the first target. `make clean` deletes build results. `.PHONY` marks targets that are actions, not files.
- A `struct` groups related data. Assignment copies the whole struct.
- `.` works on a struct and `->` on a pointer to a struct. Pass a pointer when a function must modify the caller's object.

### Exit quiz

1. Does `gcc -Wall -Wextra` refuse to build a program that has warnings?
2. A recipe line begins with four spaces. What happens when you run `make`?
3. You run `make` twice in a row without editing anything. What does the second run print, and why?
4. Given `struct book *p`, which of these are valid: `p.year`, `p->year`, `(*p).year`, `*p.year`?
5. Why does `set_year_by_value()` not change the caller's `book`?
6. A file named `clean` exists and `.PHONY` is missing. What does `make clean` do?

<details>
<summary>Answers</summary>

1. No. Warnings are reported, but the executable is still produced. You have to fix them yourself.
2. `*** missing separator.  Stop.` Recipe lines must start with a TAB.
3. ``make: Nothing to be done for `all'.`` `week01` is newer than every prerequisite, so there is nothing to rebuild. (`make week01` would print `` `week01' is up to date ``.)
4. `p->year` and `(*p).year`. `p.year` is an error because `p` is a pointer. `*p.year` parses as `*(p.year)`.
5. The parameter `b` is a copy. The function changes the copy, which disappears when the function returns.
6. Nothing. `make` treats `clean` as an up-to-date file and skips the recipe.

</details>

### Next week

Today `*p.year` failed to compile because of a precedence rule. Many similar mistakes **do** compile and silently compute the wrong thing. → **Week 02 — Operators and Precedence**: how C groups `*`, `->`, `++`, `&&`, `&`, and friends.
