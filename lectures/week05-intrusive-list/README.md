# Week 05 — Intrusive Linked List

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 05 — Intrusive Linked List](../../assignments/week05-intrusive-list/) |
| **Demo code** | [`examples/`](examples/) · [Teaching guide](examples/README.md) |
| **Previous / Next** | [Week 04](../week04-doubly-circular-list/) · [Week 06](../week06-container-of/) |

## Reference slide reading

Use the [Week 05 deck](week05-slides.pptx) for intrusive lists, first-member
casts, multiple memberships, and ownership. The seven reference PDFs supply
background rather than an intrusive-list implementation. After reviewing the
Week 04 circular-list invariants, select a short refresher as needed:

- [Structures, Unions and Enums](../week01-struct/%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf#page=24),
  pp. 24-27: nesting a structure inside another structure and accessing its
  members. Compare a node containing a book with a book containing links.
- [Dynamic Memory Allocation](../week03-dynamic-memory-singly-list/%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf#page=25),
  pp. 25-27: leaks and dangling pointers. Use this review when explaining why
  every list membership must be removed before the owning code frees a book.
- Optional: [Pointers Revisited](../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf#page=17),
  pp. 17-19, for generic object pointers; use the corrected
  [`void_pointer.c`](../week01-struct/examples/pointers-revisited/void_pointer.c)
  alongside the slides. A `void *` does not remember the payload's type or
  locate its enclosing object. Defer the general recovery calculation to Week 06.

## Learning Objectives

By the end of this session you can:

1. Explain the limits of a node that *contains* the data (`struct node { struct book data; ... }`).
2. Define `struct list_head` and embed it in a data structure (an *intrusive* list).
3. Write list operations that know nothing about the data they link.
4. Explain why traversal gives you a `struct list_head *` and why you need a way back to the containing object.
5. Explain when a first-member cast works, and why it is not enough.
6. Put one object in two lists at once, and free it safely.

---

## 0. Review of Week 04

1. What are `head.next` and `head.prev` in an empty circular list?
2. Write `insert_back()` using `insert_between()`.
3. What does `-DNDEBUG` do to `assert()`?

Today's question: **Our sentinel wastes a whole `struct book`, and our list only works for books. Can we write the list code once, for every type?**

---

## 1. Put the Links Inside the Data

### 1.1 What is wrong with `struct node`?

```c
struct node {
    struct book data;      /* the node CONTAINS the data */
    struct node *next;
    struct node *prev;
};
```

| Problem | Why it hurts |
|---|---|
| The list code is tied to one payload type | A list of students needs `struct student_node` and a second copy of every list function. |
| The sentinel carries an unused payload | A wasted `struct book` in every list head. |
| An object can be in only one list | A book cannot be in "all books" *and* "borrowed books" without a second node, a second allocation, or a copy. |
| The data is copied into the node | Or, if the node holds a `struct book *` instead, every element needs two allocations and two frees. |

### 1.2 Flip it: the data contains the links

```c
struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;   /* the links live INSIDE the book */
};
```

- `struct list_head` contains **no data at all**, only links.
- Any struct becomes "listable" by embedding a `struct list_head`.
- The sentinel is just a `struct list_head` (16 bytes on a 64-bit machine), with no wasted payload.

This is an **intrusive** list: the list "intrudes" into the object's definition.

### 1.3 The picture: links point at links

```text
  library (sentinel)        book 1                        book 2
  +-------------+         +----------------+            +----------------+
  | next  ●─────┼──┐      | id             |            | id             |
  | prev  ●     |  │      | title[32]      |            | title[32]      |
  +-------------+  │      | year           |            | year           |
                   │      +----------------+            +----------------+
                   └─────►| list.next  ●───┼───────────►| list.next  ●───┼──► back to library
                          | list.prev      |◄───────────┼ list.prev      |
                          +----------------+            +----------------+
```

**The key fact for today:** every `next` and `prev` points to the `list` member **inside** the next object, not to the start of the object.

### 1.4 A generic list API

The operations are those of the circular list (Week 04, §3–4), with `struct node` replaced by `struct list_head`. We also switch to the names used in `include/linux/list.h`:

| Week 04 | Week 05 | Meaning |
|---|---|---|
| `list_init(head)` | `list_init(head)` (Linux: `INIT_LIST_HEAD`) | Make an empty ring. |
| `list_is_empty(head)` | `list_empty(head)` | `head->next == head` |
| `insert_front(head, n)` | `list_add(new, head)` | Insert right after `head`. |
| `insert_back(head, n)` | `list_add_tail(new, head)` | Insert right before `head`. |
| `unlink_node(entry)` | `list_del(entry)` | Unlink. **Never frees.** |

Note the **argument order**. These functions take the *new entry first* and the *head second*: `list_add(new, head)`.

```c
void list_init(struct list_head *head);
int  list_empty(const struct list_head *head);
void list_add(struct list_head *new, struct list_head *head);
void list_add_tail(struct list_head *new, struct list_head *head);
void list_del(struct list_head *entry);
```

The bodies are the `insert_between()` and unlink code from Week 04 (§4.1 and §4.3) with the type changed. See `list_insert_between()`, `list_add()`, and `list_add_tail()` in [`examples/intrusive_book.c`](examples/intrusive_book.c), and the unlink in `list_del_init()` in [`examples/multi_list.c`](examples/multi_list.c).

Notice that **nothing in these functions mentions books.** The same code links students, tasks, or network packets. In the final project they live in their own file, `list.c`.

> For reference, `include/linux/list.h` calls this helper `__list_add()`. We avoid the leading double underscore, because in standard C, identifiers that begin with `__` are reserved for the compiler and the C library.

### 1.5 Creating and inserting

```c
struct book *b = book_create(1, "The C Programming Language", 1978);   /* malloc, fill, list_init(&b->list) */
list_add_tail(&b->list, &library);                                     /* link the EMBEDDED list_head */
```

You pass `&b->list`, the address of the member, **not** `b`. The list never sees a `struct book *`.

---

## 2. From `list_head *` Back to the Object

### 2.1 The problem

```c
struct list_head *pos;

for (pos = library.next; pos != &library; pos = pos->next) {
    /* pos is a struct list_head *.  How do we print the book's title? */
}
```

Traversal hands us pointers to **`list` members**. To read `id` or `title`, we need a pointer to the **book that contains** that member.

### 2.2 Option 1: put `list_head` first and cast

```c
struct tagged_book {
    struct list_head list;     /* FIRST member */
    int id;
    char title[32];
};

struct tagged_book *back = (struct tagged_book *)pos;   /* works */
```

C11 §6.7.2.1p15 guarantees that a struct and its **first** member start at the same address, so a cast from one to the other is safe. There is never padding before the first member.

**Live demo** — [`examples/first_member.c`](examples/first_member.c):

```text
&t      = 0x16b2b6510
&t.list = 0x16b2b6510   (same address)
back->id = 7, back->title = First Member
```

This trick is real and is used in some C code, but it breaks down quickly:

- **Only one member can be first**, so an object can be in only one list this way.
- If someone reorders the members, every cast silently becomes wrong. There is no compiler error.
- The assignment's `struct student` has `list` as its **last** member, so the cast does not work there.

### 2.3 Option 2: subtract the member's offset

The `list` member sits at a **fixed distance** from the start of every book. If we know that distance, we can step back from `pos` to the start of the book:

```text
 struct book (56 bytes)
 +--------------+  ◄── b                     = (char *)pos - 40
 | id           |
 | title[32]    |
 | year         |
 +--------------+  ◄── pos = &b->list        offset of 'list' = 40
 | list.next    |
 | list.prev    |
 +--------------+
```

```c
#include <stddef.h>

/* Explained in Week 06: get the book that contains this list_head. */
static struct book *book_from_list(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, list));
}
```

**Treat this helper as a black box for one week.** `offsetof`, the `char *` cast, and the generic version (`container_of()`) are next week's topic. For now: *give it a `list` pointer, get the book back.*

**Live demo** — [`examples/intrusive_book.c`](examples/intrusive_book.c):

```text
forward : (empty)
forward : [0] [1] [2] [3]
backward: [3] [2] [1] [0]
sizeof(struct list_head) = 16, sizeof(struct book) = 56
pos = 0x100925328  ->  book = 0x100925300  (40 bytes earlier)  [0] Preface
pos = 0x100925268  ->  book = 0x100925240  (40 bytes earlier)  [1] The C Programming Language
...
```

The distance is always 40 bytes: 4 (`id`) + 32 (`title`) + 4 (`year`). Book 0 was added with `list_add()`, so it appears first.

### 2.4 The `free()` trap

```c
free(pos);                    /* WRONG: pos points INSIDE the book */
free(book_from_list(pos));    /* right: the address malloc() returned */
```

`free()` must receive exactly the pointer that `malloc()` returned. `pos` is 40 bytes past it. The C library usually aborts with an error such as `free(): invalid pointer` (glibc) or `pointer being freed was not allocated` (macOS).

### 2.5 One object, two lists

With intrusive lists, membership in another list is just another member:

```c
struct book {
    int id;
    char title[32];
    struct list_head all;        /* link in the list of every book     */
    struct list_head borrowed;   /* link in the list of borrowed books */
};
```

```text
 all      ⇄ [book1.all] ⇄ [book2.all] ⇄ [book3.all] ⇄ [book4.all] ⇄ (back to all)
 borrowed ⇄              [book2.borrowed]            ⇄ [book4.borrowed] ⇄ (back to borrowed)
```

**Live demo** — [`examples/multi_list.c`](examples/multi_list.c):

```text
borrow 2 and 4
all      : [1] [2] [3] [4]
borrowed : [2] [4]
return 2
all      : [1] [2] [3] [4]
borrowed : [4]
after free_all: all empty = yes, borrowed empty = yes
```

Three lessons from this demo:

1. **Removing from one list does not affect the other.** "Return 2" unlinks `book2.borrowed` only.
2. **Ownership:** exactly one list (here `all`) is responsible for freeing. Before freeing an object, **remove it from every list** it is in. Otherwise the other list keeps a pointer into freed memory.
3. **`list_del_init()` makes "am I in a list?" answerable.** After unlinking, it re-initializes the entry to point to itself, so `list_empty(&b->borrowed)` is true exactly when the book is not borrowed.

Now look at the two helpers in the demo:

```c
static struct book *book_from_all(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, all));
}

static struct book *book_from_borrowed(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, borrowed));
}
```

They differ only in the **member name**, and a student version would differ only in the **type**. Writing one helper per (type, member) pair does not scale. Week 06 replaces all of them with **one macro**.

### 2.6 In the real world

For reference, the Linux process descriptor, `struct task_struct`, embeds several `struct list_head` members (for example `tasks`, `children`, and `sibling`), so one process is in several lists at once.

---

## 3. Lab

Task: [assignments/week05-intrusive-list/README.md](../../assignments/week05-intrusive-list/README.md)

1. Port your Week 04 circular list operations (Assignment 04B) to `struct list_head`: `list_init()`, `list_add()` and/or `list_add_tail()`, `list_del()`. Keep the argument order: `new`, then `head`.
2. Write `student_create(id, name, score)`: `malloc()`, fill in the fields, `list_init(&s->list)`. It does **not** insert.
3. Write `student_from_list(struct list_head *pos)` by analogy with `book_from_list()`. (You may use this helper this week. Next week it becomes `container_of()`.)
4. Insert three students with `list_add_tail(&s->list, &head)`.
5. Forward and backward print, using `student_from_list()`.
6. Free every student at exit. Free the **student**, not the `list_head`.

Self-check:

```bash
grep -nE "struct node *\{" assignment_05.c   # must print nothing
```

- [ ] The sentinel is a `struct list_head`, not a `struct student`.
- [ ] No list function mentions `struct student`.
- [ ] After freeing, `head.next == &head` and `head.prev == &head`.

**Stretch goals:**

- Add a second member `struct list_head honors;` and also link every student with `score >= 90` into an `honors` list. Print both lists.
- Delete a student by ID so that it disappears from **both** lists before it is freed.

---

## 4. Wrap-up

### Key takeaways

- An **intrusive** list embeds `struct list_head` in the data. The list code never sees the data type.
- One set of list functions serves every type, and the sentinel is just a `struct list_head`.
- Links point to the **embedded `list_head`**, not to the start of the object.
- To reach the object, step back by the member's offset. The first-member cast works only in a special case.
- An object can be in several lists. Remove it from all of them before freeing, and free the object pointer, never `pos`.

### Exit quiz

1. Which of these does the generic list code need to know: `sizeof(struct book)`, the name of the `list` member, or neither?
2. Why can't the assignment's `struct student` use the first-member cast?
3. What is wrong with `free(pos)` inside a traversal?
4. In `multi_list.c`, what happens if you free a borrowed book without removing it from `borrowed`?
5. `book_from_all()` and `book_from_borrowed()` differ in one token. Which one?

<details>
<summary>Answers</summary>

1. Neither. The list code only follows `next` and `prev` between `struct list_head` objects.
2. Its `list` member is last, not first, so `&s->list` is not the address of the student.
3. `pos` points to the `list` member inside the object, not to the address `malloc()` returned.
4. The `borrowed` list keeps pointers into freed memory. The next traversal of `borrowed` is a use-after-free.
5. The member name passed to `offsetof()`: `all` vs. `borrowed`.

</details>

### Next week

What exactly is `offsetof()`, why the `char *` cast, and how do we write the helper **once** for every type and member? → **Week 06 — `offsetof()` and `container_of()`**.
