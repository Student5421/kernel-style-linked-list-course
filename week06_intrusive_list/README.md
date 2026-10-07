# Week 06 — Intrusive Linked List

## 목표

- Intrusive Linked List의 개념을 이해한다.
- List metadata와 실제 data를 분리한다.
- 별도의 Node 구조체 없이 객체 자체를 List에 연결한다.

## 핵심 구조

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

Student 안에 `list_head`가 포함되어 있습니다.

## 과제

Student를 별도 Node로 감싸지 않고 Student 자체가 List의 member를 가지도록 변경하세요.

## 핵심 질문

- Intrusive List에서 `list_head`가 왜 Student 안에 들어가는가?
- `list_head *`만 가지고 Student의 `id`를 어떻게 찾을 수 있는가?

이 질문은 Week 7의 `container_of()`로 연결됩니다.
