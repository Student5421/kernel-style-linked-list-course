# Week 03 — Dynamic Memory

| | |
|---|---|
| **Session** | 3 hours (lecture + live coding + lab) |
| **Assignment** | [Week 03 — Dynamic Memory](../../assignments/week03-dynamic-memory/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 02](../week02-operators/) · [Week 04](../week04-singly-linked-list/) |

## Session Plan

| Time | Segment | Format |
|---|---|---|
| 0:00 – 0:10 | Review of Week 02 | Quiz + discussion |
| 0:10 – 0:55 | Part 1 — Where do variables live? | Lecture + live demo |
| 0:55 – 1:05 | Break | |
| 1:05 – 1:50 | Part 2 — `malloc()`, `free()`, and ownership | Lecture + live coding |
| 1:50 – 2:50 | Lab — Week 03 assignment + bug hunt | Hands-on |
| 2:50 – 3:00 | Wrap-up and exit quiz | Discussion |

## Learning Objectives

By the end of this session you can:

1. Name the memory regions of a running C program (code, data/bss, heap, stack) and say what lives in each.
2. Explain the *lifetime* of a local variable and why returning its address is a bug.
3. Allocate a struct with `malloc()`, check for failure, and release it with `free()`.
4. Recognize the four classic heap bugs: leak, use-after-free, double free, missing `NULL` check.
5. Write a `create` / `destroy` function pair and state who *owns* the object.

---

## 0. Review of Week 02 (10 min)

Warm-up questions:

1. How is `*q++` grouped, and what does it change?
2. Why is `if (flags & BOOK_DAMAGED == 0)` wrong?
3. What do `(double)(7 / 2)` and `(double)7 / 2` evaluate to?
4. Rewrite `if (p->id == id && p != NULL)` so that it cannot crash.

Today's question: **So far every struct has been a local variable. What happens to it when the function returns?**

---

## 1. Where Do Variables Live? (45 min)

### 1.1 The memory layout of a process

```text
 high addresses
 +--------------------------+
 |          stack           |   local variables, function parameters
 |            |             |   grows down with each function call
 |            v             |
 |                          |
 |            ^             |
 |            |             |
 |           heap           |   malloc()/free(): you decide the lifetime
 +--------------------------+
 |  bss   (zeroed globals)  |   int global_zero;
 |  data  (initialized)     |   int global_counter = 1;  static int x = 2;
 +--------------------------+
 |  text  (machine code)    |   your functions
 +--------------------------+
 low addresses
```

The exact addresses differ from machine to machine and from run to run. What is the same everywhere is that different regions have different **lifetimes**.

### 1.2 Three kinds of storage duration

| Storage | Example | Created | Destroyed | Who manages it |
|---|---|---|---|---|
| **Automatic** (stack) | `int x;` inside a function | when the block is entered | when the block is left | the compiler |
| **Static** (data/bss) | global variables, `static int x;` | before `main()` starts | when the program ends | the compiler |
| **Allocated** (heap) | `malloc(...)` | when you call `malloc()` | when you call `free()` | **you** |

**Live demo** — [`examples/memory_map.c`](examples/memory_map.c):

```bash
cd lectures/week03-dynamic-memory/examples
make
./memory_map
```

```text
data  : &global_counter = 0x102b34000
bss   : &global_zero    = 0x102b34008
data  : &static_local   = 0x102b34004
heap  : heap            = 0x103331520
stack : &local          = 0x16d2d2568
stack : &heap           = 0x16d2d2560   (the pointer itself is on the stack)
each call gets its own stack frame:
  depth 1: &local = 0x16d2d2538
  depth 2: &local = 0x16d2d2508
  depth 3: &local = 0x16d2d24d8
```

Things to point out:

- The `heap` **pointer variable** lives on the stack. The `int` **it points to** lives on the heap.
- Each recursive call has its own `local`, at a lower address each time. The stack grows down.

### 1.3 Stack frames and lifetime

```text
 main() calls make_book_bad()            make_book_bad() returns

 +---------------------+                 +---------------------+
 | make_book_bad frame |                 |  (dead memory —     |
 |   struct book b     | ◄── &b          |   will be reused by |
 +---------------------+                 |   the next call)    |
 | main frame          |                 +---------------------+
 |   struct book *p    |                 | main frame          |
 +---------------------+                 |   p ──────────────► ??? (dangling)
                                         +---------------------+
```

When a function returns, its frame is popped. The memory is not erased, but it **no longer belongs to you**. The next function call reuses it.

### 1.4 The classic bug: returning the address of a local

[`examples/dangling_local.c`](examples/dangling_local.c):

```c
static struct book *make_book_bad(void)
{
    struct book b = { .id = 1, .title = "Dangling", .year = 2000 };

    return &b;          /* b dies when this function returns */
}
```

