# Week 04 — Doubly Linked List

## 목표

- `prev` pointer의 역할을 이해한다.
- Forward traversal과 Backward traversal을 구현한다.
- Node 삭제 시 양쪽 연결을 수정한다.

## 과제

Week 3의 Singly Linked List를 Doubly Linked List로 확장하세요.

```c
struct node {
    struct student data;
    struct node *next;
    struct node *prev;
};
```

## 필수 기능

- Forward Print
- Backward Print
- Insert
- Delete
- Search

## 핵심 질문

Node 하나를 삭제할 때 왜 `prev->next`와 `next->prev`를 모두 수정해야 하는가?
