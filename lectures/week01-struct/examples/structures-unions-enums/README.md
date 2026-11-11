# Structures, Unions and Enums - supplementary examples

These independent C11 programs extend the existing `struct_basics.c` and
`struct_pointer.c` demos. Lecture examples use books; students apply the ideas
to their own assignment. Each file has its own `main()` so it can be compiled
and discussed separately.

The source reference is
[Structures, Unions and Enums](../../%5BSlide%5D%2005.%20Structures%2C%20Unions%20and%20Enums.pdf)
(49 pages), stored beside the Week 01 deck. The original is also preserved in
the course's `C Programming Part 2/` directory. Page numbers below are
one-based PDF pages and match the printed slide numbers.

## Build and run

From this directory:

```bash
make
./struct_values
make run       # run all six examples, including the Week 03 extension
make clean
```

For a single example without Make:

```bash
gcc -Wall -Wextra -std=c11 tagged_union.c -o tagged_union
./tagged_union
```

## Suggested teaching order

| Order | Example | Source PDF pages | Concepts and observation |
|---|---|---|---|
| 1 | [struct_values.c](struct_values.c) | 9-20 | `typedef`, omitted initializer members, returning a struct, copying an embedded array, and comparing members. The original title stays `C Programming` after editing the copy. |
| 2 | [nested_catalog.c](nested_catalog.c) | 24-29 | Nested structures, an array of books, `books[i].author.last`, nested struct assignment, and returning a pointer to an array element. A failed search returns `NULL`. |
| 3 | [union_storage.c](union_storage.c) | 32-35, 38 | All union members have the same starting address. Store and read one member at a time; compare struct and union sizes without assuming a particular byte count. |
| 4 | [enum_status.c](enum_status.c) | 40-45 | Implicit values `0, 1`, an explicit value `10`, then `11`; tags and typedef aliases; `switch`; reject unknown input codes `2` and `99`. |
| 5 | [tagged_union.c](tagged_union.c) | 36-37, 46-47 | Combine common book fields, format-specific union data, and an enum tag. Dispatch by tag and change payload plus tag when converting a print book to an ebook. |
| 6 (Week 03) | [dynamic_struct_copy.c](dynamic_struct_copy.c) | 23; ownership extension | Allocate a struct and its title separately, handle allocation failures, then compare shallow assignment with a deep clone. One owner releases each allocation. |

The existing parent-directory demos cover tags and variables, positional and
designated initialization, `.` and `->`, passing by value versus pointer, and
member addresses (PDF pages 3-8, 13-22). Use these supplements after those demos;
return to the dynamic example after introducing `malloc()` and `free()`.
For the ownership pattern used later in the course, also see
[`book_factory.c`](../../../week03-dynamic-memory-singly-list/examples/book_factory.c)
and the [Week 03 lecture notes](../../../week03-dynamic-memory-singly-list/README.md).

## Points to make explicit in class

- `typedef struct book Book;` creates another name for the same type.
- A struct may be returned by value. Returning `&local_book` would leave a
  dangling pointer after the function returns.
- PDF page 14 discusses initialization at declaration. After declaration, a
  whole struct can still be assigned from another compatible struct or from
  a compound literal: `book = (Book){ .id = 2 };`.
- Struct assignment copies every member, including embedded arrays. A pointer
  member copies an address; its pointed-to allocation is not duplicated.
- Structs cannot be compared with `==`. Compare their meaningful members;
  `memcmp()` may also compare padding bytes.
- PDF page 35 shows initialization of the first union member. C11 also permits
  a designated initializer such as `{ .price = 19.50 }` for another member.
- Union storage is large enough for every member and may include alignment
  padding. Exact sizes and printed addresses depend on the implementation.
- These demos only read the union member most recently stored. A separate tag
  and a `switch` make that choice explicit; C does not enforce the match.
- The tagged-union `switch` on PDF page 37 omits a `break` after its integer
  branch. Each branch here ends with `break`, so it reads only the selected
  payload.
- Enum names are integer constants. An enum does not automatically validate a
  number read from input; check it before assigning the corresponding status.

## In-class prompts

1. Predict whether changing `copy.title[0]` changes `original.title[0]` in
   `struct_values.c`. Repeat for `shallow_copy.title[0]` in
   `dynamic_struct_copy.c`, and explain the difference.
2. In `nested_catalog.c`, change the search ID to one that is absent. Explain
   why `found->title` must remain inside the `found != NULL` check.
3. In `union_storage.c`, predict which addresses are equal before running it.
   Explain why assigning `price` does not preserve a separate `pages` value.
4. Add a `BOOK_AUDIO` variant to `tagged_union.c`, with a duration payload and
   a matching `switch` case. Keep the tag and payload consistent.
