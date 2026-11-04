# Week 08 — Final Project: Student Management System

## 1. Project Goal

Combine everything from the earlier weeks — `struct`, pointers, dynamic memory, linked lists, circular lists, intrusive lists, `offsetof()`, and `container_of()` — into one program.

The final result is a **Student Management System** that uses an **intrusive circular doubly linked list**.

---

## 2. Required Data Structures

Use these structures as the base:

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

### Structural rules you must follow

1. Use an **intrusive linked list**.
2. Use a **circular doubly linked list**.
3. `head` is a `struct list_head` that works as the sentinel node.
4. Do not create a separate `struct node`.
5. Do not store the students in an array.
6. Create each student at run time with `malloc()`.
7. Use `container_of()` to get a `student *` from a `list_head *`.

In an empty list, this invariant must always hold:

```c
head->next == head;
head->prev == head;
```

---

## 3. User Interface

The program shows this menu:

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

- Read an ID, a name, and a score.
- Create the student with `student_create()`.
- Insert the student into the list.
- If a student with the same ID already exists, do not add it.

Suggested error message:

```text
Error: Student ID already exists.
```

### 4.2 Delete Student

Read an ID, find the student, remove it from the list, and free its memory.

Suggested order:

```text
student_find()
    ↓
list_del()
    ↓
free()
```

If the ID does not exist, print:

```text
Error: Student not found.
```

### 4.3 Search Student

Find a student by ID and print its information.

If there is no such student:

```text
Error: Student not found.
```

### 4.4 Print Students — Forward

Start at `head->next` and continue until you are back at `head`.

```c
for (pos = head->next; pos != head; pos = pos->next) {
    struct student *student =
        container_of(pos, struct student, list);
    /* print */
}
```

If the list is empty:

```text
No students found.
```

### 4.5 Print Students — Backward

Start at `head->prev` and go backward until you are back at `head`.

### 4.6 Student Count

Print how many students are in the list now.

Example:

```text
Student count: 3
```

### 4.7 Exit

Before the program ends, go through every student, remove it from the list, and `free()` it.

Just before the program ends, the list must be back in this state:

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

It only changes the links of the list:

```text
prev <-> entry <-> next
```

`list_del()` does **not** `free()` the student.

### `student_delete()`

```text
find → list_del → free
```

### `student_free_all()`

Go through all students safely, remove each one, and `free()` it.

---

## 7. Input Constraints

We suggest these ranges:

- ID: a positive integer
- Name: at most 19 characters
- Score: from `0` to `100`
- Every student ID must be unique.

Handle input errors so that the program never crashes.

---

## 8. Restrictions

These are not allowed:

1. Storing all students in an array
2. Using a separate `struct node`
3. Using a mapping table to connect a `student *` and a `list_head *`
4. Using an external linked list library
5. Using global storage for the students
6. Mapping from `list_head *` to `student *` by hand instead of with `container_of()`

---

## 9. Starter Files

`starter/` contains these files:

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

Write the code for every TODO yourself.

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

---

## 11. README Requirement

The README you submit must include at least:

1. How to run the program
2. The features you implemented
3. The data structures you used
4. Why you used a circular doubly linked list
5. What an intrusive linked list is
6. How `container_of()` works
7. The problems you met while implementing, and how you solved them

---

## 12. Final Checklist

- [ ] Each student is created with `malloc()`.
- [ ] Each student is freed with `free()`.
- [ ] There is no separate `struct node`.
- [ ] `struct student` contains `struct list_head list`.
- [ ] The program uses a circular doubly linked list.
- [ ] The invariant `head->next == head`, `head->prev == head` is kept.
- [ ] Add works.
- [ ] Delete works.
- [ ] Search works.
- [ ] Forward Print works.
- [ ] Backward Print works.
- [ ] Student Count works.
- [ ] Duplicate IDs are handled.
- [ ] IDs that do not exist are handled.
- [ ] `container_of()` is used.
- [ ] There are no memory leaks.
- [ ] There are no warnings with `gcc -Wall -Wextra -std=c11`.
- [ ] I wrote the README for my submission.
