# Week 05 — Doubly Linked List

| | |
|---|---|
| **Session** | 3 hours (lecture + live coding + lab) |
| **Assignment** | [Week 05 — Doubly Linked List](../../assignments/week05-doubly-linked-list/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 04](../week04-singly-linked-list/) · [Week 06](../week06-circular-list/) |

## Session Plan

| Time | Segment | Format |
|---|---|---|
| 0:00 – 0:10 | Review of Week 04 | Quiz + discussion |
| 0:10 – 0:55 | Part 1 — Two links per node, and insertion | Lecture + live coding |
| 0:55 – 1:05 | Break | |
| 1:05 – 1:50 | Part 2 — Delete in O(1), invariants, and debugging links | Lecture + live demo |
| 1:50 – 2:50 | Lab — Week 05 assignment | Hands-on |
| 2:50 – 3:00 | Wrap-up and exit quiz | Discussion |

## Learning Objectives

By the end of this session you can:

1. Explain what a `prev` pointer buys (backward traversal, O(1) unlink) and what it costs.
2. State the link invariants of a doubly linked list and check them in code.
3. Insert at the front and the back while keeping `head`, `tail`, `next`, and `prev` consistent.
4. List the four cases of deleting a node and which pointers change in each.
5. Debug pointer bugs by dumping addresses and running an invariant checker.

---

## 0. Review of Week 04 (10 min)

1. Why does `push_front()` take `struct node **`?
2. What must you do *before* `free(cur)` when freeing a list?
3. Which cases of delete change `head`?

Today's questions: **How do you print a singly linked list backwards? How do you delete a node when you only have a pointer to it?** Both are awkward with only `next`.

---

## 1. Two Links per Node (45 min)

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

### 1.6 Forward traversal: unchanged from Week 04

```c
for (cur = list->head; cur != NULL; cur = cur->next)
    printf(" [%d]", cur->data.id);
```

**In-class exercise (3 min):** write the *backward* traversal loop. Where does it start, which pointer does it follow, and when does it stop? You need it in the lab.

---

## 2. Delete in O(1), Invariants, and Debugging (45 min)

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

Count the special cases: two `NULL` checks in unlink, one in each push. **Remember this number.** Next week, a single extra node, the *sentinel*, makes all of them disappear.

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

## 3. Lab (60 min)

Task: [assignments/week05-doubly-linked-list/README.md](../../assignments/week05-doubly-linked-list/README.md)

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

**Stretch goals:**

- `insert_before(list, pos, n)` and `insert_after(list, pos, n)`, both in O(1).
- Move a node from the front to the back using only unlink + push (no `malloc()` or `free()`).

---

## 4. Wrap-up (10 min)

### Key takeaways

- `prev` gives backward traversal and O(1) delete, at the cost of more pointers to keep consistent.
- Write down the **invariants** and restore all of them at the end of every operation.
- Delete has four cases. Handle the left side and the right side independently.
- Unlinking and freeing are separate operations.
- A link dump and an invariant checker turn silent pointer bugs into visible ones.

### Exit quiz

1. In `push_front()` on a non-empty list, which line is easiest to forget, and what breaks without it?
2. Which pointers change when you delete the only node?
3. Why is deleting a known node O(1) in a doubly linked list but O(n) in a singly linked list?
4. State the invariant that relates `n` and `n->next`.
5. How many `NULL` checks do push_front, push_back, and unlink need in total?

<details>
<summary>Answers</summary>

1. `head->prev = n;` (the old first node pointing back). Without it, `prev` links are wrong and backward traversal skips `n`.
2. `head` and `tail` both become `NULL`.
3. The node stores its predecessor in `prev`. A singly linked node does not, so you must search from `head` to find it.
4. If `n->next != NULL`, then `n->next->prev == n`.
5. Four: one in each push, and two in unlink.

</details>

### Next week

What if the list **never** had a `NULL` in it, so that the first node had a previous node and the last node had a next one? → **Week 06 — Circular Doubly Linked List with a sentinel**: four special cases become zero.
