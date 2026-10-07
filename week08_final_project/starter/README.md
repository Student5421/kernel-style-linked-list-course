# Final Project Starter

## Build

```bash
make
```

또는

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
```

## Run

```bash
./student_manager
```

## 구현 순서 권장

1. `list_init()`
2. `list_add()`
3. `list_del()`
4. `student_create()`
5. `student_find()`
6. `student_print()`
7. `student_print_all()`
8. `student_print_reverse()`
9. `student_count()`
10. `student_delete()`
11. `student_free_all()`
12. `main()` 메뉴 연결

## 중요한 책임 분리

```text
list.c
    → Linked List 연결 관계 관리

student.c
    → Student 생성/검색/삭제/출력/Memory 관리

main.c
    → 사용자 입력과 프로그램 흐름
```

`list_del()`은 Student를 `free()`하지 않습니다.
`student_delete()`와 `student_free_all()`에서 Student memory를 해제합니다.
