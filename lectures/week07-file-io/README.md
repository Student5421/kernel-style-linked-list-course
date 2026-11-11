# Week 07 — File I/O

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 07 — File I/O](../../assignments/week07-file-io/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 06](../week06-container-of/) · [Week 08](../week08-final-project/) |

## Reference slide reading

Use [File I/O](%5BSlide%5D%2004.%20File%20IO.pdf) (62 pages). All page
numbers below are one-based PDF pages. Core reading is **pp. 3-52, then 61**:

1. Read pp. 3-15 for streams and text/binary distinctions, then pp. 17-27
   for opening modes, paths, and closing files.
2. Continue with pp. 28-40 for formatted I/O, pp. 41-48 for character/line
   I/O, and pp. 49-52 for parsing strings. Finish with p. 61 on buffering.
3. Use pp. 53-60 as optional binary-I/O and file-positioning extensions.

Before parsing, revisit [Strings](../week02-operators/%5BSlide%5D%2003.%20Strings.pdf)
**pp. 15-25** for input buffers and **pp. 42-48** for conversions. For binary
representation, consult [Low Level Operations](../week02-operators/%5BSlide%5D%2006.%20Low%20Level%20Operations.pdf)
**pp. 22-24**. Pointer, string, and resource-ownership basics come first;
list persistence then uses the intrusive-list traversal from Weeks 05-06.
Strings **pp. 37-41, 64-67, and 73** are optional references for character
validation, searching/tokenizing text, and error strings.

Pair the reading with [`stdio_streams.c`](examples/stdio_streams.c),
[`count_chars.c`](examples/count_chars.c), [`input_demo.c`](examples/input_demo.c),
and [`library_io.c`](examples/library_io.c), in that order.
The [example guide](examples/README.md) adds checked stream copies,
`strtol` input validation, and an optional encoded binary/positioning demo;
run the prepared examples with `make -C examples run` from this directory.

Three clarifications: `FILE *` is a stream handle, distinct from an OS file
descriptor. On p. 47, use `fgets(buf, sizeof(buf), fp)`; `gets()` was removed
from C11. The raw-struct example on p. 56 is unsuitable for our linked lists:
pointer values and padding do not provide a portable saved format.

## Learning Objectives

By the end of this session you can:

1. Explain `FILE *`, the three standard streams, and shell redirection (`<`, `>`, `2>`).
2. Open and close files with `fopen()`/`fclose()`, handle failure with `perror()`, and treat a file like any other owned resource.
3. Read a file character by character (`fgetc`) and line by line (`fgets`), and avoid the `char c` and `while (!feof(fp))` bugs.
4. Design a simple text format, save a linked list to it, and load the list back with `fgets()` + `sscanf()`.
5. Explain why a struct containing pointers must not be written to disk with `fwrite()`.
6. Read keyboard input robustly with `scanf()`, and test programs automatically with input files and `diff`.

---

## 0. Review of Week 06

1. On a 64-bit machine, what is `offsetof(struct student, list)`, and why is it not 28?
2. Expand by hand: `container_of(pos, struct student, list)`.
3. When must you use `list_for_each_safe()` instead of `list_for_each()`?

Today's question: **Every program so far forgets everything when it exits. How do we keep the list of students until next time?**

---

## 1. Streams and Files

### 1.1 Everything is a stream

A C program reads and writes through **streams**, represented by `FILE *`. Three streams are open before `main()` starts:

| Stream | Default connection | Used by |
|---|---|---|
| `stdin` | keyboard | `scanf()`, `getchar()`, `fgets(buf, n, stdin)` |
| `stdout` | terminal | `printf()` = `fprintf(stdout, ...)` |
| `stderr` | terminal | `fprintf(stderr, ...)`, `perror()` |

Why two output streams? When output is redirected to a file, error messages written to `stderr` still appear on the terminal, and they do not end up mixed into the data file.

### 1.2 Redirection and exit status

| Shell syntax | Effect |
|---|---|
| `./prog < in.txt` | `stdin` reads from `in.txt` |
| `./prog > out.txt` | `stdout` goes to `out.txt` (overwritten) |
| `./prog >> out.txt` | `stdout` is appended to `out.txt` |
| `./prog 2> err.txt` | `stderr` goes to `err.txt` |
| `./a \| ./b` | `stdout` of `a` becomes `stdin` of `b` |
| `echo $?` | exit status of the last command (Week 01) |

**Live demo** — [`examples/stdio_streams.c`](examples/stdio_streams.c):

```bash
./stdio_streams > out.txt     # terminal shows: error messages go to stderr
cat out.txt                   # normal output goes to stdout
./stdio_streams 2> err.txt    # terminal shows: normal output goes to stdout
```

