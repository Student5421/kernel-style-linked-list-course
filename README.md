# C Programming Final Project: Kernel-style Linked List

8주 동안 C Programming에서 학습한 `struct`, pointer, dynamic memory, linked list를
하나의 Student Management System으로 통합하는 프로젝트입니다.

## Learning Path

```text
Struct
  ↓
Pointer
  ↓
Dynamic Memory
  ↓
Singly Linked List
  ↓
Doubly Linked List
  ↓
Circular Doubly Linked List
  ↓
Intrusive Linked List
  ↓
offsetof()
  ↓
container_of()
  ↓
Kernel-style Linked List
```

## Repository Guide

- `week01_struct/` — Struct와 Student 기본
- `week02_dynamic_memory/` — Dynamic Memory
- `week03_singly_linked_list/` — Singly Linked List
- `week04_doubly_linked_list/` — Doubly Linked List
- `week05_circular_list/` — Circular Doubly Linked List
- `week06_intrusive_list/` — Intrusive Linked List
- `week07_container_of/` — `offsetof()`와 `container_of()`
- `week08_final_project/` — 최종 Student Management System
- `docs/` — 전체 프로젝트 명세, 제출 방법, 평가 기준

각 주차의 `README.md`를 먼저 읽고 해당 주차의 `starter/`에서 작업하세요.

## General Rules

1. C11 기준으로 작성합니다.
2. 컴파일 경고를 확인합니다.
3. Dynamic Memory를 사용하는 경우 반드시 `free()`까지 책임집니다.
4. 배열 기반의 Student 저장소로 최종 프로젝트를 구현하지 않습니다.
5. 최종 프로젝트에서는 별도의 `struct node`를 만들지 않습니다.
6. 최종 프로젝트는 Circular Doubly Linked List + Intrusive List 구조를 사용합니다.
7. 최종 프로젝트에서는 `container_of()`를 사용합니다.
8. 최종 제출물은 정상적으로 컴파일되어야 합니다.

## Compile

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

가능하면 다음도 사용하세요.

```bash
gcc -Wall -Wextra -Werror -std=c11 main.c list.c student.c -o student_manager
```

## Final Project

최종 프로젝트의 자세한 요구사항은
`week08_final_project/README.md`와 `docs/final_project_specification.md`를 확인하세요.
