# Week 08 — Final Project

## Student Management System

최종 프로젝트의 목적은 1~7주차에서 학습한 C의 핵심 개념을 하나의 프로그램으로 통합하는 것입니다.

## Starter

`starter/` 디렉터리에서 작업을 시작하세요.

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

## Required Menu

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

## Required Data Structure

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

## Required Functions

### list.c

```c
void list_init(struct list_head *head);
void list_add(struct list_head *new, struct list_head *head);
void list_del(struct list_head *entry);
```

### student.c

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

자세한 요구사항은 `../../docs/final_project_specification.md`를 확인하세요.