### 1.3 Opening and closing files

```c
FILE *fp = fopen("books.txt", "r");

if (fp == NULL) {
    perror("books.txt");       /* books.txt: No such file or directory */
    return EXIT_FAILURE;
}
/* ... read from fp ... */
fclose(fp);
```

| Mode | Meaning | If the file does not exist |
|---|---|---|
| `"r"` | read | `fopen()` fails |
| `"w"` | write, **erasing** existing content | it is created |
| `"a"` | append to the end | it is created |
| `"r+"` | read and write | `fopen()` fails |

- `perror(msg)` prints `msg`, a colon, and the reason for the last failure (from `errno`).
- **A `FILE *` is a resource, just like heap memory (Week 03).** Every successful `fopen()` needs exactly one `fclose()`. Forgetting it leaks the file handle, and output that was still buffered may never reach the disk.
- On Windows, add `b` (`"rb"`, `"wb"`) for binary files. On Linux and macOS it makes no difference.

### 1.4 Reading one character at a time

**Live demo** — [`examples/count_chars.c`](examples/count_chars.c):

```c
int c;                  /* int, not char: EOF must differ from every character */

while ((c = fgetc(fp)) != EOF) {
    chars++;
    if (c == '\n')
        lines++;
}
```

```text
$ ./count_chars books.txt
books.txt: 7 lines, 178 characters
$ wc -l -c books.txt
       7     178 books.txt
$ ./count_chars missing.txt ; echo $?
missing.txt: No such file or directory
1
```

Two classic bugs:

1. **`char c` instead of `int c`.** `fgetc()` returns any byte value 0–255 *or* `EOF` (a negative `int`), which is 257 possible values. A `char` cannot hold all of them: either a real byte looks like `EOF`, or `EOF` is never seen and the loop never ends.
2. **The parentheses.** `c = fgetc(fp) != EOF` assigns 0 or 1 to `c` (Week 02, §1.5).

**Do not write `while (!feof(fp))`:**

```c
while (!feof(fp)) {          /* WRONG */
    fgets(line, sizeof(line), fp);
    process(line);           /* runs once more after the last line */
}
```

`feof()` becomes true only **after** a read has already failed. The loop body therefore runs one extra time with stale data. Always test the **return value of the read function** instead.

### 1.5 Reading one line at a time

```c
char line[128];

while (fgets(line, sizeof(line), fp) != NULL) {
    line[strcspn(line, "\n")] = '\0';     /* strip the trailing newline */
    /* ... */
}
```

- `fgets(buf, size, fp)` reads at most `size - 1` characters, stops **after** a `'\n'` (which it keeps), and adds `'\0'`. If nothing could be read (end of file, or an error), it returns `NULL` and leaves `buf` unchanged. It never overflows `buf`.
- `strcspn(line, "\n")` is the length up to the first `'\n'` (or the whole string), so the assignment removes the newline if there is one.
- **A line longer than the buffer** arrives in pieces. If there is no `'\n'` in the buffer and you are not at end of file, the line was too long. The demo detects this and skips the rest of the line:

```c
size_t len = strcspn(line, "\n");

if (line[len] != '\n' && !feof(fp)) {
    fprintf(stderr, "%s:%d: line too long, skipped\n", path, lineno);
    skip_rest_of_line(fp);
    continue;
}
```

### 1.6 Writing, and buffering

`fprintf(fp, ...)`, `fputs(s, fp)`, and `fputc(c, fp)` write to a stream. Output is **buffered**: it collects in memory and is written to the file when the buffer fills, on `fflush(fp)`, or on `fclose(fp)`. Two consequences:

- If the program crashes before `fclose()`, the last part of the output may be lost.
- Write errors (for example, a full disk) may only show up when `fclose()` returns non-zero. Check it when writing.

---

## 2. Saving and Loading a List

### 2.1 Designing a text format

```text
# id,year,title
1,1978,The C Programming Language
2,2005,Understanding the Linux Kernel
4,2004,Code Complete, 2nd Ed.
```

- **One record per line**, so a damaged line affects only one record.
- **Put the free-text field last**, so it may contain spaces and even commas.
- **Allow comment lines** (`#`) and empty lines.
- **Text, not binary:** you can read it, edit it, `diff` it, and move it to another machine.

### 2.2 Saving: traverse and print

From [`examples/library_io.c`](examples/library_io.c):

