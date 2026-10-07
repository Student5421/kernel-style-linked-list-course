# Week 08 Starter

이 디렉터리는 Final Project의 starter code입니다.

## Files

- `main.c` — 메뉴와 프로그램 흐름
- `list.h` — `list_head`, `container_of()`, List API
- `list.c` — List 기본 연산
- `student.h` — Student 구조체와 Student API
- `student.c` — Student 연산
- `Makefile` — 빌드 편의 기능

모든 `TODO`를 직접 구현하세요.

## Build

```bash
make
./student_manager
```

또는:

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

## Important

이 starter code의 함수 구조는 하나의 권장 설계입니다. 핵심은 다음 요구사항을 만족하는 것입니다.

- Circular Doubly Linked List
- Intrusive List
- sentinel head
- `container_of()`
- dynamic memory management
- Student CRUD 기능
