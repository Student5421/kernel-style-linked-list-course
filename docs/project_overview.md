# Project Overview

## Goal

The goal of this project is not to memorize a linked list API. It is to understand how the core ideas of C connect inside one data structure.

## 8-Week Learning Goals

| Week | Topic | Key Concepts |
|---|---|---|
| 1 | Struct | `struct`, pointer |
| 2 | Operators & Precedence | precedence, short-circuit, bit flags |
| 3 | Dynamic Memory and Singly Linked List | `malloc()`, `free()`, heap, `next`, traversal |
| 4 | Doubly Linked and Circular Lists | `prev`, bidirectional traversal, sentinel, circular invariant |
| 5 | Intrusive Linked List | `list_head` inside the object |
| 6 | `container_of()` | `offsetof()`, pointer arithmetic |
| 7 | File I/O | `fopen()`, `fgets()`, saving and loading files |
| 8 | Final Project | putting it all together |

## Final Data Structure

```c
struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};
```

`struct student` contains its own `list_head`, so no separate `struct node` is needed. This is the key idea of an **intrusive linked list**.

In an empty circular list, this invariant must always hold:

```text
head->next == head
head->prev == head
```

So the `next` of the last element points to `head`, not to `NULL`.