```c
/* Returns 0 on success, -1 on failure. */
static int library_save(struct list_head *head, const char *path)
{
    FILE *fp = fopen(path, "w");
    struct list_head *pos;

    if (fp == NULL) {
        perror(path);
        return -1;
    }

    fprintf(fp, "# id,year,title\n");
    list_for_each(pos, head) {
        struct book *b = container_of(pos, struct book, list);

        fprintf(fp, "%d,%d,%s\n", b->id, b->year, b->title);
    }

    if (fclose(fp) != 0) {                      /* buffered data is written here */
        perror(path);
        return -1;
    }
    return 0;
}
```

Everything from Weeks 05–06 is here: traverse the `list_head`s, and use `container_of()` to reach each book.

### 2.3 Loading: `fgets()` + `sscanf()`, one line at a time

```c
while (fgets(line, sizeof(line), fp) != NULL) {
    /* ... long-line check, strip '\n', skip comments (§1.5) ... */

    if (sscanf(line, "%d,%d,%31[^\n]", &id, &year, title) != 3) {
        fprintf(stderr, "%s:%d: invalid line: %s\n", path, lineno, line);
        continue;
    }

    b = book_create(id, title, year);
    if (b == NULL) {
        fprintf(stderr, "Error: out of memory\n");
        break;
    }
    list_add_tail(&b->list, head);
    loaded++;
}
fclose(fp);
```

- **Why not `fscanf()` directly?** `fscanf()` treats newlines as ordinary whitespace. After one malformed line it loses track of where records start, and every following record is misread. Reading a whole line first means each line is parsed on its own, and errors can name the line.
- **`%31[^\n]`** is a *scanset*: "up to 31 characters that are not a newline". Unlike `%s`, it accepts spaces and commas, so it fits the last field of our format. The width is `sizeof(title) - 1`, the same rule as `%19s` for `char name[20]` (§2.5).
- **Check that `sscanf()` returns 3**, the number of fields you asked for.
- **Report errors as `file:line: message`** on `stderr`, the same shape as compiler messages (Week 01).

**Live demo:**

```bash
./library_io books.txt saved.txt
```

```text
books.txt:5: invalid line: oops, this line is broken
loaded 4 books from books.txt
  [1] The C Programming Language (1978)
  [2] Understanding the Linux Kernel (2005)
  [3] Lions' Commentary on UNIX (1996)
  [4] Code Complete, 2nd Ed. (2004)
saved to saved.txt
```

The broken line was reported and skipped, the empty line and the comment were ignored, and the comma inside "Code Complete, 2nd Ed." survived.

### 2.4 Why not `fwrite()` the structs?

```c
fwrite(b, sizeof(*b), 1, fp);     /* tempting, and wrong for our list */
```

This writes the raw bytes of `struct book`, **including `list.next` and `list.prev`**. Those are heap addresses from *this* run of the program. In the next run they point to nothing. For other structs the bytes also include padding (`struct student` has 4 bytes before `list`, Week 06 §1.2), and the layout can differ between compilers and machines.

**Rule: save the data, and rebuild the links when loading.** `fread()`/`fwrite()` are fine for plain data without pointers, such as an array of numbers.

### 2.5 Robust keyboard input with `scanf()`

The same rules apply to `stdin`. The trap: when the user types `abc` where a number is expected, `scanf("%d", &x)` returns **0**, stores nothing, and leaves `abc` in the input. The next `scanf("%d")` fails on the same characters, so a menu loop that just retries spins forever.

From [`examples/input_demo.c`](examples/input_demo.c):

```c
/* Throw away the rest of the current input line, including the '\n'. */
static void discard_line(void)
{
    int c;

    while ((c = getchar()) != '\n' && c != EOF)
        ;
}

/* Returns 1 on success, 0 if the input was not a number, EOF at end of input. */
static int read_int(const char *prompt, int *out)
{
    int rc;

    printf("%s", prompt);
    rc = scanf("%d", out);
    if (rc == EOF)
        return EOF;
    discard_line();             /* on failure this removes the bad characters */
    return rc == 1;
}
```

1. **Check `scanf()`'s return value**, which is the number of items stored, or `EOF`. Check it *before* using the variable.
2. **Give every `%s` a width:** `char name[20]` → `"%19s"`.
3. `%s` reads one **word**. For a full line with spaces, use `fgets(buf, size, stdin)` followed by `sscanf()`, exactly as in §2.3.
4. **Handle `EOF`** (Ctrl-D, or the end of a redirected file): leave the loop and clean up.
5. **Validate ranges** after a successful read.

### 2.6 Testing with files

**Input redirection** replays a test without typing:

```bash
./input_demo < input.txt
```

