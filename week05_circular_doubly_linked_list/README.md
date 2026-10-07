# Week 05 — Circular Doubly Linked List

## 목표

- Circular List의 구조를 이해한다.
- `NULL` 대신 sentinel을 사용하는 방법을 이해한다.
- List invariant를 유지한다.

## 핵심 구조

빈 리스트:

```text
       +------+
       | HEAD |
       +------+
        ↑    ↓
        +----+
```

```c
head->next == head;
head->prev == head;
```

Student가 하나 있으면:

```text
HEAD <-> STUDENT <-> HEAD
```

## 과제

Week 4의 Doubly Linked List를 Circular Doubly Linked List로 변경하세요.

## 필수 조건

- 빈 리스트에서도 `head->next == head`
- 빈 리스트에서도 `head->prev == head`
- 마지막 node의 `next`는 `head`
- 첫 node의 `prev`는 `head`

## 핵심 질문

Circular List에서는 왜 `while (node != NULL)`이 종료 조건으로 적절하지 않은가?
