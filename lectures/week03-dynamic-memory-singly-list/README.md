# Week 03 — Dynamic Memory and Singly Linked List

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 03 — Assignment 03A (Dynamic Memory) and Assignment 03B (Singly Linked List)](../../assignments/week03-dynamic-memory-singly-list/) |
| **Demo code** | [`examples/`](examples/) · [Teaching guide](examples/README.md) |
| **Previous / Next** | [Week 02](../week02-operators/) · [Week 04](../week04-doubly-circular-list/) |

This session has two halves. Parts 1 and 2 look at where variables live and move objects onto the heap with `malloc()` and `free()`, under a clear ownership rule. Parts 3 and 4 use those heap objects to build the course's first data structure, a singly linked list: nodes, traversal, insertion, freeing the whole list, and the design of delete.

## Reference slide reading

Page ranges below use one-based PDF pages. Start after the pointer and
`sizeof` review in Weeks 01-02, then use the slides in this order before
building the singly linked list.

| Order | Reference pages | Connection to this lecture |
|---|---|---|
| 1 | [Dynamic Memory Allocation](%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf), pp. 2-5 | Motivation, memory regions, and storage lifetime; pair with [`memory_map.c`](examples/memory_map.c). |
| 2 | [Dynamic Memory Allocation](%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf), pp. 6-24 | Allocation APIs, the visual allocation/free trace (pp. 9-19), dynamic arrays, `calloc()`, `realloc()`, and failure checks; pair with [`malloc_basics.c`](examples/malloc_basics.c). |
| 3 | [Dynamic Memory Allocation](%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf), pp. 25-27 | Lost ownership, leaks, and dangling pointers; connect to the create/destroy pair in [`book_factory.c`](examples/book_factory.c), then freeing list nodes. |
| 4 | [Structures, Unions and Enums](../week01-struct/%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf), p. 23 | A heap-allocated struct can own a separate heap string. Use [`dynamic_struct_copy.c`](../week01-struct/examples/structures-unions-enums/dynamic_struct_copy.c) to compare borrowed shallow copies with an owning deep clone. |
| 5 (optional) | [Dynamic Memory Allocation](%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf), pp. 28-29 | Allocate a real table of row pointers, then each row; release rows before the table. First revisit [`matrix_arguments.c`](../week01-struct/examples/pointers-revisited/matrix_arguments.c) and the distinction between `int **` and a pointer to an array. |

For generic allocation results and changing a head pointer, revisit
[Pointers Revisited](../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf),
pp. 17-19 and 25-26, alongside
[`pass_by_value.c`](../week01-struct/examples/pointers-revisited/pass_by_value.c).
After introducing allocation, revisit [Strings](../week02-operators/%5BSlide%5D%2003.%20Strings.pdf)
pp. 49-60 for destination capacity and copying, pp. 68-72 for byte-counted memory
operations, and pp. 74-81 for length and pointer traversal. A copied pointer
does not clone its allocation, and a string allocation needs its terminating
`'\0'`. `memcpy()` requires non-overlapping regions; `memmove()` handles overlap.

Check every allocation before use. For `realloc()` with a positive new size,
save the result in a temporary pointer and replace the owner only on success;
on failure, the original allocation still needs to be released. Use `free()`
explicitly when releasing storage rather than relying on `realloc(p, 0)`.
The layout and reuse diagrams illustrate lifetimes, not guaranteed addresses
or allocator placement.

## Learning Objectives

By the end of this session you can:

1. Name the memory regions of a running C program (code, data/bss, heap, stack) and say what lives in each.
2. Explain the *lifetime* of a local variable and why returning its address is a bug.
3. Allocate a struct with `malloc()`, check for failure, and release it with `free()`.
4. Recognize the four classic heap bugs: leak, use-after-free, double free, missing `NULL` check.
5. Write a `create` / `destroy` function pair and state who *owns* the object.
6. Compare arrays and linked lists in terms of memory layout and the cost of insert, delete, and indexing.
7. Define a self-referential `struct node` and draw a list as boxes and arrows.
8. Traverse a list with a cursor pointer, and handle the empty list (`head == NULL`).
9. Explain why `push_front()` needs `struct node **` (or must return the new head).
10. Free an entire list without a use-after-free.
11. Identify every case that `delete` must handle.