```text
ID (0 to quit): Title: Year: OK: [1] K&R (1978)
ID (0 to quit): Error: Invalid input.
ID (0 to quit): Title: Year: OK: [2] SICP (1985)
ID (0 to quit): Title: Year: OK: [3] AVeryLongTitleThatDoesNotFitInt (2001)
ID (0 to quit): Title: Year: Error: Year must be 1450-2100.
ID (0 to quit): bye
```

The prompts run together because input from a file is not echoed. The invalid `abc`, the over-long title, and the out-of-range year are all handled without a crash.

**Makefile corner: a `test` target.** Save the output you have checked once as `expected.txt`. Afterwards `diff` compares each new run against it:

```make
test: input_demo library_io
	./input_demo < input.txt > actual.txt
	diff expected.txt actual.txt
	./library_io books.txt saved.txt
	./library_io saved.txt saved2.txt
	diff saved.txt saved2.txt
	@echo "all tests passed"
```

- `diff` prints nothing and exits with status 0 when the files are identical. If they differ, it exits non-zero, and `make` stops with an error. **A failed test is a failed build.**
- The second half is a **round-trip test**: save, load what was saved, save again, and the two files must be identical.
- A leading `@` stops `make` from printing the command before it runs it.

---

## 3. Lab

Task: [assignments/week07-file-io/README.md](../../assignments/week07-file-io/README.md)

1. Copy your list functions and `student_create()` from Weeks 05–06 into the starter.
2. `student_load()`: `fopen()` + `perror()`, then a `fgets()` loop, `sscanf(line, "%d %19s %d", ...)`, range checks, and errors with line numbers on `stderr`.
3. `student_print_all()` and `student_free_all()`.
4. `student_save()`: `fopen(path, "w")`, `fprintf()`, and a checked `fclose()`.
5. Round-trip: `./week07 students.txt students_out.txt`, then `./week07 students_out.txt check.txt`, then `diff students_out.txt check.txt`.

Test plan:

| # | Input | Expected |
|---|---|---|
| 1 | The provided `students.txt` | 3 students loaded. Lines 5 and 6 reported on `stderr`. |
| 2 | A file name that does not exist | `perror()` message, exit status 1 |
| 3 | An empty file | 0 students, and an output file with no student lines |
| 4 | A name longer than 19 characters | No overflow. With `"%d %19s %d"` the leftover letters make the score fail to parse, so the line is reported as invalid. |
| 5 | The round trip | `diff` prints nothing |

**Stretch goals:**

- Reject a line whose ID already appears earlier in the file.
- Add a `make test` target to your starter Makefile that runs the round trip and the `diff`.
- *Optional, not part of the final project spec:* add "Save" and "Load" menu items to your Week 08 Student Management System.

---

## 4. Wrap-up

### Key takeaways

- `stdin`, `stdout`, and `stderr` are streams. Errors go to `stderr`, so redirection does not hide them.
- `fopen()` can fail: check for `NULL` and call `perror()`. Every successful `fopen()` needs exactly one `fclose()`.
- `int c = fgetc(fp)`, never `char`. Test the read function's return value, never `while (!feof(fp))`.
- Read lines with `fgets()` and parse them with `sscanf()`, checking the return value. Report errors as `file:line: message`.
- Save **data**, not pointers. Rebuild the list when loading.
- Test with `< input.txt`, compare with `diff`, and let `make test` run it all.

### Exit quiz

1. Why does `./prog > out.txt` still show error messages on the terminal?
2. What is wrong with `char c; while ((c = fgetc(fp)) != EOF)`?
3. Why is `while (!feof(fp)) { fgets(...); ... }` wrong?
4. What does `%31[^\n]` read, and why use it for the title?
5. Why can't we save the list with `fwrite()` on each `struct book` and read it back with `fread()`?

<details>
<summary>Answers</summary>

1. The error messages are written to `stderr`, and `>` redirects only `stdout`.
2. `c` must be an `int`. A `char` cannot represent every byte value plus `EOF`, so either a real character is mistaken for `EOF` or `EOF` is never detected.
3. `feof()` only becomes true after a read has failed, so the body runs one extra time with stale data. Test `fgets()`'s return value instead.
4. Up to 31 characters that are not a newline, including spaces and commas. The title is the last field and may contain both, and 31 fits `char title[32]`.
5. The struct contains `list.next` and `list.prev`, heap addresses that are meaningless in the next run. Padding and layout can also differ between machines.

</details>

### Next week

Everything is in place: structs, operators, the heap, circular doubly linked lists, intrusive `list_head`, `container_of()`, and file I/O. → **Week 08 — Final Project: Student Management System**, plus how to build a program from several `.c` files.
