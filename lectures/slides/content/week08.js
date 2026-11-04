// Week 08 — Multi-file Programs and the Final Project
module.exports = {
    week: 8,
    dirName: 'week08-final-project',
    title: 'Multi-file Programs and the Final Project',
    short: 'Multi-file Programs and the Final Project',
    subtitle: 'Headers, separate compilation, the project Makefile, and the Student Management System kickoff',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'starter/Makefile', lang: 'make',
            code: { file: '/assignments/week08-final-project/starter/Makefile', lines: [5, 15] },
            notes: 'The last week. Two goals: build a program from several .c files, and start the Student Management System with a working plan.' },


        { kind: 'objectives', items: [
            'Split a program into headers (interfaces) and source files (implementations), with include guards',
            'Compile each `.c` file separately and link the object files, by hand and with `make`',
            'Tell a compile error from a link error, and fix both',
            'Read every line of the project Makefile: `$(SRCS:.c=.o)`, `%.o: %.c`, `$@`, `$^`, `$<`',
            'Explain why editing a header does not trigger a rebuild with the starter Makefile, and fix it',
            'Apply Week 07\'s robust input handling and file-based testing to the project',
            'Lay out the final project in three layers with clear responsibilities',
        ], size: 16 },

        { kind: 'content', title: 'Review: the whole course in one struct', tag: 'WARM-UP',
            a: { code: `struct list_head {              /* Week 04: next + prev, circular, with a sentinel */
    struct list_head *next;
    struct list_head *prev;
};

struct student {                /* Week 01: a struct.  Week 03: created with malloc() */
    int id;
    char name[20];              /* at most 19 characters + '\\0' */
    int score;
    struct list_head list;      /* Week 05: the links live inside the object */
};

struct student *s = container_of(pos, struct student, list);   /* Week 06 */`, label: null },
            foot: 'Ask the class: for each line, which week explained it, and what bug does it prevent?' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — Multi-file', kind: 'section', num: 1, label: 'PART 1', title: 'Programs made of several `.c` files', sub: 'Headers, include guards, separate compilation, compile vs. link errors' },

        { kind: 'concept', title: 'Modules: one program, several files', layout: 'tb', ratio: 0.5,
            what: 'A larger C program is split into **modules**: each `.c` file implements one part, and its `.h` file tells the other files how to use it. In the final project, `list.c` knows only `struct list_head`, `student.c` knows students, and `main.c` talks to the user.',
            why: 'In one big `main.c`, every edit recompiles everything, nobody can read the whole file at once, and the list code cannot be reused. Split, a change to `student.c` recompiles only `student.c`, and `list.c` works unchanged for any struct that embeds a `list_head`.',
            how: { art: `main.c      ──#include──►  student.h  ──#include──►  list.h
student.c   ──#include──►  student.h  (and through it, list.h)
list.c      ──#include──►  list.h` },
            notes: 'Four reasons to split: separation of concerns, readability, faster rebuilds, and reuse. The arrows show which file includes which header.' },

        { kind: 'content', title: 'The final project\'s files',
            a: { table: { head: ['File', 'Contains'], colW: [2.2, 9.8], size: 18, rows: [
                ['`list.h`', '`struct list_head`, `container_of()`, and the list function prototypes'],
                ['`list.c`', 'The list functions: `list_init()`, `list_add()`, `list_del()`'],
                ['`student.h`', '`struct student` and the student function prototypes'],
                ['`student.c`', '`student_create()`, `student_find()`, `student_delete()`, printing, counting, freeing'],
                ['`main.c`', 'The menu loop and user input'],
            ] } } },
        { kind: 'concept', title: 'Header files: declarations vs. definitions', layout: 'tb', ratio: 0.48,
            what: 'A header (`.h`) is a module\'s **interface**: the `struct` definitions, function **prototypes** (declarations), and macros other files need. The `.c` file holds the **definitions**. `#include` pastes the header into each file that uses it.',
            why: 'Without a shared header, every file that calls `student_create()` must declare it itself; the copies drift apart, and the compiler can no longer check the calls against the real parameter types.',
            how: { code: `#include "list.h"

struct student *student_create(int id, const char *name, int score);
struct student *student_find(struct list_head *head, int id);
int student_delete(struct list_head *head, int id);
/* ... five more prototypes ... */`, label: 'starter/student.h' },
            notes: 'Put struct definitions, prototypes, macros, and an include guard in the header; put function definitions, static helpers, and variables in the .c file. #include "list.h" searches the project directory first; #include <stdio.h> only the system directories.' },

        { kind: 'content', title: 'What goes in a header', layout: 'tb', ratio: 0.52,
            a: { table: { head: ['Put in a `.h` (the interface)', 'Put in a `.c` (the implementation)'], colW: [6, 6], size: 17, rows: [
                ['`struct` definitions that several files need', 'Function **definitions** (the bodies)'],
                ['Function **prototypes** (declarations)', '`static` helpers used only in that file'],
                ['Macros such as `container_of()`', 'Variables'],
                ['An include guard', ''],
            ] } },
            b: { callout: [
                '**Never define a function or a variable in a header**: every `.c` that includes it gets a copy, and the linker reports a duplicate symbol.',
                '`#include "list.h"` searches your project directory first; `#include <stdio.h>` searches only the system directories.',
            ] } },

        { kind: 'concept', title: 'Include guards', ratio: 0.55,
            what: 'An **include guard** wraps a header in `#ifndef LIST_H` / `#define LIST_H` / `#endif`. The first inclusion defines `LIST_H`; every later inclusion finds it already defined and skips the whole file.',
            why: '`main.c` gets `list.h` through `student.h`, and may include it directly too. Without a guard, `struct list_head` is defined twice and the compiler stops with `error: redefinition of \'list_head\'`.',
            how: { code: `#ifndef LIST_H
#define LIST_H

/* ... contents ... */

#endif`, label: 'list.h', maxFont: 22 },
            notes: 'The starter\'s headers already have guards. Write one in every header you create.' },

        { kind: 'concept', title: 'Separate compilation and object files', layout: 'tb', ratio: 0.5,
            what: '`gcc -c file.c` compiles one file without linking. The result is an **object file** (`.o`): machine code with unresolved references to functions defined in other files. A final `gcc` step **links** the object files into the executable.',
            why: 'Compiling everything in one command recompiles every file after every edit. With object files, `make` recompiles only the changed `.c` file and relinks, which matters as soon as a project has more than one file.',
            how: { art: `main.c    ──gcc -c──►  main.o    ┐
list.c    ──gcc -c──►  list.o    ├── gcc (link) ──►  student_manager
student.c ──gcc -c──►  student.o ┘` },
            notes: '-c means "compile only, don\'t link". The final step links the object files, connecting each call to its definition. The next slide shows the four commands by hand.' },

        { kind: 'content', title: 'Compiling by hand',
            a: { term: [
                { cmd: 'gcc -Wall -Wextra -std=c11 -c main.c    -o main.o' },
                { cmd: 'gcc -Wall -Wextra -std=c11 -c list.c    -o list.o' },
                { cmd: 'gcc -Wall -Wextra -std=c11 -c student.c -o student.o' },
                { cmd: 'gcc -Wall -Wextra -std=c11 -o student_manager main.o list.o student.o' },
            ] },
            foot: 'One `gcc` call can do all four steps, but then every file is recompiled every time.' },

        { kind: 'content', title: 'Compile errors vs. link errors',
            a: { table: { head: ['', 'Compile error', 'Link error'], colW: [1.6, 4.6, 5.8], size: 16, rows: [
                ['**When**', 'Compiling **one** `.c` file', 'Combining the `.o` files'],
                ['**Message**', '`main.c:12:5: error: ...` (has a file and line)', 'gcc: `undefined reference to \'list_add\'`; clang: `Undefined symbols ... "_list_add"`'],
                ['**Also**', '', 'gcc: `multiple definition of \'f\'`; clang: `duplicate symbol \'_f\'`'],
                ['**Cause**', 'Syntax, types, missing `#include`', 'A `.c` file not compiled or linked; a name mismatch between prototype and definition; a function defined in a header'],
            ] } } },

        { kind: 'concept', title: 'Linking and link errors', ratio: 0.48,
            what: 'The **linker** combines object files and connects every function call to exactly one definition. A **link error** means it could not: a definition is missing, or the same one appears twice.',
            why: 'The compiler checks each file alone, so it accepts a call it has a prototype for. Leave `stats.c` out of the command and `main.c` still compiles; only the linker notices that `stats_add` exists nowhere.',
            how: { term: [
                { cmd: 'gcc -Wall -Wextra -std=c11 main.c -o broken', out: `Undefined symbols for architecture arm64:
  "_stats_add", referenced from:
      _main in main-8f203c.o
  "_stats_init", referenced from: ...
  "_stats_print", referenced from: ...
ld: symbol(s) not found for architecture arm64` },
            ] },
            notes: 'Run it in lectures/week08-final-project/examples. On Linux, GNU ld prints "undefined reference to ..." for the same three symbols. Typical causes: a .c file not compiled or linked, a name mismatch between prototype and definition, or a function defined in a header (duplicate symbol).' },

        { kind: 'concept', title: '`static` functions are file-private', ratio: 0.42,
            what: 'A function declared `static` is visible only inside its own `.c` file. Other files cannot call it, and its name cannot clash with a function of the same name elsewhere.',
            why: 'Without `static`, every helper is global: two files that each define `print_menu()` give a duplicate-symbol link error, and readers cannot tell which functions are meant to be used from outside.',
            how: { code: { file: '/assignments/week08-final-project/starter/main.c', fn: 'print_menu' }, label: 'starter/main.c' },
            notes: 'Mark every helper that is not part of a header\'s interface static.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — Makefile', kind: 'section', num: 2, label: 'PART 2', title: 'The final project\'s Makefile, line by line', sub: 'Substitution references, pattern rules, automatic variables, header dependencies' },

        { kind: 'content', title: 'The starter Makefile', ratio: 0.42,
            a: { make: { file: '/assignments/week08-final-project/starter/Makefile', lines: [1, 19] }, label: 'starter/Makefile' },
            b: { table: { head: ['New today', 'Meaning'], colW: [2.6, 3.8], size: 16, rows: [
                ['`$(SRCS:.c=.o)`', 'substitution: `main.o list.o student.o`'],
                ['`%.o: %.c`', 'pattern rule: any `X.o` from `X.c`'],
                ['`$@` `$^` `$<`', 'automatic variables'],
                ['`.PHONY`', 'actions, not files (Week 01)'],
            ] } } },

        { kind: 'concept', title: 'Substitution references', ratio: 0.5,
            what: '`$(SRCS:.c=.o)` is a **substitution reference**: the value of `SRCS` with every `.c` suffix replaced by `.o`. The Makefile lists the source files once and derives the object files from them.',
            why: 'Without it you maintain two lists by hand. Adding `stats.c` means editing both, and forgetting the `.o` leaves its functions out of the link: a link error.',
            how: { make: `SRCS = main.c list.c student.c
OBJS = $(SRCS:.c=.o)

# OBJS is now: main.o list.o student.o`, label: 'starter/Makefile' },
            notes: 'SRCS is the list of source files. OBJS is the same list with .c replaced by .o; the executable depends on all of them.' },
        { kind: 'concept', title: 'Pattern rules', layout: 'tb', ratio: 0.48,
            what: '`%.o: %.c` is a **pattern rule**: "any `X.o` is built from `X.c`" with one recipe. When make needs `list.o`, it matches the pattern with `X = list` and runs the recipe for `list.c`.',
            why: 'Without it, the Makefile needs one nearly identical rule per object file: three copies of the same recipe here, dozens in a larger project, and every flag change must be made in each copy.',
            how: { make: `%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# make list.o runs:  gcc -Wall -Wextra -std=c11 -c list.c -o list.o`, label: 'starter/Makefile' },
            notes: 'One rule serves all three files. $< and $@ are explained on the next slide.' },

        { kind: 'concept', title: 'Automatic variables', layout: 'tb', ratio: 0.46,
            what: 'Inside a recipe, make sets **automatic variables** for the rule being run: `$@` is the target, `$^` is all the prerequisites, and `$<` is the first prerequisite.',
            why: 'A pattern rule has no fixed file names, so the recipe cannot say `list.c` or `list.o`. Without automatic variables, one recipe could not serve every file.',
            how: { table: { head: ['Variable', 'Means', 'In `$(TARGET): $(OBJS)`', 'In `%.o: %.c` (`list.o`)'], colW: [1.6, 2.6, 4, 3.8], size: 17, rows: [
                ['`$@`', 'the target', '`student_manager`', '`list.o`'],
                ['`$^`', 'all prerequisites', '`main.o list.o student.o`', '`list.c`'],
                ['`$<`', 'the first prerequisite', '`main.o`', '`list.c`'],
            ] } },
            notes: 'The link rule uses -o $@ $^, the compile rule -c $< -o $@.' },

        { kind: 'demo', title: 'Watching incremental builds', layout: 'tb', ratio: 0.66,
            a: { term: [
                { cmd: 'make', out: `gcc -Wall -Wextra -std=c11 -c main.c -o main.o
gcc -Wall -Wextra -std=c11 -c stats.c -o stats.o
gcc -Wall -Wextra -std=c11 -o stats_demo main.o stats.o` },
                { cmd: 'touch stats.c' },
                { cmd: 'make', out: `gcc -Wall -Wextra -std=c11 -c stats.c -o stats.o
gcc -Wall -Wextra -std=c11 -o stats_demo main.o stats.o` },
            ] },
            b: { callout: 'Only `stats.o` was recompiled, then everything was relinked. `main.o` was reused.' },
            notes: 'examples/ has the same Makefile shape as the starter, with main.c, stats.c, and stats.h.' },

        { kind: 'demo', title: 'make run', ratio: 0.48,
            a: { code: { file: 'examples/main.c', fn: 'main' } },
            b: { term: [{ cmd: 'make run', out: `./stats_demo < numbers.txt
== Score statistics ==
count   : 5
min/max : 64 / 99
average : 82.00` }] } },

        { kind: 'concept', title: 'Header dependencies', ratio: 0.48,
            what: 'A rule\'s prerequisites are the only files make watches. The starter rule `%.o: %.c` makes each `.o` depend on its `.c` **only**, so make has no idea which headers that `.c` file includes.',
            why: 'Edit `stats.h` and `make` says *Nothing to be done*: the program keeps the old behavior. Worse, after a change to `struct student`, some `.o` files may disagree about its layout (next slide).',
            how: { term: [
                { cmd: 'vi stats.h  # STATS_TITLE "Exam statistics"' },
                { cmd: 'make', out: "make: Nothing to be done for `all'." },
                { cmd: './stats_demo < numbers.txt', out: '== Score statistics ==  # the OLD title' },
            ] },
            notes: 'Fix 1: make clean && make after editing any header. Fix 2: list the headers as prerequisites, e.g. main.o stats.o: stats.h. Both are on the next slides.' },

        { kind: 'content', title: 'Worse than a stale title',
            a: { cards: [
                { n: 1, h: 'Change a header', body: 'Add a member to `struct student` in `student.h`.' },
                { n: 2, h: 'Edit main.c', body: 'Only `main.o` is rebuilt. `student.o` is not.' },
                { n: 3, h: 'Silent corruption', kind: 'bad', body: 'The two `.o` files disagree about the layout, so `container_of()` uses the wrong offset. No error message.' },
            ] } },

        { kind: 'compare', title: 'Two fixes',
            left: { label: 'FIX 1 · ALWAYS WORKS', kind: 'good', note: 'After editing any header, rebuild everything.', body: { sh: '$ make clean && make', label: null } },
            right: { label: 'FIX 2 · BETTER', kind: 'good', note: 'List the header dependencies. A rule with no recipe only adds prerequisites; `$<` is still the `.c` file.', body: { make: `main.o: student.h list.h
student.o: student.h list.h
list.o: list.h`, label: null } },
            notes: 'In examples/Makefile, uncomment the line main.o stats.o: stats.h to see fix 2 work. Going further (optional): gcc -MMD -MP writes .d dependency files, and -include $(OBJS:.o=.d) reads them; if you use it, delete the .d files in clean.' },

        /* ---------------- Part 3 ---------------- */
        { newSection: 'Part 3 — Architecture', kind: 'section', num: 3, label: 'PART 3', title: 'Project architecture and test plan', sub: 'Three layers, responsibilities, the Add flow, and what to test' },

        { kind: 'concept', title: 'A layered design', layout: 'tb', ratio: 0.5,
            what: 'The final project has three **layers**. `main.c` handles the user, `student.c` manages students, and `list.c` manages links. Each layer calls only the layer directly below it.',
            why: 'If `list.c` mentions `struct student`, it no longer works for any other type, and a change to students can break the list. Clear layers make every bug belong to one file.',
            how: { diagram: { type: 'flow', boxH: 1.3, steps: [
                { t: 'main.c', sub: 'menu, input, messages', code: true },
                { t: 'student.c', sub: 'create, find, delete, print, free', code: true },
                { t: 'list.c', sub: 'list_init, list_add, list_del', code: true },
            ] } },
            notes: 'Each layer calls only the layer below it. If list.c mentions struct student, the design is broken. The next slide lists each function\'s responsibilities from the project specification.' },

        { kind: 'content', title: 'Responsibilities', layout: 'tb', ratio: 0.74,
            a: { table: { head: ['Function', 'Does', 'Does not'], colW: [3.4, 5.4, 3.2], size: 14, rows: [
                ['`list_init(head)`', '`head->next = head->prev = head`', ''],
                ['`list_add(new, head)`', 'Insert `new` right after `head`', 'allocate anything'],
                ['`list_del(entry)`', 'Make the neighbors point at each other', '**`free()`**'],
                ['`student_create(...)`', '`malloc()`, fill in fields, initialize `list`', 'insert into the list'],
                ['`student_find(head, id)`', 'Traverse with `container_of()`; return the student or `NULL`', 'print'],
                ['`student_delete(head, id)`', 'find → `list_del()` → `free()`; return success/failure', ''],
                ['`student_free_all(head)`', 'Safe traversal: unlink and free every student', 'leave `head` dangling'],
            ] } },
            b: { callout: '`head` is a **local variable in `main()`**: no global storage. `list_add()` inserts at the front; add `list_add_tail()` (Week 05) for insertion order.' },
            notes: 'These come from the project specification. The starter\'s function set is a recommended design, not a limit.' },

        { kind: 'content', title: 'The "Add Student" flow',
            a: { art: `read ID ──► valid? (positive integer) ──no──► "Error: Invalid input."
   │yes
   ▼
student_find(&head, id) != NULL ? ──yes──► "Error: Student ID already exists."
   │no
   ▼
read name (≤ 19 chars), read score ──► 0 ≤ score ≤ 100 ? ──no──► error message
   │yes
   ▼
s = student_create(id, name, score) ──► NULL? ──► "Error: out of memory"
   │
   ▼
list_add(&s->list, &head)` },
            notes: 'Check for a duplicate before asking for the name and score, so the user is not asked to type data that will be thrown away.' },

        { kind: 'content', title: 'Input handling and testing', ratio: 0.62,
            a: { bullets: [
                'Check every `scanf()` return value **before** using the variable; discard the rest of a bad line (Week 07, §2.5)',
                'Read the name with `"%19s"` for `char name[20]`',
                'Handle `EOF` in the menu and in the middle of "Add": free everything and exit normally',
                'Replay tests with `./student_manager < test1.txt` and compare with `diff` (Week 07, §2.6)',
            ], size: 18 },
            b: { code: `1
1
Alice
95
1
1
4
7`, lang: 'text', label: 'test1.txt' },
            notes: 'test1.txt adds Alice, tries to add ID 1 again, prints forward, and exits. It assumes the duplicate check comes right after the ID.' },

        { kind: 'content', title: 'Test cases to cover',
            a: { table: { head: ['Area', 'Cases'], colW: [2.2, 9.8], size: 17, rows: [
                ['Empty list', 'Print forward/backward, count, search, delete'],
                ['Add', 'Normal add; duplicate ID; ID ≤ 0; score < 0 or > 100; name longer than 19 characters'],
                ['Delete', 'First, middle, last, only student; ID not found'],
                ['Order', 'Forward is exactly the reverse of backward'],
                ['Input', 'Letters instead of numbers in the menu and in each field; EOF in the middle of "Add"'],
                ['Exit', 'With 0 students and with several. Afterwards `head` is an empty ring'],
            ] } },
            notes: 'Check for leaks by reasoning, as in Week 03: every student_create() must be matched by exactly one free(), in student_delete() or student_free_all(). A temporary live-student counter makes this visible while developing.' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Project kickoff', sub: 'Read the whole specification first, then milestones M0–M4 in class' },

        { kind: 'content', title: 'Milestones in class (M0–M4)',
            a: { table: { head: ['', 'Goal', 'Done when'], colW: [0.7, 6.0, 5.3], size: 14, rows: [
                ['**M0**', 'Copy `starter/` into `<student_id>_<name>/`. Run `make`, `./student_manager`, choose 7', 'The untouched starter builds with zero warnings and exits cleanly'],
                ['**M1**', '`list.c`: `list_init()`, `list_add()`, `list_del()` (Week 06, Lab C)', 'A temporary test checks `head.next`/`head.prev` after two adds'],
                ['**M2**', '`student_create()`, `student_print()`, `student_print_all()`, `student_count()`', 'Menu 4 and 6 work on students added by temporary code'],
                ['**M3**', 'Menu 1 (Add): input validation, `student_find()` duplicate check', 'Adding, duplicates, and bad input behave as the spec says'],
                ['**M4**', 'Menu 2, 3, 5: `student_delete()`, search, `student_print_reverse()`', 'The test cases pass'],
            ] } },
            notes: 'Task: assignments/week08-final-project/README.md.' },

        { kind: 'content', title: 'At home (M5–M6)', layout: 'tb', ratio: 0.5,
            a: { table: { head: ['', 'Goal', 'Done when'], colW: [0.7, 5.9, 5.4], size: 16, rows: [
                ['**M5**', '`student_free_all()` with a safe traversal; handle EOF and invalid input everywhere', 'Exit leaves `head` as an empty ring; no input crashes the program'],
                ['**M6**', 'Header dependencies in the Makefile, test input files, and the README', 'Everything in the final checklist is ticked'],
            ] } },
            b: { callout: 'Rebuild after **every** function. Never write more than about 20 lines without compiling.' } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'content', title: 'Submission checklist',
            a: { steps: [
                '`main.c`, `list.h`, `list.c`, `student.h`, `student.c`, `Makefile`, `README.md`. No executable, no `.o` files (`make clean`)',
                'Builds with `gcc -Wall -Wextra -std=c11` and **zero warnings**',
                'No student array, no `struct node`, no mapping table, no global student storage',
                'Every student is created with `malloc()` and freed exactly once',
                '`container_of()` takes you from `list_head *` to `student *`',
                '`head->next == head && head->prev == head` at start and at exit',
                'README: how to run, features, data structures, why circular, intrusive lists, `container_of()`, problems solved',
            ], size: 16, rowH: 0.74, cols: 1, kind: 'good' },
            notes: 'From docs/submission.md and the final checklist in the project README.' },

        { kind: 'takeaways', items: [
            'Headers declare, and `.c` files define. Include guards prevent double definitions',
            '`gcc -c` compiles one file; linking connects the pieces. A link error means a missing or duplicated definition',
            '`$(SRCS:.c=.o)`, `%.o: %.c`, `$@`, `$^`, and `$<` let one short Makefile build any number of files',
            'make knows only the dependencies you tell it. After editing a header: `make clean && make`, or list the headers',
            'Check every `scanf()` return value, give every `%s` a width, and test with `< input.txt`',
        ] },

        { kind: 'quiz', title: 'Final quiz', questions: [
            'You edited `student.h` and make says "Nothing to be done". Why, and what do you do?',
            'In `$(TARGET): $(OBJS)`, what do `$@` and `$^` expand to?',
            '`main.c` compiles, but linking reports `undefined reference to \'student_find\'`. Name two causes',
            'Why is `scanf("%s", name)` dangerous, and what do you write instead?',
            'Which layer may call `free()` on a student: `list.c`, `student.c`, or `main.c`?',
        ] },

        { kind: 'answers', title: 'Final quiz — answers', answers: [
            'Each `.o` depends only on its `.c`, so make does not know about the header. `make clean && make`, or add the header prerequisites',
            '`student_manager`, and `main.o list.o student.o`',
            '`student.c` is not compiled or linked (missing from `SRCS`), or the name is misspelled or the function is `static` in student.c',
            'A long name overflows the array. Use `scanf("%19s", name)` for `char name[20]`',
            '`student.c`, in `student_delete()` and `student_free_all()`. `list.c` never frees; `main.c` uses the student API',
        ] },

        { kind: 'section', num: '10', label: 'FINAL PROJECT', title: 'Good luck with the project', sub: 'Specification: `assignments/week08-final-project/README.md`' },
    ],
};