---

## 0. Review of Week 02

Warm-up questions:

1. How is `*q++` grouped, and what does it change?
2. Why is `if (flags & BOOK_DAMAGED == 0)` wrong?
3. What do `(double)(7 / 2)` and `(double)7 / 2` evaluate to?
4. Rewrite `if (p->id == id && p != NULL)` so that it cannot crash.

Today's question: **So far every struct has been a local variable. What happens to it when the function returns?**

---

## 1. Where Do Variables Live?

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
cd lectures/week03-dynamic-memory-singly-list/examples
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

Both are exactly what a linked list needs (Part 3, later today). The heap gives us memory whose lifetime **we** control.

---

## 2. `malloc()`, `free()`, and Ownership

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

## 3. Nodes, Links, and Traversal

We can now create as many objects as we like at run time. But how do we **keep track** of an unknown number of them without an array? The answer: every object holds a pointer to the next one.

### 3.1 Arrays vs. linked lists

```text
Array: one contiguous block
+------+------+------+------+------+
|  b0  |  b1  |  b2  |  b3  |  b4  |
+------+------+------+------+------+

Linked list: nodes anywhere on the heap, each one knows the next
head ──► +----+---+     +----+---+     +----+------+
         | b0 | ●─┼───► | b1 | ●─┼───► | b2 | NULL |
         +----+---+     +----+---+     +----+------+
```

| Operation | Array | Singly linked list |
|---|---|---|
| Access the *i*-th element | O(1), `a[i]` | O(n), walk from `head` |
| Insert / delete at the front | O(n), shift everything | **O(1)** |
| Insert / delete in the middle (position known) | O(n), shift | **O(1)** once you have the previous node |
| Size | Fixed, or `realloc()` + copy | Grows one node at a time |
| Extra memory | None | One pointer per node |

A list trades fast indexing for cheap insertion and deletion and unlimited growth. That is the right trade when objects are added and removed often but rarely looked up by position.

### 3.2 The node: a self-referential struct

```c
struct book {
    int id;
    char title[32];
    int year;
};

struct node {
    struct book data;     /* the payload             */
    struct node *next;    /* the link: NULL at the end */
};
```

- A struct cannot contain *itself* (its size would be infinite), but it can contain a **pointer** to its own type.
- The Assignment 03B starter uses the same shape with `struct student data;`.
- A pointer called **`head`** points to the first node, and `head == NULL` means the list is empty. The last node (the **tail**) has `next == NULL`.

### 3.3 Building a list by hand

**Live demo** — [`examples/sll_manual.c`](examples/sll_manual.c). There is no `malloc()` yet, so we can focus on the links:

```c
struct node c = { .data = { 3, "Linux Device Drivers", 2005 },           .next = NULL };
struct node b = { .data = { 2, "Understanding the Linux Kernel", 2005 }, .next = &c   };
struct node a = { .data = { 1, "The C Programming Language", 1978 },     .next = &b   };
struct node *head = &a;
```

```text
node at 0x16f75e4c8: [1] The C Programming Language       next = 0x16f75e4f8
node at 0x16f75e4f8: [2] Understanding the Linux Kernel   next = 0x16f75e528
node at 0x16f75e528: [3] Linux Device Drivers             next = 0x0
```

Ask the class to draw this output as boxes and arrows, using the printed addresses.

### 3.4 The traversal pattern

```c
struct node *cur;

for (cur = head; cur != NULL; cur = cur->next) {
    /* use cur->data */
}
```

```text
step 1: cur = head        cur ──► [1] ──► [2] ──► [3] ──► NULL
step 2: cur = cur->next           [1] ──► [2] ◄── cur
step 3: cur = cur->next                   ... ──► [3] ◄── cur
step 4: cur = cur->next   cur == NULL → loop ends
```

