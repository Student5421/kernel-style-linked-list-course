# Week 08 — Final Project: Student Management System

## 1. Project Goal

앞의 7주 동안 학습한 `struct`, pointer, dynamic memory, Linked List, Circular List, Intrusive List, `offsetof()`, `container_of()`를 하나의 프로그램으로 통합합니다.

최종 결과물은 **Kernel-style Linked List**를 사용하는 **Student Management System**입니다.

---

## 2. Required Data Structures

다음 구조를 기본으로 사용합니다.

```c
struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};
```

### 반드시 지켜야 할 구조적 조건

1. **Intrusive Linked List**를 사용합니다.
2. **Circular Doubly Linked List**를 사용합니다.
3. `head`는 sentinel node 역할을 하는 `struct list_head`입니다.
4. 별도의 `struct node`를 만들지 않습니다.
5. Student 배열을 사용하여 전체 학생을 저장하지 않습니다.
6. 각 Student는 `malloc()`으로 동적으로 생성합니다.
7. `list_head *`에서 `student *`를 얻을 때 `container_of()`를 사용합니다.

빈 리스트에서는 다음 invariant가 항상 성립해야 합니다.

```c
head->next == head;
head->prev == head;
```

---

## 3. User Interface

프로그램은 다음과 같은 메뉴를 제공합니다.

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

---

## 4. Required Features

### 4.1 Add Student

- ID, Name, Score를 입력받습니다.
- `student_create()`로 Student를 생성합니다.
- List에 Student를 삽입합니다.
- 이미 같은 ID가 존재하면 추가하지 않습니다.

권장 오류 메시지:

```text
Error: Student ID already exists.
```

### 4.2 Delete Student

ID를 입력받아 Student를 찾은 뒤 List에서 제거하고 메모리를 해제합니다.

권장 순서:

```text
student_find()
    ↓
list_del()
    ↓
free()
```

없는 ID를 입력하면 다음과 같이 처리합니다.

```text
Error: Student not found.
```

### 4.3 Search Student

ID로 Student를 검색하고 정보를 출력합니다.

검색 대상이 없으면:

```text
Error: Student not found.
```

### 4.4 Print Students — Forward

`head->next`에서 시작하여 `head`로 돌아올 때까지 순회합니다.

```c
for (pos = head->next; pos != head; pos = pos->next) {
    struct student *student =
        container_of(pos, struct student, list);
    /* print */
}
```

빈 리스트라면:

```text
No students found.
```

### 4.5 Print Students — Backward

`head->prev`에서 시작하여 `head`로 돌아올 때까지 역순회합니다.

### 4.6 Student Count

현재 List에 들어 있는 Student의 개수를 출력합니다.

예:

```text
Student count: 3
```

### 4.7 Exit

종료 전에 모든 Student를 순회하면서 List에서 제거하고 `free()`해야 합니다.

프로그램 종료 직전에는 다시 다음 상태가 되어야 합니다.

```c
head->next == head;
head->prev == head;
```

---

## 5. Required Functions

### `list.c`

```c
void list_init(struct list_head *head);
void list_add(struct list_head *new,
              struct list_head *head);
void list_del(struct list_head *entry);
```

### `student.c`

```c
struct student *student_create(int id, const char *name, int score);
struct student *student_find(struct list_head *head, int id);
int student_delete(struct list_head *head, int id);
void student_print(const struct student *student);
void student_print_all(struct list_head *head);
void student_print_reverse(struct list_head *head);
int student_count(struct list_head *head);
void student_free_all(struct list_head *head);
```

---

## 6. Function Responsibilities

### `list_del()`

List의 연결 관계만 수정합니다.

```text
prev <-> entry <-> next
```

`list_del()`에서 Student를 `free()`하지 않습니다.

### `student_delete()`

```text
find → list_del → free
```

### `student_free_all()`

전체 Student를 안전하게 순회하면서 제거하고 `free()`합니다.

---

## 7. Input Constraints

다음 범위를 권장합니다.

- ID: 양의 정수
- Name: 최대 19문자
- Score: `0` 이상 `100` 이하
- Student ID는 unique해야 합니다.

입력 오류가 발생했을 때 프로그램이 비정상 종료되지 않도록 처리하세요.

---

## 8. Restrictions

다음 구현은 허용하지 않습니다.

1. Student 전체를 배열에 저장
2. 별도의 `struct node` 사용
3. `student *`와 `list_head *`를 연결하기 위한 mapping table 사용
4. 외부 Linked List library 사용
5. 전역 Student 저장소 사용
6. `container_of()`를 사용하지 않고 직접 mapping하는 방식

---

## 9. Starter Files

`starter/`에는 다음 파일이 제공됩니다.

```text
starter/
├── main.c
├── list.h
├── list.c
├── student.h
├── student.c
├── Makefile
└── README.md
```

TODO 부분을 직접 구현하세요.

---

## 10. Build and Run

### GCC

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

### Makefile

```bash
make
./student_manager
make clean
```

가능하면 다음과 같이 warning을 error로 취급하는 것도 권장합니다.

```bash
gcc -Wall -Wextra -Werror -std=c11 main.c list.c student.c -o student_manager
```

### Valgrind

환경에서 Valgrind를 사용할 수 있다면:

```bash
valgrind --leak-check=full ./student_manager
```

---

## 11. README Requirement

최종 제출물의 README에는 최소한 다음 내용을 포함하세요.

1. 프로그램 실행 방법
2. 구현한 기능
3. 사용한 자료구조
4. Circular Doubly Linked List를 사용한 이유
5. Intrusive Linked List의 의미
6. `container_of()`의 동작 원리
7. 구현 중 발생한 문제와 해결 방법

---

## 12. Final Checklist

- [ ] Student를 `malloc()`으로 생성한다.
- [ ] Student를 `free()`한다.
- [ ] 별도의 `struct node`가 없다.
- [ ] `struct student` 안에 `struct list_head list`가 있다.
- [ ] Circular Doubly Linked List를 사용한다.
- [ ] `head->next == head`, `head->prev == head` invariant를 유지한다.
- [ ] Add가 동작한다.
- [ ] Delete가 동작한다.
- [ ] Search가 동작한다.
- [ ] Forward Print가 동작한다.
- [ ] Backward Print가 동작한다.
- [ ] Student Count가 동작한다.
- [ ] 중복 ID를 처리한다.
- [ ] 존재하지 않는 ID를 처리한다.
- [ ] `container_of()`를 사용한다.
- [ ] Memory leak이 없다.
- [ ] `gcc -Wall -Wextra -std=c11`에서 warning이 없다.
- [ ] 제출 README를 작성했다.
