# Week 06 — Intrusive Linked List

## Learning Objectives

- Linked List node를 별도의 `struct node`로 만들지 않는 방법을 이해한다.
- Data object 내부에 `struct list_head`를 포함하는 Intrusive List를 구현한다.
- List metadata와 실제 data object를 분리해서 생각한다.

## Assignment

다음과 같은 구조를 사용하세요.

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

별도의 `struct node`를 만들지 않고 `student.list`를 List node처럼 사용하세요.

## Requirements

- Student 내부에 `struct list_head list`를 둡니다.
- sentinel `head`를 사용합니다.
- Circular Doubly Linked List를 유지합니다.
- `struct node`를 추가하지 않습니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week06
./week06
```

## Checklist

- [ ] `struct node`를 만들지 않았다.
- [ ] `student.list`를 사용했다.
- [ ] Circular 구조가 유지된다.
- [ ] Forward / Backward traversal을 구현했다.

## Makefile

```bash
cd starter
make
./week06
make clean
```
