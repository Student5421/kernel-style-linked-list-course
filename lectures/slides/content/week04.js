// Week 04 — Doubly Linked and Circular Lists
module.exports = {
    week: 4,
    dirName: 'week04-doubly-circular-list',
    title: 'Doubly Linked and Circular Lists',
    short: 'Doubly Linked and Circular Lists',
    subtitle: 'Two links per node, then a sentinel and a ring: every `NULL` special case disappears',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'dll_book.c',
            code: { file: 'examples/dll_book.c', struct: 'node' },
            notes: 'Today every node gets a second pointer, prev. That buys backward traversal and O(1) delete, and costs more pointers to keep consistent. In the second half a sentinel and circular links remove every NULL special case.' },


        { kind: 'objectives', title: 'Objectives: doubly linked list', items: [
            'Explain what a `prev` pointer buys (backward traversal, O(1) unlink) and what it costs',
            'State the link invariants of a doubly linked list and check them in code',
            'Insert at the front and the back while keeping `head`, `tail`, `next`, and `prev` consistent',
            'List the four cases of deleting a node and which pointers change in each',
            'Debug pointer bugs by dumping addresses and running an invariant checker',
        ] },

        { kind: 'objectives', title: 'Objectives: circular list with a sentinel', items: [
            'Explain what a *sentinel* node is and why it removes every `NULL` special case',
            'State the empty-list invariant and draw lists of 0, 1, and 3 elements',
            'Implement every insertion with one `insert_between()` helper',
            'Unlink a node with two assignments and no `if`',
            'Traverse both ways, and delete while traversing without a use-after-free',
            'Check invariants with `assert()`, and explain what `-DNDEBUG` does',
        ] },

        { kind: 'review', title: 'Review of Week 03', questions: [
            'Why does `push_front()` take `struct node **`?',
            'What must you do *before* `free(cur)` when freeing a list?',
            'Which cases of delete change `head`?',
        ], today: 'Today\'s questions: **How do you print a singly linked list backwards? How do you delete a node when you only have a pointer to it?** Both are awkward with only `next`.',
            notes: 'Answers: push_front must change the caller\'s head; save next before free; deleting the first node (including the only node) changes head.' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Two links', kind: 'section', num: 1, label: 'PART 1', title: 'Two links per node, and insertion', sub: 'What `prev` buys, the invariants, inserting at both ends' },

        { kind: 'concept', title: 'The `prev` pointer: a doubly linked list', ratio: 0.52,
            what: 'In a **doubly linked list** every node stores two links: `next` points to the node after it and `prev` to the node before it. The first node\'s `prev` and the last node\'s `next` are `NULL`.',
            why: ['With only `next`, you cannot walk backward, and deleting a node you already hold needs an O(n) search for its predecessor.', 'With `prev`, the node knows both neighbors, so it can be unlinked in O(1).'],
            how: { code: { file: 'examples/dll_book.c', struct: 'node' } },
            notes: 'Today every node gets a second pointer. The trade: backward traversal and O(1) delete, paid for with one more pointer per node and more pointer updates per operation. The next slide compares the costs.' },

        { kind: 'content', title: 'What `prev` costs and what it buys',
            a: { table: { head: ['Task', 'Singly linked', 'Doubly linked'], colW: [4.4, 4, 4], size: 17, rows: [
                ['Walk backward', 'Impossible without extra memory', 'Follow `prev`'],
                ['Delete a node, given a pointer to it', 'O(n): search for its predecessor', '**O(1)**: the node knows both neighbors'],
                ['Insert *before* a given node', 'O(n)', '**O(1)**'],
                ['Memory per node', '1 pointer', '2 pointers'],
                ['Pointer updates per insert/delete', '1–2', '**2–4**: more ways to get it wrong'],
            ] } },
            notes: 'The trade: backward traversal and O(1) delete, paid for with one more pointer per node and more pointer updates per operation.' },

        { kind: 'concept', title: 'Keeping both ends: `head` and `tail`', layout: 'tb', ratio: 0.55,
            what: 'A small `struct dlist` holds two pointers: `head` to the first node and `tail` to the last. Both are `NULL` when the list is empty, and every operation keeps both up to date.',
            why: 'With only `head`, inserting at the back and printing backward must first walk the whole list to find the last node, which is O(n). With `tail`, the last node is one pointer away. (The starter declares only `head`: keep a `tail` too, or walk when you need it.)',
            how: { code: { file: 'examples/dll_book.c', struct: 'dlist' } },
            notes: 'The assignment starter declares only struct node *head. You may keep a separate tail pointer, as the demo does, or walk to the last node when you need it. A small struct dlist holding both is the cleaner design.' },

        { kind: 'content', title: 'Drawing a doubly linked list', layout: 'tb', ratio: 0.55,
            a: { diagram: { type: 'chain', kind: 'doubly', nodes: ['[1]', '[2]', '[3]'], head: 'head', tail: 'tail' } },
            b: { bullets: [
                'Dark arrows are `next`, gray arrows are `prev`',
                '`head->prev` and `tail->next` are `NULL`',
                'Every link has a partner pointing the other way',
            ] },
            notes: 'Ask the class to point at each arrow and name the field: next or prev. The NULLs at both ends are what create special cases later.' },

        { kind: 'concept', title: 'Invariants', layout: 'tb', ratio: 0.46,
            what: 'An **invariant** is a property of the list that holds before and after every operation. An operation may break it temporarily, in the middle, but must restore all of them before it returns.',
            why: 'Pointer bugs are silent: a wrong `prev` does not show in a forward print. Without written rules you cannot tell whether an operation is correct. Ask: **which invariants could this break, and which lines restore them?**',
            how: { steps: [
                '`head == NULL` if and only if `tail == NULL` (the empty list)',
                '`head->prev == NULL` and `tail->next == NULL`',
                'For every node `n`: if `n->next != NULL`, then `n->next->prev == n`',
                'For every node `n`: if `n->prev != NULL`, then `n->prev->next == n`',
            ], size: 18, rowH: 0.58 },
            notes: 'An invariant is a property that holds before and after every operation. These four rules define a correct doubly linked list. Use the question on the slide every time you design a list operation.' },

        { kind: 'concept', title: 'Inserting at the front', layout: 'tb', ratio: 0.44,
            what: '`push_front()` makes a new node the first node. On a non-empty list it needs **four** pointer writes, in order; on an empty list the new node becomes both `head` and `tail`.',
            why: 'Each write restores an invariant. Skip step 3, `head->prev = n`, and backward traversal silently skips the new node. Forget the empty case, and `tail` stays `NULL`.',
            how: { art: `empty list:          head = tail = n,  n->prev = n->next = NULL

non-empty list:      head --> [A] <=> [B] <-- tail
  1. n->prev = NULL;
  2. n->next = head;    [N] --> [A]
  3. head->prev = n;    [N] <=> [A]
  4. head = n;          head --> [N] <=> [A] <=> [B] <-- tail` },
            notes: 'Trace both cases on the board. In the empty list, n becomes both head and tail. In the non-empty list, step 3 makes the old first node point back to n. The next slide shows the code.' },

        { kind: 'content', title: 'Insert at the front: the code', layout: 'tb', ratio: 0.66,
            a: { code: { file: 'examples/dll_book.c', fn: 'dlist_push_front' } },
            b: { callout: 'Step 3, `list->head->prev = n`, is the one people forget. Without it invariant 3 breaks, and backward traversal skips the new node.', kind: 'bad' },
            notes: 'The if/else handles the empty list: when there is no old first node, n is also the last node, so tail must change.' },

        { kind: 'concept', title: 'Inserting at the back', layout: 'tb', ratio: 0.29,
            what: 'It appends the node at the end. It is `push_front()` mirrored: `tail` for `head`, `prev` for `next`.',
            why: 'It keeps insertion order, and with `tail` it costs O(1), not a walk through the list.',
            how: { code: { file: 'examples/dll_book.c', fn: 'dlist_push_back' } },
            notes: 'Compare the two functions side by side with the class: head and tail swap, next and prev swap. If the mirror does not hold, one of them has a bug.' },

        { kind: 'content', title: 'Forward traversal: unchanged from Week 03', ratio: 0.62,
            a: { code: { file: 'examples/dll_book.c', fn: 'dlist_print_forward' } },
            b: { bullets: [
                'The loop starts at `list->head`, follows `next`, and stops at `NULL`.',
                'It is exactly the Week 03 loop: the `prev` links are simply not used.',
            ] } },

        { kind: 'concept', title: 'Backward traversal', layout: 'tb', ratio: 0.5,
            what: '**Backward traversal** visits the nodes from last to first: it starts at the last node and follows `prev` until it reaches `NULL`.',
            why: ['A singly linked list cannot do this without extra memory.', 'It is also a test: a missing `prev` link is invisible in a forward print and shows up only when you print backward. That is why every test prints both directions.'],
            how: { art: `forward :  head --> [1] --> [2] --> [3] --> NULL      follow next
backward:  NULL <-- [1] <-- [2] <-- [3] <-- tail      follow prev` },
            notes: 'Do not show the loop: backward print is part of Assignment 04A. The next slide asks students to write it.' },

        { kind: 'exercise', title: 'Write the backward traversal', minutes: 3, ratio: 0.55,
            a: { steps: [
                'Where does the loop **start**?',
                'Which pointer does it **follow**?',
                'When does it **stop**?',
            ], size: 22, rowH: 0.95 },
            b: { callout: 'You need this loop in the lab: backward print is part of Assignment 04A.' },
            notes: 'Give students three minutes. Do not show a solution: backward print is an assignment deliverable. Hint if needed: it is the mirror of the forward loop.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — Delete and debug', kind: 'section', num: 2, label: 'PART 2', title: 'Delete in O(1), invariants, and debugging links', sub: 'Unlinking, the four cases, link dumps, invariant checkers' },

        { kind: 'concept', title: 'Unlinking a node in O(1)', layout: 'tb', ratio: 0.46,
            what: 'To **unlink** node `n`, make its two neighbors point at each other: `n->prev->next = n->next` and `n->next->prev = n->prev`. Afterwards `n` is out of the list and can be freed or inserted elsewhere.',
            why: 'In a singly linked list a node does not know its predecessor, so deleting it means an O(n) search from `head`. Here `n` already knows both neighbors: no search, so the unlink is **O(1)**.',
            how: { art: `before:   [P] <=> [N] <=> [X]

          n->prev->next = n->next;      [P] ------------> [X]
          n->next->prev = n->prev;      [P] <------------ [X]

after:    [P] <=> [X]          [N] is unlinked` },
            notes: 'This is the general case, for a node in the middle. The next slide shows what changes when a neighbor is NULL.' },

        { kind: 'concept', title: 'The four cases of unlinking', layout: 'tb', ratio: 0.42,
            what: 'At either end a neighbor is `NULL`, so `head` or `tail` changes instead. Handle each side on its own: fix the previous node\'s `next` or else `head`; fix the next node\'s `prev` or else `tail`.',
            why: 'Applying the general case to the first or last node dereferences `NULL` and crashes. Forgetting `head` or `tail` leaves them pointing at a freed node.',
            how: { table: { head: ['Case', '`n->prev`', '`n->next`', 'Pointers to update'], colW: [2.6, 2, 2, 5.5], size: 17, rows: [
                ['Middle node', 'node', 'node', '`n->prev->next`, `n->next->prev`'],
                ['First node', '`NULL`', 'node', '`head`, `n->next->prev`'],
                ['Last node', 'node', '`NULL`', '`n->prev->next`, `tail`'],
                ['Only node', '`NULL`', '`NULL`', '`head`, `tail`'],
            ] } },
            notes: 'Notice the pattern: each side is handled independently. Left side: if there is a previous node, fix its next; otherwise fix head. Right side: if there is a next node, fix its prev; otherwise fix tail.' },

        { kind: 'exercise', title: 'Write `dlist_unlink()`', minutes: 5, ratio: 0.66,
            a: { code: `static void dlist_unlink(struct dlist *list, struct node *n)
{
    /* left side:  fix n->prev->next, or head */
    /* right side: fix n->next->prev, or tail */
}`, label: null },
            b: { bullets: [
                'Use two `if`/`else` statements, one per side',
                'It must **not** call `free()`',
            ] } },

        { kind: 'answer', title: '`dlist_unlink()`', ratio: 0.66,
            a: { code: `static void dlist_unlink(struct dlist *list, struct node *n)
{
    if (n->prev != NULL)
        n->prev->next = n->next;
    else
        list->head = n->next;

    if (n->next != NULL)
        n->next->prev = n->prev;
    else
        list->tail = n->prev;

    n->prev = NULL;
    n->next = NULL;
}`, label: null },
            b: { callout: 'Delete by ID then becomes: find the node → `dlist_unlink()` → `free()`.', kind: 'good' },
            notes: 'Resetting n->prev and n->next is optional but keeps the unlinked node from pointing into the list.' },

        { kind: 'concept', title: 'Unlinking vs. freeing', layout: 'tb', ratio: 0.48,
            what: '**Unlinking** is a list operation: it changes links. **Freeing** is a memory operation: it ends the object\'s lifetime. Delete by ID is three separate jobs: find the node, unlink it, free it.',
            why: ['If unlink also freed, you could not move a node from one list to another: unlink, then insert elsewhere, with no `malloc()` or `free()`.', 'The final project requires this split: `list_del()` must never call `free()`.'],
            how: { diagram: { type: 'flow', boxH: 1.3, steps: [
                { t: 'find', sub: 'search by ID, get the node', size: 20 },
                { t: 'dlist_unlink()', sub: 'fix the links, O(1)', size: 20, code: true },
                { t: 'free()', sub: 'end the node\'s lifetime', size: 20, code: true },
            ] } },
            notes: 'Only the find step is O(n). Once you hold the node, unlinking is O(1). Freeing is a separate memory operation, done by whoever owns the node.' },

        { kind: 'content', title: 'Count the special cases', layout: 'tb', ratio: 0.55,
            a: { stat: [
                { value: '1', label: '`NULL` check in `push_front()`' },
                { value: '1', label: '`NULL` check in `push_back()`' },
                { value: '2', label: '`NULL` checks in `dlist_unlink()`' },
            ] },
            b: { callout: '**Remember this number: four.** Next week, a single extra node, the *sentinel*, makes all of them disappear.' } },

        { kind: 'concept', title: 'A link dump', layout: 'tb', ratio: 0.36,
            what: 'A **link dump** prints each node\'s `prev`, its own address (`self`), and `next`, one node per line.',
            why: 'Pointer bugs stay silent until a crash far away; the dump makes the links visible so you can check them.',
            how: { code: { file: 'examples/dll_book.c', from: /printf\("head = /, to: /\(void \*\)cur->prev, \(void \*\)cur/ }, label: 'dll_book.c (dlist_dump)' },
            notes: 'Pointer bugs are silent until something crashes far away. Two tools help, and both are plain C. The first prints prev, self and next for every node; the next slide shows how to read its output.' },

        { kind: 'content', title: 'Reading a link dump', layout: 'tb', ratio: 0.45,
            a: { out: `  [1] prev = 0x0            self = 0x104a69280    next = 0x104a69240
  [2] prev = 0x104a69280    self = 0x104a69240    next = 0x104a692c0
  [3] prev = 0x104a69240    self = 0x104a692c0    next = 0x0`, label: 'output' },
            b: { steps: [
                'Each node\'s `next` must equal the following line\'s `self`',
                'That line\'s `prev` must equal this line\'s `self`',
                '`0x0` (`NULL`) may appear only as the first `prev` and the last `next`',
            ], size: 19, rowH: 0.7 },
            notes: 'Read it diagonally. Walk through the three lines with the class.' },

        { kind: 'concept', title: 'An invariant checker', layout: 'tb', ratio: 0.4,
            what: 'An **invariant checker** verifies the invariants in code: walking forward, every node\'s `prev` must be the node before it, and `tail` must be the last node.',
            why: 'A wrong `prev` crashes only later, somewhere unrelated. Called after every operation, the checker names the broken node at once.',
            how: { code: { file: 'examples/dll_book.c', from: /for \(cur = list->head; cur != NULL; prev = cur/, to: /^    }$/, inclusiveSame: false }, label: 'dll_book.c (dlist_check)' },
            notes: 'Call it after every operation while you develop. The checker walks forward, remembering the previous node, and verifies every prev link and the tail pointer.' },

        { kind: 'demo', title: 'Live demo: dll_book.c', layout: 'tb', ratio: 0.42,
            a: { code: { file: 'examples/dll_book.c', from: /break a link on purpose/, to: /list\.head->next->prev = list\.head;/ }, label: 'dll_book.c (main)' },
            b: { out: `forward : [1] [2] [3]
...
check: OK
BROKEN: node [2] has the wrong prev
after breaking a link, check: FAILED
after free, check: OK`, label: 'output' },
            notes: 'dll_book.c builds a list, dumps it, checks it, breaks one link on purpose, checks again, and repairs it.' },

        { kind: 'content', title: 'Common pitfalls',
            a: { table: { head: ['Symptom', 'Likely cause'], colW: [5, 7], size: 17, rows: [
                ['Forward print is fine, backward print skips nodes', 'A `prev` was not set during insert (step 3 of push_front)'],
                ['Backward print starts at the wrong node', '`tail` was not updated by `push_back()` or by deleting the last node'],
                ['Crash when deleting the first or last node', 'Dereferenced `n->prev` or `n->next` without checking for `NULL`'],
                ['List looks fine, then crashes after a delete', 'The deleted node was freed but a neighbor still points to it'],
            ] } } },

        /* ---------------- Part 3 ---------------- */
        { newSection: 'Part 3 — Sentinel', kind: 'section', num: 3, label: 'PART 3', title: 'The sentinel and the circular invariant', sub: 'Pictures of 0, 1, and 3 elements; one rule with no exceptions' },

        { kind: 'concept', title: 'The sentinel node', layout: 'tb', ratio: 0.4,
            what: 'A **sentinel** (dummy head) is one extra node that is always in the list and carries no data. It is usually a plain variable, not `malloc()`ed.',
            why: 'In Parts 1 and 2 the end nodes had `NULL` neighbors: four `NULL` checks and four delete cases. With a sentinel, every real node has a node on both sides.',
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
            why: 'The doubly linked list needed four rules, two of them about `NULL`. One rule with no exceptions means one simple checker, and list code with no special cases.',
            how: { code: `/* for EVERY node n, including the sentinel */
n->next->prev == n
n->prev->next == n

/* the empty list */
head.next == &head
head.prev == &head`, label: null },
            notes: 'Compare with the four invariants from Part 1. Now there is one rule, and it has no exceptions.' },

        { kind: 'content', title: 'Useful facts that follow',
            a: { table: { head: ['Question', 'Answer'], colW: [4.5, 7.5], size: 18, rows: [
                ['Is the list empty?', '`head.next == &head`'],
                ['First element?', '`head.next` (only valid if not empty)'],
                ['Last element?', '`head.prev`: O(1), with no separate tail pointer'],
                ['End of forward traversal?', 'Back at `&head`, **not** at `NULL`'],
            ] } } },

        { kind: 'concept', title: 'Traversing a ring', layout: 'tb', ratio: 0.44,
            what: 'Forward traversal starts at `head->next` and follows `next` until it is **back at the sentinel**. Backward traversal starts at `head->prev` and follows `prev`. An empty list runs the loop zero times.',
            why: 'A ring never contains `NULL`, so `pos != NULL` is an infinite loop: the most common circular-list bug. Starting at `head` itself would treat the sentinel\'s meaningless data as an element.',
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

        /* ---------------- Part 4 ---------------- */
        { newSection: 'Part 4 — Insert and unlink', kind: 'section', num: 4, label: 'PART 4', title: 'One insert, one unlink', sub: 'Safe traversal, `assert()`, and `-DNDEBUG`' },

        { kind: 'concept', title: '`insert_between()`: one insert for all', layout: 'tb', ratio: 0.42,
            what: '`insert_between(n, prev, next)` places a new node between two nodes that are currently neighbors, with four pointer writes. Every insertion in a ring is this one operation.',
            why: 'The doubly linked list needed a push for each end, each with an `if` for the empty list. In a ring every position has real neighbors, so one helper with no `if` covers them all.',
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
            notes: 'The result is exactly the one-element picture. Compare with dlist_push_back() from Part 1, which needed an if for the empty list.' },

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
                'Recall the general case from Part 2 (notes §2.1)',
            ] } },

        { kind: 'concept', title: 'Unlinking from a ring', ratio: 0.52,
            what: '`unlink_node(entry)` makes the two neighbors point at each other: `entry->prev->next = entry->next` and `entry->next->prev = entry->prev`. That is all: two assignments and no `if`.',
            why: 'Part 2\'s unlink needed two `NULL` checks and four cases. In a ring every node has real neighbors, so the first, last, and only node all run the same two lines.',
            how: { code: `static void unlink_node(struct node *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
}`, label: null },
            notes: 'This is the answer to the exercise: Part 2\'s general case with the ifs deleted. The next slide traces the only-element case.' },

        { kind: 'compare', title: 'Unlinking the only element',
            intro: 'Afterwards `head.next == &head` and `head.prev == &head`: the list is empty again, automatically.',
            left: { label: 'BEFORE', kind: 'neutral', body: { diagram: { type: 'chain', kind: 'circular', nodes: ['A'] } } },
            right: { label: 'AFTER unlink_node(&A)', kind: 'good', body: { diagram: { type: 'chain', kind: 'circular', nodes: [] } } } },

        { kind: 'content', title: 'Doubly linked vs. circular with a sentinel',
            a: { table: { head: ['', 'Parts 1–2 (`NULL`-terminated)', 'Parts 3–4 (circular + sentinel)'], colW: [3.5, 4.3, 4.3], size: 18, rows: [
                ['Insert front', '1 `if`', '0'],
                ['Insert back', '1 `if`', '0'],
                ['Unlink', '2 `if`s, four cases', '0'],
                ['Find the last node', 'separate `tail` pointer', '`head.prev`'],
                ['Extra memory', '`tail` pointer', 'one sentinel node'],
            ] } } },

        { kind: 'concept', title: 'After unlinking: re-initialize or poison', ratio: 0.52,
            what: 'After unlinking, `entry->next` and `entry->prev` still point into the list. Either make the entry an empty ring again (`list_del_init()` does this), or overwrite the links with "poison" that crashes at once if used (`LIST_POISON1/2`; `NULL` is the simple version).',
            why: 'Code that later follows the stale links walks into a list the entry no longer belongs to: silent corruption instead of an error. Either way unlinking does not free.',
            how: { code: `/* re-initialize: an empty ring again */
entry->next = entry;
entry->prev = entry;

/* or poison: a later use crashes */
entry->next = NULL;
entry->prev = NULL;`, label: null },
            notes: 'Delete by ID is still: find, unlink, free. For reference, the Linux list API\'s list_del writes LIST_POISON1/2 and list_del_init re-initializes the entry. We meet list_del_init again next week.' },

        { kind: 'concept', title: 'Deleting while traversing', ratio: 0.52,
            what: 'To free every node, save `pos->next` **before** `free(pos)`, then continue from the saved pointer. At the end, call `list_init()` so the empty invariant holds again.',
            why: 'The obvious loop `for (...; pos = pos->next) free(pos);` reads `pos->next` after `free(pos)`: a use after free. In Week 06 this "save next" pattern becomes the macro `list_for_each_safe()`.',
            how: { code: { file: 'examples/clist_book.c', fn: 'free_all' } },
            notes: 'Same rule as Week 03: save next before free. In Week 06 this pattern becomes a macro, list_for_each_safe().' },

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
            notes: '-DNAME defines a macro as if the file began with #define NAME 1. With NDEBUG defined, every assert compiles to nothing, so the corrupted link goes unnoticed. Note the -B: make does not notice a change of flags (Week 03).' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Week 04 assignments', sub: 'Lab A: Assignment 04A (doubly linked list)\nLab B: Assignment 04B (circular list with a sentinel)\nStretch goals (optional)' },

        { kind: 'content', title: 'Lab A — Assignment 04A: doubly linked list', ratio: 0.6,
            a: { steps: [
                'Node creation, and insert (front, back, or both). Keep `prev` correct',
                'Print the list forward',
                'Print the list backward (the exercise from Part 1)',
                'An invariant checker, adapted from `dlist_check()`',
                'Delete by ID: find the node, unlink it (all four cases), free it',
                'Free the whole list at exit',
            ], size: 18, rowH: 0.85 },
            b: { cards: [
                { h: 'Task', body: '`assignments/week04-doubly-circular-list/README.md`', size: 16 },
                { h: 'Rule', body: 'Build and run your checker after **every** step.', size: 16 },
            ], cols: 1 } },

        { kind: 'content', title: 'Lab A — test plan',
            intro: 'After each step, print **forward and backward** and run the checker.',
            a: { table: { head: ['#', 'Action', 'Expected forward / backward'], colW: [0.8, 5, 6], size: 17, rows: [
                ['1', 'Empty list', 'empty / empty'],
                ['2', 'Insert 1, 2, 3 at the back', '`1 2 3` / `3 2 1`'],
                ['3', 'Delete 2 (middle)', '`1 3` / `3 1`'],
                ['4', 'Delete 1 (first)', '`3` / `3`'],
                ['5', 'Insert 4 at the back, delete 4 (last)', '`3` / `3`'],
                ['6', 'Delete 3 (only)', 'empty / empty'],
                ['7', 'Delete 99 (missing)', '"not found", list unchanged'],
            ] } } },

        { kind: 'content', title: 'Lab B — Assignment 04B: circular list', ratio: 0.62,
            a: { steps: [
                'Turn the starter\'s initialization into `list_init()`. Add `list_is_empty()`',
                '`insert_between()`, `insert_front()`, `insert_back()`, and node creation',
                'Write the forward and backward traversals',
                'A `list_check()` with `assert()`; call it after every operation',
                'Unlink, then delete by ID (find → unlink → `free()`)',
                '`free_all()` at exit; the empty invariant must hold again',
            ], size: 18, rowH: 0.85 },
            b: { cards: [
                { h: 'Task', body: '`assignments/week04-doubly-circular-list/README.md`', size: 16 },
                { h: 'Starter', body: '`main()` in `assignment_04b.c` already initializes the sentinel.', size: 16 },
            ], cols: 1 } },

        { kind: 'content', title: 'Lab B — test plan',
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

        { kind: 'content', title: 'Stretch goals — Assignment 04A', tag: 'OPTIONAL',
            a: { cards: [
                { n: 1, h: 'Insert anywhere in O(1)', body: '`insert_before(list, pos, n)` and `insert_after(list, pos, n)`.' },
                { n: 2, h: 'Move without malloc()', body: 'Move a node from the front to the back using only unlink + push: no `malloc()` or `free()`.' },
            ] } },

        { kind: 'content', title: 'Stretch goals — Assignment 04B', tag: 'OPTIONAL',
            a: { cards: [
                { n: 1, h: '`list_move_tail(entry, head)`', body: 'Unlink `entry`, then `insert_back()`, with no `malloc()` or `free()`.' },
                { n: 2, h: '`list_splice()`', body: 'Move every node of one list to the end of another in O(1): only the four boundary links change.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', title: 'Key takeaways: doubly linked list', items: [
            '`prev` gives backward traversal and O(1) delete, at the cost of more pointers to keep consistent',
            'Write down the **invariants** and restore all of them at the end of every operation',
            'Delete has four cases. Handle the left side and the right side independently',
            'Unlinking and freeing are separate operations',
            'A link dump and an invariant checker turn silent pointer bugs into visible ones',
        ] },

        { kind: 'takeaways', title: 'Key takeaways: circular list with a sentinel', items: [
            'A sentinel plus circular links: every node always has two real neighbors, so `NULL` never appears',
            'Empty means `head.next == &head` (and `head.prev == &head`). The last node is `head.prev`',
            'Traversal starts at `head->next` and stops back at `head`, never at `NULL`',
            'One `insert_between()` implements every insert. Unlink is two lines with no `if`',
            'Save `next` before freeing during traversal. Restore the empty invariant at the end',
            '`assert()` catches broken invariants early. `-DNDEBUG` removes the checks',
        ], rowH: 0.85 },

        { kind: 'quiz', title: 'Exit quiz: doubly linked list', questions: [
            'In `push_front()` on a non-empty list, which line is easiest to forget, and what breaks without it?',
            'Which pointers change when you delete the only node?',
            'Why is deleting a known node O(1) in a doubly linked list but O(n) in a singly linked list?',
            'State the invariant that relates `n` and `n->next`',
            'How many `NULL` checks do push_front, push_back, and unlink need in total?',
        ] },

        { kind: 'answers', title: 'Exit quiz: doubly linked list — answers', answers: [
            '`head->prev = n;` (the old first node pointing back). Without it, backward traversal skips `n`',
            '`head` and `tail` both become `NULL`',
            'The node stores its predecessor in `prev`; a singly linked node must search from `head`',
            'If `n->next != NULL`, then `n->next->prev == n`',
            'Four: one in each push, and two in unlink',
        ] },

        { kind: 'quiz', title: 'Exit quiz: circular list', questions: [
            'What are `head.next` and `head.prev` in an empty list?',
            'A student writes `for (pos = head->next; pos != NULL; pos = pos->next)`. What happens?',
            'Which call inserts at the back: `insert_between(n, head, head->next)` or `insert_between(n, head->prev, head)`?',
            'After unlinking the only element, what do `head.next` and `head.prev` point to?',
            'Why must you never write `assert(p = malloc(size))`?',
        ] },

        { kind: 'answers', title: 'Exit quiz: circular list — answers', answers: [
            'Both are `&head`',
            'An infinite loop: the ring never contains `NULL`, so it goes around and around',
            '`insert_between(n, head->prev, head)`: between the last node and the sentinel',
            'Both point to `&head`: the list is empty again with no special code',
            'With `-DNDEBUG` the whole expression, including the `malloc()` call, disappears',
        ] },

        { kind: 'next', title: 'Week 05 — Intrusive Linked List', sub: 'The sentinel still wastes a `struct book`, and the list only works for books. What if the links lived **inside** the data?' },
    ],
};
