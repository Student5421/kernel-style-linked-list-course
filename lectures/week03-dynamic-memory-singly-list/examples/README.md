# Week 03 examples: allocation, lifetime, and linked lists

Run from the repository root:

```bash
make -C lectures/week03-dynamic-memory-singly-list/examples
make -C lectures/week03-dynamic-memory-singly-list/examples run
make -C lectures/week03-dynamic-memory-singly-list/examples clean
```

Every executable uses fixed input. `dangling_local.c` remains a separate warning
demonstration and is excluded from `make` and `make run`.

## Teaching sequence and reference pages

Page numbers are one-based PDF pages. The original PDFs are kept once in their
primary weekly directory:
[Dynamic Memory Allocation](../%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf),
[Pointers Revisited](../../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf),
[Structures, Unions and Enums](../../week01-struct/%5BSlide%5D%2005.%20Structures,%20Unions%20and%20Enums.pdf),
and [Strings](../../week02-operators/%5BSlide%5D%2003.%20Strings.pdf).

| Order | Demo | PDF pages and purpose |
|---|---|---|
| 1 | [memory_map.c](memory_map.c) | Dynamic Memory pp. 4-5: separate the pointer object's storage from the allocation it refers to. Addresses illustrate a particular run. |
| 2 | [malloc_basics.c](malloc_basics.c) | Dynamic Memory pp. 6-8, 20-24: allocate, check, initialize, and release integers, structures, and a zeroed array. |
| 3 | [realloc_catalog.c](realloc_catalog.c) | Dynamic Memory pp. 23-27: grow and shrink an owned year array; initialize new elements; retain ownership after failure; reject byte-size overflow. |
| 4 | [dynamic_matrix.c](dynamic_matrix.c) | Dynamic Memory pp. 28-29 and Pointers pp. 28-39: separately allocated rows versus one actual flat allocation, including cleanup after a partial allocation failure. |
| 5 | [owned_title.c](owned_title.c) | Structures p. 23; Strings pp. 49-60, 68-72, 74-81: size strings including their terminator, replace only after successful allocation, and consume borrowed substrings before freeing old storage. |
| 6 | [book_factory.c](book_factory.c) | Dynamic Memory pp. 24-27: state the owner through a create/destroy pair and verify the live-book count reaches zero. |
| 7 | [sll_manual.c](sll_manual.c), [sll_book.c](sll_book.c) | Course extension using Structures pp. 21-27 and Pointers pp. 25-26: connect objects, traverse with a cursor, insert through a head pointer, and save the next link before freeing. The PDFs supply the C mechanisms; the list algorithms are taught in the weekly notes. |

The existing [matrix argument demo](../../week01-struct/examples/pointers-revisited/matrix_arguments.c)
establishes why a true 2D array is not an `int **`. The existing
[deep-copy demo](../../week01-struct/examples/structures-unions-enums/dynamic_struct_copy.c)
already compares shallow assignment with cloning; `owned_title.c` adds safe
replacement and capacity rather than repeating that clone.

## Observe the new demos

```text
$ ./realloc_catalog
initial (3): 1978 1988 2010
grown and initialized (5): 1978 1988 2010 0 0
after simulated allocation failure (5): 1978 1988 2010 0 0
overflow rejected before allocation; count=5
shrunk (2): 1978 1988
released: count=0 owner is NULL=1
```

The overflow line appears when an `int` occupies more than one C byte. The
overflow request is rejected before any allocator call. The failure wrapper
returns `NULL` deliberately for one request, so the failure branch can be
demonstrated without exhausting the machine's memory. A real allocator can
also fail; neither failure changes the existing owner. A successful `realloc`
can move the allocation, so do not keep old aliases.

```text
$ ./dynamic_matrix
row allocation stopped at 1; releasing 1 completed rows
failed create leaves output empty: 1
zero dimension rejected
flat size overflow rejected before allocation
row 0, row table: 2000 2001 2002; flat: 2000 2001 2002
row 1, row table: 2003 2004 2005; flat: 2003 2004 2005
row-table allocations=3; flat allocations=1
destroy resets dimensions: 0 x 0
```

`grid_create` requires an empty destination. It builds a temporary grid, counts
only successfully allocated rows, and transfers ownership after full success.
Destroy an existing grid before reusing its destination. Neither representation
can be converted into the other by casting a pointer.

```text
$ ./owned_title
"C": length=1 capacity=2
"C Programming": length=13 capacity=14
failed replacement preserves the current title
"Programming": length=11 capacity=12
"ProgrammingProgramming": length=22 capacity=23
"": length=0 capacity=1
```

The empty string still owns one byte for `'\0'`. `append_title` requires an
initialized title. Both update functions allocate and copy before releasing the
old owner, so even a source substring inside the old title is consumed safely.
They preserve the old title on allocation failure. Use explicit `free()` for a
zero-length array request rather than relying on `realloc(p, 0)` behavior.

## Predict, then change

1. In `realloc_catalog.c`, predict which elements survive growth and shrinkage.
   Change the simulated failed request from 8 to 12; explain why the count and
   data must remain unchanged.
2. In `dynamic_matrix.c`, change `fail_row` in the first call from 1 to 0.
   Predict the number of completed rows that cleanup releases. Then change the
   successful dimensions to 3 by 2 and compare both printed representations.
3. In `owned_title.c`, predict the capacity after setting an empty title and
   after appending a title to itself. Explain why freeing the old title before
   the copy would invalidate a borrowed source substring.
4. Relate the allocation owner in these demos to `head` and `cur` in
   `sll_book.c`. Which variable merely observes an object, and which function
   promises to release it?

## Optional diagnostic build

Changing flags requires a rebuild:

```bash
make -B -C lectures/week03-dynamic-memory-singly-list/examples \
  CFLAGS='-std=c11 -Wall -Wextra -Wpedantic -Werror -g -fsanitize=address,undefined -fno-omit-frame-pointer'
make -C lectures/week03-dynamic-memory-singly-list/examples run
make -C lectures/week03-dynamic-memory-singly-list/examples clean
```
