// Week 06 — offsetof() and container_of()
module.exports = {
    week: 6,
    dirName: 'week06-container-of',
    title: '`offsetof()` and `container_of()`',
    short: 'offsetof() and container_of()',
    subtitle: 'Struct layout, pointer arithmetic, and getting the object back from its links',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'container_of_demo.c',
            code: [
                { file: 'examples/container_of_demo.c', struct: 'book' },
                `b = container_of(ptr, struct book,
                 borrowed);`,
            ],
            notes: 'Today we open last week\'s black box. By the end, every token of this macro is explained.' },


        { kind: 'objectives', items: [
            'Predict member offsets and `sizeof` of a struct, including padding, and confirm them with `offsetof()`',
            'Explain why pointer arithmetic is scaled, and why byte offsets require a `char *`',
            'Derive `container_of()` from first principles and explain every token of the macro',
            'Explain why `container_of()` must be a macro, and why each parameter is parenthesized',
            'Use and write `list_entry()`, `list_for_each()`, and `list_for_each_safe()`',
        ] },

        { kind: 'review', title: 'Review of Week 05', questions: [
            'In an intrusive list, what does `pos->next` point to: the next object, or something inside it?',
            'Why can\'t the assignment\'s `struct student` use a first-member cast?',
            'Why is `free(pos)` wrong inside a traversal?',
        ], today: 'Today we open last week\'s black box: **what is `offsetof`, why `char *`, and how do we write it once for every type and member?**' },

        { kind: 'content', title: 'Last week\'s black box', layout: 'tb', ratio: 0.45,
            a: { code: { file: '/lectures/week05-intrusive-list/examples/intrusive_book.c', fn: 'book_from_list', comment: true }, label: 'intrusive_book.c (Week 05)' },
            b: { bullets: [
                'What is `offsetof`, and where does the number 40 come from?',
                'Why the cast to `char *` before subtracting?',
                'How do we write this **once** for every type and every member?',
            ] },
            notes: 'Week 05 used this helper as a black box. Today we answer the three questions on the slide, then replace every helper like it with one macro.' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Layout', kind: 'section', num: 1, label: 'PART 1', title: 'Struct layout, `offsetof()`, and pointer arithmetic', sub: 'Offsets, alignment and padding, scaled pointer arithmetic' },

        { kind: 'demo', title: 'Live demo: layout.c', ratio: 0.42,
            a: { code: { file: 'examples/layout.c', struct: 'book' } },
            b: { out: `struct book: sizeof = 56, alignment of list_head = 8
  id         offset  0  size  4
  title      offset  4  size 32
  year       offset 36  size  4
  list       offset 40  size 16`, label: './layout' },
            notes: 'Run layout.c. Every member of a struct lives at a fixed offset: a number of bytes from the start of the struct.' },

        { kind: 'concept', title: 'Member offsets', layout: 'tb', ratio: 0.5,
            what: 'Every member of a struct lives at a fixed **offset**: a number of bytes from the start of the struct. The offset is the same for every object of that type, so `list` is always 40 bytes after the start of a `struct book`.',
            why: 'Traversal hands us a pointer to the `list` member, not to the book. Only because that distance is fixed can we step back from the member to the start of the book; without fixed offsets, `container_of()` could not exist.',
            how: { diagram: { type: 'layout', title: 'struct book   (sizeof == 56)', fields: [
                { name: 'id', size: 4 }, { name: 'title[32]', size: 32 }, { name: 'year', size: 4 }, { name: 'list', size: 16, hl: true },
            ] } },
            notes: 'Every member of a struct lives at a fixed offset, a number of bytes from the start of the struct. The offset is the same for every object of that type. This fixed distance is the whole trick behind container_of(): if we know where list is, we know where the book starts.' },

        { kind: 'concept', title: 'Alignment and padding', ratio: 0.52,
            what: 'Most types must be stored at an address that is a multiple of their **alignment**: `int` at multiples of 4, pointers at multiples of 8 on a 64-bit machine. To satisfy this, the compiler inserts unused **padding** bytes between members and at the end.',
            why: 'Without knowing about padding you predict the wrong offsets and the wrong `sizeof`. Three members take 12 bytes or 8 depending only on their order, and `list` in `struct student` sits at 32, not 28.',
            how: { code: `struct padded {      /* sizeof == 12 */
    char a;
    int b;
    char c;
};

struct reordered {   /* sizeof == 8 */
    int b;
    char a;
    char c;
};`, label: 'layout.c' },
            notes: 'Most types must be stored at an address that is a multiple of their alignment. To satisfy this, the compiler inserts unused padding bytes. The next slide draws both structs to scale.' },
        { kind: 'content', title: 'Padding, drawn to scale',
            intro: 'The same three members in a different order: 12 bytes versus 8. Dashed boxes are padding.',
            a: { diagram: { type: 'layouts', items: [
                { title: 'struct padded { char a; int b; char c; };      sizeof == 12', fields: [
                    { name: 'a', size: 1 }, { pad: true, size: 3 }, { name: 'b', size: 4 }, { name: 'c', size: 1 }, { pad: true, size: 3 },
                ] },
                { title: 'struct reordered { int b; char a; char c; };   sizeof == 8', w: 8.09, fields: [
                    { name: 'b', size: 4 }, { name: 'a', size: 1 }, { name: 'c', size: 1 }, { pad: true, size: 2 },
                ] },
            ] } },
            notes: 'Same three members, different order, different size. Both bars use the same scale: 12 bytes versus 8 bytes.' },

        { kind: 'content', title: 'The padding rules, informally',
            a: { cards: [
                { n: 1, h: 'Own alignment', body: 'Each member starts at a multiple of its own alignment.' },
                { n: 2, h: 'Whole struct', body: 'The total size is a multiple of the largest member alignment, so arrays of the struct stay aligned.' },
                { n: 3, h: 'Never first', body: 'There is **never** padding before the first member (Week 05, §2.2).' },
            ] } },

        { kind: 'exercise', minutes: 3, title: 'Predict the offsets', ratio: 0.5,
            a: { code: { file: '/assignments/week08-final-project/starter/student.h', struct: 'student' }, label: 'student.h' },
            b: { bullets: [
                'On a 64-bit machine, where does each member start?',
                'What is `sizeof(struct student)`?',
                'Then check with `printf` and `offsetof()`',
            ] },
            notes: 'Give students three minutes. Ask for a show of hands for "list is at 28" before revealing the answer.' },

        { kind: 'answer', title: 'Predict the offsets', layout: 'tb', ratio: 0.5,
            a: { diagram: { type: 'layout', title: 'struct student   (64-bit, sizeof == 48)', fields: [
                { name: 'id', size: 4 }, { name: 'name[20]', size: 20 }, { name: 'score', size: 4 }, { pad: true, size: 4 }, { name: 'list', size: 16, hl: true },
            ] } },
            b: { bullets: [
                '**4 bytes of padding** before `list`: it holds pointers, so it must be 8-byte aligned',
                'On a 32-bit machine pointers are 4 bytes: `list` is at 28 and `sizeof == 36`',
                'This is why we **never hard-code offsets**: ask the compiler with `offsetof()`',
            ] } },

        { kind: 'concept', title: '`offsetof()`', ratio: 0.46,
            what: '`offsetof(type, member)` is a standard macro from `<stddef.h>`. It gives the offset of `member` inside `type` as a `size_t`, computed at **compile time**. Compilers implement it with a builtin (`__builtin_offsetof`).',
            why: 'Offsets depend on padding, so they change between machines: `list` is at 32 on a 64-bit machine and at 28 on a 32-bit one. Without `offsetof()` you would hard-code 40 or 32, and the program breaks on the next machine or the next struct change.',
            how: { code: `#include <stddef.h>

size_t off = offsetof(struct book, list);
/* 40 on our machine */

printf("%zu\\n", offsetof(struct student, list));
/* 32 on 64-bit, 28 on 32-bit */`, label: null },
            notes: 'It is a standard macro that takes a type and a member name, which no function could take. Old code sometimes defines offsetof as ((size_t)&((type *)0)->member). Do not write that yourself: it is undefined behavior in standard C. Use the header.' },

        { kind: 'concept', title: 'Pointer arithmetic is scaled', layout: 'tb', ratio: 0.47,
            what: 'Adding 1 to a pointer moves it by **one element**, that is, by `sizeof(*p)` bytes: `ip + 1` moves 4 bytes for an `int *`, 16 bytes for a `struct list_head *`, and 1 byte for a `char *`. Subtracting two pointers counts elements, not bytes.',
            why: 'It is what makes `p[i]` and `p + i` work on arrays of any type. But it also means `lp - 40` on a `struct list_head *` moves 40 × 16 = 640 bytes, not 40: to subtract a byte offset you must count in bytes.',
            how: { out: `ip     = 0x16b382558
ip + 1 = 0x16b38255c   (+4 bytes: sizeof(int))
cp + 1 = 0x16b382559   (+1 byte: sizeof(char) is always 1)
(char *)(lp + 1) = 0x16b382548   (+16 bytes)
(char *)lp + 1   = 0x16b382539   (+1 byte: parentheses matter!)
&numbers[2] - &numbers[0]                 = 2 elements`, label: './pointer_arith (excerpt)' },
            notes: 'Run pointer_arith.c. Point at the two lp lines: the same +1 means 16 bytes or 1 byte depending on the pointer type. The full output also shows *(ip + 2) == ip[2] and the byte difference of 8 between numbers[2] and numbers[0].' },

        { kind: 'concept', title: 'Byte arithmetic with `char *`', ratio: 0.5,
            what: 'Because `sizeof(char)` is always 1, arithmetic on a `char *` moves exactly one **byte** per step. Converting a pointer to `char *` gives a byte-addressed view of the same address, so `(char *)lp - 40` moves back exactly 40 bytes.',
            why: '`offsetof()` gives a number of **bytes**. Subtracting it from a `struct list_head *` would move 16 times too far. (Arithmetic on `void *` also counts bytes in gcc and clang, but that is a GNU extension, not standard C.)',
            how: { table: { head: ['With `struct list_head *lp`', 'Moves by'], colW: [3.2, 3.4], size: 18, rows: [
                ['`lp - 40`', '40 × 16 = **640 bytes**: wrong'],
                ['`(char *)lp - 40`', '**40 bytes**: what we want'],
            ] } },
            notes: 'offsetof() gives a number of bytes, so the subtraction must happen on a char *. This is step 1 of container_of().' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — container_of', kind: 'section', num: 2, label: 'PART 2', title: 'Deriving `container_of()`', sub: 'From first principles to one macro, then the list iteration macros' },

        { kind: 'concept', title: '`container_of()`', layout: 'tb', ratio: 0.5,
            what: '`container_of(ptr, type, member)` takes a pointer to a member embedded in a struct and returns a pointer to the whole struct. It steps back from the member by the member\'s offset, counted in bytes.',
            why: 'An intrusive list hands you `struct list_head *` pointers, but you need the book or student around them. Week 05 wrote one helper per (type, member) pair, which does not scale; one macro replaces them all.',
            how: { code: [
                { file: 'examples/container_of_demo.c', macro: 'container_of' },
                `struct book *b = container_of(ptr, struct book, borrowed);`,
            ] },
            notes: 'This is the macro in the Week 06 starter and in the final project\'s list.h. The next slides derive it from first principles: a picture, three steps, the same steps by hand, and a demo.' },
        { kind: 'content', title: 'From first principles',
            intro: 'We have `ptr`, the address of the member `borrowed` inside some `struct book`. We want the address of that book, `b`.',
            a: { diagram: { type: 'layout', title: 'struct book in container_of_demo.c   (b is the start)', fields: [
                { name: 'id', size: 4 }, { name: 'title[32]', size: 32 }, { pad: true, size: 4 }, { name: 'all', size: 16 }, { name: 'borrowed', size: 16, hl: true },
            ], marks: [{ at: 56, label: 'ptr = &book.borrowed' }], span: { from: 0, to: 56, label: 'offsetof(struct book, borrowed) = 56' } } },
            notes: 'Draw this on the board first. b equals ptr minus the offset of borrowed, counted in bytes.' },

        { kind: 'content', title: 'Three steps back to the container', layout: 'tb', ratio: 0.62,
            a: { table: { head: ['Step', 'Code', 'Why'], colW: [0.8, 6.8, 4.4], size: 17, rows: [
                ['1', '`(char *)ptr`', 'Count in bytes, not in `list_head`s'],
                ['2', '`(char *)ptr - offsetof(struct book, borrowed)`', 'Step back to the start of the book'],
                ['3', '`(struct book *)( … )`', 'Give the address the type we want'],
            ] } },
            b: { callout: '`b  ==  ptr  −  offsetof(struct book, borrowed)`, counted in bytes' } },

        { kind: 'content', title: 'By hand, then with one macro',
            a: { code: { file: 'examples/container_of_demo.c', from: /\/\* step by step \*\//, to: /b = container_of\(ptr, struct book, borrowed\)/, drop: [/printf/] } },
            notes: 'Walk through the three numbered lines, then show that container_of() does the same in one expression.' },

        { kind: 'demo', title: 'Live demo: container_of_demo.c', ratio: 0.55,
            a: { out: `&book                = 0x16ee06510
ptr = &book.borrowed = 0x16ee06548
offsetof(struct book, all)      = 40
offsetof(struct book, borrowed) = 56
by hand      : 0x16ee06510  id = 42
container_of : 0x16ee06510  id = 42
via 'all'    : 0x16ee06510  id = 42`, label: './container_of_demo' },
            b: { callout: [
                'Check the arithmetic: `0x548 − 0x510 = 0x38 = 56`',
                'By hand, with the macro, and via `all`: the same address every time',
            ] } },

        { kind: 'content', title: 'One macro for every type and member', layout: 'tb', ratio: 0.28,
            a: { code: { file: 'examples/container_of_demo.c', macro: 'container_of' } },
            b: { table: { head: ['Token', 'Role'], colW: [3.6, 8.4], size: 16, rows: [
                ['`ptr`', 'Pointer to the embedded member (e.g. a `struct list_head *`)'],
                ['`type`', 'The containing struct type (e.g. `struct student`)'],
                ['`member`', 'The member\'s **name** inside `type` (e.g. `list`)'],
                ['`(char *)(ptr)`', 'Byte-addressed view of `ptr`'],
                ['`- offsetof(type, member)`', 'Step back to the start of the container'],
                ['`(type *)( … )`', 'The result has the container\'s type'],
                ['outer `( … )`', 'The whole expansion is one expression'],
            ] } } },

        { kind: 'concept', title: 'Why `container_of()` is a macro', ratio: 0.5,
            what: 'A macro is text substitution done by the preprocessor before compilation. Its arguments can be any text: a **type** such as `struct student` and a **member name** such as `list`, which the expansion pastes into `offsetof()` and the cast.',
            why: 'A C function receives only values. It cannot receive a type or a member name as an argument, so a function version would need one copy per (type, member) pair: exactly the problem we are solving.',
            how: { code: `struct student *s =
    container_of(pos, struct student, list);

/* expands to */
((struct student *)((char *)(pos)
    - offsetof(struct student, list)))`, label: null },
            notes: 'A macro works on text, before compilation, so it can take a type and a member name. This is exactly the macro in the Week 06 starter and in the final project\'s list.h.' },

        { kind: 'concept', title: 'Seeing the expansion: `gcc -E`', layout: 'tb', ratio: 0.47,
            what: '`gcc -E` stops after the **preprocessor** stage (Week 01) and writes the program as the compiler will see it: every `#include` pasted in and every macro expanded. A Makefile rule can produce this `.i` file on demand.',
            why: 'Macros are invisible in the source: when `container_of()` gives a wrong pointer or does not compile, you cannot see what it turned into. The `.i` file shows the exact expansion, including that `offsetof` became `__builtin_offsetof`.',
            how: { term: [
                { cmd: 'make container_of_demo.i', out: 'gcc -E container_of_demo.c -o container_of_demo.i' },
                { cmd: 'tail -n 25 container_of_demo.i', out: `...
b = ((struct book *)((char *)(ptr) - __builtin_offsetof(struct book, borrowed)));` },
            ] },
            notes: 'The examples Makefile has a rule container_of_demo.i: container_of_demo.c whose recipe is $(CC) -E container_of_demo.c -o container_of_demo.i. The .i file is about 660 lines, because stdio.h was pasted in too; your code is at the end.' },

        { kind: 'compare', title: 'Why every parenthesis matters',
            intro: '`container_of()` follows both macro rules from Week 02, §2.6. Each one prevents a real bug.',
            left: { label: 'AROUND (ptr)', kind: 'info', note: 'Without them, `container_of(lp + 1, ...)` steps back from 1 **byte** past `lp`, not 1 `list_head`.', body: { code: `(char *)lp + 1      /* 1 byte   */
(char *)(lp + 1)    /* 16 bytes */`, label: null } },
            right: { label: 'AROUND THE WHOLE', kind: 'info', note: 'Without them, `->` binds before the cast, so this does not compile.', body: { code: `container_of(pos, struct book, list)->id`, label: null } },
            notes: 'pointer_arith.c printed both addresses: they are 15 bytes apart. Rule for every macro you write: parenthesize each parameter, and the whole expansion.' },

        { kind: 'content', title: 'The macro trusts you', layout: 'tb', ratio: 0.42,
            a: { code: { file: 'examples/container_of_demo.c', from: /the macro trusts you/, to: /\(char \*\)b - \(char \*\)&book/ } },
            b: { bullets: [
                'Output: `WRONG member : 0x16ee06520  (off by 16 bytes)`',
                'No error, no warning: reading `b->id` now reads garbage',
                'Double-check that `type` and `member` match the list the pointer came from',
                'Linux adds a compile-time type check with GNU extensions. In C11, **you** are the type checker',
            ] },
            notes: 'Linux\'s version lives in include/linux/container_of.h. It is not portable C11, so we use the plain version.' },

        { kind: 'concept', title: '`list_entry()`', ratio: 0.5,
            what: '`list_entry(ptr, type, member)` is the usual name for `container_of()` when the member is a `struct list_head`. It expands to exactly the same expression, but it says what you are doing: getting the list entry at this position.',
            why: 'Every traversal of an intrusive list needs this step, often more than once per loop. List code you read will call it `list_entry()`, and naming it makes loop bodies read as "the book at `pos`" instead of raw pointer arithmetic.',
            how: { code: [
                { file: 'examples/list_macros.c', macro: 'list_entry' },
                `printf(" [%d]",
       list_entry(pos, struct book, list)->id);`,
            ] },
            notes: 'Once container_of() exists, a small family of macros is built on it. list_entry is just another name for container_of.' },
        { kind: 'concept', title: '`list_for_each()`', layout: 'tb', ratio: 0.47,
            what: '`list_for_each(pos, head)` expands to the circular-list traversal loop: start at `head->next`, follow `next`, and stop when `pos` is back at `head`. `list_for_each_prev()` does the same backwards through `prev`.',
            why: 'Without it, every traversal is typed by hand, and the Week 04 mistakes come back: `pos != NULL` loops forever in a ring, and starting at `head` visits the sentinel\'s meaningless data.',
            how: { code: [
                { file: 'examples/list_macros.c', macro: 'list_for_each' },
                `list_for_each(pos, head)
    printf(" [%d]", list_entry(pos, struct book, list)->id);`,
            ] },
            notes: 'Use list_for_each() when the loop only reads. print_books() in list_macros.c prints every book with list_for_each and list_entry.' },

        { kind: 'concept', title: '`list_for_each_safe()`', ratio: 0.42,
            what: '`list_for_each_safe(pos, n, head)` is the traversal loop with one extra pointer: before the body runs, it saves `pos->next` in `n`, and the next step continues from `n`. The body may therefore unlink and free `pos`.',
            why: 'The plain loop advances with `pos = pos->next`, reading `pos` after the body freed it: a use-after-free. It is the "save next first" rule of Weeks 03 and 04, as a macro.',
            how: { code: { file: 'examples/list_macros.c', lines: [107, 115] }, label: 'list_macros.c' },
            notes: 'The demo deletes every book published before 2000 inside list_for_each_safe(), then prints: since2000: [2 2005] [4 2010]. Use the plain macro when only reading, the _safe one whenever the body may remove pos.' },

        { kind: 'content', title: 'Which loop to use',
            a: { cards: [
                { n: 1, h: 'Only reading', body: 'Use `list_for_each()`.' },
                { n: 2, h: 'Removing pos', body: 'Use `list_for_each_safe()`. The plain loop would read `pos->next` after `free(pos)`: the Week 03 and Week 04 "save next first" rule, as a macro.' },
                { n: 3, h: 'Not in C11', body: '`list_for_each_entry()` iterates over objects directly, but needs `typeof`: a GNU extension, standard only in C23.' },
            ] } },

        { kind: 'content', title: 'Further reading: Linux\'s list.h', tag: 'OPTIONAL', ratio: 0.55,
            a: { bullets: [
                { t: 'In `include/linux/list.h` you can now read:', sub: ['`INIT_LIST_HEAD`, `__list_add`, `list_add`, `list_add_tail`', '`list_del`, `list_empty`, `list_for_each`, `list_for_each_safe`'] },
                { t: '`include/linux/container_of.h` holds the type-checked `container_of()`.' },
            ] },
            b: { callout: [
                'Its `list_del()` writes `LIST_POISON1/2` into the removed entry (Week 04, §4.4).',
                'Its `__list_add()` is our `insert_between()`.',
            ] },
            notes: 'Both files are on GitHub under torvalds/linux. You can now read most of that list implementation.' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Week 06 assignment + port Week 05', sub: 'Lab A: the assignment\nLab B: port Week 05 to container_of()\nLab C: get ready for the final project' },

        { kind: 'content', title: 'Lab A — Week 06 assignment', ratio: 0.5,
            a: { steps: [
                'Use `container_of(list, struct student, list)` to recover the student from `list`',
                'Print `id` and `score` through the recovered pointer',
                'Also print `&student`, `list`, and `offsetof(struct student, list)`; check that the arithmetic adds up',
            ], size: 18, rowH: 1.15 },
            b: { code: { file: '/assignments/week06-container-of/starter/assignment_06.c', lines: [19, 26] }, label: 'starter/assignment_06.c' },
            notes: 'Task: assignments/week06-container-of/README.md' },

        { kind: 'content', title: 'Lab B — port Week 05 to `container_of()`',
            a: { steps: [
                'Copy your Week 05 solution into a scratch directory',
                'Delete `student_from_list()` and use `container_of()` (or `list_entry()`) everywhere instead',
                'Add `list_for_each()` and `list_for_each_safe()`; rewrite your print and free loops with them',
                'Delete every student whose score is below 60, inside a `list_for_each_safe()` loop',
            ], size: 19, rowH: 1.0 } },

        { kind: 'content', title: 'Lab C — get ready for the final project', ratio: 0.42,
            a: { steps: [
                'Open the final project\'s `starter/list.h`: `struct list_head`, `container_of()`, three prototypes. You can explain every line',
                'Implement `list_init()`, `list_add()`, and `list_del()` in `starter/list.c` from your Weeks 04–05 code',
                '`list_add()` inserts **right after** `head`; `list_del()` **never frees**',
            ], size: 17, rowH: 1.35 },
            b: { code: { file: '/assignments/week08-final-project/starter/list.h', from: /^struct list_head/, to: /offsetof\(type, member\)/ }, label: 'starter/list.h' } },

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: 'list_first_entry()', body: 'Write `list_first_entry(head, type, member)` as a macro.' },
                { n: 2, h: 'Break it on purpose', body: 'Use the wrong member, then drop the parentheses. Explain each wrong result.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            'Members live at fixed offsets. Padding makes them platform-dependent, so ask `offsetof()` instead of guessing',
            'Pointer arithmetic is scaled by the element size. Byte offsets need a `char *`',
            '`container_of(ptr, type, member)` = `(type *)((char *)(ptr) - offsetof(type, member))`',
            'It must be a macro: it takes a type and a member name. Parenthesize every parameter and the whole expansion',
            'It trusts you: a wrong type or member gives a wrong pointer, silently',
            'Use `list_for_each_safe()` whenever the loop body may remove `pos`',
        ], size: 18 },

        { kind: 'quiz', questions: [
            'On a 64-bit machine, what is `offsetof(struct student, list)`, and why is it not 28?',
            'With `struct list_head *p`, how many bytes does `p - 2` move? And `(char *)p - 2`?',
            'Expand by hand: `container_of(pos, struct student, list)`',
            'Why can\'t `container_of()` be a function?',
            'When must you use `list_for_each_safe()` instead of `list_for_each()`?',
        ] },

        { kind: 'answers', answers: [
            '32: the members end at byte 28, but `struct list_head` holds pointers and must be 8-byte aligned',
            '2 × 16 = 32 bytes; and 2 bytes',
            '`((struct student *)((char *)(pos) - offsetof(struct student, list)))`',
            'A function cannot receive a type or a member name as an argument',
            'When the body may unlink or free `pos`: the increment step would read `pos->next` from freed memory',
        ] },

        { kind: 'next', title: 'Week 07 — File I/O', sub: 'The list is complete, but it disappears when the program exits. How do we save it and rebuild it next time, and why not just write the structs to disk?' },
    ],
};
