# Week 02 — Operators and Precedence

## Learning Objectives

- Understand operator precedence and associativity.
- Read expressions that mix `*`, `&`, `.`, `->`, and `++` correctly.
- Check for a `NULL` pointer safely with the short-circuit of `&&`.
- Set, clear, and test flags with bitwise operators.
- Use compiler warnings to find precedence bugs.

## Assignment

Complete the TODOs in `starter/assignment_02.c`.

1. `is_valid_score()`: check that the score is between 0 and 100 (inclusive).
2. `is_passing()`: write the `NULL` check and the "60 or more" check as one `&&` expression.
3. Using only `struct student **pp`, add 5 to the score.
4. Set (`|=`), clear (`&= ~`), and test (`&`) flags, then print them with `print_flags()`.
5. Fix the 5 bugs in `fix_me()`, and add a comment to each one that explains what was wrong.

## Requirements

- The starter produces 3 compiler warnings **on purpose**. Your submission must have 0 warnings.
- `fix_me()` also has 2 bugs that produce no warning. Run the program and read the output to find them.
- Do not chain comparisons like `0 <= score <= 100`.
- If you are not sure about precedence, add parentheses.

## Build

```bash
cd starter
gcc -Wall -Wextra -std=c11 assignment_02.c -o week02
./week02
```

## Checklist

- [ ] `is_valid_score()` returns the right value for -1, 0, 100, and 101.
- [ ] `is_passing(NULL)` returns 0 without crashing.
- [ ] I changed the value with `(*pp)->score`.
- [ ] I used `|=`, `&= ~`, and `&` for the flags.
- [ ] I fixed the 5 bugs in `fix_me()` and wrote down why each one was wrong.
- [ ] There are no compiler warnings.

## Makefile

```bash
cd starter
make
./week02
make clean
```
