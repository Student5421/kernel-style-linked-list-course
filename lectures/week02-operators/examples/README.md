# Week 02 live examples

Each source is an independent C11 program. The original operator demos remain
the core lesson; use the string and packed-field examples when revisiting the
reference PDFs. Page numbers below are one-based PDF pages and match the
printed slide numbers.

From the repository root:

```bash
make -C lectures/week02-operators/examples
make -C lectures/week02-operators/examples run
./lectures/week02-operators/examples/string_scan_argv 'C Programming 2' '' 'Linux 6'
./lectures/week02-operators/examples/string_scan_argv  # built-in examples
make -C lectures/week02-operators/examples clean
```

`make run` supplies fixed arguments and requires no keyboard input.
`precedence_traps.c` remains excluded: compile it by hand to discuss its
intentional diagnostics and unsafe expressions.

## Teaching order and observations

| Order | Example | Source PDF pages | Observe and predict |
|---|---|---|---|
| 1 | [pointer_exprs.c](pointer_exprs.c), [arith_logic.c](arith_logic.c), [bit_flags.c](bit_flags.c), [macro_parens.c](macro_parens.c) | Existing weekly notes; Low Level Operations 2-14 | Review expression grouping, arithmetic, flags, and macro substitution. Explain which object `*q++` changes. |
| 2 | [string_storage.c](string_storage.c) | Strings 3-14, 16-20, 28-32 | `strlen` excludes the null; array capacity includes it. A writable copy changes independently of its literal. A fixed row holds characters; a pointer table holds addresses. Add a title and choose enough row capacity. |
| 3 | [string_capacity.c](string_capacity.c) | Strings 43-60, 74 | Copy then append gives `C Programming`; an oversized suffix is rejected without changing it. Exact fit, empty strings, zero capacity, and an unterminated destination are handled. Why does an eight-byte formatting buffer report truncation? |
| 4 | [string_search.c](string_search.c) | Strings 61-67 | Separate arrays have equal contents but different addresses. Search reports found, missing, and empty-needle cases. `strtok` yields three tokens from `C,,Linux;Systems`, skipping the empty field and changing the buffer. Change the delimiters and predict the result. |
| 5 | [string_scan_argv.c](string_scan_argv.c) | Strings 26-27, 33-41, 75-81 | Scan each title through a `const char *`, classify safely, and print uppercase without modifying it. `C Programming 2` has length 15, two spaces, and one digit; an empty argument has zero of each. Explain shell quoting and the loop boundary. |
| 6 | [packed_book_flags.c](packed_book_flags.c) | Low Level Operations 15-19 | One flag satisfies an any-of test but not an all-of test. Replacing edition 7 with 2 clears old bits while preserving flags; edition 8 is rejected. Change the initial flags and predict both tests. |

Reference PDFs: [Strings (82 pages)](../%5BSlide%5D%2003.%20Strings.pdf) and
[Low Level Operations (25 pages)](../%5BSlide%5D%2006.%20Low%20Level%20Operations.pdf).

## Points to make explicit

- A C string needs a terminating null. A literal is an array that usually
  converts to a pointer in expressions; use `const char *` to refer to its
  contents. Its physical memory section is implementation-dependent.
- These examples use bounded output and checked copies. `snprintf` returns
  the length that would have been written, excluding the null. Test a
  negative return before converting it to `size_t`. `strncpy` may omit a
  terminator; `strncat`'s limit is not the destination's full capacity.
- Use the sign of `strcmp` / `strncmp`, not a specific nonzero value. Always
  check search results before dereferencing them. Tokenization needs writable
  storage and is not a CSV parser; `strtok` has shared internal state.
- Pass an unsigned-character value to `ctype` functions. These byte scans do
  not count Unicode code points. `size_t` lengths use `%zu`.
- Bitwise any-of and all-of tests differ. Validate a multibit value before
  shifting it into position; clear its previous bits first. Keep shifts
  unsigned and within the promoted operand's width.
- Reference string input examples using `gets` are obsolete: it is absent
  from C11. Safe line input and string-to-number parsing are revisited in
  [Week 07](../../week07-file-io/README.md). Memory-copy operations from Strings
  pp. 68-72 are revisited in [Week 06](../../week06-container-of/examples/README.md).

For strict compilation after changing flags:

```bash
make -B -C lectures/week02-operators/examples \
  CFLAGS='-Wall -Wextra -Wpedantic -Werror -std=c11'
```
