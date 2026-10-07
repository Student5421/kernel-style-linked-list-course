# Week 01 — Struct

## Learning Objectives

- `struct`로 관련 데이터를 하나의 객체로 묶을 수 있다.
- `struct` 변수와 pointer의 관계를 이해한다.
- `.`와 `->`의 차이를 이해한다.

## Assignment

`starter/main.c`의 `struct student`를 사용하여 Student 한 명의 정보를 저장하고 출력하세요.

다음 항목을 포함해야 합니다.

- ID
- Name
- Score
- Student를 가리키는 pointer를 이용한 값 수정

## Requirements

- `struct student`를 사용합니다.
- Student 배열은 사용하지 않습니다.
- `.`와 `->`를 각각 적절한 상황에서 사용해 봅니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week01
./week01
```

## Checklist

- [ ] Student 정보를 저장했다.
- [ ] Student 정보를 출력했다.
- [ ] pointer를 이용해 값을 수정했다.
- [ ] compiler warning이 없다.

## Makefile

```bash
cd starter
make
./week01
make clean
```
