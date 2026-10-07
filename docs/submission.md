# Submission Guide

## 제출 구조

최종 프로젝트 제출물은 다음과 같은 구조를 권장합니다.

```text
<student_id>_<name>/
├── main.c
├── list.h
├── list.c
├── student.h
├── student.c
├── Makefile
└── README.md
```

## 필수 조건

- 모든 필수 소스 파일이 포함되어 있어야 합니다.
- `gcc -Wall -Wextra -std=c11`로 컴파일되어야 합니다.
- 실행 파일은 제출하지 않습니다.
- 외부 Linked List library를 사용하지 않습니다.
- Student 배열을 사용하지 않습니다.
- 별도의 `struct node`를 사용하지 않습니다.
- 각 Student는 `malloc()`으로 생성합니다.
- 적절한 시점에 `free()`하여 memory leak이 없어야 합니다.
- `container_of()`를 사용하여 `list_head *`에서 `student *`를 얻습니다.

## README에 포함할 내용

1. 프로그램 실행 방법
2. 구현한 기능
3. 사용한 자료구조
4. Circular Doubly Linked List를 사용한 이유
5. Intrusive Linked List란 무엇인지
6. `container_of()`가 어떻게 동작하는지
7. 구현하면서 발생한 문제와 해결 방법

## 제출 전 검사

```bash
gcc -Wall -Wextra -Werror -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

가능하다면 memory leak도 확인하세요.

```bash
valgrind --leak-check=full ./student_manager
```