The compiler catches this one, if you have warnings enabled:

```text
clang: warning: address of stack memory associated with local variable 'b' returned [-Wreturn-stack-address]
gcc:   warning: function returns address of local variable [-Wreturn-local-addr]
```

Using `p->id` afterwards is **undefined behavior**. It may print `1`, print garbage, or crash, and it can change from one run to the next.

### 1.5 Why we need the heap

The stack cannot help in two situations:

1. **An object must outlive the function that creates it.** A `book_create()` function has to return something that still exists after it returns.
2. **We do not know how many objects we need** until the program runs. A user may add 3 students or 3,000.

Both are exactly what a linked list needs (Week 04). The heap gives us memory whose lifetime **we** control.

---

## 2. `malloc()`, `free()`, and Ownership (45 min)

### 2.1 The API

```c
#include <stdlib.h>

void *malloc(size_t size);               /* size bytes, NOT initialized, or NULL */
void *calloc(size_t count, size_t size); /* count*size bytes, all ZERO, or NULL  */
void  free(void *ptr);                   /* release; free(NULL) does nothing     */
```

- `malloc()` returns `void *`, a "pointer to anything". In C it converts to any object pointer type without a cast.
- The memory from `malloc()` contains **garbage** until you write to it.
- `malloc()` can **fail** and return `NULL`.

### 2.2 The allocation idiom

```c
struct book *b = malloc(sizeof(*b));     /* preferred */
struct book *b = malloc(sizeof(struct book));   /* also correct */
```

`sizeof(*b)` means "the size of whatever `b` points to". If you later change the type of `b`, the size stays correct. Note that `sizeof` does **not** dereference `b`, so this is safe even though `b` is not initialized yet.

A common mistake:

```c
struct book *b = malloc(sizeof(b));      /* WRONG: size of a POINTER (8 bytes), not of a book */
```

### 2.3 Always check for `NULL`

```c
struct book *b = malloc(sizeof(*b));

if (b == NULL) {
    fprintf(stderr, "Error: out of memory\n");
    return EXIT_FAILURE;
}
b->id = 1;    /* safe: b is not NULL */
```

Allocation failure is rare on a laptop. It is not rare on embedded systems or in the kernel, and dereferencing `NULL` crashes your program. Checking is a habit, not an optimization.

### 2.4 What it looks like in memory

```text
        stack                                heap
 +---------------------+          +-----------------------------------+
 | b = 0x103331520     | ───────► | id | title[32]           | year   |
 +---------------------+          +-----------------------------------+
   (dies at end of main)            (lives until free(b))
```

**Live demo** — [`examples/malloc_basics.c`](examples/malloc_basics.c): one `int`, one `struct book`, and a zeroed array from `calloc()`, each followed by `free()`.

### 2.5 After `free()`

```c
free(b);
/* b still holds the old address, but the memory is no longer yours */
b = NULL;     /* good habit: a NULL pointer fails loudly, a dangling one fails randomly */
```

`free()` does **not** change your pointer variable. It cannot, because it received a copy of the address (pass by value, Week 01).

### 2.6 The four classic heap bugs

| Bug | Code | What happens |
|---|---|---|
| **Memory leak** | `b = malloc(...); b = malloc(...);` | The first block can never be freed. Memory use grows until the program ends. |
| **Use after free** | `free(b); printf("%d", b->id);` | Undefined behavior: may "work", print garbage, or crash later somewhere else. |
| **Double free** | `free(b); free(b);` | Undefined behavior: often corrupts the allocator and aborts. |
| **Missing `NULL` check** | `b = malloc(...); b->id = 1;` | Crash when allocation fails. |

Two more you will meet soon:

- **Buffer overflow:** `strcpy(b->title, very_long_string);` writes past the end of `title`. Use `snprintf(b->title, sizeof(b->title), "%s", s);`.
- **Reading uninitialized memory:** `malloc()` returns garbage, so assign every member (or use `calloc()`).

### 2.7 Ownership: who calls `free()`?

Every heap object needs exactly **one owner**, the piece of code responsible for freeing it **exactly once**.

```c
/* Returns a new heap-allocated book, or NULL if out of memory.
 * The caller owns the result and must call book_destroy() on it. */
static struct book *book_create(int id, const char *title, int year)
{
    struct book *b = malloc(sizeof(*b));

    if (b == NULL)
        return NULL;

    b->id = id;
    snprintf(b->title, sizeof(b->title), "%s", title);
    b->year = year;
    return b;
}

static void book_destroy(struct book *b)
{
    free(b);
}
```

