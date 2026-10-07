# Week 03 — Singly Linked List

## 목표

- Node와 `next` pointer를 이해한다.
- Singly Linked List를 직접 구현한다.
- traversal을 구현한다.

## 과제

Student를 Node로 연결하는 Singly Linked List를 구현하세요.

개념적으로 다음과 같습니다.

```c
struct node {
    struct student data;
    struct node *next;
};
```

> 이 구조는 Week 3 학습용입니다. 최종 프로젝트에서는 사용하지 않습니다.

## 필수 기능

- Insert
- Search
- Delete
- Print

## 주의

Node를 삭제할 때 Linked List 연결을 먼저 수정하고,
동적으로 생성한 Node의 메모리를 적절히 해제하세요.
