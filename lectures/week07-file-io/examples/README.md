# Week 07 executable examples

Build with `make`, run prepared demonstrations with `make run`, and remove
executables and generated files with `make clean`. `make test` keeps the
original redirected-input and saved-file round-trip checks.
`books.txt` includes one deliberately malformed record, so its `library_io`
diagnostic during `make run` and `make test` is expected.

Page numbers below are one-based pages in
[File I/O](../%5BSlide%5D%2004.%20File%20IO.pdf) (62 pages).

| Teaching order | Program | PDF pages | Observe |
|---|---|---|---|
| 1 | [stdio_streams.c](stdio_streams.c) | 4-10 | Standard output and standard error can be redirected separately. Its stderr message is expected during `make run`. |
| 2 | [count_chars.c](count_chars.c) | 41-45 | `int` retains both byte values and `EOF`; the command takes a filename. |
| 3 | [input_demo.c](input_demo.c) | 29, 34-40 | Check `scanf` results and discard a bad line before trying again. |
| 4 | [line_parse.c](line_parse.c) | 47-52; Strings 42-48 | Convert a complete text line with `strtol`, inspect the end pointer and `ERANGE`, validate a year, and recover after a long line. |
| 5 | [stream_copy.c](stream_copy.c) | 41-48, 53-54, 61 | Line chunks preserve a long text line; block copying preserves embedded NUL and other binary bytes. Both copies compare every byte and check stream errors. |
| 6 | [library_io.c](library_io.c) | 17-29, 39-40, 47-52 | Load and save the book list using a line-oriented text format. |
| 7 (optional) | [binary_position.c](binary_position.c) | 53-61 | Encode a specified binary record, check element counts, seek to a record, restore `fpos_t`, and verify exact bytes. |

The conversion pages referenced above are in
[Strings](../../week02-operators/%5BSlide%5D%2003.%20Strings.pdf).

## Prepared inputs and output

```bash
make run
./line_parse                         # built-in malformed-input cases
printf '2000junk\n2024\n' | ./line_parse --stdin
./stream_copy
./binary_position
make test
```

`line_parse` rejects empty/non-numeric text, numeric overflow, years outside
1450-2100, trailing junk, and lines longer than 63 characters. It accepts
surrounding whitespace, handles a final line without a newline, and consumes
the whole overlong line before processing the next record. Input is text
without embedded NUL bytes. Its default final output is `line 11: year 2024`,
after `line 10: too long`.

The two copy programs use `tmpfile()`, which creates temporary binary update
streams that are removed on close. `stream_copy` reports byte equality for a
long text line and an 11-byte binary payload. `binary_position` writes exactly
12 octets: ASCII `BK01`, then two records, each containing a big-endian 16-bit
book ID and year. Its compile-time assertion states the requirement for
eight-bit bytes. Values and byte order are encoded explicitly; no struct is
written. Fixed binary offsets are appropriate here; text-stream positions
should be treated as values saved by the positioning APIs.

## Predict, then change

1. Reduce the buffers in `stream_copy.c`. Explain why successful copies still
   preserve every byte, even when one text line needs several reads.
2. Feed `line_parse --stdin` exactly 63 characters followed by a newline,
   then 64 characters. Add a valid year afterward to check recovery.
3. Explain why `fwrite(records, sizeof(records[0]), 2, file)` returns a record
   count while `fwrite(bytes, 1, size, file)` returns a byte count.
4. Add a third encoded book to `binary_position.c` and update the expected
   byte sequence. Use a saved position to reread it.