- Use a **separate cursor**. Writing `head = head->next` in a loop loses the list.
- For the empty list, `head == NULL` makes the loop run zero times. Traversal needs no special case.
- The loop condition is `cur != NULL`, not `cur->next != NULL`. The second form skips the last node, and it crashes on an empty list.

Counting nodes uses the same loop:

```c
static int count_list(const struct node *head)
{
    int count = 0;

    for (; head != NULL; head = head->next)   /* head is our own copy here */
        count++;
    return count;
}
```

Here moving `head` is fine, because the parameter is a **copy** of the caller's pointer (Week 01, pass by value).

---

## 4. Insert, Free, and the Design of Delete

### 4.1 Creating a node

```c
/* Returns a new unlinked node, or NULL if out of memory. */
static struct node *node_create(int id, const char *title, int year)
{
    struct node *n = malloc(sizeof(*n));

    if (n == NULL)
        return NULL;

    n->data.id = id;
    snprintf(n->data.title, sizeof(n->data.title), "%s", title);
    n->data.year = year;
    n->next = NULL;          /* not linked yet */
    return n;
}
```

Creating a node and linking it are **separate steps**. Keep them separate. The final project does the same with `student_create()` and `list_add()`.

### 4.2 Insert at the front: two steps, in this order

```text
before:              head ──► [A] ──► [B] ──► NULL
                     n    ──► [N]

1. n->next = head;   head ──► [A] ──► [B] ──► NULL
                              ▲
                     n ──► [N]┘

2. head = n;         head ──► [N] ──► [A] ──► [B] ──► NULL
```

If you swap the steps, `head = n` runs first and the old list is lost.

### 4.3 The head problem

The natural first attempt:

```c
void push_front_wrong(struct node *head, struct node *n)
{
    n->next = head;
    head = n;           /* changes the LOCAL copy of head only */
}

struct node *head = NULL;
push_front_wrong(head, n);   /* head is still NULL in main() */
```

This is `set_year_by_value()` from Week 01 again: the function received a **copy** of `head`. There are two standard fixes.

**Fix A — return the new head:**

```c
struct node *push_front(struct node *head, struct node *n)
{
    n->next = head;
    return n;
}

head = push_front(head, n);
```

**Fix B — pass a pointer to the head (pointer to pointer):**

```c
static void push_front(struct node **headp, struct node *n)
{
    n->next = *headp;
    *headp = n;
}

push_front(&head, n);
```

```text
 main()                          push_front()
 +----------------+              +----------------+
 | head  ●────────┼──► [A] ...   | headp ●        |
 +--------▲-------+              +-------|--------+
          └──────────────────────────────┘
          *headp IS main's head variable
```

We use Fix B in the demo. It scales to any function that may change `head`, including delete.

### 4.4 Insert at the back

The straightforward version needs a special case:

```c
if (*headp == NULL) {            /* empty list: the new node becomes head */
    *headp = n;
} else {
    struct node *cur = *headp;
    while (cur->next != NULL)    /* stop AT the last node */
        cur = cur->next;
    cur->next = n;
}
```

**A cleaner version:** walk the **links** instead of the nodes, and the special case disappears. (`&(*link)->next` parses as `&((*link)->next)`, as in Week 02, §2.1.)

```c
static void push_back(struct node **headp, struct node *n)
{
    struct node **link = headp;      /* address of the pointer we may overwrite */

    while (*link != NULL)
        link = &(*link)->next;       /* move to the next node's 'next' field */
    *link = n;                       /* either main's head, or the last node's next */
}
```

```text
link = &head   →   link = &A.next   →   link = &B.next    (now *link == NULL)

the three values link takes in turn. At the end it points at the NULL slot,
so *link = n writes into B's next field (or into head, if the list was empty).
```

### 4.5 Freeing the whole list

**Wrong** (use after free):

```c
for (cur = head; cur != NULL; cur = cur->next)
    free(cur);              /* cur->next is read AFTER cur was freed */
```

**Right:** save `next` first.

