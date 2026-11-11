# Week 06 live examples

Each source is a standalone C11 program. Use the first four to derive
`container_of()`, then contrast ordinary member offsets with byte ordering
and C bit-fields. Exact addresses, alignment, sizes, and object bytes depend
on the implementation; none are fixed expected outputs.

From the repository root:

```bash
make -C lectures/week06-container-of/examples
make -C lectures/week06-container-of/examples run
make -C lectures/week06-container-of/examples container_of_demo.i
make -C lectures/week06-container-of/examples clean
```

## Teaching order and observations

| Order | Example | Reference PDF pages | Observe and predict |
|---|---|---|---|
| 1 | [layout.c](layout.c) | Existing notes; Low Level Operations 20-21 as a contrast | Ask the compiler for ordinary member offsets and padding. Predict how reordering members affects size, then check rather than assuming. |
| 2 | [pointer_arith.c](pointer_arith.c) | Pointers Revisited 13-19 | Compare element steps with character-pointer byte steps. Why is a cast required before subtracting byte offsets? |
| 3 | [container_of_demo.c](container_of_demo.c) | Writing Large Programs 3-10, 15 | Recover the book from each embedded link and inspect macro expansion with `make container_of_demo.i`. Explain why the type and member name must match. |
| 4 | [list_macros.c](list_macros.c) | Existing notes; Writing Large Programs 8-10, 15 | Compare forward, backward, and safe deletion traversal. Explain why the next link is saved before a node is freed. |
| 5 | [byte_representation.c](byte_representation.c) | Low Level Operations 22-24; Strings 68-70 | Copy an integer's representation into `unsigned char` storage and back. When an exact 32-bit type and eight-bit bytes exist, observe little, big, or other byte order. Overlapping moves produce `Read C books`, then `C books`; both move the null terminator. What happens if the terminator is omitted? Discuss without introducing that bug. |
| 6 | [bitfield_layout.c](bitfield_layout.c) | Low Level Operations 20-21 | Print sizes and offsets of ordinary members beside unsigned bit-fields. Edition 15 fits in four bits, 16 is rejected, and 15 remains stored. Why can `year` have an address while `edition` cannot? |

Reference PDFs are stored once and linked here:
[Pointers Revisited](../../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf),
[Low Level Operations](../../week02-operators/%5BSlide%5D%2006.%20Low%20Level%20Operations.pdf),
[Strings](../../week02-operators/%5BSlide%5D%2003.%20Strings.pdf), and
[Writing Large Programs](../../week08-final-project/%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf).
All page numbers are one-based PDF pages, matching the printed slide numbers.

## Points to make explicit

- `memcpy` requires non-overlapping source and destination ranges; `memmove`
  handles overlap. Both count bytes and copy exactly the requested count.
  Neither appends a string terminator automatically. The same-type integer
  round trip observes this process's representation, not a portable file format.
- Byte ordering does not change the numeric value or a member's offset.
  `uint32_t` is optional; the endian demonstration checks its availability and
  `CHAR_BIT` before inspecting a known four-byte pattern. Other patterns are
  reported rather than forced into a little/big classification.
- A bit-field has no address and cannot be used with `sizeof` or `offsetof`.
  Storage order and allocation units are implementation-dependent. Ordinary
  members in the same struct still have offsets. Do not use `container_of`
  with a bit-field, or serialize a raw bit-field struct as a file/wire format.
- These C struct bit-fields differ from the explicit integer masks in
  [packed_book_flags.c](../../week02-operators/examples/packed_book_flags.c).

For a strict rebuild:

```bash
make -B -C lectures/week06-container-of/examples \
  CFLAGS='-Wall -Wextra -Wpedantic -Werror -std=c11'
```
