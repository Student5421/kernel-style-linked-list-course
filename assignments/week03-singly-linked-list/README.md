# Week 03 — Singly Linked List

## Learning Objectives

- Node와 pointer로 Linked List를 구성한다.
- `next` pointer를 이용해 순회한다.
- Insert, Search, Delete의 기본 동작을 구현한다.

## Assignment

`starter/main.c`의 `struct node`를 이용하여 Singly Linked List를 구현하세요.

최소한 다음 기능을 구현합니다.

- Insert
- Search by ID
- Delete by ID
- Print

## Requirements

- 각 node는 `next` pointer를 가져야 합니다.
- List가 비어 있을 때 `head == NULL`입니다.
- 동적으로 생성한 node는 삭제 시 `free()`합니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week03
./week03
```

## Checklist

- [ ] Insert
- [ ] Search
- [ ] Delete
- [ ] Print
- [ ] `free()` 처리

## Makefile

```bash
cd starter
make
./week03
make clean
```
