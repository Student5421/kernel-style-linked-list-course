# Week 08 Starter

This directory has the starter code for the final project.

## Files

- `main.c` — the menu and the program flow
- `list.h` — `list_head`, `container_of()`, and the list API
- `list.c` — the basic list operations
- `student.h` — the student structure and the student API
- `student.c` — the student operations
- `Makefile` — for building easily

Write the code for every `TODO` yourself.

## Build

```bash
make
./student_manager
```

Or:

```bash
gcc -Wall -Wextra -std=c11 main.c list.c student.c -o student_manager
./student_manager
```

## Important

The function structure in this starter code is one suggested design. What matters is that your program meets these requirements:

- Circular doubly linked list
- Intrusive list
- Sentinel head
- `container_of()`
- Dynamic memory management
- Student features: add, search, print, delete
