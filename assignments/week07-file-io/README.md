# Week 07 — File I/O

## Learning Objectives

- Open and close files with `fopen()`/`fclose()`, and handle a failed open.
- Read a text file safely, one line at a time, with `fgets()` and `sscanf()`.
- Save the contents of a list to a file with `fprintf()`.
- Print error messages to `stderr`.
- Rebuild an intrusive list from the data in a file.

## Assignment

Complete `starter/assignment_07.c` so that it reads a list of students from a file, prints it, and saves it to a file again.

1. Copy in `list_init()`, `list_add_tail()`, `list_del()`, and `student_create()` from your Weeks 05–06 work.
2. `student_load()`: read each line of the file, create a student, and add it to the list.
3. `student_save()`: save every student in the list, in the same format.
4. Complete `student_print_all()` and `student_free_all()`.

## File Format

```text
# id name score
1 Alice 95
2 Bob 72
```

- One student per line. The fields are separated by spaces.
- A name has no spaces and is at most 19 characters long.
- Empty lines and lines that start with `#` are skipped.

## Requirements

- If `fopen()` fails, print the reason with `perror()` and exit with `EXIT_FAILURE`.
- Call `fclose()` exactly once for every successful `fopen()`.
- Read a line with `fgets()`, then parse it with `sscanf()`.
- Read the name with a length limit, like `%19s`.
- If a line has the wrong format, or a score outside 0–100, print `filename:line: invalid line` to `stderr` and skip the line. The program keeps running.
- When you load a file you saved, you must get the same list again.
- Free every student with `free()` before the program ends.

The given `students.txt` has 2 bad lines on purpose. Your program should read 3 students from it.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_07.c -o week07
./week07 students.txt students_out.txt
```

Load the saved file again, and check that you get the same result:

```bash
./week07 students_out.txt check.txt
diff students_out.txt check.txt
```

## Checklist

- [ ] For a file that does not exist, the program prints a `perror()` message and exits with a failure status.
- [ ] Bad lines are reported to `stderr` with their line number, and skipped.
- [ ] The program reads 3 students from `students.txt`.
- [ ] Save → load again → save: the two saved files are the same (`diff` prints nothing).
- [ ] Every `fopen()` has a matching `fclose()`.
- [ ] Every student is freed with `free()`.
- [ ] There are no compiler warnings.

## Makefile

```bash
cd starter
make
./week07
make clean
```
