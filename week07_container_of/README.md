# Week 07 — `offsetof()`와 `container_of()`

## 목표

- `offsetof()`의 의미를 이해한다.
- pointer arithmetic을 이해한다.
- `list_head *`에서 원래 `struct student *`를 얻는다.

## 기본 형태

```c
#include <stddef.h>

#define container_of(ptr, type, member)     ((type *)((char *)(ptr) - offsetof(type, member)))
```

## 과제

`struct list_head *`를 받아서 원래 Student를 찾는 코드를 구현하세요.

예:

```c
struct list_head *pos = ...;

struct student *student =
    container_of(pos, struct student, list);
```

## 주의

`container_of()`를 단순히 암기하지 말고 다음을 설명할 수 있어야 합니다.

```text
member address
      ↓
offsetof(type, member)만큼 뒤로 이동
      ↓
container object의 시작 주소
```

## Challenge

왜 `(char *)`로 변환한 뒤 pointer arithmetic을 수행하는지 설명해 보세요.
