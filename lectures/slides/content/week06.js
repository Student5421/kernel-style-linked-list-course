// Week 06 — Circular Doubly Linked List with a Sentinel
module.exports = {
    week: 6,
    dirName: 'week06-circular-list',
    title: 'Circular Doubly Linked List',
    short: 'Circular Doubly Linked List',
    subtitle: 'A sentinel and a ring: every `NULL` special case disappears',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'clist_book.c',
            code: [{ file: 'examples/clist_book.c', fn: 'list_init' }, '/* empty: head.next == &head */'],
            notes: 'Last week four NULL checks. Today: zero. One extra node, the sentinel, plus circular links.' },

        { kind: 'agenda', plan: [
            ['0:00', '0:10', 'Review of Week 05', 'review', 'Review'],
            ['0:10', '0:55', 'Part 1 — The sentinel and the circular invariant', 'lecture', 'Part 1'],
            ['0:55', '1:05', 'Break', 'break', 'Break'],
            ['1:05', '1:50', 'Part 2 — One insert, one unlink, safe traversal, `assert()`', 'lecture', 'Part 2'],
            ['1:50', '2:50', 'Lab — Week 06 assignment', 'lab', 'Lab'],
            ['2:50', '3:00', 'Wrap-up and exit quiz', 'wrap', 'Quiz'],
        ] },

        { kind: 'objectives', items: [
            'Explain what a *sentinel* node is and why it removes every `NULL` special case',
            'State the empty-list invariant and draw lists of 0, 1, and 3 elements',
            'Implement every insertion with one `insert_between()` helper',
            'Unlink a node with two assignments and no `if`',
            'Traverse both ways, and delete while traversing without a use-after-free',
            'Check invariants with `assert()`, and explain what `-DNDEBUG` does',
        ] },

        { kind: 'review', title: 'Review of Week 05', questions: [
            'List the four cases of deleting a node from a doubly linked list',
            'How many `NULL` checks did push_front, push_back, and unlink need in total?',
            'Why did we keep unlink and `free()` separate?',
        ], today: 'Today\'s question: the `NULL` checks exist because the first node has no previous node and the last node has no next. **What if they always did?**',
            notes: 'Answers: middle, first, last, only node; four NULL checks; unlink is a list operation, free is a memory operation, so a node can move between lists.' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Sentinel', kind: 'section', num: 1, label: 'PART 1 · 45 MIN', title: 'The sentinel and the circular invariant', sub: 'Pictures of 0, 1, and 3 elements; one rule with no exceptions' },

        { kind: 'concept', title: 'The sentinel node', layout: 'tb', ratio: 0.4,
            what: 'A **sentinel** (dummy head) is one extra node that is always in the list and carries no data. It is usually a plain variable, not `malloc()`ed.',
            why: 'In Week 05 the end nodes had `NULL` neighbors: four `NULL` checks and four delete cases. With a sentinel, every real node has a node on both sides.',
            how: { code: [{ file: 'examples/clist_book.c', struct: 'node' }, 'struct node head;      /* the sentinel */'], label: 'clist_book.c' },
            notes: 'The sentinel is a struct node whose data is never used. Next week we fix the wasted data too. Every real node now has a neighbor on both sides.' },

        { kind: 'concept', title: 'A circular list', layout: 'tb', ratio: 0.48,
            what: 'In a **circular** list the last node\'s `next` points back to the sentinel, and the sentinel\'s `prev` points to the last node. There is no `NULL` anywhere: `head.next` is the first element and `head.prev` the last.',
            why: 'Without the ring the last node would still have `next == NULL`, and finding it would need a separate `tail` pointer. With the ring, the last node is `head.prev`, in O(1).',
            how: { diagram: { type: 'chain', kind: 'circular', nodes: ['A', 'B', 'C'] } },
            notes: 'Forward: HEAD, A, B, C, back to HEAD. Combine the two ideas, sentinel and ring, and every node always has two real neighbors.' },

        { kind: 'concept', title: 'The empty list', ratio: 0.52,
            what: 'An empty list is just the sentinel pointing to itself in both directions: `head.next == &head` and `head.prev == &head`. `list_init()` sets this up, so it must run before anything else.',
            why: 'Empty no longer means `NULL`, so no operation needs an "is it empty?" special case. But an uninitialized `struct node head;` holds garbage pointers, and the first traversal or insert follows them.',
            how: { diagram: { type: 'chain', kind: 'circular', nodes: [] } },
            notes: 'This is the picture students must be able to draw from memory. Recall Week 01: an uninitialized local holds garbage, so list_init must run first.' },

        { kind: 'content', title: 'One element', ratio: 0.5,
            a: { diagram: { type: 'chain', kind: 'circular', nodes: ['A'] } },
            b: { table: { head: ['Link', 'Points to'], colW: [2.5, 2], size: 18, rows: [
                ['`head.next`', '`&A`'],
                ['`A.prev`', '`&head`'],
                ['`A.next`', '`&head`'],
                ['`head.prev`', '`&A`'],
            ] } },
            notes: 'Four links, and every one of them points at a real node. A is both the first and the last element.' },

        { kind: 'concept', title: 'The circular invariant', ratio: 0.52,
            what: 'For **every** node `n` in the ring, the sentinel included: `n->next->prev == n` and `n->prev->next == n`. The empty list is simply the ring that contains only the sentinel.',
            why: 'Week 05 needed four rules, two of them about `NULL`. One rule with no exceptions means one simple checker, and list code with no special cases.',
            how: { code: `/* for EVERY node n, including the sentinel */
n->next->prev == n
n->prev->next == n

/* the empty list */
head.next == &head
head.prev == &head`, label: null },
            notes: 'Compare with the four Week 05 invariants. Now there is one rule, and it has no exceptions.' },

        { kind: 'content', title: 'Useful facts that follow',
            a: { table: { head: ['Question', 'Answer'], colW: [4.5, 7.5], size: 18, rows: [
                ['Is the list empty?', '`head.next == &head`'],
                ['First element?', '`head.next` (only valid if not empty)'],
                ['Last element?', '`head.prev`: O(1), with no separate tail pointer'],
                ['End of forward traversal?', 'Back at `&head`, **not** at `NULL`'],
            ] } } },

        { kind: 'concept', title: 'Traversing a ring', layout: 'tb', ratio: 0.44,
            what: 'Forward traversal starts at `head->next` and follows `next` until it is **back at the sentinel**. Backward traversal starts at `head->prev` and follows `prev`. An empty list runs the loop zero times.',
            why: 'A ring never contains `NULL`, so `pos != NULL` is an infinite loop: the most common Week 06 bug. Starting at `head` itself would treat the sentinel\'s meaningless data as an element.',
            how: { code: `/* head is a struct node *, e.g. &head */
/* forward */
for (pos = head->next; pos != head; pos = pos->next)
    ...

/* backward */
for (pos = head->prev; pos != head; pos = pos->prev)
    ...`, label: null },
            notes: 'An empty list runs the loop zero times, because head->next == head immediately. Start after the sentinel, stop back at the sentinel.' },

        { kind: 'exercise', title: 'Trace `list_init()`', tag: 'WHITEBOARD', ratio: 0.5,
            a: { code: { file: 'examples/clist_book.c', fn: 'list_init' } },
            b: { steps: [
                'Draw the sentinel after these two lines',
                'Why must `init` run before anything else?',
                'What happens if you traverse an uninitialized `struct node head;`?',
            ], size: 19, rowH: 1.0 },
            notes: 'Recall Week 01: an uninitialized local holds garbage. Its next and prev point anywhere, so the first traversal follows garbage pointers.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — Insert and unlink', kind: 'section', num: 2, label: 'PART 2 · 45 MIN', title: 'One insert, one unlink', sub: 'Safe traversal, `assert()`, and `-DNDEBUG`' },

        { kind: 'concept', title: '`insert_between()`: one insert for all', layout: 'tb', ratio: 0.42,
            what: '`insert_between(n, prev, next)` places a new node between two nodes that are currently neighbors, with four pointer writes. Every insertion in a ring is this one operation.',
            why: 'Week 05 needed a push for each end, each with an `if` for the empty list. In a ring every position has real neighbors, so one helper with no `if` covers them all.',
            how: { code: { file: 'examples/clist_book.c', fn: 'insert_between' } },
            notes: 'Every insertion places a new node between two nodes that are currently neighbors. Write that once. The four writes: next->prev = n, n->next = next, n->prev = prev, prev->next = n.' },

        { kind: 'concept', title: 'Front and back: stack and queue order', layout: 'tb', ratio: 0.4,
            what: '`insert_front()` inserts right after the sentinel, so the node becomes first; `insert_back()` inserts right before it, so it becomes last. Each is one call.',
            why: 'The choice decides the order a print shows: front insertion gives stack (LIFO) order, back insertion queue (FIFO) order. In the final project `list_add()` inserts at the front.',
            how: { code: [
                { file: 'examples/clist_book.c', fn: 'insert_front' },
                { file: 'examples/clist_book.c', fn: 'insert_back' },
            ] },
            notes: 'insert_front gives stack (LIFO) order; insert_back gives queue (FIFO) order. The final project\'s list_add inserts right after head, so a forward print shows the newest student first.' },

        { kind: 'exercise', title: 'Is the "special" case special?', tag: 'WHITEBOARD', layout: 'tb', ratio: 0.42,
            a: { callout: [
                'Trace `insert_back(&head, n)` on an **empty** list',
                'Then `prev = head->prev = &head` and `next = &head`',
                'Apply the four assignments of `insert_between()`',
            ] },
            b: { code: { file: 'examples/clist_book.c', fn: 'insert_between' }, label: null } },

        { kind: 'answer', title: 'No `if` was needed', ratio: 0.5,
            a: { art: `(1) head.prev = n        (2) n->next = &head
(3) n->prev  = &head     (4) head.next = n` },
            b: { diagram: { type: 'chain', kind: 'circular', nodes: ['n'] } },
            notes: 'The result is exactly the one-element picture. Compare with dlist_push_back() from Week 05, which needed an if for the empty list.' },

        { kind: 'demo', title: 'Live demo: the first insert', layout: 'tb', ratio: 0.42,
            a: { out: `after the first insert:
  HEAD prev = 0x101335240    self = 0x16f0ca510    next = 0x101335240
  [2]  prev = 0x16f0ca510    self = 0x101335240    next = 0x16f0ca510`, label: './clist_book' },
            b: { bullets: [
                'Both of HEAD\'s links point to `[2]`; both of `[2]`\'s links point to HEAD',
                'HEAD\'s address looks different: the sentinel is on the **stack**, the nodes are on the **heap** (Week 03)',
            ] },
            notes: 'clist_book.c dumps the links right after the first insert.' },

        { kind: 'exercise', title: 'Unlink: two assignments, no `if`', minutes: 5, ratio: 0.55,
            a: { code: `static void unlink_node(struct node *entry)
{
    /* your two lines here */
}`, label: null },
            b: { bullets: [
                'Remove `entry` from the ring',
                'The neighbors must point **at each other**',
                'Recall the general case from Week 05, §2.1',
            ] } },

        { kind: 'concept', title: 'Unlinking from a ring', ratio: 0.52,
            what: '`unlink_node(entry)` makes the two neighbors point at each other: `entry->prev->next = entry->next` and `entry->next->prev = entry->prev`. That is all: two assignments and no `if`.',
            why: 'Week 05\'s unlink needed two `NULL` checks and four cases. In a ring every node has real neighbors, so the first, last, and only node all run the same two lines.',
            how: { code: `static void unlink_node(struct node *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
}`, label: null },
            notes: 'This is the answer to the exercise: Week 05\'s general case with the ifs deleted. The next slide traces the only-element case.' },

        { kind: 'compare', title: 'Unlinking the only element',
            intro: 'Afterwards `head.next == &head` and `head.prev == &head`: the list is empty again, automatically.',
            left: { label: 'BEFORE', kind: 'neutral', body: { diagram: { type: 'chain', kind: 'circular', nodes: ['A'] } } },
            right: { label: 'AFTER unlink_node(&A)', kind: 'good', body: { diagram: { type: 'chain', kind: 'circular', nodes: [] } } } },

        { kind: 'content', title: 'Week 05 vs. Week 06',
            a: { table: { head: ['', 'Week 05 (`NULL`-terminated)', 'Week 06 (circular + sentinel)'], colW: [3.5, 4.3, 4.3], size: 18, rows: [
                ['Insert front', '1 `if`', '0'],
                ['Insert back', '1 `if`', '0'],
                ['Unlink', '2 `if`s, four cases', '0'],
                ['Find the last node', 'separate `tail` pointer', '`head.prev`'],
                ['Extra memory', '`tail` pointer', 'one sentinel node'],
            ] } } },

        { kind: 'concept', title: 'After unlinking: re-initialize or poison', ratio: 0.52,
            what: 'After unlinking, `entry->next` and `entry->prev` still point into the list. Either make the entry an empty ring again (the kernel\'s `list_del_init()`), or overwrite the links with "poison" that crashes at once if used (`LIST_POISON1/2`; `NULL` is the simple version).',
            why: 'Code that later follows the stale links walks into a list the entry no longer belongs to: silent corruption instead of an error. Either way unlinking does not free.',
            how: { code: `/* re-initialize: an empty ring again */
entry->next = entry;
entry->prev = entry;

/* or poison: a later use crashes */
entry->next = NULL;
entry->prev = NULL;`, label: null },
            notes: 'Delete by ID is still: find, unlink, free. The Linux kernel\'s list_del writes LIST_POISON1/2; list_del_init re-initializes the entry. We meet list_del_init again next week.' },

        { kind: 'concept', title: 'Deleting while traversing', ratio: 0.52,
            what: 'To free every node, save `pos->next` **before** `free(pos)`, then continue from the saved pointer. At the end, call `list_init()` so the empty invariant holds again.',
            why: 'The obvious loop `for (...; pos = pos->next) free(pos);` reads `pos->next` after `free(pos)`: a use after free. In Week 08 this "save next" pattern becomes the macro `list_for_each_safe()`.',
            how: { code: { file: 'examples/clist_book.c', fn: 'free_all' } },
            notes: 'Same rule as Week 04: save next before free. In Week 08 this pattern becomes a macro, list_for_each_safe().' },

        { kind: 'concept', title: '`assert()`', layout: 'tb', ratio: 0.42,
            what: '`assert(expr)` from `<assert.h>` does nothing when `expr` is true. When it is false, it prints the expression, file, and line, and **aborts** the program on the spot.',
            why: 'Otherwise a broken link crashes later, somewhere unrelated. `assert()` stops at the first broken invariant. Use it for programming errors, not for user errors.',
            how: { code: { file: 'examples/clist_book.c', from: /assert\(head->next->prev == head\);/, to: /^    }$/ }, label: 'clist_book.c (list_check)' },
            notes: 'Include assert.h. The checker verifies the circular invariant at every node and returns the number of nodes, so it can be used in printf.' },

        { kind: 'demo', title: 'Live demo: `assert()` catches the bug', layout: 'tb', ratio: 0.45,
            a: { term: [
                { cmd: './clist_book  # nodes = 3, links OK' },
                { cmd: './clist_book break', out: `corrupting one prev link...
Assertion failed: (pos->next->prev == pos), function list_check, file clist_book.c, line 112.` },
            ] },
            b: { code: { file: 'examples/clist_book.c', from: /strcmp\(argv\[1\], "break"\)/, to: /^    }$/ }, label: 'clist_book.c (main)' },
            notes: 'The break argument corrupts one prev link on purpose, and list_check aborts at the first broken invariant.' },

        { kind: 'concept', title: '`-DNDEBUG`: turning asserts off', layout: 'tb', ratio: 0.46,
            what: '`-DNAME` defines a macro for the preprocessor, as if the file began with `#define NAME 1`. When `NDEBUG` is defined, every `assert()` compiles to nothing.',
            why: 'Release builds may drop the checks, so an assert must never have side effects: `assert(n = malloc(...))` loses the `malloc()` too. And `make` does not notice a change of flags, so rebuild with `make -B`.',
            how: { term: [
                { cmd: 'make -B CFLAGS="-Wall -Wextra -std=c11 -DNDEBUG"' },
                { cmd: './clist_book break  # "nodes = 3, links OK": unnoticed!' },
                { cmd: 'make -B  # back to the normal build' },
            ] },
            notes: '-DNAME defines a macro as if the file began with #define NAME 1. With NDEBUG defined, every assert compiles to nothing, so the corrupted link goes unnoticed. Note the -B: make does not notice a change of flags (Week 04).' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB · 60 MIN', title: 'Week 06 assignment', sub: 'A sentinel-based circular doubly linked list' },

        { kind: 'content', title: 'Lab — suggested order', ratio: 0.62,
            a: { steps: [
                'Turn the starter\'s initialization into `list_init()`. Add `list_is_empty()`',
                '`insert_between()`, `insert_front()`, `insert_back()`, and node creation',
                'Write the forward and backward traversals',
                'A `list_check()` with `assert()`; call it after every operation',
                'Unlink, then delete by ID (find → unlink → `free()`)',
                '`free_all()` at exit; the empty invariant must hold again',
            ], size: 18, rowH: 0.85 },
            b: { cards: [
                { h: 'Task', body: '`assignments/week06-circular-list/README.md`', size: 16 },
                { h: 'Starter', body: '`main()` already initializes the sentinel.', size: 16 },
            ], cols: 1 } },

        { kind: 'content', title: 'Lab — test plan',
            intro: 'Test the empty list and the one-element list explicitly.',
            a: { table: { head: ['#', 'Action', 'Check'], colW: [0.7, 5.8, 5.8], size: 16, rows: [
                ['1', '`init`, print both directions', 'empty, `head.next == &head`, `head.prev == &head`'],
                ['2', 'Insert 1 element, print both directions', 'one element, the checker passes'],
                ['3', 'Delete that element', 'empty invariant holds again'],
                ['4', 'Insert 1, 2, 3 at the back; insert 0 at the front', 'forward `0 1 2 3`, backward `3 2 1 0`'],
                ['5', 'Delete first, middle, last', 'the checker passes after each'],
                ['6', 'Delete a missing ID', '"not found", list unchanged'],
                ['7', '`free_all()`', 'empty invariant holds'],
            ] } } },

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: '`list_move_tail(entry, head)`', body: 'Unlink `entry`, then `insert_back()`, with no `malloc()` or `free()`.' },
                { n: 2, h: '`list_splice()`', body: 'Move every node of one list to the end of another in O(1): only the four boundary links change.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            'A sentinel plus circular links: every node always has two real neighbors, so `NULL` never appears',
            'Empty means `head.next == &head` (and `head.prev == &head`). The last node is `head.prev`',
            'Traversal starts at `head->next` and stops back at `head`, never at `NULL`',
            'One `insert_between()` implements every insert. Unlink is two lines with no `if`',
            'Save `next` before freeing during traversal. Restore the empty invariant at the end',
            '`assert()` catches broken invariants early. `-DNDEBUG` removes the checks',
        ], rowH: 0.85 },

        { kind: 'quiz', questions: [
            'What are `head.next` and `head.prev` in an empty list?',
            'A student writes `for (pos = head->next; pos != NULL; pos = pos->next)`. What happens?',
            'Which call inserts at the back: `insert_between(n, head, head->next)` or `insert_between(n, head->prev, head)`?',
            'After unlinking the only element, what do `head.next` and `head.prev` point to?',
            'Why must you never write `assert(p = malloc(size))`?',
        ] },

        { kind: 'answers', answers: [
            'Both are `&head`',
            'An infinite loop: the ring never contains `NULL`, so it goes around and around',
            '`insert_between(n, head->prev, head)`: between the last node and the sentinel',
            'Both point to `&head`: the list is empty again with no special code',
            'With `-DNDEBUG` the whole expression, including the `malloc()` call, disappears',
        ] },

        { kind: 'next', title: 'Week 07 — Intrusive Linked List', sub: 'The sentinel still wastes a `struct book`, and the list only works for books. What if the links lived **inside** the data?' },
    ],
};
