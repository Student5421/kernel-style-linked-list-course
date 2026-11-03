// Week 03 — Dynamic Memory
module.exports = {
    week: 3,
    dirName: 'week03-dynamic-memory',
    title: 'Dynamic Memory',
    short: 'Dynamic Memory',
    subtitle: 'Stack, heap, malloc() and free(), and who owns what',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'book_factory.c',
            code: { file: 'examples/book_factory.c', fn: 'book_destroy' },
            notes: 'Today: where variables live, why a function cannot return the address of a local, and how malloc() and free() give us objects whose lifetime we control.' },

        { kind: 'agenda', plan: [
            ['0:00', '0:10', 'Review of Week 02', 'review', 'Review'],
            ['0:10', '0:55', 'Part 1 — Where do variables live?', 'lecture', 'Part 1'],
            ['0:55', '1:05', 'Break', 'break', 'Break'],
            ['1:05', '1:50', 'Part 2 — `malloc()`, `free()`, and ownership', 'lecture', 'Part 2'],
            ['1:50', '2:50', 'Lab — Week 03 assignment + bug hunt', 'lab', 'Lab'],
            ['2:50', '3:00', 'Wrap-up and exit quiz', 'wrap', 'Quiz'],
        ] },

        { kind: 'objectives', items: [
            'Name the memory regions of a running program (code, data/bss, heap, stack) and what lives in each',
            'Explain the *lifetime* of a local variable and why returning its address is a bug',
            'Allocate a struct with `malloc()`, check for failure, and release it with `free()`',
            'Recognize the four classic heap bugs: leak, use-after-free, double free, missing `NULL` check',
            'Write a `create` / `destroy` pair and state who *owns* the object',
        ] },

        { kind: 'review', title: 'Review of Week 02', questions: [
            'How is `*q++` grouped, and what does it change?',
            'Why is `if (flags & BOOK_DAMAGED == 0)` wrong?',
            'What do `(double)(7 / 2)` and `(double)7 / 2` evaluate to?',
            'Rewrite `if (p->id == id && p != NULL)` so that it cannot crash',
        ], today: 'Today\'s question: so far every struct has been a local variable. **What happens to it when the function returns?**' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — memory', kind: 'section', num: 1, label: 'PART 1 · 45 MIN', title: 'Where do variables live?', sub: 'Memory regions, storage duration, stack frames, dangling pointers' },

        { kind: 'concept', title: 'Memory regions of a process', ratio: 0.5,
            what: 'A running program\'s memory is divided into **regions**. **text** holds the machine code, **data/bss** hold globals and `static` variables, the **heap** holds memory from `malloc()`, and the **stack** holds locals and parameters, growing down with each call.',
            why: 'The regions differ in **lifetime**, and lifetime decides whether a pointer is still valid. Without this picture you cannot tell why returning the address of a local is a bug while returning a `malloc()`ed pointer is fine.',
            how: { diagram: { type: 'regions', high: 'high addresses', low: 'low addresses', boxW: 2.2, regions: [
                { name: 'stack', desc: 'locals, parameters; grows down', kind: 'stack' },
                { name: '', desc: '', kind: 'gap' },
                { name: 'heap', desc: '`malloc()` / `free()`', kind: 'heap' },
                { name: 'data / bss', desc: 'globals, `static`' },
                { name: 'text', desc: 'machine code' },
            ] } },
            notes: 'Exact addresses differ between machines and between runs. What is the same everywhere is that different regions have different lifetimes. The memory_map demo prints one address from each region.' },

        { kind: 'concept', title: 'Storage duration', layout: 'tb', ratio: 0.5,
            what: 'Every object has a **storage duration**: how long it exists. **Automatic** objects (locals) live until their block ends, **static** objects (globals and `static` locals) live for the whole program, and **allocated** objects live from `malloc()` until `free()`.',
            why: 'Using an object after its lifetime has ended is undefined behavior. Only allocated storage has a lifetime that **you** control, which is exactly what a list of an unknown number of objects needs.',
            how: { table: { head: ['Storage', 'Example', 'Created', 'Destroyed', 'Managed by'], colW: [2.4, 3, 2.4, 2.4, 1.8], size: 14, rows: [
                ['**Automatic** (stack)', '`int x;` inside a function', 'when the block is entered', 'when the block is left', 'the compiler'],
                ['**Static** (data/bss)', 'globals, `static int x;`', 'before `main()` starts', 'when the program ends', 'the compiler'],
                ['**Allocated** (heap)', '`malloc(...)`', 'when you call `malloc()`', 'when you call `free()`', '**you**'],
            ] } },
            notes: 'Three kinds of storage duration. Automatic and static storage are managed by the compiler; allocated storage is managed by you.' },

        { kind: 'content', title: 'Where each variable lives',
            a: { code: [
                { file: 'examples/memory_map.c', from: /^int global_counter/, to: /^int global_zero/ },
                { file: 'examples/memory_map.c', from: /static int static_local/, to: /int \*heap = malloc/ },
            ] },
            notes: 'The pointer variable heap is a local on the stack; the int it points to is on the heap.' },

        { kind: 'demo', title: 'Live demo: memory_map.c', layout: 'tb', ratio: 0.68,
            a: { out: `data  : &global_counter = 0x102b34000
bss   : &global_zero    = 0x102b34008
data  : &static_local   = 0x102b34004
heap  : heap            = 0x103331520
stack : &local          = 0x16d2d2568
stack : &heap           = 0x16d2d2560   (the pointer itself is on the stack)
each call gets its own stack frame:
  depth 1: &local = 0x16d2d2538
  depth 2: &local = 0x16d2d2508
  depth 3: &local = 0x16d2d24d8`, label: './memory_map' },
            b: { bullets: [
                'The `heap` **pointer variable** is on the stack; the `int` **it points to** is on the heap',
                'Each recursive call has its own `local`, at a lower address each time: the stack grows down',
            ] } },

        { kind: 'concept', title: 'Stack frames', layout: 'tb', ratio: 0.39,
            what: 'Each call gets a **stack frame** for its parameters and locals. On return the frame is popped: the memory is not erased, but it **no longer belongs to you**.',
            why: 'A pointer into a returned frame still holds an address and looks valid, but the next call reuses those bytes and overwrites the object.',
            how: { art: ` main() calls make_book_bad()            make_book_bad() returns
 +---------------------+                 +---------------------+
 | make_book_bad frame |                 |  (dead memory -     |
 |   struct book b     | <-- &b          |   reused by the     |
 +---------------------+                 |   next call)        |
 | main frame          |                 +---------------------+
 |   struct book *p    |                 | main frame          |
 +---------------------+                 |   p ------------> ??? (dangling)
                                         +---------------------+` },
            notes: 'When a function returns, its frame is popped. The memory_map demo showed each recursive call getting its own frame at a lower address.' },

        { kind: 'concept', title: 'Dangling pointers', layout: 'tb', ratio: 0.48,
            what: 'A **dangling pointer** still holds the address of an object whose lifetime has ended: a local of a function that has returned, or heap memory that has been freed. The address looks valid, but nothing lives there anymore.',
            why: ['`make_book_bad()` returns `&b`, and `b` dies on return: using `p->id` afterwards may print 1, print garbage, or crash.', 'Compilers warn about this case: clang `-Wreturn-stack-address`, gcc `-Wreturn-local-addr`.'],
            how: { code: { file: 'examples/dangling_local.c', fn: 'make_book_bad' } },
            notes: 'Using p->id after make_book_bad() returns is undefined behavior. dangling_local.c is built by hand on purpose so students can read the warning.' },

        { kind: 'concept', title: 'The heap', ratio: 0.5,
            what: 'The **heap** is the region where a program creates objects at run time with `malloc()` and destroys them with `free()`. A heap object lives until **you** free it, no matter which function created it.',
            why: ['A `book_create()` function must return an object that still exists after it returns, and a local cannot do that.', 'A user may add 3 students or 3,000, and the stack cannot size itself at run time. A linked list (Week 04) needs both.'],
            how: { code: `struct book *b = malloc(sizeof(*b));
/* ... use b, return it, pass it on ... */
free(b);   /* only now does it die */`, label: null },
            notes: 'The heap gives us memory whose lifetime we control. Both needs are exactly what a linked list has.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — malloc and free', kind: 'section', num: 2, label: 'PART 2 · 45 MIN', title: '`malloc()`, `free()`, and ownership', sub: 'The API, the idiom, the NULL check, the four classic bugs, who frees' },

        { kind: 'concept', title: '`malloc()`, `calloc()`, and `free()`', layout: 'tb', ratio: 0.5,
            what: '`malloc(size)` reserves `size` bytes on the heap and returns a `void *` to them, which converts to any object pointer without a cast. `calloc(n, size)` does the same for `n` elements and zeroes them. `free(p)` gives the memory back; `free(NULL)` does nothing.',
            why: ['These are the only way to get memory whose lifetime you control.', 'The memory from `malloc()` contains **garbage** until you write to it, and `malloc()` can **fail** and return `NULL`: both must be handled.'],
            how: { code: `#include <stdlib.h>

void *malloc(size_t size);               /* size bytes, NOT initialized, or NULL */
void *calloc(size_t count, size_t size); /* count*size bytes, all ZERO, or NULL  */
void  free(void *ptr);                   /* release; free(NULL) does nothing     */`, label: null },
            notes: 'malloc() returns void *, a pointer to anything. In C it converts to any object pointer type without a cast.' },

        { kind: 'concept', title: 'The allocation idiom: `sizeof(*p)`', layout: 'tb', ratio: 0.5,
            what: '`malloc(sizeof(*b))` asks for "the size of whatever `b` points to". `sizeof` does not evaluate its operand, so this is safe even before `b` has a value, and it stays correct if the type of `b` changes.',
            why: ['The common mistake `malloc(sizeof(b))` asks for the size of a **pointer** (8 bytes), not of a book, so the program then writes past the block.', '`sizeof(struct book)` is also correct, but must be updated by hand if the type changes.'],
            how: { code: `struct book *b = malloc(sizeof(*b));   /* RIGHT: the size of a book    */
struct book *b = malloc(sizeof(b));    /* WRONG: the size of a pointer */`, label: null },
            notes: 'sizeof(*b) means the size of whatever b points to. sizeof does not dereference b, so this is safe even though b is not initialized yet.' },

        { kind: 'concept', title: 'Allocation failure: check for `NULL`', ratio: 0.46,
            what: 'When `malloc()` cannot find enough memory it returns `NULL` instead of a pointer. Every call must be followed by a check that reports the error and then stops or cleans up.',
            why: 'Without the check, the next line `b->id = 1;` dereferences `NULL` and the program crashes. Failure is rare on a laptop but not on embedded systems or in the kernel, so checking is a habit, not an optimization.',
            how: { code: { file: 'examples/malloc_basics.c', from: /^\s*b = malloc\(sizeof\(\*b\)\);/, to: /^\s*}/ } },
            notes: 'Allocation failure is rare on a laptop. It is not rare on embedded systems or in the kernel, and dereferencing NULL crashes the program.' },

        { kind: 'content', title: 'What it looks like in memory',
            a: { art: `        stack                                heap
 +---------------------+          +-----------------------------------+
 | b = 0x103331520     | -------> | id | title[32]           | year   |
 +---------------------+          +-----------------------------------+
   (dies at end of main)            (lives until free(b))` } },

        { kind: 'demo', title: 'Live demo: malloc_basics.c', layout: 'tb', ratio: 0.68,
            a: { code: { file: 'examples/malloc_basics.c', from: /one struct: the memory is NOT initialized/, to: /^\s*b = NULL;/ } },
            b: { out: `*number = 42
book: [1] Modern Operating Systems (2014)
scores[0] = 0   ...   scores[4] = 0`, label: './malloc_basics' },
            notes: 'The same file also allocates one int and a zeroed array with calloc(), each followed by free().' },

        { kind: 'content', title: '`calloc()`: n zeroed elements', ratio: 0.6,
            a: { code: { file: 'examples/malloc_basics.c', from: /n ints, all zero: calloc/, to: /^\s*free\(scores\);/ } },
            b: { bullets: [
                'The count `n` can be decided at run time',
                '`calloc()` zeroes the memory; `malloc()` does not',
                'Same rules: check for `NULL`, `free()` exactly once',
                '`free(NULL)` is allowed and does nothing',
            ] } },

        { kind: 'content', title: 'After `free()`', ratio: 0.55,
            a: { code: `free(b);
/* b still holds the old address,
   but the memory is no longer yours */
b = NULL;   /* NULL fails loudly;
               dangling fails randomly */`, label: null },
            b: { bullets: [
                '`free()` does **not** change your pointer variable',
                'It cannot: it received a copy of the address (pass by value, Week 01)',
                'Set the pointer to `NULL` yourself',
            ] } },

        { kind: 'concept', title: 'Memory leak', layout: 'tb', ratio: 0.52,
            what: 'A **memory leak** is heap memory that is still allocated but that no pointer refers to anymore, so it can never be freed. It usually happens when a pointer is overwritten, or goes out of scope, before `free()`.',
            why: 'Each leaked block stays allocated until the program ends. A long-running program that leaks inside a loop, such as a menu that adds and deletes students, uses more and more memory until it fails.',
            how: { code: `b = malloc(sizeof(*b));
b = malloc(sizeof(*b));   /* the first block is now unreachable: leaked */`, label: null },
            notes: 'The bug-hunt program in the lab contains exactly this: b = malloc(...); b = a;.' },

        { kind: 'concept', title: 'Use after free', layout: 'tb', ratio: 0.52,
            what: 'A **use after free** reads or writes heap memory through a pointer after that memory was passed to `free()`. The pointer still holds the old address: it is dangling.',
            why: 'It is undefined behavior: the program may seem to work, print garbage, or crash later in unrelated code, because the allocator may already have reused the block. These bugs are among the hardest to find.',
            how: { code: `free(b);
printf("%d\\n", b->id);   /* use after free */

free(b);
b = NULL;                 /* a later mistake now fails loudly */`, label: null },
            notes: 'free() does not change the pointer variable. Setting it to NULL turns a silent use after free into an immediate crash.' },

        { kind: 'concept', title: 'Double free', layout: 'tb', ratio: 0.52,
            what: 'A **double free** passes the same block to `free()` twice. It often happens when two pointers refer to the same block and both are freed, or when cleanup code runs twice.',
            why: 'It is undefined behavior that usually corrupts the allocator\'s bookkeeping, so the program aborts, or crashes later in an unrelated `malloc()`. Clear ownership (one owner frees exactly once) prevents it.',
            how: { code: `b = a;        /* two pointers, one block */
free(a);
free(b);      /* double free */`, label: null },
            notes: 'free(NULL) is allowed, which is one more reason to set a pointer to NULL after freeing it.' },

        { kind: 'content', title: 'The four classic heap bugs',
            a: { table: { head: ['Bug', 'Code', 'What happens'], colW: [2.5, 4.6, 5], size: 15, rows: [
                ['**Memory leak**', '`b = malloc(...); b = malloc(...);`', 'The first block can never be freed; memory use grows'],
                ['**Use after free**', '`free(b); printf("%d", b->id);`', 'Undefined behavior: may "work", print garbage, or crash later'],
                ['**Double free**', '`free(b); free(b);`', 'Undefined behavior: often corrupts the allocator and aborts'],
                ['**Missing `NULL` check**', '`b = malloc(...); b->id = 1;`', 'Crash when allocation fails'],
            ] } } },

        { kind: 'concept', title: 'Buffer overflow', layout: 'tb', ratio: 0.52,
            what: 'A **buffer overflow** writes past the end of an array. `strcpy(b->title, s)` copies until `s` ends, however small `title` is; a bounded copy such as `snprintf(b->title, sizeof(b->title), "%s", s)` never writes more than the array holds.',
            why: 'The extra bytes overwrite whatever lies next in memory: other members, other heap blocks, or the allocator\'s own data, so the crash, if any, happens somewhere else. A related bug is reading memory that was never initialized: `malloc()` returns garbage.',
            how: { code: `strcpy(b->title, very_long_string);               /* overflows title[32] */

snprintf(b->title, sizeof(b->title), "%s", s);    /* bounded copy        */`, label: null },
            notes: 'Assign every member after malloc(), or use calloc(). In the book_factory demo, a 47-character title is safely truncated to 31 characters.' },

        { kind: 'concept', title: 'Ownership: who calls `free()`?', layout: 'tb', ratio: 0.52,
            what: 'Every heap object has exactly one **owner**: the piece of code responsible for freeing it, exactly once. A function that allocates states the contract in a comment: who receives the object, and who must free it.',
            why: 'Without a clear owner, either nobody frees the object (a leak) or two parts of the program both free it (a double free). The final project splits the work: `student_create()` allocates, `list_del()` only unlinks, `student_delete()` frees.',
            how: { code: `/* Returns a new heap-allocated book, or NULL if out of memory.
 * The caller owns the result and must call book_destroy() on it. */
static struct book *book_create(int id, const char *title, int year);`, label: 'book_factory.c' },
            notes: 'Every heap object needs exactly one owner: the code responsible for freeing it exactly once. Write the contract as a comment for every function that allocates.' },

        { kind: 'concept', title: 'A `create` / `destroy` pair', ratio: 0.5,
            what: 'A **create** function allocates an object, fills in every member, and returns it; the matching **destroy** function releases it. Together they keep every `malloc()` and `free()` for one type in one place.',
            why: ['Without the pair, `malloc()` and `free()` calls are scattered through the program, and checking that each is matched is hard.', 'Returning heap memory from `book_create()` is fine: a heap object lives on after the function returns.'],
            how: { code: `struct book *a = book_create(1, "K&R", 1978);
if (a == NULL)
    return EXIT_FAILURE;
book_print(a);
book_destroy(a);     /* exactly once */`, label: null },
            notes: 'When you read book_create(), look for the matching book_destroy(). The live counter on the next slide checks that every create is matched.' },

        { kind: 'concept', title: 'Finding leaks with a live-object counter', ratio: 0.5,
            what: 'A **live-object counter** is a variable that `create` increments and `destroy` decrements. Printing it at the end of `main()` shows how many objects were never destroyed.',
            why: 'Leaks are silent: the program prints the right output and exits normally, so a missing `free()` goes unnoticed. A count of `0` at exit means every create had a matching destroy, with no extra tools.',
            how: { out: `[1] The C Programming Language (1978)
[2] A title that is far too long to (2024)
live books: 2
live books at exit: 0`, label: './book_factory' },
            notes: 'live_books is incremented in book_create() and decremented in book_destroy(). Book 2\'s title was truncated safely to 31 characters by snprintf().' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB · 60 MIN', title: 'Week 03 assignment + bug hunt', sub: 'Lab A: the assignment (30 min)\nLab B: bug hunt (20 min)\nLab C: stretch goals (10 min, optional)' },

        { kind: 'content', title: 'Lab A — Week 03 assignment', tag: '30 MIN',
            a: { steps: [
                '`cd assignments/week03-dynamic-memory/starter && make && ./week03`',
                'Allocate **one** `struct student` with `malloc()`',
                'Check for `NULL`; print an error and return non-zero on failure',
                'Store ID, name, and score through the pointer; bounded copy for the name (≤ 19 characters)',
                'Print the student',
                '`free()` it before `main()` returns; optionally set the pointer to `NULL`',
                'Build with zero warnings',
            ], cols: 2, size: 17, rowH: 1.3 },
            notes: 'Task: assignments/week03-dynamic-memory/README.md' },

        { kind: 'content', title: 'Lab A — checklist',
            a: { cards: [
                { n: 1, h: '`malloc()`', body: 'The student is allocated with `malloc(sizeof(...))`.' },
                { n: 2, h: 'Failure handled', body: 'A `NULL` result prints an error and returns non-zero.' },
                { n: 3, h: 'Through the pointer', body: 'Every member is set and read with `->`.' },
                { n: 4, h: '`free()`', body: 'Called exactly once, before `main()` returns.' },
            ] } },

        { kind: 'exercise', title: 'Lab B — bug hunt', tag: 'BUG HUNT · 20 MIN',
            intro: 'Same `struct book` as before. This compiles, but has **six** memory bugs. Name each one (§2.2 and the four-bugs table) and fix it, on paper first.',
            a: { code: `int main(void)
{
    struct book *a = malloc(sizeof(a));
    struct book *b;

    a->id = 1;
    strcpy(a->title, "Structure and Interpretation of Computer Programs");
    a->year = 1985;

    b = malloc(sizeof(*b));
    b = a;

    free(a);
    printf("%d %s\\n", b->id, b->title);
    free(b);
    return 0;
}`, label: null } },

        { kind: 'answer', title: 'Lab B — bug hunt',
            a: { steps: [
                '`malloc(sizeof(a))` allocates the size of a **pointer**. Use `sizeof(*a)`',
                'No `NULL` check after either `malloc()`',
                '`strcpy()` of a 49-character title into `char title[32]`: **buffer overflow**. Use `snprintf()`',
                '`b = malloc(...); b = a;` **leaks** the block allocated for `b`',
                '`free(a)` then `b->id`: **use after free**, because `b` and `a` point to the same block',
                '`free(b)` after `free(a)`: **double free** of that same block',
            ], kind: 'good', size: 18, rowH: 0.88 } },

        { kind: 'content', title: 'Lab C — stretch goals', tag: 'OPTIONAL',
            a: { cards: [
                { n: 1, h: '`student_create()`', body: 'Write `student_create(int id, const char *name, int score)` and `student_destroy()`, following `book_create()`.' },
                { n: 2, h: 'Live-object counter', body: 'Create two students and confirm the counter is `0` at exit.' },
                { n: 3, h: 'Reject bad input', body: 'Return `NULL` for a score outside 0–100, and handle it in `main()`.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            'Locals live on the **stack** and die when their function returns. Never return their address',
            'Heap memory from `malloc()` lives until **you** call `free()`',
            '`malloc(sizeof(*p))`, check for `NULL`, initialize every member, and `free()` exactly once',
            'Every heap object has one **owner**. Write the ownership contract in a comment',
            '`free()` does not reset your pointer. Set it to `NULL` yourself',
        ] },

        { kind: 'quiz', questions: [
            'Where does the pointer variable `b` live in `struct book *b = malloc(sizeof(*b));`? Where does the book live?',
            'What is wrong with `malloc(sizeof(b))`?',
            'Is `free(NULL)` an error?',
            'After `free(p);`, what value does `p` hold?',
            'Why is it fine for `book_create()` to return a pointer, but not for `make_book_bad()`?',
        ] },

        { kind: 'answers', answers: [
            '`b` is a local variable on the stack. The book it points to is on the heap',
            'It allocates the size of a pointer (typically 8 bytes), not of a `struct book`',
            'No. `free(NULL)` does nothing',
            'The same address as before: a *dangling* pointer. Set it to `NULL`',
            '`book_create()` returns heap memory, which lives until `free()`; `make_book_bad()` returns a dead stack address',
        ] },

        { kind: 'next', title: 'Week 04 — Singly Linked List', sub: 'We can create as many objects as we like at run time. How do we keep track of them without an array? Every object holds a pointer to the next one.' },
    ],
};
