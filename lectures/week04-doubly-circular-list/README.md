# Week 04 — Doubly Linked and Circular Lists

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 04 — Doubly Linked and Circular Lists](../../assignments/week04-doubly-circular-list/) (Assignments 04A and 04B) |
| **Demo code** | [`examples/`](examples/) · [Teaching guide](examples/README.md) |
| **Previous / Next** | [Week 03](../week03-dynamic-memory-singly-list/) · [Week 05](../week05-intrusive-list/) |

This week gives every node a second link. Parts 1 and 2 add a `prev` pointer to the singly linked list from Week 03: backward traversal and O(1) delete become possible, at the price of special cases around `NULL`. Parts 3 and 4 make every one of those special cases disappear with a sentinel node and circular links. The lab follows the same split: Lab A builds the doubly linked list (Assignment 04A), and Lab B builds the circular list with a sentinel (Assignment 04B).

## Reference slide reading

The [Week 04 deck](week04-slides.pptx) remains the primary slide material for
doubly linked lists, sentinels, circular invariants, and safe deletion. The
seven supplied reference PDFs review prerequisites; they do not teach these
list algorithms. Revisit only the sections needed during the live demos:

- [Pointers Revisited](../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf#page=25),
  pp. 25-26: double pointers, after recalling `&`, `*`, and struct pointers.
  [Structures, Unions and Enums](../week01-struct/%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf#page=21),
  pp. 21-27: pointer parameters and nested data used by `struct node`.
- [Dynamic Memory Allocation](../week03-dynamic-memory-singly-list/%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf#page=25),
  pp. 25-27: leaks and dangling pointers. Apply Week 03's ownership rules when
  unlinking nodes and saving the next link before freeing the current node.
- [Writing Large Programs](../week08-final-project/%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf#page=16),
  pp. 16-18: conditional compilation and `-D`; connect these to the lecture's
  `assert()` / `-DNDEBUG` demonstration, which the reference does not cover.

## Learning Objectives

By the end of this session you can:

1. Explain what a `prev` pointer buys (backward traversal, O(1) unlink) and what it costs.
2. State the link invariants of a doubly linked list and check them in code.
3. Insert at the front and the back while keeping `head`, `tail`, `next`, and `prev` consistent.
4. List the four cases of deleting a node and which pointers change in each.
5. Debug pointer bugs by dumping addresses and running an invariant checker.
6. Explain what a *sentinel* node is and why it removes every `NULL` special case.
7. State the empty-list invariant `head.next == &head && head.prev == &head` and draw lists of 0, 1, and 3 elements.
8. Implement every insertion with one `insert_between()` helper.
9. Unlink a node with two assignments and no `if`.
10. Traverse forward and backward, and delete while traversing without a use-after-free.
11. Check invariants with `assert()`, and explain what `-DNDEBUG` does.

---

## 0. Review of Week 03

1. Why does `push_front()` take `struct node **`?
2. What must you do *before* `free(cur)` when freeing a list?
3. Which cases of delete change `head`?

Today's questions: **How do you print a singly linked list backwards? How do you delete a node when you only have a pointer to it?** Both are awkward with only `next`.

---

## 1. Two Links per Node

### 1.1 What `prev` buys

| Task | Singly linked | Doubly linked |
|---|---|---|
| Walk backward | Impossible without extra memory | Follow `prev` |
| Delete a node, given a pointer to it | O(n): search for its predecessor | **O(1)**: the node knows both neighbors |
| Insert *before* a given node | O(n) | **O(1)** |
| Memory per node | 1 pointer | 2 pointers |
| Pointer updates per insert/delete | 1–2 | **2–4**, so there are more ways to get it wrong |

### 1.2 The node and the list

```c
struct node {
    struct book data;
    struct node *next;
    struct node *prev;
};

struct dlist {
    struct node *head;     /* first node, or NULL */
    struct node *tail;     /* last node, or NULL  */
};
```

```text
         head                                    tail
          │                                       │
          ▼                                       ▼
        +------+------+------+   +------+------+------+   +------+------+------+
NULL ◄──┼ prev | [1]  | next ┼──►┼ prev | [2]  | next ┼──►┼ prev | [3]  | next ┼──► NULL
        |      |      |      |◄──┼      |      |      |◄──┼      |      |      |
        +------+------+------+   +------+------+------+   +------+------+------+
```

> The assignment's starter declares only `struct node *head`. You may keep a separate `tail` pointer, as the demo does, or walk to the last node when you need it. Either is fine. A small `struct dlist` that holds both is the cleaner design.

### 1.3 Invariants: the rules that must always hold

An **invariant** is a property that holds before and after every operation. For a doubly linked list:

1. `head == NULL` if and only if `tail == NULL` (the empty list).
2. `head->prev == NULL` and `tail->next == NULL`.
3. For every node `n`: if `n->next != NULL`, then `n->next->prev == n`.
4. For every node `n`: if `n->prev != NULL`, then `n->prev->next == n`.

Every operation may break the rules temporarily, *in the middle*, but must restore all of them before it returns. When you design an operation, ask: **which invariants could this break, and which lines restore them?**

### 1.4 Insert at the front

```text
empty list:                     head = tail = NULL
after push_front(n):            head = tail = n,  n->prev = n->next = NULL

non-empty list:
  before                head ──► [A] ⇄ [B] ◄── tail
  1. n->prev = NULL;
  2. n->next = head;    [N] ──► [A]
  3. head->prev = n;    [N] ⇄ [A]
  4. head = n;          head ──► [N] ⇄ [A] ⇄ [B] ◄── tail
```

```c
static void dlist_push_front(struct dlist *list, struct node *n)
{
    n->prev = NULL;
    n->next = list->head;
    if (list->head != NULL)
        list->head->prev = n;      /* old first node points back to n */
    else
        list->tail = n;            /* empty list: n is also the last node */
    list->head = n;
}
```

Step 3 is the one people forget. Without it, invariant 3 breaks, and backward traversal skips the new node.

### 1.5 Insert at the back: the mirror image

```c
static void dlist_push_back(struct dlist *list, struct node *n)
{
    n->next = NULL;
    n->prev = list->tail;
    if (list->tail != NULL)
        list->tail->next = n;
    else
        list->head = n;
    list->tail = n;
}
```

Compare it with `push_front()` line by line: `head ↔ tail` and `next ↔ prev`. That symmetry is a good way to check your work.

### 1.6 Forward traversal: unchanged from Week 03

```c
for (cur = list->head; cur != NULL; cur = cur->next)
    printf(" [%d]", cur->data.id);
```

**In-class exercise (3 min):** write the *backward* traversal loop. Where does it start, which pointer does it follow, and when does it stop? You need it in Lab A (§5.1).

---

## 2. Delete in O(1), Invariants, and Debugging

### 2.1 Unlinking a node: the general case

To remove `n` from the middle, the two neighbors must point **at each other**:

```text
before:   [P] ⇄ [N] ⇄ [X]

          n->prev->next = n->next;      [P] ──────────► [X]
          n->next->prev = n->prev;      [P] ◄────────── [X]

after:    [P] ⇄ [X]          [N] is unlinked: free it, or insert it elsewhere
```

There is no search: `n` already knows both neighbors. That is the O(1) delete.

### 2.2 The four cases

`n->prev` or `n->next` may be `NULL`, and then `head` or `tail` must change instead:

| Case | `n->prev` | `n->next` | Pointers to update |
|---|---|---|---|
| Middle node | node | node | `n->prev->next`, `n->next->prev` |
| First node | `NULL` | node | `head`, `n->next->prev` |
| Last node | node | `NULL` | `n->prev->next`, `tail` |
| Only node | `NULL` | `NULL` | `head`, `tail` |

Notice the pattern: each side is handled independently.

- **Left side:** if there is a previous node, fix its `next`. Otherwise fix `head`.
- **Right side:** if there is a next node, fix its `prev`. Otherwise fix `tail`.

**In-class exercise (5 min):** write `dlist_unlink(struct dlist *list, struct node *n)` using two `if`/`else` statements, one per side. It must **not** call `free()`.

<details>
<summary>Answer</summary>

```c
static void dlist_unlink(struct dlist *list, struct node *n)
{
    if (n->prev != NULL)
        n->prev->next = n->next;
    else
        list->head = n->next;

    if (n->next != NULL)
        n->next->prev = n->prev;
    else
        list->tail = n->prev;

    n->prev = NULL;
    n->next = NULL;
}
```

Delete by ID then becomes: find the node → `dlist_unlink()` → `free()`.

</details>

Count the special cases: two `NULL` checks in unlink, one in each push. **Remember this number.** In Part 3, a single extra node, the *sentinel*, makes all of them disappear.

### 2.3 Why unlink and free are separate

- `unlink` is a **list** operation: it changes links.
- `free` is a **memory** operation: it ends the object's lifetime.

Keeping them separate lets you move a node from one list to another (unlink, then insert elsewhere) without freeing it. The final project requires this split: `list_del()` must never call `free()`.

### 2.4 Debugging links: make the invisible visible

Pointer bugs are silent until something crashes far away. Two tools help, and both are plain C.

**1. A link dump.** Print `prev`, `self`, and `next` for every node:

```text
head = 0x104a69280, tail = 0x104a692c0
  [1] prev = 0x0            self = 0x104a69280    next = 0x104a69240
  [2] prev = 0x104a69280    self = 0x104a69240    next = 0x104a692c0
  [3] prev = 0x104a69240    self = 0x104a692c0    next = 0x0
```

Read it diagonally: each node's `next` must equal the following line's `self`, and that line's `prev` must equal this line's `self`.

**2. An invariant checker** that you call after every operation while developing:

```c
/* Returns 1 if every link is consistent, 0 (and prints why) otherwise. */
static int dlist_check(const struct dlist *list)
{
    const struct node *cur;
    const struct node *prev = NULL;

    for (cur = list->head; cur != NULL; prev = cur, cur = cur->next) {
        if (cur->prev != prev) {
            printf("BROKEN: node [%d] has the wrong prev\n", cur->data.id);
            return 0;
        }
    }
    if (list->tail != prev) {
        printf("BROKEN: tail does not point to the last node\n");
        return 0;
    }
    return 1;
}
```

**Live demo** — [`examples/dll_book.c`](examples/dll_book.c) builds a list, dumps it, checks it, breaks one link on purpose, and checks again:

```text
forward : [1] [2] [3]
...
check: OK
BROKEN: node [2] has the wrong prev
after breaking a link, check: FAILED
after free, check: OK
```

### 2.5 Common pitfalls

| Symptom | Likely cause |
|---|---|
| Forward print is fine, backward print skips nodes | A `prev` was not set during insert (step 3 in §1.4). |
| Backward print starts at the wrong node | `tail` was not updated by `push_back()` or by deleting the last node. |
| Crash when deleting the first or last node | Dereferenced `n->prev` or `n->next` without checking for `NULL`. |
| List looks fine, then crashes after a delete | The deleted node was freed but a neighbor still points to it. |

---

## 3. The Sentinel and the Circular Invariant

The question for Parts 3 and 4: **The `NULL` checks counted in §2.2 exist because the first node has no previous node and the last node has no next. What if they always did?**

### 3.1 Two ideas combined

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

### 3.2 Pictures you must be able to draw

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

### 3.3 The invariant

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

Compare this with the four rules in §1.3, two of which were about `NULL`. There is now **one** rule, and it has no exceptions.

### 3.4 Useful facts that follow

| Question | Answer |
|---|---|
| Is the list empty? | `head.next == &head` |
| First element? | `head.next` (only valid if not empty) |
| Last element? | `head.prev`, O(1), with no separate tail pointer |
| End of forward traversal? | When you are back at `&head`, **not** at `NULL` |

### 3.5 Traversal

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
- `pos != NULL` is an **infinite loop** in a circular list. It is the most common circular-list bug.
- An empty list runs the loop zero times, because `head->next == head` immediately.

### 3.6 Whiteboard exercise: trace `init`

```c
static void list_init(struct node *head)
{
    head->next = head;
    head->prev = head;
}
```

Why must `init` run before anything else? What happens if you traverse an uninitialized `struct node head;`? (Recall Week 01: an uninitialized local holds garbage.)

---

## 4. One Insert, One Unlink

### 4.1 Insert between two adjacent nodes

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

### 4.2 Whiteboard exercise: the "special" case is not special

Trace `insert_back(&head, n)` on an **empty** list. Then `prev = head->prev = &head` and `next = &head`:

```text
① head.prev = n         ② n->next = &head
③ n->prev  = &head      ④ head.next = n
```

The result is exactly the one-element picture from §3.2. **No `if` was needed.** Compare with `dlist_push_back()` from §1.5.

**Live demo** — [`examples/clist_book.c`](examples/clist_book.c) dumps the links after the first insert:

```text
after the first insert:
  HEAD prev = 0x101335240    self = 0x16f0ca510    next = 0x101335240
  [2]  prev = 0x16f0ca510    self = 0x101335240    next = 0x16f0ca510
```

Both of HEAD's links point to `[2]`, and both of `[2]`'s links point to HEAD. Notice that HEAD's address looks very different from the others: the sentinel is on the **stack** and the nodes are on the **heap** (Week 03).

### 4.3 Unlink: two assignments, no `if`

**In-class exercise (5 min):** remove `entry` from the ring. The neighbors must point at each other. Recall the general case from §2.1.

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

This is the general case from §2.1 with the `if`s deleted. Because every node has real neighbors, the first, last, and only-node cases are all the same code.

</details>

Trace it on the **one-element** list. Afterwards, `head.next == &head` and `head.prev == &head`, so the list is empty again, automatically.

| | `NULL`-terminated (Parts 1–2) | Circular + sentinel (Parts 3–4) |
|---|---|---|
| Insert front | 1 `if` | 0 |
| Insert back | 1 `if` | 0 |
| Unlink | 2 `if`s, four cases | 0 |
| Find the last node | separate `tail` pointer | `head.prev` |
| Extra memory | `tail` pointer | one sentinel node |

### 4.4 After unlinking

`entry->next` and `entry->prev` still point into the list. If someone follows them, they walk into a list that `entry` is no longer part of. Two common defenses:

- Point them at the entry itself (re-initialize it as an empty ring).
- Set them to "poison" values that crash immediately if used. Setting them to `NULL` is the simple version.

For reference, the Linux kernel's `list_del_init()` does the first, and its `list_del()` does the second, writing `LIST_POISON1` and `LIST_POISON2`.

Either way, unlinking **does not free**. Delete by ID is still: find → unlink → `free()`.

### 4.5 Deleting while traversing

This loop frees `pos` and then reads `pos->next`, which is a use-after-free:

```c
for (pos = head->next; pos != head; pos = pos->next)
    free(pos);                                     /* WRONG */
```

Save the next node first, as in Week 03:

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

In Week 06 we turn this "save next" pattern into a macro, `list_for_each_safe()`.

### 4.6 Checking invariants with `assert()`

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

### 4.7 Makefile corner: `-DNDEBUG` turns asserts off

`-DNAME` defines a macro for the preprocessor, as if the file began with `#define NAME 1`. When `NDEBUG` is defined, every `assert()` compiles to nothing:

```bash
make -B CFLAGS="-Wall -Wextra -std=c11 -DNDEBUG"
./clist_book break      # "nodes = 3, links OK": the corruption goes unnoticed!
make -B                 # back to the normal build
```

Note the `-B`: as Week 03 showed, `make` does not notice a change of flags. Two consequences:

- Never put code with **side effects** inside `assert()` (e.g. `assert(n = malloc(...))`). It vanishes with `-DNDEBUG`.
- `assert()` is for **programming errors** (broken invariants), not for user errors like a bad ID. Handle user errors with `if` and a message.

---

## 5. Lab

Task: [assignments/week04-doubly-circular-list/README.md](../../assignments/week04-doubly-circular-list/README.md)

The assignment has two parts, one for each half of today's lecture: **Assignment 04A — Doubly Linked List** (`starter/assignment_04a.c`) and **Assignment 04B — Circular Doubly Linked List** (`starter/assignment_04b.c`). `make` in `starter/` builds both programs.

### 5.1 Lab A — Assignment 04A: Doubly Linked List

```bash
cd assignments/week04-doubly-circular-list/starter && make && ./week04a
```

Suggested order. Build and run your checker after **every** step:

1. Node creation, and insert (front or back, or both). Keep `prev` correct.
2. Forward print.
3. Backward print (the in-class exercise in §1.6).
4. An invariant checker, adapted from `dlist_check()`.
5. Delete by ID: find the node, unlink it (all four cases), free it.
6. Free the whole list at exit.

Test plan. After each step, print **forward and backward** and run the checker:

| # | Action | Expected forward / backward |
|---|---|---|
| 1 | Empty list | empty / empty |
| 2 | Insert 1, 2, 3 at the back | `1 2 3` / `3 2 1` |
| 3 | Delete 2 (middle) | `1 3` / `3 1` |
| 4 | Delete 1 (first) | `3` / `3` |
| 5 | Insert 4 at the back, delete 4 (last) | `3` / `3` |
| 6 | Delete 3 (only) | empty / empty |
| 7 | Delete 99 (missing) | "not found", list unchanged |

### 5.2 Lab B — Assignment 04B: Circular Doubly Linked List with a Sentinel

```bash
cd assignments/week04-doubly-circular-list/starter && make && ./week04b
```

The `assignment_04b.c` starter already initializes the sentinel in `main()`. Suggested order:

1. Turn the initialization into `list_init()`. Add `list_is_empty()`.
2. `insert_between()`, `insert_front()`, `insert_back()`, and node creation.
3. Forward and backward traversal.
4. A `list_check()` with `assert()`. Call it after every operation.
5. Unlink, then delete by ID (find → unlink → `free()`).
6. `free_all()` at exit, after which the empty invariant must hold again.

The assignment README requires you to test the empty list and the one-element list explicitly:

| # | Action | Check |
|---|---|---|
| 1 | `init`, print both directions | empty, `head.next == &head`, `head.prev == &head` |
| 2 | Insert 1 element, print both directions | one element, the checker passes |
| 3 | Delete that element | empty invariant holds again |
| 4 | Insert 1, 2, 3 at the back; insert 0 at the front | forward `0 1 2 3`, backward `3 2 1 0` |
| 5 | Delete first, middle, last | the checker passes after each |
| 6 | Delete a missing ID | "not found", list unchanged |
| 7 | `free_all()` | empty invariant holds |

### 5.3 Stretch goals

**Lab A (doubly linked list):**

- `insert_before(list, pos, n)` and `insert_after(list, pos, n)`, both in O(1).
- Move a node from the front to the back using only unlink + push (no `malloc()` or `free()`).

**Lab B (circular list with a sentinel):**

- `list_move_tail(entry, head)`: unlink `entry`, then `insert_back()`, with no `malloc()` or `free()`.
- `list_splice()`: move every node of one list to the end of another in O(1) (only the four boundary links change).

---

## 6. Wrap-up

### Key takeaways

- `prev` gives backward traversal and O(1) delete, at the cost of more pointers to keep consistent.
- Write down the **invariants** and restore all of them at the end of every operation.
- In a `NULL`-terminated list, delete has four cases. Handle the left side and the right side independently.
- Unlinking and freeing are separate operations.
- A link dump and an invariant checker turn silent pointer bugs into visible ones.
- A sentinel plus circular links means every node always has two real neighbors, so `NULL` never appears.
- Empty means `head.next == &head` (and `head.prev == &head`). The last node is `head.prev`.
- Traversal starts at `head->next` and stops when it returns to `head`, never at `NULL`.
- One `insert_between()` implements every insert. Unlink is two lines with no `if`.
- Save `next` before freeing during traversal. Restore the empty invariant at the end.
- `assert()` catches broken invariants early. `-DNDEBUG` removes the checks.

### Exit quiz

**Doubly linked list (Parts 1–2)**

1. In `push_front()` on a non-empty list, which line is easiest to forget, and what breaks without it?
2. Which pointers change when you delete the only node?
3. Why is deleting a known node O(1) in a doubly linked list but O(n) in a singly linked list?
4. State the invariant that relates `n` and `n->next`.
5. How many `NULL` checks do push_front, push_back, and unlink need in total?

**Circular list with a sentinel (Parts 3–4)**

6. What are `head.next` and `head.prev` in an empty list?
7. A student writes `for (pos = head->next; pos != NULL; pos = pos->next)`. What happens?
8. Which call inserts at the back: `insert_between(n, head, head->next)` or `insert_between(n, head->prev, head)`?
9. After unlinking the only element, what do `head.next` and `head.prev` point to?
10. Why must you never write `assert(p = malloc(size))`?

<details>
<summary>Answers</summary>

1. `head->prev = n;` (the old first node pointing back). Without it, `prev` links are wrong and backward traversal skips `n`.
2. `head` and `tail` both become `NULL`.
3. The node stores its predecessor in `prev`. A singly linked node does not, so you must search from `head` to find it.
4. If `n->next != NULL`, then `n->next->prev == n`.
5. Four: one in each push, and two in unlink.
6. Both are `&head`.
7. An infinite loop. The ring never contains `NULL`, so the loop goes around and around, through the sentinel's meaningless data too.
8. `insert_between(n, head->prev, head)`: between the last node and the sentinel.
9. Both point to `&head`, so the list is empty again with no special code.
10. With `-DNDEBUG` the whole expression, including the `malloc()` call, disappears.

</details>

### Next week

Our sentinel still carries an unused `struct book data`, and the list code only works for `struct node` holding a book. What if the links did not need a node at all, and lived **inside** the data instead? → **Week 05 — Intrusive Linked List**: `struct list_head`.
