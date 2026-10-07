# Week 04 — Doubly Linked List

## Learning Objectives

- `next`와 `prev`를 동시에 관리한다.
- Forward / Backward traversal을 구현한다.
- Node 삭제 시 양쪽 연결을 수정한다.

## Assignment

`starter/main.c`를 완성하여 Doubly Linked List를 구현하세요.

## Requirements

- Node에 `next`와 `prev`가 모두 있어야 합니다.
- Forward Print를 구현합니다.
- Backward Print를 구현합니다.
- Delete 시 앞뒤 node의 연결을 모두 수정합니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week04
./week04
```

## Checklist

- [ ] `next` 연결이 정상이다.
- [ ] `prev` 연결이 정상이다.
- [ ] Forward traversal이 동작한다.
- [ ] Backward traversal이 동작한다.
- [ ] Delete 후 연결이 깨지지 않는다.

## Makefile

```bash
cd starter
make
./week04
make clean
```
