# Week 05 examples: intrusive links, copying, and ownership

From the repository root:

```bash
make -C lectures/week05-intrusive-list/examples
make -C lectures/week05-intrusive-list/examples run
make -C lectures/week05-intrusive-list/examples clean
```

All programs use fixed input and run without interaction.

## Teaching sequence and reference pages

The intrusive algorithms are course extensions. Their C prerequisites come
from [Structures, Unions and Enums](../../week01-struct/%5BSlide%5D%2005.%20Structures,%20Unions%20and%20Enums.pdf),
[Pointers Revisited](../../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf),
and [Dynamic Memory Allocation](../../week03-dynamic-memory-singly-list/%5BSlide%5D%2002.%20Dynamic%20Memory%20Allocation.pdf).

| Order | Demo | PDF pages and purpose |
|---|---|---|
| 1 | [first_member.c](first_member.c) | Structures pp. 21-27 and Pointers pp. 6-9: follow a pointer to an embedded first member back to the enclosing structure. This cast depends on the link being first. |
| 2 | [intrusive_book.c](intrusive_book.c) | Structures pp. 21-27 and Pointers pp. 14-16: embed links away from the beginning and recover the book using its member offset. Week 06 generalizes the repeated expression. |
| 3 | [multi_list.c](multi_list.c) | Structures pp. 24-27 and Dynamic Memory pp. 25-27: one heap book participates in two lists through two embedded links; the owning list removes every membership before freeing the book. |
| 4 | [borrowed_catalog.c](borrowed_catalog.c) | Structures p. 17, pp. 21-27, and Dynamic Memory pp. 25-27: structure assignment also copies link pointer values. Reset the destination's links before using the copy as a distinct member. A list borrowing stack books unlinks them but never frees them. |

## Observe copying and borrowed membership

```text
$ ./borrowed_catalog
copy starts detached: 1
catalog: [1] C Programming [2] c Programming
after unlink, original still alive: [1] C Programming
reinsertion preserves object identity: 1
catalog: [2] c Programming [1] A Programming
empty after detaching stack-owned books: 1
```

`copy_detached` has a specific contract: the destination is a different object
and belongs to no list. Assignment copies both the embedded title array and the
link addresses. Reinitializing the destination's links prevents those copied
addresses from being mistaken for the source's actual list membership. Do not
overwrite a destination that is already linked. This helper is for the shown
payload with its embedded character array; an owning pointer member would need
its own copying and ownership policy.

The `saved` pointer continues to identify the original book after unlinking.
The book remains alive because its enclosing block still runs. Reinsert it only
after detaching its existing membership. Detach both books before leaving the
block; calling `free()` on either stack book or its embedded link would be
invalid. In contrast, `multi_list.c` owns heap books and does need to release
their allocations after removing every membership.

## Predict, then change

1. Predict whether editing the copied title changes the original title. Explain
   why the character arrays are independent but the link pointer values require
   explicit reinitialization.
2. Predict the catalog order after the original book is unlinked and appended
   again. Identify which object the saved pointer still names.
3. In a scratch copy, add a second detached book copy with a new ID, then unlink
   it before scope exit. Keep every link in at most one ring at a time.
4. Compare `borrowed_catalog.c` with `multi_list.c`: identify the owner, each
   borrowed membership, and the exact point at which the payload ceases to exist.