```c
static void free_list(struct node **headp)
{
    struct node *cur = *headp;
    struct node *next;

    while (cur != NULL) {
        next = cur->next;   /* save it BEFORE free() */
        free(cur);
        cur = next;
    }
    *headp = NULL;          /* the caller's head no longer dangles */
}
```

**Live demo** — [`examples/sll_book.c`](examples/sll_book.c):

```text
(empty)
[1] The C Programming Language (1978)
[2] Understanding the Linux Kernel (2005)
[3] Linux Device Drivers (2005)
count = 3
(empty)
```

> The demo uses `goto out_of_memory;` for error handling. A single cleanup label at the end of a function is a common and accepted C idiom. It keeps the cleanup code in one place.

### 4.6 Search by ID: a design exercise

Write the function on paper before the lab:

```c
/* Returns the node whose data.id == id, or NULL if there is none. */
struct node *find_by_id(struct node *head, int id);
```

Questions to settle first:

- What does it return for an empty list?
- Why return a `struct node *` and not a copy of the `struct book`?

### 4.7 Delete by ID: a design exercise

Deleting means **unlinking** a node from its predecessor and then **freeing** it. A singly linked node does not know its predecessor, so you track it while you search:

```text
Delete [B]:

prev     cur
 ▼        ▼
[A] ───► [B] ───► [C] ───► NULL

prev->next = cur->next;      [A] ─────────────► [C] ───► NULL
free(cur);                         [B] (freed)
```

Every case delete must handle:

| Case | What changes |
|---|---|
| List is empty | Nothing. Report "not found". |
| ID is not in the list | Nothing. Report "not found". |
| Target is the **first** node | `head` itself must change. There is no `prev`. |
| Target is in the middle | `prev->next = cur->next` |
| Target is the last node | Same as the middle case: `prev->next` becomes `NULL`. |
| Target is the **only** node | `head` becomes `NULL`. |

Rules of thumb:

1. **Unlink first, then free.** After `free(cur)`, you may not read `cur->next`.
2. Because the first-node case changes `head`, delete needs `struct node **headp`, just like `push_front()`.
3. **Stretch:** the `struct node **link` trick from `push_back()` removes the first-node special case from delete too. Try it after your two-pointer version works.

### 4.8 Makefile corner: flags are not prerequisites

`make` compares **file timestamps** only. If you change *how* you compile, it does not notice:

```bash
make                                         # builds with the Makefile's CFLAGS
make CFLAGS="-Wall -Wextra -std=c11 -g"      # "Nothing to be done for 'all'": no rebuild!
make -B CFLAGS="-Wall -Wextra -std=c11 -g"   # -B forces the rebuild
```

`-g` adds debugging information for a debugger (`gdb` on Linux, `lldb` on macOS). Remember the rule: **after changing flags, `make clean && make` (or `make -B`).**

---

## 5. Lab

Task: [assignments/week03-dynamic-memory-singly-list/README.md](../../assignments/week03-dynamic-memory-singly-list/README.md). `make` in `starter/` builds both executables, `week03a` and `week03b`.

### 5.1 Lab A — Assignment 03A (Dynamic Memory)

1. `cd assignments/week03-dynamic-memory-singly-list/starter && make && ./week03a`
2. Allocate **one** `struct student` with `malloc()`.
3. Check the result for `NULL`, and print an error and return a non-zero status on failure.
4. Store ID, name, and score through the pointer (`->`). Copy the name with a bounded copy (at most 19 characters).
5. Print the student.
6. `free()` it before `main()` returns. Optionally set the pointer to `NULL`.
7. Build with zero warnings.

### 5.2 Lab B — Bug hunt

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

### 5.3 Lab C — Assignment 03B (Singly Linked List)

Build and run: `cd assignments/week03-dynamic-memory-singly-list/starter && make && ./week03b`

Suggested order. Build after **every** step:

1. `node_create()`, which allocates a node holding one student, plus a `NULL` check.
2. Insert, either `push_front()` or `push_back()`, and print. Insert three students and print them.
3. `free_list()`. Call it at the end of `main()` from now on.
4. Search by ID. Print the found student, or `Not found`.
5. Delete by ID: find, unlink, free. Handle every case in the table in §4.7.

