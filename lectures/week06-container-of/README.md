# Week 06 — `offsetof()` and `container_of()`

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 06 — `container_of()`](../../assignments/week06-container-of/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 05](../week05-intrusive-list/) · [Week 07](../week07-file-io/) |

## Reference slide reading

The [Week 06 deck](week06-slides.pptx) teaches `offsetof()`, `container_of()`,
and list macros. Start with Week 05's embedded-member model; the following
PDF sections support the derivation rather than replace it:

- [Pointers Revisited](../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf#page=13),
  pp. 13-19: `sizeof`, scaled pointer arithmetic, and generic object pointers.
  Use `size_t` and `%zu`; byte arithmetic needs a character pointer, and
  standard C11 does not support arithmetic on `void *`.
- [Low Level Operations](../week02-operators/%5BSlide%5D%2006.%20Low%20Level%20Operations.pdf#page=20),
  pp. 20-24: implementation-dependent bit-field storage and byte ordering.
  Contrast these with offsets of ordinary members: bit-fields have no address
  and cannot be used with `offsetof()`.
  [Strings](../week02-operators/%5BSlide%5D%2003.%20Strings.pdf#page=68),
  pp. 68-72, supplies byte-counted memory operations after the byte-pointer review.
- [Writing Large Programs](../week08-final-project/%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf#page=3),
  pp. 3-10 and 15-18: preprocessing, parameter substitution, repeated
  evaluation, parentheses, and conditional compilation. Page 15 directly
  supports the macro-parenthesization discussion; pp. 11-13 (`#` / `##`) and
  19-20 (predefined macros / `#error`) are optional extensions.
- Optional: [Structures, Unions and Enums](../week01-struct/%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf#page=32),
  pp. 32-47, with the [union/enum examples](../week01-struct/examples/structures-unions-enums/README.md),
  for shared storage and tagged variants; [Pointers Revisited](../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf#page=41),
  pp. 41-50, with the [callback/declaration examples](../week01-struct/examples/pointers-revisited/README.md),
  for function pointers and complex types. These are enrichment, not prerequisites
  for the list assignment.

The [example guide](examples/README.md) adds byte-representation, overlapping
memory-copy, and bit-field demonstrations alongside the existing list examples.
Run them together with `make -C examples run` from this week's directory.

## Learning Objectives

By the end of this session you can:

1. Predict member offsets and `sizeof` of a struct, including padding, and confirm them with `offsetof()`.
2. Explain why pointer arithmetic is scaled, and why byte offsets require a `char *`.
3. Derive `container_of()` from first principles and explain every token of the macro.
4. Explain why `container_of()` must be a macro, and why each parameter is parenthesized.
5. Use and write `list_entry()`, `list_for_each()`, and `list_for_each_safe()`.
6. Read the corresponding parts of a real list implementation, `include/linux/list.h`.

---

## 0. Review of Week 05

1. In an intrusive list, what does `pos->next` point to: the next object, or something inside it?
2. Why can't the assignment's `struct student` use a first-member cast?
3. Why is `free(pos)` wrong inside a traversal?

Last week's black box:

```c
static struct book *book_from_list(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, list));
}
```

Today we open it: **what is `offsetof`, why `char *`, and how do we write it once for every type and member?**

---

## 1. Struct Layout, `offsetof()`, and Pointer Arithmetic

### 1.1 Members have fixed offsets

Every member of a struct lives at a fixed **offset**, a number of bytes from the start of the struct. The offset is the same for every object of that type.

**Live demo** — [`examples/layout.c`](examples/layout.c):

```text
struct book: sizeof = 56, alignment of list_head = 8
  id         offset  0  size  4
  title      offset  4  size 32
  year       offset 36  size  4
  list       offset 40  size 16
```

```text
 offset  0      4                                36     40                  56
         +------+--------------------------------+------+-------------------+
         |  id  |          title[32]             | year | list (next, prev) |
         +------+--------------------------------+------+-------------------+
```

### 1.2 Alignment and padding

Most types must be stored at an address that is a multiple of their **alignment** (usually their size, for basic types): `int` at multiples of 4, pointers at multiples of 8 on a 64-bit machine. To satisfy this, the compiler inserts unused **padding** bytes.

```text
struct padded  { char a; int b; char c; };      sizeof = 12

 offset  0    1         4              8    9          12
         +----+---------+--------------+----+----------+
         | a  | padding |      b       | c  | padding  |
         +----+---------+--------------+----+----------+

struct reordered { int b; char a; char c; };    sizeof = 8

 offset  0              4    5    6         8
         +--------------+----+----+---------+
         |      b       | a  | c  | padding |
         +--------------+----+----+---------+
```

The rules, informally:

1. Each member starts at a multiple of its own alignment.
2. The struct's total size is a multiple of its largest member alignment, so that arrays of the struct stay aligned.
3. There is **never** padding before the first member (Week 05, §2.2).

**Exercise (3 min):** predict the offsets in the final project's struct on a 64-bit machine, then check them with `printf`.

```c
struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};
```

<details>
<summary>Answer</summary>

`id` at 0, `name` at 4, `score` at 24, then **4 bytes of padding**, `list` at 32, and `sizeof == 48`. On a 32-bit machine pointers are 4 bytes, so `list` is at 28 and `sizeof == 36`. This is exactly why we **never hard-code offsets** and always ask the compiler with `offsetof()`.

</details>

### 1.3 `offsetof()`

```c
#include <stddef.h>

size_t off = offsetof(struct book, list);    /* 40 on our machine */
```

- It is a standard macro from `<stddef.h>`. It yields a `size_t` constant, computed at **compile time**.
- It takes a **type** and a **member name**, neither of which a function could take.
- Compilers implement it with a builtin (`__builtin_offsetof`). Old code sometimes defines it as `((size_t)&((type *)0)->member)`. Do not write that yourself: it is undefined behavior in standard C. Use the header. (Inside `sizeof`, as in `layout.c`'s `SHOW` macro, `((type *)0)->member` is fine, because `sizeof` never evaluates its operand.)

### 1.4 Pointer arithmetic is scaled

Adding 1 to a pointer moves it by **one element**, that is, by `sizeof(*p)` bytes:

**Live demo** — [`examples/pointer_arith.c`](examples/pointer_arith.c):

```text
ip     = 0x16b382558
ip + 1 = 0x16b38255c   (+4 bytes: sizeof(int))
cp + 1 = 0x16b382559   (+1 byte: sizeof(char) is always 1)
*(ip + 2) = 30, ip[2] = 30
lp              = 0x16b382538
(char *)(lp + 1) = 0x16b382548   (+16 bytes)
(char *)lp + 1   = 0x16b382539   (+1 byte: parentheses matter!)
(char *)&numbers[2] - (char *)&numbers[0] = 8 bytes
&numbers[2] - &numbers[0]                 = 2 elements
```

| Expression (with `struct list_head *lp`) | Moves by |
|---|---|
| `lp - 40` | 40 × 16 = **640 bytes**, which is wrong for our purpose |
| `(char *)lp - 40` | **40 bytes**, which is what we want |

`offsetof()` gives a number of **bytes**, so the subtraction must happen on a `char *`. (Arithmetic on `void *` also counts bytes in gcc and clang, but that is a GNU extension, not standard C.)

---

## 2. Deriving `container_of()`

### 2.1 From first principles

We have `ptr`, the address of the member `borrowed` inside some `struct book`. We want the address of that book.

```text
       b ──► +-----------------+  ◄── what we want
             | id              |
             | title[32]       |
             | all             |
     ptr ──► | borrowed        |  ◄── what we have
             +-----------------+

       b  ==  ptr  −  offsetof(struct book, borrowed)      (in bytes)
```

| Step | Code | Why |
|---|---|---|
| 1 | `(char *)ptr` | Count in bytes, not in `list_head`s. |
| 2 | `(char *)ptr - offsetof(struct book, borrowed)` | Step back to the start of the book. |
| 3 | `(struct book *)( … )` | Give the address the type we want. |

**Live demo** — [`examples/container_of_demo.c`](examples/container_of_demo.c):

```text
&book                = 0x16ee06510
ptr = &book.borrowed = 0x16ee06548
offsetof(struct book, all)      = 40
offsetof(struct book, borrowed) = 56
by hand      : 0x16ee06510  id = 42
container_of : 0x16ee06510  id = 42
via 'all'    : 0x16ee06510  id = 42
```

Check the arithmetic: `0x548 − 0x510 = 0x38 = 56`.

### 2.2 Generalize: one macro for every type and member

```c
#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))
```

| Token | Role |
|---|---|
| `ptr` | Pointer to the embedded member (e.g. a `struct list_head *`). |
| `type` | The containing struct type (e.g. `struct student`). |
| `member` | The member's **name** inside `type` (e.g. `list`). |
| `(char *)(ptr)` | Byte-addressed view of `ptr`. |
| `- offsetof(type, member)` | Step back to the start of the container. |
| `(type *)( … )` | Result has the container's type. |
| outer `( … )` | The whole expansion is one expression. |

Usage:

```c
struct student *s = container_of(pos, struct student, list);
```

This is **exactly** the macro in your Week 06 starter and in the final project's `list.h`.

### 2.3 Why a macro, not a function?

A function cannot take a **type** (`struct student`) or a **member name** (`list`) as an argument. A macro works on text, before compilation, so it can.

### 2.4 Makefile corner: see the expansion with `gcc -E`

The Week 06 examples Makefile has a rule that stops after preprocessing (Week 01, §1.2):

```make
container_of_demo.i: container_of_demo.c
	$(CC) -E container_of_demo.c -o container_of_demo.i
```

```bash
make container_of_demo.i
tail -n 25 container_of_demo.i
```

```c
b = ((struct book *)((char *)(ptr) - __builtin_offsetof(struct book, borrowed)));
```

The `.i` file is about 660 lines, because `#include <stdio.h>` was pasted in too. Your code is at the end. Note that `offsetof` itself expanded to a compiler builtin.

### 2.5 Why every parenthesis matters

`container_of()` follows both macro rules from Week 02, §2.6. Each one prevents a real bug here:

- **Around `ptr`:** with `(char *)ptr`, the call `container_of(lp + 1, struct book, list)` would expand to `(char *)lp + 1`, which is 1 *byte* past `lp` instead of 1 `list_head` (16 bytes) past it. `pointer_arith.c` printed both addresses, 15 bytes apart.
- **Around the whole expansion:** without it, `container_of(pos, struct book, list)->id` would apply the cast to `(…)->id`, because `->` binds tighter than a cast. That does not compile.

### 2.6 The macro trusts you

```c
b = container_of(ptr, struct book, all);    /* ptr is really &book.borrowed */
```

```text
WRONG member : 0x16ee06520  (off by 16 bytes)
```

There is no error and no warning, just a pointer 16 bytes into the middle of the book. Reading `b->id` now reads garbage. Always double-check that the `type` and `member` match the list the pointer came from.

For reference, the version in `include/linux/container_of.h` adds a **compile-time check** that `ptr` really has the member's type. It relies on GNU extensions, so it is not portable C11. We use the plain version, and you are the type checker.

### 2.7 Iteration macros

Once `container_of()` exists, a small family of list macros can be built on top of it.

**Live demo** — [`examples/list_macros.c`](examples/list_macros.c):

```c
#define list_entry(ptr, type, member) \
    container_of(ptr, type, member)

#define list_for_each(pos, head) \
    for ((pos) = (head)->next; (pos) != (head); (pos) = (pos)->next)

#define list_for_each_prev(pos, head) \
    for ((pos) = (head)->prev; (pos) != (head); (pos) = (pos)->prev)

/* n remembers pos->next, so the loop body may unlink and free pos */
#define list_for_each_safe(pos, n, head) \
    for ((pos) = (head)->next, (n) = (pos)->next; (pos) != (head); \
         (pos) = (n), (n) = (pos)->next)
```

```c
list_for_each_safe(pos, n, &library) {
    struct book *b = list_entry(pos, struct book, list);

    if (b->year < 2000) {
        list_del(&b->list);
        free(b);
    }
}
```

```text
all      : [1 1978] [2 2005] [3 1996] [4 2010]
backward : [4] [3] [2] [1]
since2000: [2 2005] [4 2010]
at exit  :
```

- Use `list_for_each()` when you only **read**.
- Use `list_for_each_safe()` when the loop body may **unlink or free** `pos`. The plain version would read `pos->next` after `free(pos)`. This is the Week 03 and Week 04 "save next first" rule, packaged as a macro.

> `include/linux/list.h` also has `list_for_each_entry(pos, head, member)`, which iterates directly over containing objects. It needs `typeof`, a GNU extension (standardized only in C23), so we do not use it in C11 code.

### 2.8 Reading the real thing

For reference, you can now read most of a real-world implementation of the same list:

- [`include/linux/list.h`](https://github.com/torvalds/linux/blob/master/include/linux/list.h): find `INIT_LIST_HEAD`, `__list_add`, `list_add`, `list_add_tail`, `list_del`, `list_empty`, `list_for_each`, `list_for_each_safe`.
- [`include/linux/container_of.h`](https://github.com/torvalds/linux/blob/master/include/linux/container_of.h): the type-checked `container_of()`.

Things you will notice: `list_del()` writes `LIST_POISON1/2` into the removed entry (Week 04, §4.4), and `__list_add()` is our `insert_between()`.

---

## 3. Lab

### Lab A — Week 06 assignment

Task: [assignments/week06-container-of/README.md](../../assignments/week06-container-of/README.md)

1. Use `container_of(list, struct student, list)` to recover the student from `list`.
2. Print `id` and `score` through the recovered pointer.
3. Also print `&student`, `list`, and `offsetof(struct student, list)`, and check that the arithmetic adds up.

### Lab B — Port Week 05 to `container_of()`

1. Copy your Week 05 solution into a scratch directory.
2. Delete `student_from_list()` and use `container_of()` (or `list_entry()`) everywhere instead.
3. Add `list_for_each()` and `list_for_each_safe()`, and rewrite your print and free loops with them.
4. Delete every student whose score is below 60, inside a `list_for_each_safe()` loop.

### Lab C — Get ready for the final project

1. Open [`assignments/week08-final-project/starter/list.h`](../../assignments/week08-final-project/starter/list.h): `struct list_head`, `container_of()`, and three prototypes. You can now explain every line.
2. Implement `list_init()`, `list_add()`, and `list_del()` in `starter/list.c` from your Week 04/05 code. Remember: `list_add()` inserts **right after** `head`, and `list_del()` **never frees**.

**Stretch goals:**

- Write `list_first_entry(head, type, member)` as a macro.
- Break `container_of()` on purpose (wrong member, missing parentheses) and explain each wrong result.

---

## 4. Wrap-up

### Key takeaways

- Members live at fixed offsets. Padding makes those offsets platform-dependent, so ask `offsetof()` instead of guessing.
- Pointer arithmetic is scaled by the element size. Byte offsets need a `char *`.
- `container_of(ptr, type, member)` = `(type *)((char *)(ptr) - offsetof(type, member))`: step back from the member to the start of its container.
- It must be a macro, because it takes a type and a member name. Parenthesize every parameter and the whole expansion.
- It trusts you: a wrong type or member gives a wrong pointer silently.
- Use `list_for_each_safe()` whenever the loop body may remove `pos`.

### Exit quiz

1. On a 64-bit machine, what is `offsetof(struct student, list)` and why is it not 28?
2. With `struct list_head *p`, how many bytes does `p - 2` move? And `(char *)p - 2`?
3. Expand by hand: `container_of(pos, struct student, list)`.
4. Why can't `container_of()` be a function?
5. When must you use `list_for_each_safe()` instead of `list_for_each()`?

<details>
<summary>Answers</summary>

1. 32. `id` + `name` + `score` end at byte 28, but `struct list_head` holds pointers and must be 8-byte aligned, so 4 bytes of padding come first.
2. 2 × 16 = 32 bytes; and 2 bytes.
3. `((struct student *)((char *)(pos) - offsetof(struct student, list)))`
4. A function cannot receive a type or a member name as an argument.
5. When the loop body may unlink or free `pos`, because the loop's increment step would otherwise read `pos->next` from freed memory.

</details>

### Next week

The list is complete, but it disappears when the program exits. How do we save it to a file and rebuild it next time, and why can't we just write the structs to disk? → **Week 07 — File I/O**.
