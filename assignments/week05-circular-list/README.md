# Week 05 — Circular Doubly Linked List

## Learning Objectives

- `NULL` 대신 sentinel을 사용하는 Circular List를 이해한다.
- 빈 리스트의 invariant를 이해한다.
- Circular Doubly Linked List의 삽입과 순회를 구현한다.

## Assignment

`starter/main.c`를 기반으로 **sentinel `head`를 사용하는 Circular Doubly Linked List**를 구현하세요.

## Empty List Invariant

빈 리스트에서는 항상 다음 조건이 성립해야 합니다.

```c
head.next == &head;
head.prev == &head;
```

List를 순회할 때 마지막 node 다음에는 `NULL`이 아니라 `&head`가 옵니다.

## Requirements

- sentinel `head`를 사용합니다.
- `next`와 `prev`를 모두 유지합니다.
- Insert와 Delete를 구현합니다.
- Forward / Backward traversal을 구현합니다.
- 빈 리스트와 element가 하나인 경우를 반드시 테스트합니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week05
./week05
```

## Checklist

- [ ] Empty invariant가 유지된다.
- [ ] Insert 후 `next`/`prev`가 정상이다.
- [ ] Delete 후 `next`/`prev`가 정상이다.
- [ ] Forward traversal이 동작한다.
- [ ] Backward traversal이 동작한다.

## Makefile

```bash
cd starter
make
./week05
make clean
```
