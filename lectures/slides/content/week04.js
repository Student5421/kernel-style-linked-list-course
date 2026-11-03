// Week 04 — Singly Linked List
module.exports = {
    week: 4,
    dirName: 'week04-singly-linked-list',
    title: 'Singly Linked List',
    short: 'Singly Linked List',
    subtitle: 'Nodes, links, traversal, insertion, freeing, and the design of delete',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'sll_book.c',
            code: [{ file: 'examples/sll_book.c', struct: 'book' }, { file: 'examples/sll_book.c', struct: 'node' }],
            notes: 'We can create objects at run time. Today we chain them together: every node holds a pointer to the next one.' },

        { kind: 'agenda', plan: [
            ['0:00', '0:10', 'Review of Week 03', 'review', 'Review'],
            ['0:10', '0:55', 'Part 1 — Nodes, links, and traversal', 'lecture', 'Part 1'],
            ['0:55', '1:05', 'Break', 'break', 'Break'],
            ['1:05', '1:50', 'Part 2 — Insert, free, and the design of delete', 'lecture', 'Part 2'],
            ['1:50', '2:50', 'Lab — Week 04 assignment', 'lab', 'Lab'],
            ['2:50', '3:00', 'Wrap-up and exit quiz', 'wrap', 'Quiz'],
        ] },

        { kind: 'objectives', items: [
            'Compare arrays and linked lists: memory layout, insert, delete, indexing',
            'Define a self-referential `struct node` and draw a list as boxes and arrows',
            'Traverse a list with a cursor and handle the empty list (`head == NULL`)',
            'Explain why `push_front()` needs `struct node **` (or must return the new head)',
            'Free an entire list without a use-after-free',
            'Identify every case that `delete` must handle',
        ] },

        { kind: 'review', title: 'Review of Week 03', questions: [
            'Where does `struct book *b = malloc(sizeof(*b));` put `b`, and where does it put the book?',
            'Name the four classic heap bugs',
            'After `free(p)`, what value does `p` hold?',
        ], today: 'Today\'s question: we can create objects at run time. **How do we keep track of an unknown number of them without an array?**' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — nodes', kind: 'section', num: 1, label: 'PART 1 · 45 MIN', title: 'Nodes, links, and traversal', sub: 'Arrays vs. lists, the self-referential struct, the traversal loop' },

        { kind: 'concept', title: 'Linked list', layout: 'tb', ratio: 0.55,
            what: 'A **linked list** is a chain of separately allocated **nodes**. Each node holds its data and a pointer to the next node; a `head` pointer gives the first node, and the last node points to `NULL`. Unlike an array, the nodes can be anywhere in memory.',
            why: ['An array has a fixed size (or must be `realloc()`ed and copied), and inserting at the front shifts every element: O(n).', 'A list grows one node at a time and inserts or deletes in O(1) once you hold the right node, at the cost of O(n) indexing.'],
            how: { diagram: { type: 'chain', kind: 'singly', nodes: ['b0', 'b1', 'b2'] } },
            notes: 'Array: one contiguous block. Linked list: nodes anywhere on the heap, and each one knows the next. A list trades fast indexing for cheap insertion and deletion and unlimited growth; operating-system kernels need exactly that trade. The next slide compares the costs.' },

        { kind: 'content', title: 'What each one costs',
            a: { table: { head: ['Operation', 'Array', 'Singly linked list'], colW: [5, 3.4, 3.6], rows: [
                ['Access the *i*-th element', 'O(1), `a[i]`', 'O(n), walk from `head`'],
                ['Insert / delete at the front', 'O(n), shift everything', '**O(1)**'],
                ['Insert / delete in the middle (position known)', 'O(n), shift', '**O(1)** given the previous node'],
                ['Size', 'Fixed, or `realloc()` + copy', 'Grows one node at a time'],
                ['Extra memory', 'None', 'One pointer per node'],
            ] } },
            foot: 'A list trades fast indexing for cheap insertion and deletion and unlimited growth. Kernels need exactly that trade.' },

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

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — insert, free, delete', kind: 'section', num: 2, label: 'PART 2 · 45 MIN', title: 'Insert, free, and the design of delete', sub: 'push_front, the head problem, push_back, free_list, search and delete' },

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
            b: { callout: 'The demo uses `goto out_of_memory;` for error handling. One cleanup label at the end of a function is common in the Linux kernel: the cleanup code lives in one place.' } },

        { kind: 'exercise', title: 'Search by ID: design it first', minutes: 5, ratio: 0.5,
            a: { code: `/* Returns the node whose data.id == id,
 * or NULL if there is none. */
struct node *find_by_id(struct node *head,
                        int id);`, label: null },
            b: { steps: [
                'What does it return for an empty list?',
                'Why return a `struct node *` and not a copy of the `struct book`?',
            ], size: 19, rowH: 1.1 },
            notes: 'Write it on paper before the lab.' },

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
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB · 60 MIN', title: 'Week 04 assignment', sub: 'Insert, search, delete, print, free. Build after every step' },

        { kind: 'content', title: 'Lab — suggested order', tag: '60 MIN',
            a: { steps: [
                '`node_create()`: allocate a node holding one student, with a `NULL` check',
                'Insert (`push_front()` or `push_back()`) and print three students',
                '`free_list()`. Call it at the end of `main()` from now on',
                'Search by ID. Print the found student, or `Not found`',
                'Delete by ID: find, unlink, free. Handle every case in the table',
            ], size: 19, rowH: 0.95 },
            notes: 'Task: assignments/week04-singly-linked-list/README.md' },

        { kind: 'content', title: 'Lab — test plan',
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

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: 'Delete with `**link`', body: 'No special case for the first node.' },
                { n: 2, h: '`insert_sorted()`', body: 'Keep the list ordered by ID.' },
                { n: 3, h: '`reverse_list()`', body: 'Reverse in place by changing only `next` pointers.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            'A list is nodes connected by `next`. `head == NULL` means empty; the last `next` is `NULL`',
            'Traverse with a separate cursor: `for (cur = head; cur != NULL; cur = cur->next)`',
            'A function that may change `head` needs `struct node **` (or must return the new head)',
            'When freeing, save `next` **before** `free()`',
            'Delete handles empty, not-found, first, middle, last, and only-node cases. Week 06 removes the first/last/only-node cases',
        ] },

        { kind: 'quiz', questions: [
            'What is the time cost of reaching the 1000th node of a list?',
            'Why does `push_front_wrong(head, n)` leave `main()`\'s `head` unchanged?',
            'What is wrong with `for (cur = head; cur != NULL; cur = cur->next) free(cur);`?',
            'Which delete cases change `head`?',
            'In `push_back()` with `struct node **link`, what does `link` point to when the list is empty?',
        ] },

        { kind: 'answers', answers: [
            'O(n): you must follow 999 `next` pointers from `head`',
            'The function received a copy of `head` and changed only the copy',
            '`cur = cur->next` reads from `cur` after it was freed: use after free',
            'Deleting the first node, which includes deleting the only node',
            'To `main()`\'s `head` variable itself, so `*link = n` sets `head`',
        ] },

        { kind: 'next', title: 'Week 05 — Doubly Linked List', sub: 'A singly linked list only goes forward, and deleting a node means finding its predecessor. What if every node also knew the node before it?' },
    ],
};
