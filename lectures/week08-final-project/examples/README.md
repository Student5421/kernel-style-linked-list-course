# Week 08 executable examples

These examples connect the preprocessor to separate compilation and module
interfaces. Build everything with `make`, execute with `make run`, and remove
outputs with `make clean`.

All page references are one-based pages in
[Writing Large Programs](../%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf)
(41 pages).

| Teaching order | Example | PDF pages | Demonstration |
|---|---|---|---|
| 1 | [preprocessor_demo.c](preprocessor_demo.c) | 3-18 | `#` stringification, two-stage `##` token pasting, repeated macro evaluation, a `static inline` alternative, and `#ifdef DEBUG` versus `#if DEBUG`. |
| 2 | [stats demo](main.c) with [stats.h](stats.h) and [stats.c](stats.c) | 22-29 | Compile objects separately, link them, and inspect the original header-dependency exercise. |
| 3 | [book-module/](book-module/) | 24-40 | Shared prototypes, guarded headers, file-private validation, one `extern` constant definition, layered reporting, and complete header prerequisites. |

The stats Makefile's `# main.o stats.o: stats.h` line remains commented out
for the existing lecture demonstration. The book package supplies the complete
dependency example. No linked-list operations or final-project features are
implemented here.

## Preprocessor experiments

```bash
./preprocessor_demo
gcc -std=c11 -E preprocessor_demo.c > preprocessor_demo.i
make -B preprocessor_demo CFLAGS='-Wall -Wextra -std=c11 -DDEBUG=1'
./preprocessor_demo
make -B preprocessor_demo CFLAGS='-Wall -Wextra -std=c11 -DDEBUG=0'
```

The macro calls `next_year()` twice and prints `result=2002 calls=2`; the inline
function calls it once and prints `result=2001 calls=1`. The conditional
operator sequences its condition before its selected branch, so the macro
experiment has defined behavior. Avoid passing side effects to such macros in
application code. `DEBUG=0` still satisfies `#ifdef DEBUG`; only the numeric
`#if DEBUG` branch becomes disabled. Changing compiler flags requires a forced
rebuild (`-B`) because Make does not track flags as file prerequisites.

## Complete book package

| File | Role |
|---|---|
| [book.h](book-module/book.h) | Book value type, public initializer, capacity/name macros, and `extern` declaration. |
| [book.c](book-module/book.c) | One name definition, input validation, and the private `valid_year` helper. |
| [report.h](book-module/report.h) | Reporting interface; includes the book interface. |
| [report.c](book-module/report.c) | Formatted output and its return-status check. |
| [main.c](book-module/main.c) | Creates two local books, calls the APIs, and demonstrates a rejected year. |
| [Makefile](book-module/Makefile) | One object per source, link step, and all project-header prerequisites. |

```bash
make -C book-module run
make -C book-module -n
```

`main.c` includes `book.h` both directly and through `report.h`, so the guards
are exercised during every build. The shared name is an immutable constant;
the book data belongs to `main()`. This demonstrates `extern` without global
mutable book storage.

For a real rebuild experiment, change `BOOK_MODULE_NAME` in `book-module/book.h`
and run `make -C book-module run`: all three objects rebuild, then the heading
changes. Change a prototype or member next and inspect which clients depend
on it. Explain why a guard prevents repeated inclusion in one translation unit
but cannot repair an external function defined in several translation units.

Delete the optional preprocessor listing after inspection; `make clean` also
removes it.
