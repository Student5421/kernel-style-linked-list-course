# Week 07 — `container_of()`

## Learning Objectives

- `offsetof()`가 구조체 member의 offset을 계산하는 원리를 이해한다.
- `list_head *`만 가지고 원래 `struct student *`를 얻는 방법을 이해한다.
- `container_of()`의 pointer arithmetic을 설명할 수 있다.

## Assignment

`starter/main.c`에 있는 다음 macro를 이해하고 사용하세요.

```c
#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))
```

`student.list`의 주소만 가지고 원래 `student` 객체의 주소를 복원한 뒤 ID와 Score를 출력하세요.

## Key Idea

```text
student
+----------------+
| id             |
| name           |
| score          |
| list  <--------+---- list pointer
+----------------+
       ^
       |
  offsetof(student, list)
```

`container_of()`는 `list`의 주소에서 member의 offset을 빼서 container인 `student`의 시작 주소를 계산합니다.

## Build

```bash
gcc -Wall -Wextra -std=c11 main.c -o week07
./week07
```

## Checklist

- [ ] `offsetof()`의 의미를 설명할 수 있다.
- [ ] `container_of()`를 직접 사용했다.
- [ ] `list_head *`에서 `student *`를 얻었다.
- [ ] 별도의 mapping table을 사용하지 않았다.

## Makefile

```bash
cd starter
make
./week07
make clean
```
