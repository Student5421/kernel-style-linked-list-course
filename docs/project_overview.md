# Project Overview

## 목적

이 프로젝트의 목적은 Linked List API를 단순히 외우는 것이 아니라, C의 핵심 개념이 하나의 자료구조 구현으로 어떻게 연결되는지 이해하는 것입니다.

## 8주 학습 목표

| 주차 | 주제 | 핵심 개념 |
|---|---|---|
| 1 | Struct | `struct`, pointer |
| 2 | Dynamic Memory | `malloc()`, `free()`, heap |
| 3 | Singly Linked List | `next`, traversal |
| 4 | Doubly Linked List | `prev`, bidirectional traversal |
| 5 | Circular Doubly Linked List | sentinel, circular invariant |
| 6 | Intrusive Linked List | object 내부의 `list_head` |
| 7 | `container_of()` | `offsetof()`, pointer arithmetic |
| 8 | Final Project | 전체 개념 통합 |

## 최종 자료구조

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

`struct student`가 자신의 `list_head`를 직접 포함하므로 별도의 `struct node`가 필요하지 않습니다. 이것이 **Intrusive Linked List**의 핵심입니다.

빈 Circular List에서는 다음 불변식이 항상 성립해야 합니다.

```text
head->next == head
head->prev == head
```

따라서 마지막 element의 `next`는 `NULL`이 아니라 `head`를 가리킵니다.