- The **comment** states the ownership contract. Write one for every function that allocates.
- `create` and `destroy` come in pairs. When you read `book_create()`, look for the matching `book_destroy()`.
- Returning a pointer to heap memory is fine, unlike returning a pointer to a local, because the heap object lives on after the function returns.

> **Preview of the final project.** The spec separates *allocation*, *linking*, and *freeing* on purpose: `student_create()` allocates but does **not** insert into the list, `list_del()` unlinks but does **not** free, and `student_delete()` does *find → unlink → free*. Today's ownership rule is the reason.

### 2.8 Checking for leaks without extra tools

Count live objects: increment in `create`, decrement in `destroy`, and print the count at exit.

**Live demo** — [`examples/book_factory.c`](examples/book_factory.c):

```text
[1] The C Programming Language (1978)
[2] A title that is far too long to (2024)
live books: 2
live books at exit: 0
```

- `live books at exit: 0` means every `create` had a matching `destroy`.
- Book 2's title was **truncated safely** to 31 characters by `snprintf()`. With `strcpy()` it would have overflowed the array.

---

## 3. Lab (60 min)

### Lab A — Week 03 assignment (30 min)

Task: [assignments/week03-dynamic-memory/README.md](../../assignments/week03-dynamic-memory/README.md)

1. `cd assignments/week03-dynamic-memory/starter && make && ./week03`
2. Allocate **one** `struct student` with `malloc()`.
3. Check the result for `NULL`, and print an error and return a non-zero status on failure.
4. Store ID, name, and score through the pointer (`->`). Copy the name with a bounded copy (at most 19 characters).
5. Print the student.
6. `free()` it before `main()` returns. Optionally set the pointer to `NULL`.
7. Build with zero warnings.

### Lab B — Bug hunt (20 min)

The program below compiles, but it contains **six** memory bugs. Your compiler may even warn about one or two of them. Find each one, name it (use §2.2 and the table in §2.6), and fix it. Do it on paper first, then type it in and test.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct book {
    int id;
    char title[32];
    int year;
};

int main(void)
{
    struct book *a = malloc(sizeof(a));
    struct book *b;

    a->id = 1;
    strcpy(a->title, "Structure and Interpretation of Computer Programs");
    a->year = 1985;

    b = malloc(sizeof(*b));
    b = a;

    free(a);
    printf("%d %s\n", b->id, b->title);
    free(b);
    return 0;
}
```

<details>
<summary>Answers</summary>

1. `malloc(sizeof(a))` allocates the size of a **pointer**, not a book. Use `sizeof(*a)`.
2. No `NULL` check after either `malloc()`.
3. `strcpy()` of a 49-character title into `char title[32]`: **buffer overflow**. Use `snprintf(a->title, sizeof(a->title), "%s", ...)`.
4. `b = malloc(...); b = a;` **leaks** the first block allocated for `b`.
5. `free(a)` followed by `b->id`: **use after free**, because `b` and `a` point to the same block.
6. `free(b)` after `free(a)`: **double free** of that same block.

</details>

### Lab C — Stretch goals (10 min, optional)

1. Write `student_create(int id, const char *name, int score)` and `student_destroy()` for your `struct student`, following `book_create()`. You will reuse the idea in the final project.
2. Add a live-object counter, create two students, and confirm the counter is `0` at exit.
3. Make `student_create()` return `NULL` for invalid input (for example, a score outside 0–100), and handle that in `main()`.

---

## 4. Wrap-up (10 min)

### Key takeaways

- Locals live on the **stack** and die when their function returns. Never return their address.
- Heap memory from `malloc()` lives until **you** call `free()`.
- `malloc(sizeof(*p))`, check for `NULL`, initialize every member, and `free()` exactly once.
- Every heap object has one **owner**. Write the ownership contract in a comment.
- `free()` does not reset your pointer. Set it to `NULL` yourself.

### Exit quiz

1. Where does the pointer variable `b` live in `struct book *b = malloc(sizeof(*b));`? Where does the book live?
2. What is wrong with `malloc(sizeof(b))`?
3. Is `free(NULL)` an error?
4. After `free(p);`, what value does `p` hold?
5. Why is it fine for `book_create()` to return a pointer, but not fine for `make_book_bad()`?

<details>
<summary>Answers</summary>

1. `b` is a local variable on the stack. The book it points to is on the heap.
2. It allocates the size of a pointer (typically 8 bytes) instead of the size of a `struct book`.
3. No. `free(NULL)` does nothing.
4. The same address as before. It is now a *dangling* pointer, so set it to `NULL`.
5. `book_create()` returns heap memory, which lives until `free()`. `make_book_bad()` returns the address of a stack variable that died when the function returned.

</details>

### Next week

We can now create as many objects as we like at run time. But how do we **keep track** of them without an array? → **Week 04 — Singly Linked List**: every object holds a pointer to the next one.
