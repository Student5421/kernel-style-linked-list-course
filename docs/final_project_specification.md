# Final Project Specification

## Student Management System

최종 프로젝트에서는 학생 정보를 관리하는 프로그램을 구현합니다.

프로그램은 다음 메뉴를 제공합니다.

```text
===== Student Management System =====

1. Add Student
2. Delete Student
3. Search Student
4. Print Students (Forward)
5. Print Students (Backward)
6. Student Count
7. Exit

Select:
```

## Student

```c
struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};
```

## List

```c
struct list_head {
    struct list_head *next;
    struct list_head *prev;
};
```

## 필수 함수

### list.c

```c
void list_init(struct list_head *head);

void list_add(struct list_head *new,
              struct list_head *head);

void list_del(struct list_head *entry);
```

### student.c

```c
struct student *student_create(
    int id,
    const char *name,
    int score
);

struct student *student_find(
    struct list_head *head,
    int id
);

int student_delete(
    struct list_head *head,
    int id
);

void student_print(
    const struct student *student
);

void student_print_all(
    struct list_head *head
);

void student_print_reverse(
    struct list_head *head
);

int student_count(
    struct list_head *head
);

void student_free_all(
    struct list_head *head
);
```

### main.c

```c
int main(void);
```

## 구현 책임

`list_del()`은 Linked List의 연결 관계만 수정합니다.

```text
list_del()
    ↓
List relationship 수정
```

Student의 메모리 해제는 별도로 수행합니다.

```text
free()
    ↓
Student memory release
```

따라서 `student_delete()`는 다음 흐름을 가집니다.

```text
student_find()
      ↓
   student *
      ↓
list_del(&student->list)
      ↓
     free()
```

## 필수 제약

1. `struct student students[100]`와 같은 Student 배열을 사용하지 않습니다.
2. 다음과 같은 별도 Node 구조체를 사용하지 않습니다.

```c
struct node {
    struct student data;
    struct node *next;
    struct node *prev;
};
```

3. 각 Student는 `malloc()`으로 생성합니다.
4. `struct student` 안에 `struct list_head list`를 포함합니다.
5. Circular Doubly Linked List를 사용합니다.
6. `head`는 sentinel node로 사용합니다.
7. `next`와 `prev`의 연결 관계를 항상 유지합니다.
8. `list_head *`와 `student *`를 연결하기 위한 별도 mapping table을 만들지 않습니다.
9. 외부 Linked List library를 사용하지 않습니다.
10. 전역 Student 저장소를 만들지 않습니다.
11. `container_of()`를 이용하여 `list_head *`에서 `student *`를 얻습니다.

## `container_of()`

다음 형태를 사용할 수 있습니다.

```c
#include <stddef.h>

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))
```

Student가 다음과 같이 있을 때:

```text
+-----------------------------+
| id                          |
+-----------------------------+
| name                        |
+-----------------------------+
| score                       |
+-----------------------------+
| list.next                   |
+-----------------------------+
| list.prev                   |
+-----------------------------+
        ^
        |
      list
```

`&student->list`에서 Student의 시작 주소까지 offset만큼 뒤로 이동하면
원래 `struct student *`를 얻을 수 있습니다.

## 예외 처리

- 중복 ID:
  `Error: Student ID already exists.`
- 존재하지 않는 Student:
  `Error: Student not found.`
- 빈 리스트:
  `No students found.`
- 빈 리스트에서 삭제:
  `Error: No students available.`
- `malloc()` 실패:
  `Error: Memory allocation failed.`
- Score: `0 <= score <= 100`
- ID: 양의 정수
- Name: 최대 19문자

## 종료

프로그램 종료 전에 모든 Student를 해제해야 합니다.

```text
student_free_all()
    ↓
list_del()
    ↓
free()
    ↓
empty circular list
```
