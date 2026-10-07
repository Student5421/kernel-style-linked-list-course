# Project Overview

## 목적

이 프로젝트의 목적은 Linked List API 자체를 외우는 것이 아니라,
C의 핵심 개념들이 하나의 자료구조 구현에서 어떻게 연결되는지 이해하는 것입니다.

## 8주 학습 목표

| 주차 | 주제 | 핵심 개념 |
|---|---|---|
| 1 | Struct | `struct`, pointer |
| 2 | Dynamic Memory | `malloc`, `free`, heap |
| 3 | Singly Linked List | `next`, traversal |
| 4 | Doubly Linked List | `prev`, bidirectional traversal |
| 5 | Circular List | sentinel, circular invariant |
| 6 | Intrusive List | data structure inside object |
| 7 | `container_of()` | `offsetof`, pointer arithmetic |
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

Student가 Linked List node 자체를 포함하는 Intrusive List 방식입니다.

리스트가 비어 있을 때:

```text
HEAD.next == HEAD
HEAD.prev == HEAD
```

Circular 구조이므로 마지막 node 다음에는 `NULL`이 아니라 `HEAD`가 옵니다.
