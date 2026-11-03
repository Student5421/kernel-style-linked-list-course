# Week 06 — Circular Doubly Linked List with a Sentinel

| | |
|---|---|
| **Session** | 3 hours (lecture + live coding + lab) |
| **Assignment** | [Week 06 — Circular Doubly Linked List](../../assignments/week06-circular-list/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 05](../week05-doubly-linked-list/) · [Week 07](../week07-intrusive-list/) |

## Session Plan

| Time | Segment | Format |
|---|---|---|
| 0:00 – 0:10 | Review of Week 05 | Quiz + discussion |
| 0:10 – 0:55 | Part 1 — The sentinel and the circular invariant | Lecture + whiteboard tracing |
| 0:55 – 1:05 | Break | |
| 1:05 – 1:50 | Part 2 — One insert, one unlink, safe traversal, `assert()` | Lecture + live coding |
| 1:50 – 2:50 | Lab — Week 06 assignment | Hands-on |
| 2:50 – 3:00 | Wrap-up and exit quiz | Discussion |

## Learning Objectives

By the end of this session you can:

1. Explain what a *sentinel* node is and why it removes every `NULL` special case.
2. State the empty-list invariant `head.next == &head && head.prev == &head` and draw lists of 0, 1, and 3 elements.
3. Implement every insertion with one `insert_between()` helper.
4. Unlink a node with two assignments and no `if`.
5. Traverse forward and backward, and delete while traversing without a use-after-free.
6. Check invariants with `assert()`, and explain what `-DNDEBUG` does.

---

## 0. Review of Week 05 (10 min)

1. List the four cases of deleting a node from a doubly linked list.
2. How many `NULL` checks did push_front, push_back, and unlink need in total?
3. Why did we keep unlink and `free()` separate?

Today's question: **The `NULL` checks exist because the first node has no previous node and the last node has no next. What if they always did?**

---

## 1. The Sentinel and the Circular Invariant (45 min)

### 1.1 Two ideas combined

1. **Sentinel (dummy head):** one extra node that is always in the list and carries no data. Every real node now has a neighbor on both sides.
2. **Circular:** the last node's `next` points back to the sentinel, and the sentinel's `prev` points to the last node. There is no `NULL` anywhere.

```c
struct node {
    struct book data;      /* unused in the sentinel */
    struct node *next;
    struct node *prev;
};

struct node head;          /* the sentinel: usually a plain variable, not malloc()ed */
```

### 1.2 Pictures you must be able to draw

**Empty list:** the sentinel points to itself in both directions.

```text
          ┌─── next ───┐
          │            │
          ▼            │
      +--------+       │
      |  HEAD  |───────┘
      |        |───────┐
      +--------+       │
          ▲            │
          │            │
          └─── prev ───┘
```

**One element:**

```text
   ┌────────── next ──────────┐
   ▼                          │
 HEAD ⇄ [A] ──────────────────┘    head.next == &A,  A.prev == &head
   │     ▲                         A.next == &head,  head.prev == &A
   └prev─┘
```

**Three elements:**

```text
   ┌──────────────── next ────────────────┐
   ▼                                      │
 HEAD ⇄ [A] ⇄ [B] ⇄ [C] ──────────────────┘    C.next == &head
   │                 ▲
   └────── prev ─────┘                         head.prev == &C
```

`head.next` is the first element and `head.prev` is the last.

### 1.3 The invariant

For **every** node `n` in the ring, including the sentinel:

```c
n->next->prev == n
n->prev->next == n
```

and for the empty list, specifically:

```c
head.next == &head
head.prev == &head
```

Compare this with Week 05's four rules, two of which were about `NULL`. There is now **one** rule, and it has no exceptions.

### 1.4 Useful facts that follow

| Question | Answer |
|---|---|
| Is the list empty? | `head.next == &head` |
| First element? | `head.next` (only valid if not empty) |
| Last element? | `head.prev`, O(1), with no separate tail pointer |
| End of forward traversal? | When you are back at `&head`, **not** at `NULL` |

### 1.5 Traversal

```c
/* in a function that receives struct node *head, e.g. called with &head */

/* forward */
for (pos = head->next; pos != head; pos = pos->next)
    ...

/* backward */
for (pos = head->prev; pos != head; pos = pos->prev)
    ...
```

- Start **after** the sentinel. The sentinel's data is meaningless.
- Stop when you are **back at the sentinel**.
- `pos != NULL` is an **infinite loop** in a circular list. It is the most common Week 06 bug.
- An empty list runs the loop zero times, because `head->next == head` immediately.

### 1.6 Whiteboard exercise: trace `init`

