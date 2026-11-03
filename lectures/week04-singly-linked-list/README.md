# Week 04 — Singly Linked List

| | |
|---|---|
| **Session** | 3 hours (lecture + live coding + lab) |
| **Assignment** | [Week 04 — Singly Linked List](../../assignments/week04-singly-linked-list/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 03](../week03-dynamic-memory/) · [Week 05](../week05-doubly-linked-list/) |

## Session Plan

| Time | Segment | Format |
|---|---|---|
| 0:00 – 0:10 | Review of Week 03 | Quiz + discussion |
| 0:10 – 0:55 | Part 1 — Nodes, links, and traversal | Lecture + live demo |
| 0:55 – 1:05 | Break | |
| 1:05 – 1:50 | Part 2 — Insert, free, and the design of delete | Lecture + live coding |
| 1:50 – 2:50 | Lab — Week 04 assignment | Hands-on |
| 2:50 – 3:00 | Wrap-up and exit quiz | Discussion |

## Learning Objectives

By the end of this session you can:

1. Compare arrays and linked lists in terms of memory layout and the cost of insert, delete, and indexing.
2. Define a self-referential `struct node` and draw a list as boxes and arrows.
3. Traverse a list with a cursor pointer, and handle the empty list (`head == NULL`).
4. Explain why `push_front()` needs `struct node **` (or must return the new head).
5. Free an entire list without a use-after-free.
6. Identify every case that `delete` must handle.

---

## 0. Review of Week 03 (10 min)

1. Where does `struct book *b = malloc(sizeof(*b));` put `b`, and where does it put the book?
2. Name the four classic heap bugs.
3. After `free(p)`, what value does `p` hold?

Today's question: **We can create objects at run time. How do we keep track of an unknown number of them without an array?**

---

## 1. Nodes, Links, and Traversal (45 min)

### 1.1 Arrays vs. linked lists

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

A list trades fast indexing for cheap insertion and deletion and unlimited growth. Operating-system kernels need exactly that trade, which is why they are full of lists.

### 1.2 The node: a self-referential struct

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
- The assignment's starter uses the same shape with `struct student data;`.
- A pointer called **`head`** points to the first node, and `head == NULL` means the list is empty. The last node (the **tail**) has `next == NULL`.

### 1.3 Building a list by hand

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

### 1.4 The traversal pattern

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

## 2. Insert, Free, and the Design of Delete (45 min)

### 2.1 Creating a node

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

### 2.2 Insert at the front: two steps, in this order

```text
before:              head ──► [A] ──► [B] ──► NULL
                     n    ──► [N]

1. n->next = head;   head ──► [A] ──► [B] ──► NULL
                              ▲
                     n ──► [N]┘

2. head = n;         head ──► [N] ──► [A] ──► [B] ──► NULL
```

If you swap the steps, `head = n` runs first and the old list is lost.

### 2.3 The head problem

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

### 2.4 Insert at the back

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

**Kernel-style taste:** walk the **links** instead of the nodes, and the special case disappears. (`&(*link)->next` parses as `&((*link)->next)`, as in Week 02, §2.1.)

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

### 2.5 Freeing the whole list

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

> The demo uses `goto out_of_memory;` for error handling. A single cleanup label at the end of a function is common and accepted in the Linux kernel. It keeps the cleanup code in one place.

### 2.6 Search by ID: a design exercise

Write the function on paper before the lab:

```c
/* Returns the node whose data.id == id, or NULL if there is none. */
struct node *find_by_id(struct node *head, int id);
```

Questions to settle first:

- What does it return for an empty list?
- Why return a `struct node *` and not a copy of the `struct book`?

### 2.7 Delete by ID: a design exercise

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

### 2.8 Makefile corner: flags are not prerequisites

`make` compares **file timestamps** only. If you change *how* you compile, it does not notice:

```bash
make                                         # builds with the Makefile's CFLAGS
make CFLAGS="-Wall -Wextra -std=c11 -g"      # "Nothing to be done for 'all'": no rebuild!
make -B CFLAGS="-Wall -Wextra -std=c11 -g"   # -B forces the rebuild
```

`-g` adds debugging information for a debugger (`gdb` on Linux, `lldb` on macOS). Remember the rule: **after changing flags, `make clean && make` (or `make -B`).**

---

## 3. Lab (60 min)

Task: [assignments/week04-singly-linked-list/README.md](../../assignments/week04-singly-linked-list/README.md)

Suggested order. Build after **every** step:

1. `node_create()`, which allocates a node holding one student, plus a `NULL` check.
2. Insert, either `push_front()` or `push_back()`, and print. Insert three students and print them.
3. `free_list()`. Call it at the end of `main()` from now on.
4. Search by ID. Print the found student, or `Not found`.
5. Delete by ID: find, unlink, free. Handle every case in the table in §2.7.

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

**Stretch goals:**

- Delete with `struct node **link` and no special case for the first node.
- `insert_sorted()`: keep the list ordered by ID.
- `reverse_list()`: reverse the list in place by changing only `next` pointers.

---

## 4. Wrap-up (10 min)

### Key takeaways

- A list is nodes connected by `next` pointers. `head == NULL` means empty, and the last node's `next` is `NULL`.
- Traverse with a separate cursor: `for (cur = head; cur != NULL; cur = cur->next)`.
- A function that may change `head` needs `struct node **` (or must return the new head).
- When freeing, save `next` **before** `free()`.
- Delete must handle empty, not-found, first, middle, last, and only-node cases. Next week you will see how many of these get *worse* with two pointers per node, and in Week 06 how the first, last, and only-node cases disappear.

### Exit quiz

1. What is the time cost of reaching the 1000th node of a list?
2. Why does `push_front_wrong(head, n)` leave `main()`'s `head` unchanged?
3. What is wrong with `for (cur = head; cur != NULL; cur = cur->next) free(cur);`?
4. Which delete cases change `head`?
5. In `push_back()` with `struct node **link`, what does `link` point to when the list is empty?

<details>
<summary>Answers</summary>

1. O(n): you must follow 999 `next` pointers from `head`.
2. The function received a copy of `head` and changed only the copy.
3. `cur = cur->next` reads from `cur` after it was freed (use after free).
4. Deleting the first node, which includes deleting the only node.
5. To `main()`'s `head` variable itself, so `*link = n` sets `head`.

</details>

### Next week

A singly linked list can only go forward, and deleting a node requires finding its predecessor. What if every node also knew the node **before** it? → **Week 05 — Doubly Linked List**.
