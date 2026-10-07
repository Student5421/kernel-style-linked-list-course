# Week 02 — Dynamic Memory

## Learning Objectives

- Stack과 heap의 차이를 이해한다.
- `malloc()`으로 동적으로 Student를 생성한다.
- `free()`로 동적 메모리를 해제한다.

## Assignment

`starter/main.c`에서 `malloc()`을 사용하여 Student 한 명을 동적으로 생성하고 정보를 저장한 뒤 출력하세요.

## Requirements

1. `malloc(sizeof(struct student))`와 같은 방식으로 메모리를 할당합니다.
2. `malloc()` 실패를 검사합니다.
3. Student 정보를 저장하고 출력합니다.
4. 프로그램 종료 전에 반드시 `free()`합니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week02
./week02
```

## Checklist

- [ ] `malloc()`을 사용했다.
- [ ] allocation failure를 처리했다.
- [ ] Student pointer를 사용했다.
- [ ] `free()`를 호출했다.

## Makefile

```bash
cd starter
make
./week02
make clean
```