```c
static void list_init(struct node *head)
{
    head->next = head;
    head->prev = head;
}
```

Why must `init` run before anything else? What happens if you traverse an uninitialized `struct node head;`? (Recall Week 01: an uninitialized local holds garbage.)

---

## 2. One Insert, One Unlink (45 min)

### 2.1 Insert between two adjacent nodes

Every insertion places a new node between two nodes that are currently neighbors. Write that once:

```c
/* Insert n between two neighbors: prev <-> n <-> next. */
static void insert_between(struct node *n, struct node *prev, struct node *next)
{
    next->prev = n;
    n->next = next;
    n->prev = prev;
    prev->next = n;
}
```

```text
before:   [prev] ⇄ [next]

after:    [prev] ⇄ [n] ⇄ [next]

          ① next->prev = n      ② n->next = next
          ③ n->prev = prev      ④ prev->next = n
```

Then every insertion is one line:

```c
static void insert_front(struct node *head, struct node *n)   /* after the sentinel  */
{
    insert_between(n, head, head->next);
}

static void insert_back(struct node *head, struct node *n)    /* before the sentinel */
{
    insert_between(n, head->prev, head);
}
```

`insert_front()` gives stack (LIFO) order, and `insert_back()` gives queue (FIFO) order.

### 2.2 Whiteboard exercise: the "special" case is not special

Trace `insert_back(&head, n)` on an **empty** list. Then `prev = head->prev = &head` and `next = &head`:

```text
① head.prev = n         ② n->next = &head
③ n->prev  = &head      ④ head.next = n
```

The result is exactly the one-element picture from §1.2. **No `if` was needed.** Compare with `dlist_push_back()` from Week 05.

**Live demo** — [`examples/clist_book.c`](examples/clist_book.c) dumps the links after the first insert:

```text
after the first insert:
  HEAD prev = 0x101335240    self = 0x16f0ca510    next = 0x101335240
  [2]  prev = 0x16f0ca510    self = 0x101335240    next = 0x16f0ca510
```

Both of HEAD's links point to `[2]`, and both of `[2]`'s links point to HEAD. Notice that HEAD's address looks very different from the others: the sentinel is on the **stack** and the nodes are on the **heap** (Week 03).

### 2.3 Unlink: two assignments, no `if`

**In-class exercise (5 min):** remove `entry` from the ring. The neighbors must point at each other. Recall the general case from Week 05, §2.1.

```c
static void unlink_node(struct node *entry)
{
    /* your two lines here */
}
```

<details>
<summary>Answer</summary>

```c
static void unlink_node(struct node *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
}
```

This is Week 05's general case with the `if`s deleted. Because every node has real neighbors, the first, last, and only-node cases are all the same code.

</details>

Trace it on the **one-element** list. Afterwards, `head.next == &head` and `head.prev == &head`, so the list is empty again, automatically.

| | Week 05 (`NULL`-terminated) | Week 06 (circular + sentinel) |
|---|---|---|
| Insert front | 1 `if` | 0 |
| Insert back | 1 `if` | 0 |
| Unlink | 2 `if`s, four cases | 0 |
| Find the last node | separate `tail` pointer | `head.prev` |
| Extra memory | `tail` pointer | one sentinel node |

### 2.4 After unlinking

`entry->next` and `entry->prev` still point into the list. If someone follows them, they walk into a list that `entry` is no longer part of. Two common defenses:

- Point them at the entry itself (re-initialize it as an empty ring). The Linux kernel's `list_del_init()` does this.
- Set them to "poison" values that crash immediately if used. The kernel's `list_del()` writes `LIST_POISON1` and `LIST_POISON2`. Setting them to `NULL` is the simple version.

Either way, unlinking **does not free**. Delete by ID is still: find → unlink → `free()`.

### 2.5 Deleting while traversing

This loop frees `pos` and then reads `pos->next`, which is a use-after-free:

```c
for (pos = head->next; pos != head; pos = pos->next)
    free(pos);                                     /* WRONG */
```

Save the next node first, as in Week 04:

```c
static void free_all(struct node *head)
{
    struct node *pos = head->next;
    struct node *next;

    while (pos != head) {
        next = pos->next;     /* save before free() */
        free(pos);
        pos = next;
    }
    list_init(head);          /* restore the empty invariant */
}
```

In Week 08 we turn this "save next" pattern into a macro, `list_for_each_safe()`.

### 2.6 Checking invariants with `assert()`

