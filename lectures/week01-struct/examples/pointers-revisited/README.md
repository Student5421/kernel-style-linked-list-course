# Pointers Revisited: supplementary live demos

These examples extend `../pointer_basics.c` and `../struct_pointer.c` using
[Pointers Revisited](../../%5BSlide%5D%2001.%20Pointers%20Revisited.pdf)
(51 PDF pages). Page numbers below refer
to PDF page order, which agrees with the printed slide numbers. Each file is
a standalone C11 program; the source is teaching material rather than a
line-for-line transcription of the slides.

From the repository root:

```bash
make -C lectures/week01-struct/examples/pointers-revisited
make -C lectures/week01-struct/examples/pointers-revisited run
./lectures/week01-struct/examples/pointers-revisited/matrix_arguments
make -C lectures/week01-struct/examples/pointers-revisited clean
```

## Suggested teaching order

| Order | Example | PDF pages | What to observe | Predict or change |
|---|---|---|---|---|
| 1 | [`pass_by_value.c`](pass_by_value.c) | 10-12, 25-26 | Swapping copies leaves `1978 2010`; swapping through pointers produces `2010 1978`. An `int **` reseats the caller's pointer. | Predict the selected year after each selection function. Why does the first selection not persist? |
| 2 | [`array_arithmetic.c`](array_arithmetic.c) | 13-16, 27 | Four elements, an element distance of 4, and a one-past loop. `sizeof` sees an array in `main` and a pointer inside the function. | Add a fifth year. Which counts update automatically, and why must the function still receive a count? |
| 3 | [`void_pointer.c`](void_pointer.c) | 17-19 | A year, a character, a string, and an address of a string-pointer object require their actual types. `title` and `&title` need different indirection. | Explain the pointer levels before changing the two title calls. Do not pair an object with a mismatched kind. |
| 4 | [`pointer_declarations.c`](pointer_declarations.c) | 20-23, 49 | `int *rows[2]` stores pointers; `int (*row)[3]` advances by one three-integer row. String pointers point to read-only literals. | Explain why changing a pointer-table entry does not move an array's elements. |
| 5 | [`matrix_arguments.c`](matrix_arguments.c) | 28-39 | Four correctly typed interfaces print the same `1 2 3 / 4 5 6` values; a pointer table can reverse the view. Element addresses use pointer expressions, as in Exercise 3 (p. 31). | Change the matrix values and its separate flat copy. Why is a cast to `int **` unnecessary and wrong? |
| 6 | [`function_callbacks.c`](function_callbacks.c) | 41-45 | Both function-call spellings work; a table dispatches add/subtract. `qsort` calls a comparator to sort book records by year or title. | Add a comparator that sorts years in descending order. Preserve a valid comparison result even for extreme integer values. |
| 7 | [`complex_declarations.c`](complex_declarations.c) | 47-50 | An array of function pointers and a function returning a function pointer really run. A `typedef` expresses the same type. | Read `int *(*getters[2])(void)` from `getters`, then explain why the returned address remains valid. |

Address values and type sizes depend on the execution environment. Each `+1`
step uses `sizeof` of the pointed-to type; no demo assumes four-byte `int`
or eight-byte pointers. Start with the existing basic demos for PDF pp. 3-9.
The matrix and callback examples can be used as later review after Weeks 02
and 03, rather than adding all of them to the first lecture.

## C11 details to discuss alongside the slides

- C passes every argument by value, including a pointer value (pp. 10-12).
  Pass the address of an object to change it; pass a pointer object's address
  to change that pointer. There is no C++ reference parameter in these files.
- `sizeof` produces `size_t`, an unsigned integer type that is not necessarily
  `unsigned int` (p. 13). Print it with `%zu`. Print a `ptrdiff_t` pointer
  difference with `%td`. Differences count elements within one array.
- `void *` holds object-pointer values, without runtime type information.
  Recover the actual type before dereferencing. Arithmetic on `void *` is
  outside C11, and equal `sizeof` values cannot identify a type (pp. 17-19).
  Here an explicit enum controls scalar printing; `qsort` supplies another
  common generic API, where the callback knows the element type.
- An array expression usually converts to a pointer to its first element;
  the array remains an array in `sizeof` and unary `&` contexts. A matrix
  converts to a pointer to its first row, **not** `int **` (pp. 28-39).
  The `int **` demo receives a real array of `int *` objects. The flat demo
  receives a separate one-dimensional array, keeping indexing inside that
  array. Do not walk an `int *` beyond one row and dereference it in another.
- A one-past pointer is a loop boundary, never an element to dereference.
  No example subtracts or orders pointers into unrelated arrays.
- String literals are represented by `const char *` in the examples because
  modifying a string literal is undefined (p. 21). `%p` is used with object
  pointers cast to `void *`, never with function pointers (pp. 26, 41-43).
- Use `(void)` for a function with no parameters in C11 (pp. 47-50).
  A function returning an object pointer must return an address that outlives
  the call; the complex-declaration demo uses a static object.

For a stricter build, force recompilation when changing flags:

```bash
make -B -C lectures/week01-struct/examples/pointers-revisited \
  CFLAGS='-Wall -Wextra -Wpedantic -Werror -std=c11'
```
