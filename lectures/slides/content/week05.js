// Week 05 — Intrusive Linked List
module.exports = {
    week: 5,
    dirName: 'week05-intrusive-list',
    title: 'Intrusive Linked List',
    short: 'Intrusive Linked List',
    subtitle: 'Put the links inside the data: one list implementation for every type',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'intrusive_book.c',
            code: `struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;
};`,
            notes: 'Today the node disappears. The links move into the data itself, exactly as in our final project.' },


        { kind: 'objectives', items: [
            'Explain the limits of a node that *contains* the data',
            'Define `struct list_head` and embed it in a data structure (an *intrusive* list)',
            'Write list operations that know nothing about the data they link',
            'Explain why traversal gives you a `struct list_head *`, and why you need a way back',
            'Explain when a first-member cast works, and why it is not enough',
            'Put one object in two lists at once, and free it safely',
        ] },

        { kind: 'review', title: 'Review of Week 04', questions: [
            'What are `head.next` and `head.prev` in an empty circular list?',
            'Write `insert_back()` using `insert_between()`',
            'What does `-DNDEBUG` do to `assert()`?',
        ], today: 'Today\'s question: our sentinel wastes a whole `struct book`, and our list only works for books. **Can we write the list code once, for every type?**',
            notes: 'Answers: both are &head; insert_between(n, head->prev, head); it turns every assert into nothing.' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Links inside', kind: 'section', num: 1, label: 'PART 1', title: 'Put the links inside the data', sub: '`struct list_head` and a list API that knows nothing about books' },

        { kind: 'concept', title: 'A node that contains the data', layout: 'tb', ratio: 0.5,
            what: 'In Weeks 03–04 every list element is a `struct node` that **contains** a `struct book` plus the links. The list code works on nodes, so it is written for one payload type.',
            why: ['A list of students needs a `struct student_node` and a second copy of every list function.', 'The sentinel wastes a whole `struct book`, and a book can be in only one list without a second node, a second allocation, or a copy.'],
            how: { code: `struct node {
    struct book data;      /* the node CONTAINS the data */
    struct node *next;
    struct node *prev;
};`, label: null },
            notes: 'Four problems from the notes: list code tied to one payload type; the sentinel carries an unused payload; an object can be in only one list; the data is copied into the node, or with a struct book * inside, two allocations and two frees per element.' },

        { kind: 'concept', title: '`struct list_head`', ratio: 0.5,
            what: '`struct list_head` holds only two links, `next` and `prev`, and no data. Any struct becomes "listable" by embedding one as a member. The sentinel is then just a `struct list_head`: 16 bytes.',
            why: 'In `struct node` the links and the payload were glued together, so the sentinel wasted a `struct book` and the list code worked only for books.',
            how: { code: [{ file: 'examples/intrusive_book.c', struct: 'list_head' }, `struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;   /* links INSIDE */
};`], label: 'intrusive_book.c' },
            notes: 'struct list_head has no data, only links. Any struct becomes listable by embedding one.' },

        { kind: 'concept', title: 'An intrusive list', layout: 'tb', ratio: 0.395,
            what: 'In an **intrusive** list each object embeds its own `list_head`. Every `next` and `prev` points to the `list` member **inside** the next object, not to its start.',
            why: 'Nothing is allocated or copied for the list, and an object joins several lists by embedding one `list_head` per list.',
            how: { art: `  library (sentinel)        book 1                        book 2
  +-------------+         +----------------+            +----------------+
  | next  *-----+--+      | id             |            | id             |
  | prev  *     |  |      | title[32]      |            | title[32]      |
  +-------------+  |      | year           |            | year           |
                   |      +----------------+            +----------------+
                   +----->| list.next  *---+----------->| list.next  *---+--> (library)
                          | list.prev      |<-----------+ list.prev      |
                          +----------------+            +----------------+` },
            notes: 'The key fact for today: every next and prev points to the list member inside the next object, not to the start of the object. The list intrudes into the object\'s definition, hence the name.' },

        { kind: 'content', title: 'The ring, seen from the list code', layout: 'tb', ratio: 0.6,
            a: { diagram: { type: 'chain', kind: 'circular', nodes: ['book 1', 'book 2', 'book 3'], sentinel: 'library', nodeW: 1.4 } },
            b: { bullets: [
                'The same circular ring as Week 04: `library.next` is the first book, `library.prev` the last',
                'But every box the arrows touch is a `struct list_head`, embedded in a book',
            ] },
            notes: 'From the list code\'s point of view, there are only list_head objects. It never sees a struct book.' },

        { kind: 'concept', title: 'A generic list API', layout: 'tb', ratio: 0.36,
            what: 'The list functions see only `struct list_head *`. They use the `list.h` names and argument order: the new entry first, the head second.',
            why: 'With nodes that contain the data, each payload type needs its own copy of every function. This API is written once, in `list.c`.',
            how: { table: { head: ['Week 04', 'Week 05', 'Meaning'], colW: [3.4, 4.6, 4], size: 15, rows: [
                ['`list_init(head)`', '`list_init(head)` (Linux: `INIT_LIST_HEAD`)', 'Make an empty ring'],
                ['`list_is_empty(head)`', '`list_empty(head)`', '`head->next == head`'],
                ['`insert_front(head, n)`', '`list_add(new, head)`', 'Insert right after `head`'],
                ['`insert_back(head, n)`', '`list_add_tail(new, head)`', 'Insert right before `head`'],
                ['`unlink_node(entry)`', '`list_del(entry)`', 'Unlink. **Never frees**'],
            ] } },
            notes: 'The operations are Week 04\'s, with struct node replaced by struct list_head. Note the argument order: list_add(new, head). Nothing in these functions mentions books.' },

        { kind: 'content', title: 'Nothing here mentions books', layout: 'tb', ratio: 0.72,
            a: { code: [
                { file: 'examples/intrusive_book.c', fn: 'list_add', comment: true },
                { file: 'examples/intrusive_book.c', fn: 'list_add_tail', comment: true },
            ] },
            b: { bullets: [
                'Same code links students, tasks, or network packets. In the final project it lives in `list.c`',
                'Linux\'s `list.h` calls this helper `__list_add()`; names starting with `__` are reserved in standard C, so we use `list_insert_between()`',
            ], size: 18 },
            notes: 'The bodies are Week 04\'s insert_between() and unlink code with the type changed. See examples/intrusive_book.c for list_insert_between.' },

        { kind: 'content', title: 'Creating and inserting', layout: 'tb', ratio: 0.45,
            a: { code: `struct book *b = book_create(1, "The C Programming Language", 1978);
/* malloc, fill in the fields, list_init(&b->list) */

list_add_tail(&b->list, &library);   /* link the EMBEDDED list_head */`, label: null },
            b: { callout: 'You pass `&b->list`, the address of the member, **not** `b`. The list never sees a `struct book *`.' } },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — Back to the object', kind: 'section', num: 2, label: 'PART 2', title: 'From `list_head *` back to the object', sub: 'First-member casts, stepping back by an offset, one object in two lists' },

        { kind: 'concept', title: 'From `list_head *` back to the object', layout: 'tb', ratio: 0.46,
            what: 'Traversal hands you `struct list_head *pos`, a pointer to the `list` member inside some book. To read `id` or `title`, you need a pointer to the **book that contains** that member.',
            why: 'Without a way back, an intrusive list is useless: you can walk the ring but never print a title. And `free(pos)` would free the wrong address, 40 bytes inside the book.',
            how: { code: `struct list_head *pos;

for (pos = library.next; pos != &library; pos = pos->next) {
    /* pos is a struct list_head *.  How do we print the title? */
}`, label: null },
            notes: 'Traversal hands us pointers to list members. To read id or title we need a pointer to the book that contains that member. Two options follow.' },

        { kind: 'concept', title: 'The first-member cast', layout: 'tb', ratio: 0.395,
            what: 'If `list_head` is the **first** member, a plain cast gets the object back. C11 §6.7.2.1p15: a pointer to a struct points to its first member.',
            why: 'It is the simplest way back, with no arithmetic, because there is never padding before the first member. But it works only in this special case.',
            how: { code: [{ file: 'examples/first_member.c', struct: 'tagged_book' }, 'back = (struct tagged_book *)pos;   /* works */'], label: 'first_member.c' },
            notes: 'The trick is real and is used in some C code. The demo prints the same address for &t and &t.list.' },

        { kind: 'demo', title: 'Live demo: first_member.c', ratio: 0.55,
            a: { out: `&t      = 0x16b2b6510
&t.list = 0x16b2b6510   (same address)
back->id = 7, back->title = First Member`, label: './first_member' },
            b: { callout: '`&t` and `&t.list` are the **same address**, so the cast gives back the whole object.', kind: 'good' } },

        { kind: 'content', title: 'Why the first-member cast is not enough',
            a: { cards: [
                { n: 1, h: 'Only one member can be first', body: 'So an object can be in only one list this way.', kind: 'bad' },
                { n: 2, h: 'Reordering breaks it silently', body: 'Move a member, and every cast becomes wrong. No compiler error.', kind: 'bad' },
                { n: 3, h: 'Our struct has `list` last', body: 'The assignment\'s `struct student` cannot use the cast.', kind: 'bad' },
            ] },
            notes: 'The trick is real and is used in some C code, but it breaks down quickly.' },

        { kind: 'concept', title: 'Stepping back by the member\'s offset', ratio: 0.5,
            what: 'The `list` member sits at the same distance from the start of **every** book: 40 bytes. Subtract that distance from `pos`, counting in bytes, and you are at the start of the book.',
            why: 'This works wherever the member is: `struct student` with `list` last works, and so does an object with several `list_head` members. The first-member cast handles neither.',
            how: { diagram: { type: 'layout', title: 'struct book   (sizeof == 56)', fields: [
                { name: 'id', size: 4 }, { name: 'title[32]', size: 32 }, { name: 'year', size: 4 }, { name: 'list', size: 16, hl: true },
            ], marks: [{ at: 40, label: 'pos = &b->list' }], span: { from: 0, to: 40, label: 'b = (char *)pos - 40' } } },
            notes: 'The list member sits at a fixed distance from the start of every book: 4 (id) + 32 (title) + 4 (year) = 40 bytes. Step back from pos by that distance and you are at the start of the book. The next slide wraps this in a helper.' },

        { kind: 'content', title: 'The helper: a black box for one week', layout: 'tb', ratio: 0.45,
            a: { code: { file: 'examples/intrusive_book.c', fn: 'book_from_list', comment: true } },
            b: { callout: [
                'Give it a `list` pointer, get the book back',
                '`offsetof`, the `char *` cast, and the generic `container_of()` are next week\'s topic',
            ] },
            notes: 'Include stddef.h for offsetof. Treat this helper as a black box for one week.' },

        { kind: 'demo', title: 'Live demo: intrusive_book.c', layout: 'tb', ratio: 0.55,
            a: { out: `forward : (empty)
forward : [0] [1] [2] [3]
backward: [3] [2] [1] [0]
sizeof(struct list_head) = 16, sizeof(struct book) = 56
pos = 0x100925328  ->  book = 0x100925300  (40 bytes earlier)  [0] Preface
pos = 0x100925268  ->  book = 0x100925240  (40 bytes earlier)  [1] The C Programming Language
...`, label: './intrusive_book' },
            b: { bullets: [
                'The distance is always 40 bytes: 4 (`id`) + 32 (`title`) + 4 (`year`)',
                'Book 0 was added with `list_add()`, so it appears first',
            ] } },

        { kind: 'concept', title: 'The `free()` trap', layout: 'tb', ratio: 0.5,
            what: '`free()` must receive exactly the pointer that `malloc()` returned. Inside a traversal, `pos` points to the `list` member, 40 bytes past the start of the book.',
            why: '`free(pos)` hands the allocator an address it never gave out. It usually aborts with `free(): invalid pointer` (glibc) or `pointer being freed was not allocated` (macOS).',
            how: { code: `free(pos);                  /* WRONG: pos points INSIDE the book */

free(book_from_list(pos));  /* RIGHT: the address malloc() returned */`, label: null },
            notes: 'Free the object, not the embedded member. The same rule holds next week with container_of().' },

        { kind: 'concept', title: 'One object, two lists', layout: 'tb', ratio: 0.48,
            what: 'With intrusive lists, membership in another list is just another member. A book with `struct list_head all;` and `struct list_head borrowed;` can be in the list of every book and the list of borrowed books at the same time.',
            why: 'With `struct node`, one book in two lists needs a second node, a second allocation, or a copy that drifts out of date. Here both lists link the same object.',
            how: { code: { file: 'examples/multi_list.c', struct: 'book' } },
            notes: 'With intrusive lists, membership in another list is just another member. all holds every book; borrowed holds books 2 and 4 in the demo.' },

        { kind: 'demo', title: 'Live demo: multi_list.c', ratio: 0.55,
            a: { out: `borrow 2 and 4
all      : [1] [2] [3] [4]
borrowed : [2] [4]
return 2
all      : [1] [2] [3] [4]
borrowed : [4]
after free_all: all empty = yes, borrowed empty = yes`, label: './multi_list' },
            b: { callout: '"Return 2" unlinks `book2.borrowed` only. Book 2 stays in `all`.', kind: 'good' } },

        { kind: 'content', title: 'Three lessons from the demo',
            a: { cards: [
                { n: 1, h: 'Lists are independent', body: 'Removing from one list does not affect the other.' },
                { n: 2, h: 'One owner frees', body: 'Here `all` frees. Remove the object from **every** list first.' },
                { n: 3, h: '`list_del_init()`', body: 'Re-initializes the entry, so `list_empty(&b->borrowed)` means "not borrowed".' },
            ] },
            notes: 'If a book is freed while still in borrowed, that list keeps a pointer into freed memory.' },

        { kind: 'concept', title: 'One owner frees, after every unlink', ratio: 0.5,
            what: 'Exactly one list owns the objects and frees them; here it is `all`. Before freeing a book, remove it from **every** list it is in. `list_del_init()` re-initializes the entry, so `list_empty(&b->borrowed)` says whether the book is still borrowed.',
            why: 'If a borrowed book is freed while it is still in `borrowed`, that list keeps a pointer into freed memory, and its next traversal is a use after free.',
            how: { code: { file: 'examples/multi_list.c', fn: 'free_all' } },
            notes: 'free_all walks the owner list, all. For each book it first removes the book from borrowed if it is there (list_empty tells us, thanks to list_del_init), then from all, and only then frees it.' },

        { kind: 'content', title: 'Two helpers, one difference', layout: 'tb', ratio: 0.62,
            a: { code: [
                { file: 'examples/multi_list.c', fn: 'book_from_all' },
                { file: 'examples/multi_list.c', fn: 'book_from_borrowed' },
            ] },
            b: { callout: 'They differ only in the **member name**; a student version would differ only in the **type**. One helper per (type, member) pair does not scale: Week 06 replaces them all with **one macro**.' } },

        { kind: 'content', title: 'In the real world', ratio: 0.6,
            a: { code: `struct task_struct {   /* Linux, simplified */
    ...
    struct list_head tasks;
    ...
    struct list_head children;
    struct list_head sibling;
    ...
};`, label: null },
            b: { bullets: [
                'A process descriptor holds many `struct list_head` members',
                'One process is in several lists at once',
                'The same pattern appears in file systems, device drivers, and the network stack',
            ] } },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Week 05 assignment', sub: 'An intrusive circular list of students: no `struct node`' },

        { kind: 'content', title: 'Lab — steps', ratio: 0.64,
            a: { steps: [
                'Port your Week 04 circular list operations (Assignment 04B) to `struct list_head`; keep the argument order',
                '`student_create(id, name, score)`: `malloc()`, fill in, `list_init(&s->list)`; no insert',
                '`student_from_list(pos)` by analogy with `book_from_list()`',
                'Insert three students with `list_add_tail(&s->list, &head)`',
                'Forward and backward print, using `student_from_list()`',
                'Free every student at exit: the **student**, not the `list_head`',
            ], size: 17, rowH: 0.86 },
            b: { cards: [
                { h: 'Task', body: '`assignments/week05-intrusive-list/README.md`', size: 15 },
                { h: 'Helper', body: 'You may use `student_from_list()` this week. Next week it becomes `container_of()`.', size: 15 },
            ], cols: 1 } },

        { kind: 'content', title: 'Lab — self-check', layout: 'tb', ratio: 0.25,
            a: { term: [{ cmd: 'grep -nE "struct node *\\{" assignment_05.c  # must print nothing' }] },
            b: { steps: [
                'The sentinel is a `struct list_head`, not a `struct student`',
                'No list function mentions `struct student`',
                'After freeing, `head.next == &head` and `head.prev == &head`',
            ], size: 18, rowH: 0.95, kind: 'good' } },

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: 'A second list', body: 'Add `struct list_head honors;` and link every student with `score >= 90` into it. Print both lists.' },
                { n: 2, h: 'Delete from both', body: 'Delete a student by ID so that it disappears from **both** lists before it is freed.' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            'An **intrusive** list embeds `struct list_head` in the data. The list code never sees the data type',
            'One set of list functions serves every type, and the sentinel is just a `struct list_head`',
            'Links point to the **embedded `list_head`**, not to the start of the object',
            'To reach the object, step back by the member\'s offset. The first-member cast works only in a special case',
            'An object can be in several lists. Remove it from all of them before freeing, and free the object, never `pos`',
        ] },

        { kind: 'quiz', questions: [
            'Which does the generic list code need to know: `sizeof(struct book)`, the name of the `list` member, or neither?',
            'Why can\'t the assignment\'s `struct student` use the first-member cast?',
            'What is wrong with `free(pos)` inside a traversal?',
            'In `multi_list.c`, what happens if you free a borrowed book without removing it from `borrowed`?',
            '`book_from_all()` and `book_from_borrowed()` differ in one token. Which one?',
        ] },

        { kind: 'answers', answers: [
            'Neither: the list code only follows `next` and `prev` between `struct list_head` objects',
            'Its `list` member is last, not first, so `&s->list` is not the address of the student',
            '`pos` points to the `list` member inside the object, not to what `malloc()` returned',
            '`borrowed` keeps pointers into freed memory: its next traversal is a use-after-free',
            'The member name passed to `offsetof()`: `all` vs. `borrowed`',
        ] },

        { kind: 'next', title: 'Week 06 — `offsetof()` and `container_of()`', sub: 'What exactly is `offsetof()`, why the `char *` cast, and how do we write the helper **once** for every type and member?' },
    ],
};
