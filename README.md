# C Programming — Kernel-style Linked List

8주 동안 C의 핵심 개념을 단계적으로 학습하고, 마지막에는 **Kernel-style Linked List**를 이용한 **Student Management System**을 구현합니다.

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
Student Management System
```

## Weekly Assignments

| Week | Topic | Main Concepts |
|---|---|---|
| 1 | Struct | `struct`, pointer |
| 2 | Dynamic Memory | `malloc()`, `free()`, heap |
| 3 | Singly Linked List | `next`, traversal |
| 4 | Doubly Linked List | `prev`, `next` |
| 5 | Circular Doubly Linked List | sentinel, circular invariant |
| 6 | Intrusive Linked List | embedded `list_head` |
| 7 | `container_of()` | `offsetof()`, pointer arithmetic |
| 8 | Final Project | Student Management System |

각 주차의 `README.md`를 먼저 읽고 `starter/`에서 과제를 시작하세요.

## Start Here

- [Week 01 — Struct](assignments/week01-struct/)
- [Week 02 — Dynamic Memory](assignments/week02-dynamic-memory/)
- [Week 03 — Singly Linked List](assignments/week03-singly-linked-list/)
- [Week 04 — Doubly Linked List](assignments/week04-doubly-linked-list/)
- [Week 05 — Circular Doubly Linked List](assignments/week05-circular-list/)
- [Week 06 — Intrusive Linked List](assignments/week06-intrusive-list/)
- [Week 07 — `container_of()`](assignments/week07-container-of/)
- [Week 08 — Final Project](assignments/week08-final-project/)

## General Rules

1. C11 기준으로 작성합니다.
2. `gcc -Wall -Wextra -std=c11` 컴파일 경고를 확인합니다.
3. `malloc()`으로 할당한 메모리는 반드시 적절한 시점에 `free()`합니다.
4. 최종 프로젝트에서는 Student 배열을 사용하지 않습니다.
5. 최종 프로젝트에서는 별도의 `struct node`를 사용하지 않습니다.
6. 최종 프로젝트는 **Circular Doubly Linked List + Intrusive List** 구조를 사용합니다.
7. 최종 프로젝트에서는 `container_of()`를 사용합니다.
8. 제출 전 반드시 컴파일과 기본 동작을 확인합니다.

## Final Project

최종 프로젝트는 `assignments/week08-final-project/README.md`에 모든 요구사항이 정리되어 있습니다.

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

가능하다면 `-Werror`와 Valgrind도 사용하세요.
