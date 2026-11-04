// Week 05 — Doubly Linked List
module.exports = {
    week: 5,
    dirName: 'week05-doubly-linked-list',
    title: 'Doubly Linked List',
    short: 'Doubly Linked List',
    subtitle: 'Two links per node: walk both ways, delete in O(1), and keep every link consistent',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'dll_book.c',
            code: { file: 'examples/dll_book.c', struct: 'node' },
            notes: 'Today every node gets a second pointer, prev. That buys backward traversal and O(1) delete, and costs more pointers to keep consistent.' },

        { kind: 'agenda', plan: [
            ['0:00', '0:10', 'Review of Week 04', 'review', 'Review'],
            ['0:10', '0:55', 'Part 1 — Two links per node, and insertion', 'lecture', 'Part 1'],
            ['0:55', '1:05', 'Break', 'break', 'Break'],
            ['1:05', '1:50', 'Part 2 — Delete in O(1), invariants, and debugging links', 'lecture', 'Part 2'],
            ['1:50', '2:50', 'Lab — Week 05 assignment', 'lab', 'Lab'],
            ['2:50', '3:00', 'Wrap-up and exit quiz', 'wrap', 'Quiz'],
        ] },

        { kind: 'objectives', items: [
            'Explain what a `prev` pointer buys (backward traversal, O(1) unlink) and what it costs',
            'State the link invariants of a doubly linked list and check them in code',
            'Insert at the front and the back while keeping `head`, `tail`, `next`, and `prev` consistent',
            'List the four cases of deleting a node and which pointers change in each',
            'Debug pointer bugs by dumping addresses and running an invariant checker',
        ] },

        { kind: 'review', title: 'Review of Week 04', questions: [
            'Why does `push_front()` take `struct node **`?',
            'What must you do *before* `free(cur)` when freeing a list?',
            'Which cases of delete change `head`?',
        ], today: 'Today\'s questions: **How do you print a singly linked list backwards? How do you delete a node when you only have a pointer to it?** Both are awkward with only `next`.',
            notes: 'Answers: push_front must change the caller\'s head; save next before free; deleting the first node (including the only node) changes head.' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Two links', kind: 'section', num: 1, label: 'PART 1 · 45 MIN', title: 'Two links per node, and insertion', sub: 'What `prev` buys, the invariants, inserting at both ends' },

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

        { kind: 'content', title: 'Forward traversal: unchanged from Week 04', ratio: 0.62,
            a: { code: { file: 'examples/dll_book.c', fn: 'dlist_print_forward' } },
            b: { bullets: [
                'The loop starts at `list->head`, follows `next`, and stops at `NULL`.',
                'It is exactly the Week 04 loop: the `prev` links are simply not used.',
            ] } },

        { kind: 'concept', title: 'Backward traversal', layout: 'tb', ratio: 0.5,
            what: '**Backward traversal** visits the nodes from last to first: it starts at the last node and follows `prev` until it reaches `NULL`.',
            why: ['A singly linked list cannot do this without extra memory.', 'It is also a test: a missing `prev` link is invisible in a forward print and shows up only when you print backward. That is why every test prints both directions.'],
            how: { art: `forward :  head --> [1] --> [2] --> [3] --> NULL      follow next
backward:  NULL <-- [1] <-- [2] <-- [3] <-- tail      follow prev` },
            notes: 'Do not show the loop: backward print is part of the Week 05 assignment. The next slide asks students to write it.' },

        { kind: 'exercise', title: 'Write the backward traversal', minutes: 3, ratio: 0.55,
            a: { steps: [
                'Where does the loop **start**?',
                'Which pointer does it **follow**?',
                'When does it **stop**?',
            ], size: 22, rowH: 0.95 },
            b: { callout: 'You need this loop in the lab: backward print is part of the Week 05 assignment.' },
            notes: 'Give students three minutes. Do not show a solution: backward print is an assignment deliverable. Hint if needed: it is the mirror of the forward loop.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — Delete and debug', kind: 'section', num: 2, label: 'PART 2 · 45 MIN', title: 'Delete in O(1), invariants, and debugging links', sub: 'Unlinking, the four cases, link dumps, invariant checkers' },

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

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB · 60 MIN', title: 'Week 05 assignment', sub: 'Insert, print both ways, check the links, delete' },

        { kind: 'content', title: 'Lab — suggested order', ratio: 0.6,
            a: { steps: [
                'Node creation, and insert (front, back, or both). Keep `prev` correct',
                'Print the list forward',
                'Print the list backward (the exercise from Part 1)',
                'An invariant checker, adapted from `dlist_check()`',
                'Delete by ID: find the node, unlink it (all four cases), free it',
                'Free the whole list at exit',
            ], size: 18, rowH: 0.85 },
            b: { cards: [
                { h: 'Task', body: '`assignments/week05-doubly-linked-list/README.md`', size: 16 },
                { h: 'Rule', body: 'Build and run your checker after **every** step.', size: 16 },
            ], cols: 1 } },

        { kind: 'content', title: 'Lab — test plan',
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

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: 'Insert anywhere in O(1)', body: '`insert_before(list, pos, n)` and `insert_after(list, pos, n)`.' },
                { n: 2, h: 'Move without malloc()', body: 'Move a node from the front to the back using only unlink + push: no `malloc()` or `free()`.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            '`prev` gives backward traversal and O(1) delete, at the cost of more pointers to keep consistent',
            'Write down the **invariants** and restore all of them at the end of every operation',
            'Delete has four cases. Handle the left side and the right side independently',
            'Unlinking and freeing are separate operations',
            'A link dump and an invariant checker turn silent pointer bugs into visible ones',
        ] },

        { kind: 'quiz', questions: [
            'In `push_front()` on a non-empty list, which line is easiest to forget, and what breaks without it?',
            'Which pointers change when you delete the only node?',
            'Why is deleting a known node O(1) in a doubly linked list but O(n) in a singly linked list?',
            'State the invariant that relates `n` and `n->next`',
            'How many `NULL` checks do push_front, push_back, and unlink need in total?',
        ] },

        { kind: 'answers', answers: [
            '`head->prev = n;` (the old first node pointing back). Without it, backward traversal skips `n`',
            '`head` and `tail` both become `NULL`',
            'The node stores its predecessor in `prev`; a singly linked node must search from `head`',
            'If `n->next != NULL`, then `n->next->prev == n`',
            'Four: one in each push, and two in unlink',
        ] },

        { kind: 'next', title: 'Week 06 — Circular Doubly Linked List', sub: 'What if the list never had a `NULL` in it? With a sentinel, four special cases become zero.' },
    ],
};
