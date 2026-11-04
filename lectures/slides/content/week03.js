// Week 03 — Dynamic Memory and Singly Linked List
module.exports = {
    week: 3,
    dirName: 'week03-dynamic-memory-singly-list',
    title: 'Dynamic Memory and Singly Linked List',
    short: 'Dynamic Memory and Singly Linked List',
    subtitle: 'Stack and heap, malloc() and free(), ownership, and a singly linked list built from heap nodes',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'book_factory.c',
            code: { file: 'examples/book_factory.c', fn: 'book_destroy' },
            notes: 'Today: where variables live, why a function cannot return the address of a local, and how malloc() and free() give us objects whose lifetime we control. Then we chain those heap objects together: every node holds a pointer to the next one.' },


        { kind: 'objectives', title: 'Objectives: dynamic memory', items: [
            'Name the memory regions of a running program (code, data/bss, heap, stack) and what lives in each',
            'Explain the *lifetime* of a local variable and why returning its address is a bug',
            'Allocate a struct with `malloc()`, check for failure, and release it with `free()`',
            'Recognize the four classic heap bugs: leak, use-after-free, double free, missing `NULL` check',
            'Write a `create` / `destroy` pair and state who *owns* the object',
        ] },

        { kind: 'objectives', title: 'Objectives: singly linked list', items: [
            'Compare arrays and linked lists: memory layout, insert, delete, indexing',
            'Define a self-referential `struct node` and draw a list as boxes and arrows',
            'Traverse a list with a cursor and handle the empty list (`head == NULL`)',
            'Explain why `push_front()` needs `struct node **` (or must return the new head)',
            'Free an entire list without a use-after-free',
            'Identify every case that `delete` must handle',
        ] },

        { kind: 'review', title: 'Review of Week 02', questions: [
            'How is `*q++` grouped, and what does it change?',
            'Why is `if (flags & BOOK_DAMAGED == 0)` wrong?',
            'What do `(double)(7 / 2)` and `(double)7 / 2` evaluate to?',
            'Rewrite `if (p->id == id && p != NULL)` so that it cannot crash',
        ], today: 'Today\'s questions: so far every struct has been a local variable. **What happens to it when the function returns?** And once we can create objects at run time, **how do we keep track of them without an array?**' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — memory', kind: 'section', num: 1, label: 'PART 1', title: 'Where do variables live?', sub: 'Memory regions, storage duration, stack frames, dangling pointers' },

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
            why: ['A `book_create()` function must return an object that still exists after it returns, and a local cannot do that.', 'A user may add 3 students or 3,000, and the stack cannot size itself at run time. A linked list (Part 3) needs both.'],
            how: { code: `struct book *b = malloc(sizeof(*b));
/* ... use b, return it, pass it on ... */
free(b);   /* only now does it die */`, label: null },
            notes: 'The heap gives us memory whose lifetime we control. Both needs are exactly what a linked list has.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — malloc and free', kind: 'section', num: 2, label: 'PART 2', title: '`malloc()`, `free()`, and ownership', sub: 'The API, the idiom, the NULL check, the four classic bugs, who frees' },

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

        /* ---------------- Part 3 ---------------- */
        { newSection: 'Part 3 — nodes', kind: 'section', num: 3, label: 'PART 3', title: 'Nodes, links, and traversal', sub: 'Arrays vs. lists, the self-referential struct, the traversal loop' },

        { kind: 'concept', title: 'Linked list', layout: 'tb', ratio: 0.55,
            what: 'A **linked list** is a chain of separately allocated **nodes**. Each node holds its data and a pointer to the next node; a `head` pointer gives the first node, and the last node points to `NULL`. Unlike an array, the nodes can be anywhere in memory.',
            why: ['An array has a fixed size (or must be `realloc()`ed and copied), and inserting at the front shifts every element: O(n).', 'A list grows one node at a time and inserts or deletes in O(1) once you hold the right node, at the cost of O(n) indexing.'],
            how: { diagram: { type: 'chain', kind: 'singly', nodes: ['b0', 'b1', 'b2'] } },
            notes: 'Array: one contiguous block. Linked list: nodes anywhere on the heap, and each one knows the next. A list trades fast indexing for cheap insertion and deletion and unlimited growth. The next slide compares the costs.' },

        { kind: 'content', title: 'What each one costs',
            a: { table: { head: ['Operation', 'Array', 'Singly linked list'], colW: [5, 3.4, 3.6], rows: [
                ['Access the *i*-th element', 'O(1), `a[i]`', 'O(n), walk from `head`'],
                ['Insert / delete at the front', 'O(n), shift everything', '**O(1)**'],
                ['Insert / delete in the middle (position known)', 'O(n), shift', '**O(1)** given the previous node'],
                ['Size', 'Fixed, or `realloc()` + copy', 'Grows one node at a time'],
                ['Extra memory', 'None', 'One pointer per node'],
            ] } },
            foot: 'A list trades fast indexing for cheap insertion and deletion and unlimited growth.' },

        { kind: 'concept', title: 'The node and the head pointer', ratio: 0.58,
            what: 'A **node** is a struct that holds the data plus a `next` pointer to another node of the same type. The list itself is a pointer to the first node, called **`head`**: `head == NULL` means the list is empty, and the last node (the **tail**) has `next == NULL`.',
            why: ['A struct cannot contain itself (its size would be infinite), but it can contain a **pointer** to its own type.', 'Without `head` nothing refers to the first node, and without the `NULL` at the end a traversal would not know where to stop.'],
            how: { code: [{ file: 'examples/sll_book.c', struct: 'book' }, { file: 'examples/sll_book.c', struct: 'node' }] },
            notes: 'The assignment\'s starter uses the same shape with struct student data;. Week 01 previewed this self-referential struct; today we build the list.' },

        { kind: 'content', title: 'Building a list by hand', layout: 'tb', ratio: 0.42,
            a: { code: { file: 'examples/sll_manual.c', from: /struct node c =/, to: /struct node \*head = &a;/ } },
            b: { diagram: { type: 'chain', kind: 'singly', nodes: ['[1]', '[2]', '[3]'] } },
            notes: 'No malloc() yet, so we can focus on the links. Nodes are declared in reverse so each can point to the next.' },

        { kind: 'demo', title: 'Live demo: sll_manual.c', layout: 'tb', ratio: 0.45,
            a: { code: { file: 'examples/sll_manual.c', from: /for \(cur = head;/, to: /\(void \*\)cur->next\);/ } },
            b: { out: `node at 0x16f75e4c8: [1] The C Programming Language       next = 0x16f75e4f8
node at 0x16f75e4f8: [2] Understanding the Linux Kernel   next = 0x16f75e528
node at 0x16f75e528: [3] Linux Device Drivers             next = 0x0`, label: './sll_manual' },
            foot: 'Ask the class to draw this output as boxes and arrows, using the printed addresses.' },

        { kind: 'concept', title: 'Traversal with a cursor', layout: 'tb', ratio: 0.5,
            what: 'To **traverse** a list is to visit every node in order. A separate **cursor** pointer starts at `head` and follows `next` until it becomes `NULL`: `for (cur = head; cur != NULL; cur = cur->next)`.',
            why: ['Moving `head` itself (`head = head->next`) loses the start of the list.', 'With `cur != NULL`, an empty list runs the loop zero times. `cur->next != NULL` would skip the last node and crash on an empty list.'],
            how: { art: `step 1: cur = head        cur --> [1] --> [2] --> [3] --> NULL
step 2: cur = cur->next           [1] --> [2] <-- cur
step 3: cur = cur->next                   ... --> [3] <-- cur
step 4: cur = cur->next   cur == NULL -> loop ends` },
            notes: 'Use a separate cursor. For the empty list, head == NULL makes the loop run zero times, so traversal needs no special case.' },

        { kind: 'content', title: 'Traversal rules', ratio: 0.5,
            a: { bullets: [
                'Use a **separate cursor**: `head = head->next` in a loop loses the list',
                'Empty list: `head == NULL`, so the loop runs zero times. No special case',
                'The condition is `cur != NULL`, not `cur->next != NULL`: that skips the last node and crashes on an empty list',
            ] },
            b: { code: { file: 'examples/sll_book.c', fn: 'count_list' } },
            notes: 'In count_list, moving head is fine: the parameter is a copy of the caller\'s pointer (pass by value, Week 01).' },

        { kind: 'content', title: 'Printing, including the empty list', layout: 'tb', ratio: 0.68,
            a: { code: { file: 'examples/sll_book.c', fn: 'print_list' } },
            b: { bullets: [
                '`const struct node *`: printing only reads the list',
                'The empty case gets its own message, so an empty list is visible in tests',
                'The loop itself needs no special case',
            ] } },

        /* ---------------- Part 4 ---------------- */
        { newSection: 'Part 4 — insert, free, delete', kind: 'section', num: 4, label: 'PART 4', title: 'Insert, free, and the design of delete', sub: 'push_front, the head problem, push_back, free_list, search and delete' },

        { kind: 'content', title: 'Creating a node',
            a: { code: { file: 'examples/sll_book.c', fn: 'node_create', comment: true } },
            foot: 'Creating a node and linking it are **separate steps**. The final project does the same: `student_create()`, then `list_add()`.' },

        { kind: 'concept', title: 'Inserting at the front', layout: 'tb', ratio: 0.5,
            what: 'Inserting a node `n` at the front takes two steps, in this order. First `n->next = head` makes the new node point to the old first node; then `head = n` makes the list start at the new node. The cost is O(1), whatever the length of the list.',
            why: 'If the steps are swapped, `head = n` runs first; `n->next = head` then makes `n` point to itself, and the rest of the list is lost (and leaked).',
            how: { art: `before:              head --> [A] --> [B] --> NULL
                     n    --> [N]

1. n->next = head;   [N] --> [A] --> [B] --> NULL

2. head = n;         head --> [N] --> [A] --> [B] --> NULL` },
            notes: 'push_front() in sll_book.c does exactly these two lines. The next slides show why it takes struct node ** instead of struct node *.' },

        { kind: 'content', title: 'The head problem', ratio: 0.58,
            a: { code: `void push_front_wrong(struct node *head,
                      struct node *n)
{
    n->next = head;
    head = n;      /* changes the LOCAL copy only */
}

struct node *head = NULL;
push_front_wrong(head, n);   /* head is still NULL */`, label: null },
            b: { callout: [
                'This is `set_year_by_value()` from Week 01 again.',
                'The function received a **copy** of `head` and changed only the copy.',
                'There are two standard fixes: return the new head, or pass a pointer to the head.',
            ], kind: 'bad' } },

        { kind: 'concept', title: 'Pointer to pointer: `struct node **`', layout: 'tb', ratio: 0.5,
            what: 'A **pointer to pointer** holds the address of a pointer variable. Passing `&head` gives a function a `struct node **headp`, and `*headp` **is** the caller\'s `head`, so `*headp = n` changes it.',
            why: ['`push_front_wrong(head, n)` receives a copy of `head` and changes only the copy: the list in `main()` stays empty.', 'Every function that may change `head` (insert at the front, delete the first node) needs this, or must return the new head.'],
            how: { art: ` main()                          push_front()
 +----------------+              +----------------+
 | head  *--------+--> [A] ...   | headp *        |
 +--------^-------+              +-------|--------+
          +------------------------------+
          *headp IS main's head variable` },
            notes: 'struct node **headp = &head. Writing *headp writes main\'s head. Fix A (return the new head) is the alternative; the demo uses this one, Fix B.' },

        { kind: 'content', title: 'Fix A — return the new head', ratio: 0.5,
            a: { code: `struct node *push_front(struct node *head,
                        struct node *n)
{
    n->next = head;
    return n;
}

head = push_front(head, n);`, label: null },
            b: { bullets: [
                'The caller stores the result back into its own `head`',
                'Simple, but every caller must remember the assignment',
            ] } },

        { kind: 'content', title: 'Fix B — pass a pointer to the head', layout: 'tb', ratio: 0.6,
            a: { code: { file: 'examples/sll_book.c', fn: 'push_front', comment: true } },
            b: { callout: 'Call it as `push_front(&head, n);`. The demo uses Fix B because it scales to any function that may change `head`, including delete.' } },

        { kind: 'content', title: 'Insert at the back', ratio: 0.62,
            a: { code: `if (*headp == NULL) {        /* empty list */
    *headp = n;
} else {
    struct node *cur = *headp;
    while (cur->next != NULL)  /* stop AT the last */
        cur = cur->next;
    cur->next = n;
}`, label: null },
            b: { bullets: [
                'The straightforward version needs a special case for the empty list',
                'The new node becomes `head` when the list is empty',
                'Otherwise walk to the last node and link after it',
            ] } },

        { kind: 'concept', title: 'Walking the links: `struct node **link`', layout: 'tb', ratio: 0.43,
            what: 'Keep `link`, a pointer to **the pointer you might overwrite**: first `head`, then each node\'s `next`. `link = &(*link)->next` moves it on, and `*link = n` writes whichever pointer it reached.',
            why: 'A plain `push_back()` needs a special case for the empty list, where `head` itself must change. Walking the links treats `head` and every `next` alike: no special case.',
            how: { code: { file: 'examples/sll_book.c', fn: 'push_back' }, label: null },
            notes: '&(*link)->next parses as &((*link)->next) (Week 02). At the end of the loop, link points to the NULL slot: main\'s head for an empty list, otherwise the last node\'s next. The same trick removes the first-node special case from delete.' },

        { kind: 'concept', title: 'Freeing a whole list', layout: 'tb', ratio: 0.5,
            what: 'Every node was allocated with `malloc()`, so every node must be freed. Walk the list and, for each node, **save `next` first**, then `free()` the node and move on; at the end, set `head` to `NULL`.',
            why: ['The natural loop `for (...; cur = cur->next) free(cur);` reads `cur->next` **after** `cur` was freed: a use after free.', 'Without `*headp = NULL`, the caller\'s `head` still points into freed memory.'],
            how: { code: `while (cur != NULL) {
    next = cur->next;   /* save it BEFORE free() */
    free(cur);
    cur = next;
}
*headp = NULL;          /* no dangling head      */`, label: null },
            notes: 'free_list() in sll_book.c does exactly this. Freeing the list is the last call in main() from now on.' },

        { kind: 'demo', title: 'Live demo: sll_book.c', ratio: 0.55,
            a: { out: `(empty)
[1] The C Programming Language (1978)
[2] Understanding the Linux Kernel (2005)
[3] Linux Device Drivers (2005)
count = 3
(empty)`, label: './sll_book' },
            b: { callout: 'The demo uses `goto out_of_memory;` for error handling. One cleanup label at the end of a function keeps all the cleanup code in one place.' } },

        { kind: 'exercise', title: 'Search by ID: design it first', minutes: 5, ratio: 0.5,
            a: { code: `/* Returns the node whose data.id == id,
 * or NULL if there is none. */
struct node *find_by_id(struct node *head,
                        int id);`, label: null },
            b: { steps: [
                'What does it return for an empty list?',
                'Why return a `struct node *` and not a copy of the `struct book`?',
            ], size: 19, rowH: 1.1 },
            notes: 'Write it on paper before Lab C.' },

        { kind: 'concept', title: 'Deleting a node: unlink, then free', layout: 'tb', ratio: 0.5,
            what: 'Deleting takes two separate steps: **unlink** the node by making its predecessor point past it (`prev->next = cur->next`), then **free** it. A singly linked node does not know its predecessor, so the search keeps a `prev` pointer one step behind `cur`.',
            why: ['After `free(cur)` you may no longer read `cur->next`, so unlinking must come first.', 'The **first** node has no `prev`: `head` itself must change, so delete needs `struct node **headp` too.'],
            how: { art: `prev     cur
 v        v
[A] ---> [B] ---> [C] ---> NULL

prev->next = cur->next;      [A] -------------> [C] ---> NULL
free(cur);                         [B] (freed)` },
            notes: 'Stretch: the struct node **link trick from push_back removes the first-node special case from delete too. Try it after the two-pointer version works. The next slide lists every case delete must handle.' },

        { kind: 'content', title: 'Every case delete must handle',
            a: { table: { head: ['Case', 'What changes'], colW: [5, 7], rows: [
                ['List is empty', 'Nothing. Report "not found"'],
                ['ID is not in the list', 'Nothing. Report "not found"'],
                ['Target is the **first** node', '`head` itself must change: there is no `prev`'],
                ['Target is in the middle', '`prev->next = cur->next`'],
                ['Target is the last node', 'Same as the middle: `prev->next` becomes `NULL`'],
                ['Target is the **only** node', '`head` becomes `NULL`'],
            ] } } },

        { kind: 'concept', title: 'Flags are not prerequisites: `make -B`', layout: 'tb', ratio: 0.5,
            what: '`make` decides what to rebuild from **file timestamps** only. Changing `CFLAGS`, for example to add `-g` (debugging information for `gdb` or `lldb`), changes no file, so make sees nothing to do. `make -B` rebuilds everything regardless.',
            why: 'Without forcing the rebuild you keep running the old executable, built without the new flag, and the debugger cannot show your source lines. After changing flags, run `make clean && make` or `make -B`.',
            how: { term: [
                { cmd: 'make  # builds with the Makefile\'s CFLAGS' },
                { cmd: 'make CFLAGS="-Wall -Wextra -std=c11 -g"', out: "make: Nothing to be done for `all'." },
                { cmd: 'make -B CFLAGS="-Wall -Wextra -std=c11 -g"  # -B forces it' },
            ] },
            notes: 'make compares file timestamps only; it does not notice a change of flags. -g adds debugging information for a debugger: gdb on Linux, lldb on macOS.' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Week 03 assignments + bug hunt', sub: 'Lab A: Assignment 03A (dynamic memory)\nLab B: bug hunt\nLab C: Assignment 03B (singly linked list)\nStretch goals (optional)' },

        { kind: 'content', title: 'Lab A — Assignment 03A: dynamic memory',
            a: { steps: [
                '`cd assignments/week03-dynamic-memory-singly-list/starter && make && ./week03a`',
                'Allocate **one** `struct student` with `malloc()`',
                'Check for `NULL`; print an error and return non-zero on failure',
                'Store ID, name, and score through the pointer; bounded copy for the name (≤ 19 characters)',
                'Print the student',
                '`free()` it before `main()` returns; optionally set the pointer to `NULL`',
                'Build with zero warnings',
            ], cols: 2, size: 17, rowH: 1.3 },
            notes: 'Task: assignments/week03-dynamic-memory-singly-list/README.md' },

        { kind: 'content', title: 'Lab A — checklist',
            a: { cards: [
                { n: 1, h: '`malloc()`', body: 'The student is allocated with `malloc(sizeof(...))`.' },
                { n: 2, h: 'Failure handled', body: 'A `NULL` result prints an error and returns non-zero.' },
                { n: 3, h: 'Through the pointer', body: 'Every member is set and read with `->`.' },
                { n: 4, h: '`free()`', body: 'Called exactly once, before `main()` returns.' },
            ] } },

        { kind: 'exercise', title: 'Lab B — bug hunt', tag: 'BUG HUNT',
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

        { kind: 'content', title: 'Lab C — Assignment 03B: singly linked list',
            a: { steps: [
                'In `assignment_03b.c`, `node_create()`: allocate a node holding one student, with a `NULL` check',
                'Insert (`push_front()` or `push_back()`) and print three students',
                '`free_list()`. Call it at the end of `main()` from now on',
                'Search by ID. Print the found student, or `Not found`',
                'Delete by ID: find, unlink, free. Handle every case in the table',
            ], size: 19, rowH: 0.95 },
            notes: 'Task: assignments/week03-dynamic-memory-singly-list/README.md' },

        { kind: 'content', title: 'Lab C — test plan',
            a: { table: { head: ['#', 'Action', 'Expected'], colW: [0.6, 6, 5.4], size: 15, rows: [
                ['1', 'Print the empty list', 'an "empty" message, no crash'],
                ['2', 'Delete ID 1 from the empty list', '"not found", no crash'],
                ['3', 'Insert 1, 2, 3, then print', 'three students'],
                ['4', 'Search for 2, then for 99', 'found / not found'],
                ['5', 'Delete the first node, then print', 'two students, `head` updated'],
                ['6', 'Delete the last node, then print', 'one student'],
                ['7', 'Delete the only node, then print', 'empty list, `head == NULL`'],
                ['8', 'Free the list at exit', 'no use-after-free'],
            ] } } },

        { kind: 'content', title: 'Stretch goals — Assignment 03A', tag: 'OPTIONAL',
            a: { cards: [
                { n: 1, h: '`student_create()`', body: 'Write `student_create(int id, const char *name, int score)` and `student_destroy()`, following `book_create()`.' },
                { n: 2, h: 'Live-object counter', body: 'Create two students and confirm the counter is `0` at exit.' },
                { n: 3, h: 'Reject bad input', body: 'Return `NULL` for a score outside 0–100, and handle it in `main()`.' },
            ] } },

        { kind: 'content', title: 'Stretch goals — Assignment 03B', tag: 'OPTIONAL',
            a: { cards: [
                { n: 1, h: 'Delete with `**link`', body: 'No special case for the first node.' },
                { n: 2, h: '`insert_sorted()`', body: 'Keep the list ordered by ID.' },
                { n: 3, h: '`reverse_list()`', body: 'Reverse in place by changing only `next` pointers.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', title: 'Key takeaways: dynamic memory', items: [
            'Locals live on the **stack** and die when their function returns. Never return their address',
            'Heap memory from `malloc()` lives until **you** call `free()`',
            '`malloc(sizeof(*p))`, check for `NULL`, initialize every member, and `free()` exactly once',
            'Every heap object has one **owner**. Write the ownership contract in a comment',
            '`free()` does not reset your pointer. Set it to `NULL` yourself',
        ] },

        { kind: 'takeaways', title: 'Key takeaways: singly linked list', items: [
            'A list is nodes connected by `next`. `head == NULL` means empty; the last `next` is `NULL`',
            'Traverse with a separate cursor: `for (cur = head; cur != NULL; cur = cur->next)`',
            'A function that may change `head` needs `struct node **` (or must return the new head)',
            'When freeing, save `next` **before** `free()`',
            'Delete handles empty, not-found, first, middle, last, and only-node cases. Week 04 removes the first/last/only-node cases',
        ] },

        { kind: 'quiz', title: 'Exit quiz: dynamic memory', questions: [
            'Where does the pointer variable `b` live in `struct book *b = malloc(sizeof(*b));`? Where does the book live?',
            'What is wrong with `malloc(sizeof(b))`?',
            'Is `free(NULL)` an error?',
            'After `free(p);`, what value does `p` hold?',
            'Why is it fine for `book_create()` to return a pointer, but not for `make_book_bad()`?',
        ] },

        { kind: 'answers', title: 'Exit quiz: dynamic memory — answers', answers: [
            '`b` is a local variable on the stack. The book it points to is on the heap',
            'It allocates the size of a pointer (typically 8 bytes), not of a `struct book`',
            'No. `free(NULL)` does nothing',
            'The same address as before: a *dangling* pointer. Set it to `NULL`',
            '`book_create()` returns heap memory, which lives until `free()`; `make_book_bad()` returns a dead stack address',
        ] },

        { kind: 'quiz', title: 'Exit quiz: singly linked list', questions: [
            'What is the time cost of reaching the 1000th node of a list?',
            'Why does `push_front_wrong(head, n)` leave `main()`\'s `head` unchanged?',
            'What is wrong with `for (cur = head; cur != NULL; cur = cur->next) free(cur);`?',
            'Which delete cases change `head`?',
            'In `push_back()` with `struct node **link`, what does `link` point to when the list is empty?',
        ] },

        { kind: 'answers', title: 'Exit quiz: singly linked list — answers', answers: [
            'O(n): you must follow 999 `next` pointers from `head`',
            'The function received a copy of `head` and changed only the copy',
            '`cur = cur->next` reads from `cur` after it was freed: use after free',
            'Deleting the first node, which includes deleting the only node',
            'To `main()`\'s `head` variable itself, so `*link = n` sets `head`',
        ] },

        { kind: 'next', title: 'Week 04 — Doubly Linked and Circular Lists', sub: 'A singly linked list only goes forward, and deleting a node means finding its predecessor. What if every node also knew the node before it?' },
    ],
};