```c
#include <assert.h>

/* Checks the circular invariant at every node; returns the number of nodes. */
static int list_check(const struct node *head)
{
    const struct node *pos;
    int count = 0;

    assert(head->next->prev == head);
    assert(head->prev->next == head);
    for (pos = head->next; pos != head; pos = pos->next) {
        assert(pos->next->prev == pos);
        assert(pos->prev->next == pos);
        count++;
    }
    return count;
}
```

`assert(expr)` does nothing if `expr` is true. If it is false, it prints the expression, file, and line, and **aborts** the program on the spot, instead of letting the bug crash somewhere unrelated later.

**Live demo:**

```bash
./clist_book            # nodes = 3, links OK
./clist_book break      # corrupts one prev link on purpose
```

```text
corrupting one prev link...
Assertion failed: (pos->next->prev == pos), function list_check, file clist_book.c, line 112.
```

### 2.7 Makefile corner: `-DNDEBUG` turns asserts off

`-DNAME` defines a macro for the preprocessor, as if the file began with `#define NAME 1`. When `NDEBUG` is defined, every `assert()` compiles to nothing:

```bash
make -B CFLAGS="-Wall -Wextra -std=c11 -DNDEBUG"
./clist_book break      # "nodes = 3, links OK": the corruption goes unnoticed!
make -B                 # back to the normal build
```

Note the `-B`: as Week 04 showed, `make` does not notice a change of flags. Two consequences:

- Never put code with **side effects** inside `assert()` (e.g. `assert(n = malloc(...))`). It vanishes with `-DNDEBUG`.
- `assert()` is for **programming errors** (broken invariants), not for user errors like a bad ID. Handle user errors with `if` and a message.

---

## 3. Lab (60 min)

Task: [assignments/week06-circular-list/README.md](../../assignments/week06-circular-list/README.md)

The starter already initializes the sentinel in `main()`. Suggested order:

1. Turn the initialization into `list_init()`. Add `list_is_empty()`.
2. `insert_between()`, `insert_front()`, `insert_back()`, and node creation.
3. Forward and backward traversal.
4. A `list_check()` with `assert()`. Call it after every operation.
5. Unlink, then delete by ID (find → unlink → `free()`).
6. `free_all()` at exit, after which the empty invariant must hold again.

The README requires you to test the empty list and the one-element list explicitly:

| # | Action | Check |
|---|---|---|
| 1 | `init`, print both directions | empty, `head.next == &head`, `head.prev == &head` |
| 2 | Insert 1 element, print both directions | one element, the checker passes |
| 3 | Delete that element | empty invariant holds again |
| 4 | Insert 1, 2, 3 at the back; insert 0 at the front | forward `0 1 2 3`, backward `3 2 1 0` |
| 5 | Delete first, middle, last | the checker passes after each |
| 6 | Delete a missing ID | "not found", list unchanged |
| 7 | `free_all()` | empty invariant holds |

**Stretch goals:**

- `list_move_tail(entry, head)`: unlink `entry`, then `insert_back()`, with no `malloc()` or `free()`.
- `list_splice()`: move every node of one list to the end of another in O(1) (only the four boundary links change).

---

## 4. Wrap-up (10 min)

### Key takeaways

- A sentinel plus circular links means every node always has two real neighbors, so `NULL` never appears.
- Empty means `head.next == &head` (and `head.prev == &head`). The last node is `head.prev`.
- Traversal starts at `head->next` and stops when it returns to `head`, never at `NULL`.
- One `insert_between()` implements every insert. Unlink is two lines with no `if`.
- Save `next` before freeing during traversal. Restore the empty invariant at the end.
- `assert()` catches broken invariants early. `-DNDEBUG` removes the checks.

### Exit quiz

1. What are `head.next` and `head.prev` in an empty list?
2. A student writes `for (pos = head->next; pos != NULL; pos = pos->next)`. What happens?
3. Which call inserts at the back: `insert_between(n, head, head->next)` or `insert_between(n, head->prev, head)`?
4. After unlinking the only element, what do `head.next` and `head.prev` point to?
5. Why must you never write `assert(p = malloc(size))`?

<details>
<summary>Answers</summary>

1. Both are `&head`.
2. An infinite loop. The ring never contains `NULL`, so the loop goes around and around, through the sentinel's meaningless data too.
3. `insert_between(n, head->prev, head)`: between the last node and the sentinel.
4. Both point to `&head`, so the list is empty again with no special code.
5. With `-DNDEBUG` the whole expression, including the `malloc()` call, disappears.

</details>

### Next week

Our sentinel still carries an unused `struct book data`, and the list code only works for `struct node` holding a book. What if the links did not need a node at all, and lived **inside** the data instead? → **Week 07 — Intrusive Linked List**: `struct list_head`.