Test plan. Put these calls in `main()` and check the printed list after each one:

| # | Action | Expected |
|---|---|---|
| 1 | Print the empty list | an "empty" message, no crash |
| 2 | Delete ID 1 from the empty list | "not found", no crash |
| 3 | Insert 1, 2, 3, then print | three students |
| 4 | Search for 2, then for 99 | found / not found |
| 5 | Delete the first node, then print | two students, `head` updated |
| 6 | Delete the last node, then print | one student |
| 7 | Delete the only node, then print | empty list, `head == NULL` |
| 8 | Free the list at exit | no use-after-free |

### 5.4 Stretch goals (optional)

Dynamic memory (after Lab A):

1. Write `student_create(int id, const char *name, int score)` and `student_destroy()` for your `struct student`, following `book_create()`. You will reuse the idea in the final project.
2. Add a live-object counter, create two students, and confirm the counter is `0` at exit.
3. Make `student_create()` return `NULL` for invalid input (for example, a score outside 0–100), and handle that in `main()`.

Singly linked list (after Lab C):

- Delete with `struct node **link` and no special case for the first node.
- `insert_sorted()`: keep the list ordered by ID.
- `reverse_list()`: reverse the list in place by changing only `next` pointers.

---

## 6. Wrap-up

### Key takeaways

- Locals live on the **stack** and die when their function returns. Never return their address.
- Heap memory from `malloc()` lives until **you** call `free()`.
- `malloc(sizeof(*p))`, check for `NULL`, initialize every member, and `free()` exactly once.
- Every heap object has one **owner**. Write the ownership contract in a comment.
- `free()` does not reset your pointer. Set it to `NULL` yourself.
- A list is nodes connected by `next` pointers. `head == NULL` means empty, and the last node's `next` is `NULL`.
- Traverse with a separate cursor: `for (cur = head; cur != NULL; cur = cur->next)`.
- A function that may change `head` needs `struct node **` (or must return the new head).
- When freeing, save `next` **before** `free()`.
- Delete must handle empty, not-found, first, middle, last, and only-node cases. Next week you will first see how many of these get *worse* with two pointers per node, and then how the first, last, and only-node cases disappear.

### Exit quiz

1. Where does the pointer variable `b` live in `struct book *b = malloc(sizeof(*b));`? Where does the book live?
2. What is wrong with `malloc(sizeof(b))`?
3. Is `free(NULL)` an error?
4. After `free(p);`, what value does `p` hold?
5. Why is it fine for `book_create()` to return a pointer, but not fine for `make_book_bad()`?
6. What is the time cost of reaching the 1000th node of a list?
7. Why does `push_front_wrong(head, n)` leave `main()`'s `head` unchanged?
8. What is wrong with `for (cur = head; cur != NULL; cur = cur->next) free(cur);`?
9. Which delete cases change `head`?
10. In `push_back()` with `struct node **link`, what does `link` point to when the list is empty?

<details>
<summary>Answers</summary>

1. `b` is a local variable on the stack. The book it points to is on the heap.
2. It allocates the size of a pointer (typically 8 bytes) instead of the size of a `struct book`.
3. No. `free(NULL)` does nothing.
4. The same address as before. It is now a *dangling* pointer, so set it to `NULL`.
5. `book_create()` returns heap memory, which lives until `free()`. `make_book_bad()` returns the address of a stack variable that died when the function returned.
6. O(n): you must follow 999 `next` pointers from `head`.
7. The function received a copy of `head` and changed only the copy.
8. `cur = cur->next` reads from `cur` after it was freed (use after free).
9. Deleting the first node, which includes deleting the only node.
10. To `main()`'s `head` variable itself, so `*link = n` sets `head`.

</details>

### Next week

A singly linked list can only go forward, and deleting a node requires finding its predecessor. What if every node also knew the node **before** it? And what if the list **never** had a `NULL` in it at all? → **Week 04 — Doubly Linked and Circular Lists**.
