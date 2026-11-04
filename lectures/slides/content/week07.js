// Week 07 — File I/O
module.exports = {
    week: 7,
    dirName: 'week07-file-io',
    title: 'File I/O',
    short: 'File I/O',
    subtitle: 'Streams, files, and saving a linked list so it survives the end of the program',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'count_chars.c',
            code: [
                { file: 'examples/count_chars.c', lines: [22, 22] },
                { file: 'examples/count_chars.c', lines: [28, 35] },
            ],
            notes: 'Every program so far forgets everything when it exits. Today: streams, files, and saving the list of books so that it can be rebuilt next time.' },


        { kind: 'objectives', items: [
            'Explain `FILE *`, the three standard streams, and shell redirection (`<`, `>`, `2>`)',
            'Open and close files with `fopen()`/`fclose()`, handle failure with `perror()`, and treat a file as an owned resource',
            'Read a file by character (`fgetc`) and by line (`fgets`), and avoid the `char c` and `while (!feof(fp))` bugs',
            'Design a simple text format, save a linked list to it, and load it back with `fgets()` + `sscanf()`',
            'Explain why a struct containing pointers must not be written to disk with `fwrite()`',
            'Read keyboard input robustly with `scanf()`, and test programs with input files and `diff`',
        ], size: 16 },

        { kind: 'review', title: 'Review of Week 06', questions: [
            'On a 64-bit machine, what is `offsetof(struct student, list)`, and why is it not 28?',
            'Expand by hand: `container_of(pos, struct student, list)`',
            'When must you use `list_for_each_safe()` instead of `list_for_each()`?',
        ], today: 'Today\'s question: **every program so far forgets everything when it exits.** How do we keep the list of students until next time?' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Streams', kind: 'section', num: 1, label: 'PART 1', title: 'Streams and files', sub: 'Standard streams, redirection, fopen/fclose, reading characters and lines' },

        { kind: 'concept', title: 'Streams and `FILE *`', layout: 'tb', ratio: 0.52,
            what: 'A C program reads and writes through **streams**, represented by `FILE *`. Three are open before `main()` starts: `stdin` (the keyboard), `stdout` (the terminal), and `stderr` (also the terminal, for error messages).',
            why: 'One type for every source means one set of functions: `fgets(buf, n, stdin)` and `fgets(buf, n, fp)` are the same call. And because errors have their own stream, `./prog > out.txt` neither hides them nor mixes them into the data file.',
            how: { table: { head: ['Stream', 'Default', 'Used by'], colW: [1.6, 2.2, 8.2], size: 17, rows: [
                ['`stdin`', 'keyboard', '`scanf()`, `getchar()`, `fgets(buf, n, stdin)`'],
                ['`stdout`', 'terminal', '`printf()` = `fprintf(stdout, ...)`'],
                ['`stderr`', 'terminal', '`fprintf(stderr, ...)`, `perror()`'],
            ] } },
            notes: 'A C program reads and writes through streams, represented by FILE *. Three are open before main() starts. Why two output streams? When output is redirected to a file, error messages written to stderr still appear on the terminal, and they do not end up mixed into the data file.' },

        { kind: 'concept', title: 'Redirection', ratio: 0.5,
            what: 'The shell can connect a program\'s streams to files or to other programs before it starts: `< in.txt` feeds `stdin` from a file, `> out.txt` sends `stdout` to a file, `2>` sends `stderr`, and `|` connects one program\'s `stdout` to the next one\'s `stdin`.',
            why: 'Without redirection, testing means typing the same input again and again, and saving output means copying it off the screen. The program itself does not change: it still reads `stdin` and writes `stdout`.',
            how: { table: { head: ['Shell syntax', 'Effect'], colW: [2.6, 4.2], size: 16, rows: [
                ['`./prog < in.txt`', '`stdin` reads from `in.txt`'],
                ['`./prog > out.txt`', '`stdout` to `out.txt` (overwritten)'],
                ['`./prog >> out.txt`', '`stdout` appended to `out.txt`'],
                ['`./prog 2> err.txt`', '`stderr` to `err.txt`'],
                ['`./a | ./b`', '`stdout` of `a` → `stdin` of `b`'],
                ['`echo $?`', 'exit status (Week 01)'],
            ] } },
            notes: 'The shell does the connecting; the program only sees its three streams. The stdio_streams demo shows that > redirects only stdout, so the stderr line stays on the terminal.' },

        { kind: 'demo', title: 'Live demo: stdio_streams.c', layout: 'tb', ratio: 0.52,
            a: { code: `int main(void)
{
    printf("normal output goes to stdout\\n");     /* same as fprintf(stdout, ...) */
    fprintf(stderr, "error messages go to stderr\\n");
    return 0;
}`, label: 'stdio_streams.c' },
            b: { term: [
                { cmd: './stdio_streams > out.txt', out: 'error messages go to stderr' },
                { cmd: 'cat out.txt', out: 'normal output goes to stdout' },
                { cmd: './stdio_streams 2> err.txt', out: 'normal output goes to stdout' },
            ] },
            notes: 'With > only stdout is redirected, so the stderr line stays on the terminal. With 2> it is the other way round.' },

        { kind: 'concept', title: 'Opening and closing a file', ratio: 0.5,
            what: '`fopen(name, mode)` opens a file and returns a `FILE *`, or `NULL` if it cannot. `perror()` prints why it failed. `fclose(fp)` writes out any buffered data and releases the file. A `FILE *` is an owned resource, like heap memory.',
            why: ['A missing file makes `fopen()` return `NULL`; using that pointer crashes the program.', 'Forgetting `fclose()` leaks the file handle, and buffered output may never reach the disk. Every successful `fopen()` needs exactly one `fclose()`.'],
            how: { code: `FILE *fp = fopen("books.txt", "r");

if (fp == NULL) {
    perror("books.txt");
    return EXIT_FAILURE;
}
/* ... read from fp ... */
fclose(fp);`, label: null },
            notes: 'perror prints, for example: books.txt: No such file or directory. Just like heap memory in Week 03, a file has an owner who must close it exactly once. The next slide lists the modes.' },

        { kind: 'content', title: 'File modes and `perror()`', ratio: 0.55,
            a: { table: { head: ['Mode', 'Meaning', 'If the file is missing'], colW: [1.1, 3.2, 2.6], size: 17, rows: [
                ['`"r"`', 'read', '`fopen()` fails'],
                ['`"w"`', 'write, **erasing** existing content', 'it is created'],
                ['`"a"`', 'append to the end', 'it is created'],
                ['`"r+"`', 'read and write', '`fopen()` fails'],
            ] } },
            b: { callout: [
                '`perror(msg)` prints `msg`, a colon, and the reason for the last failure, taken from `errno`.',
                'On Windows, add `b` (`"rb"`, `"wb"`) for binary files. On Linux and macOS it makes no difference.',
            ] } },

        { kind: 'demo', title: 'Live demo: count_chars.c', ratio: 0.45,
            a: { code: { file: 'examples/count_chars.c', lines: [28, 32] } },
            b: { term: [
                { cmd: './count_chars books.txt', out: 'books.txt: 7 lines, 178 characters' },
                { cmd: 'wc -l -c books.txt', out: '       7     178 books.txt' },
                { cmd: './count_chars missing.txt ; echo $?', out: 'missing.txt: No such file or directory\n1' },
            ] },
            notes: 'c is declared as int, not char: EOF must differ from every character. Compare the result with wc.' },

        { kind: 'concept', title: 'Reading characters: `fgetc()` and `EOF`', ratio: 0.52,
            what: '`fgetc(fp)` returns the next byte of the file as an `int` in 0–255, or the special negative value `EOF` when there is nothing more to read. The loop reads, stores, and compares in one condition: `(c = fgetc(fp)) != EOF`.',
            why: ['With `char c`, 257 possible values do not fit in a `char`: a real byte looks like `EOF`, or `EOF` is never seen and the loop never ends.', 'Without the parentheses, `c = fgetc(fp) != EOF` assigns 0 or 1 to `c` (Week 02, §1.5).'],
            how: { code: { file: 'examples/count_chars.c', lines: [28, 32] }, label: 'count_chars.c' },
            notes: 'c is declared as int, not char: EOF must differ from every character. The count_chars demo compares its result with wc.' },

        { kind: 'concept', title: 'End of file: `feof()`', ratio: 0.5,
            what: '`feof(fp)` tells you whether an earlier read on `fp` hit the end of the file. It becomes true only **after** a read has already failed, so it describes the past, not the next read.',
            why: 'Used as a loop condition, `while (!feof(fp))` runs the body one extra time: the last `fgets()` fails, but `process(line)` still runs on the stale data of the previous line.',
            how: { code: `/* WRONG: the body runs once too often */
while (!feof(fp)) {
    fgets(line, sizeof(line), fp);
    process(line);
}

/* RIGHT: test the read itself */
while (fgets(line, sizeof(line), fp) != NULL)
    process(line);`, label: null },
            notes: 'Always test the return value of the read function instead. feof() and ferror() are useful after the loop, to tell end of file from a read error.' },

        { kind: 'concept', title: 'Reading lines: `fgets()`', ratio: 0.5,
            what: '`fgets(buf, size, fp)` reads one line into `buf`: at most `size - 1` characters, stopping **after** the `\'\\n\'`, which it keeps. On success it adds `\'\\0\'`. If nothing could be read, it returns `NULL` and leaves `buf` unchanged.',
            why: 'Records in a text file are lines. Reading a whole line first means one bad line cannot confuse the next, and `fgets()` can never overflow `buf`, unlike `gets()` or an unbounded `%s`.',
            how: { code: `char line[128];

while (fgets(line, sizeof(line), fp) != NULL) {
    line[strcspn(line, "\\n")] = '\\0';
    /* ... */
}`, label: null },
            notes: 'strcspn(line, "\\n") is the length up to the first newline, or the whole string; the assignment removes the newline if there is one. A line longer than the buffer arrives in pieces: next slide.' },

        { kind: 'content', title: 'Lines longer than the buffer', layout: 'tb', ratio: 0.45,
            a: { code: [
                { file: 'examples/library_io.c', lines: [121, 121] },
                { file: 'examples/library_io.c', lines: [128, 132] },
            ], label: 'library_io.c' },
            b: { bullets: [
                'A line longer than the buffer arrives **in pieces**, one `fgets()` call per piece.',
                'If there is no `\'\\n\'` in the buffer and we are not at end of file, the line was too long.',
                'The loader reports it, then throws the rest of the line away with `skip_rest_of_line()`.',
            ] } },

        { kind: 'concept', title: 'Output buffering', layout: 'tb', ratio: 0.47,
            what: '`fprintf(fp, ...)`, `fputs()`, and `fputc()` do not write to the disk directly. Output collects in a memory **buffer** and reaches the file when the buffer fills, on `fflush(fp)`, or on `fclose(fp)`.',
            why: 'If the program crashes before `fclose()`, the last part of the output is lost. A write error, such as a full disk, may only show when `fclose()` returns non-zero, so check it.',
            how: { code: `fprintf(fp, "%d,%d,%s\\n", b->id, b->year, b->title);  /* to the buffer */
if (fclose(fp) != 0) {    /* buffered data is written here */
    perror(path);
    return -1;
}`, label: 'library_save()' },
            notes: 'This is the end of library_save(): the checked fclose is where buffered data is actually written.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — Save and load', kind: 'section', num: 2, label: 'PART 2', title: 'Saving and loading a list', sub: 'A text format, fgets + sscanf, robust keyboard input, testing with files' },

        { kind: 'concept', title: 'A text file format', ratio: 0.5,
            what: 'A **file format** is the agreement on how records are written: here one book per line as `id,year,title`, with comment lines starting with `#`. The free-text field goes last so it may contain spaces and commas.',
            why: ['One record per line means a damaged line affects only one record.', 'Text, not binary: you can read it, edit it, `diff` it, and move it to another machine.'],
            how: { code: { file: 'examples/books.txt', lines: [1, 7] }, lang: 'text', label: 'books.txt' },
            notes: 'books.txt deliberately contains an empty line and a broken line to exercise the loader.' },

        { kind: 'content', title: 'Saving: traverse and print',
            a: { code: { file: 'examples/library_io.c', fn: 'library_save', drop: [/^\s*$/] } },
            notes: 'Everything from Weeks 05 and 06 is here: traverse the list_heads, and use container_of() to reach each book. The checked fclose() is where buffered data is written.' },

        { kind: 'concept', title: 'Parsing a line: `fgets()` + `sscanf()`', layout: 'tb', ratio: 0.52,
            what: '`sscanf()` parses a string the way `scanf()` parses input. The loader reads each line with `fgets()`, parses it with `sscanf()`, and checks that `sscanf()` returned the number of fields it asked for.',
            why: '`fscanf()` treats newlines as ordinary whitespace: after one malformed line it loses track of where records start, and every following record is misread. Line by line, each line is parsed on its own and errors can name the line.',
            how: { code: `if (sscanf(line, "%d,%d,%31[^\\n]", &id, &year, title) != 3) {
    fprintf(stderr, "%s:%d: invalid line: %s\\n", path, lineno, line);
    continue;
}
b = book_create(id, title, year);`, label: 'library_load()' },
            notes: 'The full function is library_load() in examples/library_io.c: fgets loop, long-line check, strip the newline, skip comments, sscanf, book_create, list_add_tail. Errors are reported as file:line: message on stderr, the same shape as compiler messages.' },

        { kind: 'concept', title: 'Scansets: `%31[^\\n]`', ratio: 0.48,
            what: 'A **scanset** `%[...]` reads characters as long as they belong to a set. `%[^\\n]` means "any character except a newline", and the width 31 limits it to 31 characters, which fits `char title[32]` (`sizeof(title) - 1`).',
            why: '`%s` stops at the first space, so a title such as "Code Complete, 2nd Ed." would be cut to "Code". Without the width, a long title overflows the array.',
            how: { code: `char title[32];

sscanf("4,2004,Code Complete, 2nd Ed.",
       "%d,%d,%31[^\\n]", &id, &year, title);
/* title == "Code Complete, 2nd Ed." */`, label: null },
            notes: 'The title is the last field of the format, so the scanset can take the rest of the line, commas included.' },

        { kind: 'demo', title: 'Live demo: library_io.c', layout: 'tb', ratio: 0.66,
            a: { term: [{ cmd: './library_io books.txt saved.txt', out: `books.txt:5: invalid line: oops, this line is broken
loaded 4 books from books.txt
  [1] The C Programming Language (1978)
  [2] Understanding the Linux Kernel (2005)
  [3] Lions' Commentary on UNIX (1996)
  [4] Code Complete, 2nd Ed. (2004)
saved to saved.txt` }] },
            b: { callout: 'The broken line was reported and skipped, the empty line and the comment were ignored, and the comma inside "Code Complete, 2nd Ed." survived.' } },

        { kind: 'concept', title: 'Binary I/O: why not `fwrite()` the structs', layout: 'tb', ratio: 0.52,
            what: '`fwrite(b, sizeof(*b), 1, fp)` copies the raw bytes of an object to a file, and `fread()` copies them back. That works for plain data, such as an array of numbers.',
            why: 'A `struct book` holds `list.next` and `list.prev`: heap addresses from **this** run, meaningless in the next one. Other structs also contain padding (`struct student` has 4 bytes before `list`), and layouts differ between machines. Save the data, and rebuild the links when loading.',
            how: { diagram: { type: 'layout', title: 'fwrite(b, sizeof(*b), 1, fp) writes all 56 bytes', fields: [
                { name: 'id', size: 4 }, { name: 'title[32]', size: 32 }, { name: 'year', size: 4 }, { name: 'list.next', size: 8, hl: true }, { name: 'list.prev', size: 8, hl: true },
            ] } },
            notes: 'Rule: save the data, rebuild the links when loading. fread()/fwrite() are fine for plain data without pointers.' },

        { kind: 'concept', title: 'Robust keyboard input', ratio: 0.46,
            what: '`scanf()` returns the number of items it stored, or `EOF` at end of input. Robust input checks that value before using the variable, and after a failure throws away the rest of the bad line.',
            why: 'If the user types `abc` for a number, `scanf("%d")` returns 0, stores nothing, and leaves `abc` in the input. The next `scanf("%d")` fails on the same characters, so a retrying menu loop spins forever.',
            how: { code: `static void discard_line(void)
{
    int c;
    while ((c = getchar()) != '\\n' && c != EOF)
        ;
}
static int read_int(const char *prompt, int *out)
{
    int rc;
    printf("%s", prompt);
    rc = scanf("%d", out);
    if (rc == EOF)
        return EOF;
    discard_line();
    return rc == 1;
}`, label: 'input_demo.c' },
            notes: 'discard_line() removes the bad characters, including the newline. read_int() returns 1 on success, 0 if the input was not a number, and EOF at end of input. The next slide lists the five rules.' },

        { kind: 'content', title: 'Five rules for `scanf()`',
            a: { steps: [
                '**Check `scanf()`\'s return value**: the number of items stored, or `EOF`. Check it *before* using the variable',
                '**Give every `%s` a width**: `char name[20]` → `"%19s"`',
                '`%s` reads one **word**. For a whole line, use `fgets(buf, size, stdin)` and then `sscanf()`',
                '**Handle `EOF`** (Ctrl-D, or the end of a redirected file): leave the loop and clean up',
                '**Validate ranges** after a successful read',
            ], size: 19, rowH: 0.95 } },

        { kind: 'concept', title: 'Testing with input files', layout: 'tb', ratio: 0.4,
            what: 'A test input file holds exactly the keys you would type. Running `./program < input.txt` replays it through `stdin`, so the same test runs the same way every time.',
            why: 'Retyping inputs is slow, and typing mistakes hide bugs. With a file, every edge case (invalid `abc`, an over-long title, a bad year) is tested on every run.',
            how: { term: [{ cmd: './input_demo < input.txt', out: `ID (0 to quit): Title: Year: OK: [1] K&R (1978)
ID (0 to quit): Error: Invalid input.
ID (0 to quit): Title: Year: OK: [2] SICP (1985)
ID (0 to quit): Title: Year: OK: [3] AVeryLongTitleThatDoesNotFitInt (2001)
ID (0 to quit): Title: Year: Error: Year must be 1450-2100.
ID (0 to quit): bye` }] },
            notes: 'The prompts run together because input from a file is not echoed. The full run also shows the title truncated safely to 31 characters. None of the bad inputs crashed the program.' },

        { kind: 'concept', title: 'A `test` target with `diff`', ratio: 0.52,
            what: '`diff a b` compares two files: it prints nothing and exits with status 0 when they are identical. A `test` target runs the program on saved input, then `diff`s the result against output you checked once by hand.',
            why: 'Without it, every change must be re-checked by eye. With it, a non-zero `diff` stops `make`: **a failed test is a failed build**. The round trip (save, load, save, compare) proves the saver and loader agree.',
            how: { make: { file: 'examples/Makefile', from: /^test:/, to: /@echo/ }, label: 'examples/Makefile' },
            notes: 'expected.txt is output you checked once by hand. A leading @ stops make from printing the command.' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Week 07 assignment', sub: 'Load students from a file, print them, save them, and check the round trip' },

        { kind: 'content', title: 'Lab — load, print, save', ratio: 0.62,
            a: { steps: [
                'Copy your list functions and `student_create()` from Weeks 05–06 into the starter',
                '`student_load()`: `fopen()` + `perror()`, a `fgets()` loop, `sscanf(line, "%d %19s %d", ...)`, range checks, errors with line numbers on `stderr`',
                '`student_print_all()` and `student_free_all()`',
                '`student_save()`: `fopen(path, "w")`, `fprintf()`, and a checked `fclose()`',
                'Round trip: load `students.txt`, save, load the saved file, `diff` the two',
            ], size: 16, rowH: 1.05 },
            b: { code: { file: '/assignments/week07-file-io/starter/students.txt', lines: [1, 7] }, lang: 'text', label: 'starter/students.txt' },
            notes: 'Task: assignments/week07-file-io/README.md. The provided students.txt has two bad lines on purpose; three students must be loaded.' },

        { kind: 'content', title: 'Test plan',
            a: { table: { head: ['#', 'Input', 'Expected'], colW: [0.6, 4.4, 7], size: 17, rows: [
                ['1', 'The provided `students.txt`', '3 students loaded; lines 5 and 6 reported on `stderr`'],
                ['2', 'A file name that does not exist', '`perror()` message, exit status 1'],
                ['3', 'An empty file', '0 students, and an output file with no student lines'],
                ['4', 'A name longer than 19 characters', 'No overflow: with `"%d %19s %d"` the line is reported as invalid'],
                ['5', 'The round trip', '`diff` prints nothing'],
            ] } } },

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: 'Duplicate IDs', body: 'Reject a line whose ID already appeared earlier in the file.' },
                { n: 2, h: 'make test', body: 'Add a `test` target to your starter Makefile that runs the round trip and the `diff`.' },
                { n: 3, h: 'Save and Load menus', body: 'Optional, not part of the final project spec: add them to your Week 08 program.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            '`stdin`, `stdout`, `stderr` are streams. Errors go to `stderr`, so redirection does not hide them',
            '`fopen()` can fail: check for `NULL`, call `perror()`. Every successful `fopen()` needs one `fclose()`',
            '`int c = fgetc(fp)`, never `char`. Test the read\'s return value, never `while (!feof(fp))`',
            'Read lines with `fgets()`, parse with `sscanf()`, check its return value, report `file:line: message`',
            'Save **data**, not pointers. Rebuild the list when loading',
            'Test with `< input.txt`, compare with `diff`, and let `make test` run it all',
        ], size: 18 },

        { kind: 'quiz', questions: [
            'Why does `./prog > out.txt` still show error messages on the terminal?',
            'What is wrong with `char c; while ((c = fgetc(fp)) != EOF)`?',
            'Why is `while (!feof(fp)) { fgets(...); ... }` wrong?',
            'What does `%31[^\\n]` read, and why use it for the title?',
            'Why can\'t we save the list by calling `fwrite()` on each `struct book`?',
        ] },

        { kind: 'answers', answers: [
            'Error messages go to `stderr`, and `>` redirects only `stdout`',
            '`c` must be an `int`: a `char` cannot hold every byte value plus `EOF`',
            '`feof()` turns true only after a read fails, so the body runs once more with stale data',
            'Up to 31 non-newline characters, spaces and commas included: the title is last and fits `char title[32]`',
            'It writes `list.next`/`list.prev`: heap addresses that mean nothing in the next run. Padding and layout differ too',
        ] },

        { kind: 'next', title: 'Week 08 — Final Project', sub: 'Everything is in place: structs, operators, the heap, circular lists, list_head, container_of(), and file I/O. Plus: building a program from several .c files.' },
    ],
};
