# Lecture examples: pointers, structures, unions, and enums

Start with the three core demos, then use the two supplements alongside the
reference PDFs. Each `.c` file is a separate executable with its own `main()`.
The examples use C11, English comments, and the course's book/catalog domain.

## Build and run

From the repository root:

```bash
make -C lectures/week01-struct/examples
make -C lectures/week01-struct/examples run
make -C lectures/week01-struct/examples clean
```

To focus on one topic, build its directory and run one executable:

```bash
make -C lectures/week01-struct/examples/pointers-revisited
./lectures/week01-struct/examples/pointers-revisited/matrix_arguments

make -C lectures/week01-struct/examples/structures-unions-enums
./lectures/week01-struct/examples/structures-unions-enums/tagged_union
```

`make supplements` in this directory builds both supplements. All runnable demos
use fixed input so they can be shown in class without keyboard input. Addresses,
type sizes, and padding can differ between machines; compare relationships rather
than memorizing numeric addresses or byte counts. `warnings.c` remains a separate
compiler-warning demonstration and is excluded from `make` and `make run`.

## Teaching sequence

| Stage | Examples | Use in class |
|---|---|---|
| Core | [`struct_basics.c`](struct_basics.c), [`pointer_basics.c`](pointer_basics.c), [`struct_pointer.c`](struct_pointer.c) | Define a book, copy its members, follow an address, and change the caller's book through a pointer. |
| Pointer supplement | [`pointers-revisited/`](pointers-revisited/) | Passing pointers, array bounds and sizes, `void *`, array declarations, 2D arguments, callbacks, and complex declarations. |
| Structure supplement | [`structures-unions-enums/`](structures-unions-enums/) | Returning structures, `typedef` aliases, nesting and arrays, ownership when copying pointer members, unions, enums, and tagged variants. |

The supplements extend the material in
[Pointers Revisited](../%5BSlide%5D%2001.%20Pointers%20Revisited.pdf) and
[Structures, Unions and Enums](../%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf).
Their directory READMEs map
examples to PDF page numbers, identify C11 clarifications, and provide short
prediction and modification exercises. Lecture copies of both PDFs are beside
the Week 01 deck, and the originals remain in the sibling `C Programming Part 2/`
course folder. The examples compile and run independently of the PDFs.

These are a reference bank across the course, rather than extra requirements for
the first session. Use the following points in the existing schedule:

| When | Suggested supplement topics |
|---|---|
| Week 01, after the core demos | Passing by value/address, structure return values, nested members, `typedef` syntax. |
| Week 02, after pointer expressions | Pointer/array declarations, `sizeof`, array arithmetic, 2D argument types, and reading complex declarations. |
| Week 03, before linked-list insertion | Changing a pointer through `**`, allocation failure handling, and shallow versus deep copies. |
| Week 06, after layout and byte arithmetic | Union storage/alignment, `void *`, function callbacks, and enum-tagged variants. |

For each demo, ask students to predict the output, run it, then make one change
from the local README. Keep assignment work in `assignments/`; the supplements
demonstrate mechanisms with books so students still design their own student code.
The [full reference reading map](../../README.md#reference-pdf-placement) also
places Strings, Dynamic Memory, Low Level Operations, File IO, and Writing Large
Programs alongside the appropriate weekly decks. The existing code directories
remain stable; each week's notes link the examples used there.

## Optional diagnostic build

Compiler options are not file prerequisites, so force a rebuild when changing
them (the Week 03 Makefile topic):

```bash
make -B -C lectures/week01-struct/examples \
  CFLAGS='-std=c11 -Wall -Wextra -Wpedantic -Werror'

make -B -C lectures/week01-struct/examples \
  CFLAGS='-std=c11 -Wall -Wextra -Wpedantic -Werror -g -fsanitize=address,undefined -fno-omit-frame-pointer'
make -C lectures/week01-struct/examples run
make -C lectures/week01-struct/examples clean
```

The second build needs a compiler with AddressSanitizer and UndefinedBehaviorSanitizer.
