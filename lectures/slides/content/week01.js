// Week 01 — Build Tools, Makefile, and struct
module.exports = {
    week: 1,
    dirName: 'week01-struct',
    title: 'Build Tools, Makefile, and `struct`',
    short: 'Build Tools, Makefile, and struct',
    subtitle: 'Compile and run C programs, drive the build with make, and group data with struct',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'where we are going',
            code: `struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};`,
            notes: 'Welcome. In ten weeks you will build a Student Management System on the same linked-list design the Linux kernel uses. Today almost nothing in this snippet makes sense; by Week 08 you will be able to explain every line.' },

        { kind: 'agenda', plan: [
            ['0:00', '0:15', 'Course introduction and roadmap', 'review', 'Intro'],
            ['0:15', '0:35', 'Part 1 — From source code to a running program', 'lecture', 'gcc'],
            ['0:35', '1:15', 'Part 2 — `make` and Makefiles', 'lecture', 'make'],
            ['1:15', '1:25', 'Break', 'break', 'Break'],
            ['1:25', '1:50', 'Part 3 — Grouping data with `struct`', 'lecture', 'struct'],
            ['1:50', '2:05', 'Part 4 — Pointers and structs', 'lecture', 'ptr'],
            ['2:05', '2:50', 'Lab — Makefile mini-lab + Week 01 assignment', 'lab', 'Lab'],
            ['2:50', '3:00', 'Wrap-up and exit quiz', 'wrap', 'Quiz'],
        ] },

        { kind: 'objectives', items: [
            'Compile and run a C program with `gcc -Wall -Wextra -std=c11`',
            'Read a compiler warning and find the line it points to',
            'Explain the parts of a Makefile rule: target, prerequisites, recipe',
            'Build, run, and clean every assignment with `make` and `make clean`',
            'Write a small Makefile from scratch',
            'Define and initialize a `struct`; access members with `.`',
            'Use a pointer to a struct with `->`',
            'Explain why passing a pointer lets a function change the caller\'s data',
        ] },

        { kind: 'content', title: 'Where we are going', ratio: 0.5,
            a: { bullets: [
                'A **Student Management System** built on a kernel-style linked list',
                'The links live **inside** each object: no `struct node` anywhere',
                'The same design holds thousands of lists in the Linux kernel',
                'By Week 08 you can explain every line on the right',
            ] },
            b: { code: { file: '/assignments/week10-final-project/starter/student.h', struct: 'student' }, label: 'student.h' },
            notes: 'Show the final structure. Point out struct list_head inside struct student. Promise: by Week 08 every line is explained.' },

        { kind: 'content', title: 'Roadmap: ten weeks, one question each',
            a: { table: { head: ['Week', 'Topic', 'The question we answer'], colW: [1, 4, 8], size: 14, rows: [
                ['1', 'Build tools, `struct`, pointers', 'How do I build a program, and how do I group data?'],
                ['2', 'Operators and precedence', 'What does `*p->next` or `flags & MASK == 0` really mean?'],
                ['3', 'Dynamic memory', 'How do I create objects at run time?'],
                ['4', 'Singly linked list', 'How do I chain objects together?'],
                ['5', 'Doubly linked list', 'How do I walk backwards and delete in O(1)?'],
                ['6', 'Circular doubly linked list', 'How do I get rid of every `NULL` special case?'],
                ['7', 'Intrusive linked list', 'Why put the links *inside* the data?'],
                ['8', '`offsetof()` and `container_of()`', 'How do I get the object back from its links?'],
                ['9', 'File I/O', 'How do I save the list and load it again?'],
                ['10', 'Final project', 'Putting it all together'],
            ] } }, 
            notes: 'Each week answers one question, and each answer is needed by the next week. The final project uses all of them.' },

        { kind: 'content', title: 'How the repository is organized', layout: 'tb', ratio: 0.5,
            a: { code: `assignments/weekNN-<topic>/README.md   the task
assignments/weekNN-<topic>/starter/    your code + Makefile
lectures/weekNN-<topic>/README.md      lecture notes
lectures/weekNN-<topic>/examples/      code shown in class
docs/                                  grading, submission`, lang: 'text', label: 'repository' },
            b: { cards: [
                { n: 1, h: 'Read first', body: 'Each week starts with the assignment `README.md`.' },
                { n: 2, h: 'Write here', body: 'All your code goes into `starter/`.' },
                { n: 3, h: 'Watch here', body: 'Every demo is in `lectures/.../examples/`.' },
            ] }, 
            notes: 'Walk through the tree. Assignments are what students hand in; lectures hold these notes and the demo code. Every demo shown in class is in the week\'s examples directory.' },

        { kind: 'content', title: 'Ground rules',
            a: { cards: [
                { n: 1, h: 'C11, zero warnings', body: 'Every program compiles with `-Wall -Wextra -std=c11` and prints no warnings.' },
                { n: 2, h: 'Free what you allocate', body: 'Every `malloc()` has exactly one matching `free()` (from Week 03).' },
                { n: 3, h: 'book in class, student in labs', body: 'Demos use `struct book`. Assignments use `struct student`. Carrying the idea over is the exercise.' },
            ] }, 
            notes: 'Warnings count as bugs from day one. malloc/free starts in Week 03. Demos use struct book so that students have to translate the idea to struct student themselves in the lab.' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — gcc', kind: 'section', num: 1, label: 'PART 1 · 20 MIN', title: 'From source code to a running program', sub: 'Toolchain, compiler flags, running, reading warnings' },

        { kind: 'content', title: 'Setting up a toolchain', ratio: 0.62,
            a: { table: { head: ['Platform', 'Install', 'Notes'], colW: [2.2, 3.6, 4], size: 15, rows: [
                ['Linux', '`sudo apt install build-essential`', 'Installs `gcc` and `make`'],
                ['macOS', '`xcode-select --install`', '`gcc` is Apple Clang: same flags, different wording'],
                ['Windows', 'Install WSL (Ubuntu)', 'Then follow the Linux row'],
            ] } },
            b: { term: [{ cmd: 'gcc --version' }, { cmd: 'make --version' }] },
            notes: 'Make sure everyone can run both commands before Part 2.' },

        { kind: 'concept', title: 'The compilation pipeline', layout: 'tb', ratio: 0.55,
            what: 'Compiling turns a `.c` source file into an executable in four stages. The **preprocessor** expands `#include` and `#define`, the **compiler** translates C into assembly, the **assembler** produces an object file (`.o`), and the **linker** joins it with the C library. One `gcc` command runs all four.',
            why: ['When a build fails, the message tells you **which stage** failed: a compile error points to a line of your code, a link error means a definition is missing.', 'Later weeks stop `gcc` early on purpose: `-E` in Week 08, `-c` in Week 10.'],
            how: { diagram: { type: 'flow', boxH: 1.2, steps: [
                { t: 'hello.c', sub: 'source', kind: 'file', code: true },
                { t: 'preprocessor', sub: '#include, #define' },
                { t: 'compiler', sub: 'C → assembly' },
                { t: 'assembler', sub: 'assembly → .o' },
                { t: 'linker', sub: '+ C library' },
                { t: 'hello', sub: 'executable', kind: 'file', code: true },
            ] } },
            notes: 'One gcc command runs the preprocessor, compiler, assembler and linker. Knowing the stages lets students read error messages: compile errors have a file and line, link errors talk about missing symbols. We stop gcc after one stage in Week 08 (-E) and Week 10 (-c).' },

        { kind: 'content', title: 'The command we use in this course', layout: 'tb', ratio: 0.22,
            a: { sh: '$ gcc -Wall -Wextra -std=c11 assignment_01.c -o week01', label: null, maxFont: 26 },
            b: { table: { head: ['Part', 'Meaning'], colW: [2.5, 9], size: 16, rows: [
                ['`gcc`', 'The compiler driver'],
                ['`-Wall`', 'Enable the common warnings'],
                ['`-Wextra`', 'More warnings: unused parameters, signed/unsigned comparisons, …'],
                ['`-std=c11`', 'Compile as ISO C11'],
                ['`assignment_01.c`', 'Input source file(s)'],
                ['`-o week01`', 'Name of the executable (without `-o`: `a.out`)'],
            ] } }, 
            notes: 'This is the exact command every starter Makefile runs. -Wall and -Wextra turn on warnings, -std=c11 selects the language version, -o names the output; without it you get a.out.' },

        { kind: 'concept', title: 'Running a program: `./` and the exit status', layout: 'tb', ratio: 0.5,
            what: 'The shell runs an executable when you give its path: `./week01` means "the file `week01` in this directory". When the program ends, the value returned by `main()` becomes its **exit status**, and `0` means success.',
            why: ['Without `./`, the shell searches only the directories listed in `PATH`, and reports *command not found*.', 'Tools read the exit status to decide what happens next: `make` stops the build when a command exits with a non-zero status.'],
            how: { term: [{ cmd: 'make', out: 'gcc -Wall -Wextra -std=c11 assignment_01.c -o week01' }, { cmd: './week01' }, { cmd: 'echo $?', out: '0' }] },
            notes: 'The current directory is not in PATH, so ./ is required. echo $? prints the exit status of the last command. We use the exit status again in Week 09, where a failing diff makes make stop.' },

        { kind: 'concept', title: 'Compiler warnings', layout: 'tb', ratio: 0.56,
            what: '`-Wall -Wextra` turn on the useful warnings. A **warning** is the compiler telling you that code is legal C but probably wrong: a `printf` format that does not match its argument, or a variable that is never used.',
            why: ['A warning does **not** stop the build: the executable is still produced, and it runs.', 'Without `-Wall`, gcc accepts `printf("score = %s\\n", score)` with an `int` silently (clang still warns about the format), and the program prints garbage or crashes.'],
            how: { term: [{ cmd: 'gcc -Wall -Wextra -std=c11 warnings.c -o warnings', out: `warnings.c:16:28: warning: format specifies type 'char *'
    but the argument has type 'int' [-Wformat]
warnings.c:14:9: warning: unused variable 'unused' [-Wunused-variable]
2 warnings generated.` }] },
            notes: 'Live demo: build examples/warnings.c by hand (its Makefile skips it on purpose). Line 16 passes an int to %s; line 14 declares a variable that is never used. Point out that the executable was produced anyway. From today, zero warnings is part of every assignment.' },

        { kind: 'content', title: 'How to read a diagnostic', layout: 'tb', ratio: 0.38,
            a: { art: `warnings.c : 16 : 28 : warning : format specifies type ...  [-Wformat]
   file      line  col  severity  what is wrong               which flag` },
            b: { bullets: [
                '**A warning does not stop the build.** This program still runs, and prints garbage or crashes',
                'Fix the **first** diagnostic first: later ones are often caused by it',
                'gcc and clang word messages differently; the `file:line:column` shape is the same',
            ] }, 
            notes: 'file:line:column, severity, message, and the flag that found it. A warning does not stop the build: this program is still produced, and it will print garbage or crash. Fix the first diagnostic first.' },

        { kind: 'content', title: 'The starter-code idiom `(void)x;`', ratio: 0.52,
            a: { code: `int main(void)
{
    struct student student = {0};
    (void)student;

    /* TODO: ... */

    return 0;
}`, label: 'starter/assignment_01.c' },
            b: { callout: [
                '`(void)student;` uses the variable without doing anything',
                'It silences the *unused variable* warning in the starter',
                'Delete it once your code really uses the variable',
            ] }, 
            notes: 'The starter files contain lines like (void)student;. That uses the variable without doing anything, which silences the unused-variable warning. Delete it once the variable is really used.' },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — make', kind: 'section', num: 2, label: 'PART 2 · 40 MIN', title: '`make` and Makefiles', sub: 'Rules, timestamps, variables, clean, .PHONY' },

        { kind: 'concept', title: '`make` and the Makefile', layout: 'tb', ratio: 0.5,
            what: '`make` is a build tool. It reads a file named `Makefile` that lists **what** to build, **from what**, and **with which commands**, and then runs only the commands that are needed.',
            why: ['Without it you retype the whole `gcc` command after every edit, and one typo builds the wrong thing.', 'In Week 10 the project has three `.c` files: rebuilding all of them every time wastes time, and nobody else knows the right commands.'],
            how: { term: [{ cmd: 'cd assignments/week01-struct/starter' }, { cmd: 'make', out: 'gcc -Wall -Wextra -std=c11 assignment_01.c -o week01' }, { cmd: 'make', out: "make: Nothing to be done for `all'." }] },
            notes: 'Every starter directory already contains a Makefile. Today students learn to read it, use it, and write one. Note the second make: nothing changed, so nothing is rebuilt.' },

        { kind: 'concept', title: 'A Makefile rule', layout: 'tb', ratio: 0.55,
            what: 'A **rule** says how to build one **target**. The first line is `target: prerequisites`, the files the target is built from. The lines below it are the **recipe**: the shell commands that build the target, each starting with a TAB character.',
            why: ['make must know what each file is built **from**: that is how it decides whether the target is out of date.', 'Without the TAB, make cannot tell a recipe from the next rule, and stops with *missing separator*.'],
            how: { make: { file: 'examples/makefile-steps/Makefile.step1', from: /^hello:/ }, label: 'Makefile.step1' },
            notes: 'hello is the target, hello.c the prerequisite, and the gcc line is the recipe; it starts with a real TAB. make runs the recipe when hello does not exist or hello.c is newer.' },

        { kind: 'demo', title: 'Step 1 — the smallest useful Makefile', layout: 'tb', ratio: 0.26,
            a: { make: { file: 'examples/makefile-steps/Makefile.step1', from: /^hello:/ }, label: 'Makefile.step1' },
            b: { term: [
                { cmd: 'make -f Makefile.step1', out: 'gcc -Wall -Wextra -std=c11 hello.c -o hello' },
                { cmd: 'make -f Makefile.step1', out: "make: `hello' is up to date." },
                { cmd: 'touch hello.c' },
                { cmd: 'make -f Makefile.step1', out: 'gcc -Wall -Wextra -std=c11 hello.c -o hello' },
            ] },
            notes: '-f picks the Makefile; normally make reads the file called Makefile. touch pretends we edited hello.c.' },

        { kind: 'concept', title: 'Incremental builds: timestamps', ratio: 0.5,
            what: 'make compares file **modification times**. It rebuilds a target only if the target does not exist or one of its prerequisites is **newer** than it. Otherwise it reports that the target is *up to date*.',
            why: ['Recompiling every file after every edit is slow; in Week 10 only the `.c` file you edited is recompiled.', 'It also explains a surprise: when nothing changed, `make` builds nothing.'],
            how: { art: `hello.c  modified 10:05
hello    built    10:03
→ prerequisite is newer: rebuild

hello.c  modified 10:05
hello    built    10:06
→ target is newer: "up to date"` },
            notes: 'touch hello.c updates its modification time, which is why the third make in the demo rebuilt. Changing compiler flags is not a file change; Week 04 shows the consequence.' },

        { kind: 'concept', title: 'The default goal and action targets', layout: 'tb', ratio: 0.48,
            what: '`make` with no arguments builds the **first** target in the file, the *default goal*, by convention named `all`. Some targets name **actions** rather than files: `make clean` runs the `clean` recipe, which deletes the build results.',
            why: ['Without `all` first, `make` builds whichever rule happens to come first in the file.', 'Without `clean`, you delete executables by hand, and old build results end up committed or submitted.'],
            how: { make: { file: 'examples/makefile-steps/Makefile.step2', from: /^all:/, drop: [/^\s*$/] }, label: 'Makefile.step2' },
            notes: 'all has no recipe; it only requires hello to be up to date. No file named clean is ever created: clean is an action.' },

        { kind: 'concept', title: 'Make variables', ratio: 0.46,
            what: 'A **variable** gives a value a name once (`CC = gcc`) and uses it anywhere as `$(CC)`. `CC`, `CFLAGS`, and `TARGET` are the conventional names for the compiler, its flags, and the executable.',
            why: 'Without variables the same flags are copied into every rule. Changing one flag means editing every copy, and the copies drift apart. With them, the starter Makefiles differ only in the executable and source file names.',
            how: { make: { file: '/assignments/week01-struct/starter/Makefile', lines: [1, 11] }, label: 'starter/Makefile' },
            notes: 'This is the Week 01 starter Makefile, unchanged. After expansion the recipe is exactly the gcc command from Part 1; make -n on the next slide prints it.' },

        { kind: 'content', title: '`make -n`: print, don\'t run', ratio: 0.55,
            a: { term: [{ cmd: 'cd assignments/week01-struct/starter' }, { cmd: 'make clean', out: 'rm -f week01' }, { cmd: 'make -n', out: 'gcc -Wall -Wextra -std=c11 assignment_01.c -o week01' }] },
            b: { callout: 'The starter Makefiles for Weeks 02–09 have the same shape: only `TARGET` (`week02`, …) and the source file (`assignment_02.c`, …) change. Read one and you have read them all.' }, 
            notes: 'make -n prints the commands without running them, which is the quickest way to see what a Makefile does. The starters for Weeks 02 to 09 differ only in TARGET.' },

        { kind: 'demo', title: 'Step 4 — a file named "clean"', ratio: 0.6,
            a: { term: [{ cmd: 'cd lectures/week01-struct/examples/makefile-steps' }, { cmd: 'touch clean' }, { cmd: 'make -f Makefile.step3 clean', out: "make: `clean' is up to date." }, { cmd: 'rm clean  # tidy up' }] },
            b: { bullets: [
                'Nothing was deleted',
                '`make` saw a **file** called `clean`, with no prerequisites, and decided it was up to date',
                'Fix: declare action targets **phony**',
            ] }, 
            notes: 'Create a file called clean and run make clean: nothing is deleted. make sees a file named clean with no prerequisites and decides it is up to date.' },

        { kind: 'concept', title: '`.PHONY` targets', ratio: 0.42,
            what: '`.PHONY: all run clean` tells make that these targets are **actions, not files**, so their recipes always run. A `run` target can depend on the program: `make run` builds it if needed, then runs it.',
            why: 'Without `.PHONY`, a file that happens to be named `clean` makes `make clean` report *up to date* and delete nothing, as on the previous slide.',
            how: { make: { file: 'examples/makefile-steps/Makefile.step4', from: /^CC =/ }, label: 'Makefile.step4' },
            notes: 'The Week 01 to 09 starters do not declare .PHONY; they work as long as nobody creates a file named all or clean. The Week 10 starter declares it. Students may add .PHONY and run to their own Makefiles.' },

        { kind: 'content', title: 'Common make errors',
            a: { table: { head: ['What you see', 'Cause', 'Fix'], colW: [5.2, 3.6, 3.6], size: 14, rows: [
                ['`*** missing separator.  Stop.`', 'Recipe starts with spaces', 'Use one TAB; `cat -et` shows `^I`'],
                ['`No targets specified and no makefile found`', 'Wrong directory', '`cd` into `starter/`, or `make -C dir`'],
                ["`No rule to make target 'assignment_01.c'`", 'Prerequisite missing or misspelled', 'Check names with `ls`'],
                ["`Nothing to be done for 'all'`", 'Not an error: nothing changed', 'Edit a file, or `make clean && make`'],
                ['`make: *** [week01] Error 1`', '`gcc` failed', 'Scroll up; fix the first compiler error'],
            ] } },
            notes: 'VS Code keeps TABs in files named Makefile. In Vim: :set noexpandtab.' },

        { kind: 'content', title: 'Your workflow for every week', ratio: 0.55,
            a: { term: [
                { cmd: 'cd assignments/week01-struct/starter' },
                { cmd: 'make  # build' },
                { cmd: './week01  # run' },
                { cmd: 'make  # after editing assignment_01.c' },
                { cmd: 'make clean  # before you commit' },
            ] },
            b: { table: { head: ['Command', 'Effect'], colW: [2.2, 3.4], size: 15, rows: [
                ['`make`', 'build the default goal'],
                ['`make clean`', 'run the clean recipe'],
                ['`make -n`', 'print, don\'t run'],
                ['`make -C dir`', 'run as if in `dir`'],
                ['`make -f file`', 'use another Makefile'],
            ] } }, 
            notes: 'cd into the starter directory, make, run, edit, make again, and make clean before committing. From the repository root, make -C does the same without cd.' },

        /* ---------------- Part 3 ---------------- */
        { newSection: 'Part 3 — struct', kind: 'section', num: 3, label: 'PART 3 · 25 MIN', title: 'Grouping data with `struct`', sub: 'Definition, initialization, strings, copies, layout' },

        { kind: 'concept', title: '`struct`: grouping related data', layout: 'tb', ratio: 0.5,
            what: 'A `struct` groups related variables, its **members**, into one object with a type of its own, here `struct book`. The definition only describes the layout; it creates no variable.',
            why: 'Without it, one book is three unrelated variables (`book1_id`, `book1_title`, `book1_year`). Nothing says they belong together, and you cannot pass "a book" to a function or return one.',
            how: { code: `struct book {
    int id;
    char title[32];
    int year;
};

struct book b1 = { 1, "The C Programming Language", 1978 };`, label: 'struct_basics.c' },
            notes: 'Contrast three loose variables with one object. The next slide covers the rules for writing the definition.' },

        { kind: 'content', title: 'Defining a struct type', ratio: 0.45,
            a: { code: { file: 'examples/struct_basics.c', struct: 'book' }, maxFont: 24 },
            b: { bullets: [
                'The type name is the two words `struct book`',
                'A definition creates **no variable**; it describes a layout',
                'The closing `};` needs its semicolon',
                'No `typedef`: kernel style keeps the word `struct` visible',
            ] }, 
            notes: 'The type name is the two words struct book. The definition creates no variable; it only describes a layout. We do not typedef structs: the Linux kernel style keeps the word struct visible.' },

        { kind: 'concept', title: 'Initializing a struct', layout: 'tb', ratio: 0.54,
            what: 'An initializer gives the members their first values when the variable is created: **positional** (`{ 1, "…", 1978 }`, in member order) or **designated** (`{ .id = 2, .year = 2010 }`, by name). Members you leave out become zero, so `{0}` zeroes everything.',
            why: ['A local struct without an initializer holds whatever bytes were already in memory: reading it gives garbage.', 'A positional initializer silently breaks when someone reorders the members; a designated one does not.'],
            how: { code: `struct book b1 = { 1, "The C Programming Language", 1978 };
struct book b2 = { .id = 2, .title = "Linux Kernel Development", .year = 2010 };
struct book b3 = {0};
struct book b4;            /* GARBAGE until assigned */`, label: null },
            notes: 'Designated initializers are C99. Prefer them: they are easier to read and survive reordering. Never read b4 before assigning it.' },

        { kind: 'concept', title: 'Strings inside a struct', ratio: 0.5,
            what: '`char title[32]` is an array of 32 bytes inside the struct. It holds a string of at most **31 characters**, because one byte is needed for the terminating `\'\\0\'`. The assignment\'s `char name[20]` holds at most 19.',
            why: ['Arrays cannot be assigned: `b1.title = "New";` does not compile.', '`strcpy()` copies until the source ends, so a long source writes past the array and corrupts the members next to it.'],
            how: { code: `/* only if it surely fits */
strcpy(b1.title, "New Title");

/* bounded copy: never overflows */
snprintf(b1.title, sizeof(b1.title),
         "%s", src);`, label: null },
            notes: 'snprintf with sizeof copies at most 31 characters and always adds the terminating zero byte. This matters in Week 03 and in the final project, where names come from user input.' },

        { kind: 'concept', title: 'Struct assignment copies everything', layout: 'tb', ratio: 0.5,
            what: 'Assigning one struct to another (`b3 = b1`) copies **every member**, including all 32 bytes of the `title` array. Afterwards the two are independent objects.',
            why: 'Knowing that `=` copies explains why changing `b3` never changes `b1`, and why a function that receives a struct gets its own copy (Part 4). To share one object instead of copying it, you need a pointer.',
            how: { code: { file: 'examples/struct_basics.c', from: /struct assignment copies/, to: /snprintf\(b3/ } },
            notes: 'After the copy, b3.id = 3 and the new title change only b3. The demo prints both structs to show it.' },

        { kind: 'concept', title: 'Members live at fixed offsets', layout: 'tb', ratio: 0.5,
            what: 'The members of a struct are stored one after another **in declaration order**, each at a fixed distance from the start of the struct: its **offset**. `sizeof(struct book)` is the total size in bytes: 4 + 32 + 4 = 40.',
            why: 'You need this picture to predict `sizeof`. In Week 08, `container_of()` uses a member\'s offset to get from that member back to the whole struct. (The compiler may add padding between members; that is also Week 08.)',
            how: { diagram: { type: 'layout', title: 'struct book   (sizeof == 40)', fields: [
                { name: 'id', size: 4 }, { name: 'title[32]', size: 32 }, { name: 'year', size: 4 },
            ] } },
            notes: 'id starts at offset 0, title at 4, year at 36. The struct_pointer demo later prints the member addresses and shows the same distances.' },

        { kind: 'demo', title: 'Live demo: struct_basics.c', ratio: 0.42,
            a: { term: [{ cmd: 'cd lectures/week01-struct/examples' }, { cmd: 'make' }, { cmd: './struct_basics' }] },
            b: { out: `b1: id=1 title="The C Programming Language" year=1978
b2: id=2 title="Linux Kernel Development" year=2010
b3: id=0 title="" year=0
after copy:
b1: id=1 title="The C Programming Language" year=1978
b3: id=3 title="A Copy of K&R" year=1978
sizeof(struct book) = 40 bytes
strlen(b1.title)    = 26 characters`, label: 'output' }, 
            notes: 'Run make, then ./struct_basics. Point out the zero-initialized b3, the copy, the truncation-safe title copy, and sizeof(struct book) = 40.' },

        /* ---------------- Part 4 ---------------- */
        { newSection: 'Part 4 — pointers', kind: 'section', num: 4, label: 'PART 4 · 15 MIN', title: 'Pointers and structs', sub: '`&`, `*`, `->`, and passing structs to functions' },

        { kind: 'concept', title: 'Pointers',
            what: 'A **pointer** is a variable that holds the address of another object. `&x` gives the address of `x`, and `*p` is the object that `p` points to. `NULL` is a pointer that points to no object at all.',
            why: ['Without pointers a function only ever receives copies, so it cannot change the caller\'s variables.', 'Every linked list in this course is a set of objects that hold pointers to each other.'],
            how: { code: { file: 'examples/pointer_basics.c', from: /int x = 10;/, to: /printf\("after/ } },
            notes: 'Writing through *p changes x. Print addresses with %p and a (void *) cast. Never dereference NULL.' },

        { kind: 'concept', title: 'Pointer to a struct: `->`', ratio: 0.48,
            what: 'With `struct book *p = &book;`, the expression `p->year` means "follow `p`, then take the member `year`". It is exactly the same as `(*p).year`, only easier to read. Use `.` on a struct variable and `->` on a pointer.',
            why: 'The member operator `.` binds tighter than `*`, so the natural-looking `*p.year` means `*(p.year)` and does not compile. Without `->`, every access needs the parentheses of `(*p).year`.',
            how: { code: `struct book book = { .id = 1, .year = 2010 };
struct book *p = &book;

(*p).year = 2024;  /* follow p, then the member */
p->year   = 2024;  /* the same, easier to read  */`, label: null },
            notes: 'Rule of thumb: a struct variable takes ., a pointer to a struct takes ->. Operator precedence is next week\'s topic.' },

        { kind: 'concept', title: 'Passing a struct to a function', layout: 'tb', ratio: 0.36,
            what: 'A parameter is a **copy** of its argument: a whole struct, or, for a pointer, just the address of the original object.',
            why: '`set_year_by_value()` changes only its own copy, which vanishes on return. To change the caller\'s object, pass a pointer.',
            how: { code: [
                { file: 'examples/struct_pointer.c', fn: 'set_year_by_value' },
                { file: 'examples/struct_pointer.c', fn: 'set_year_by_pointer' },
            ] },
            notes: 'Passing by value copies the whole struct and cannot change the caller. Passing a pointer is cheap and lets the function modify the original. const documents and enforces read-only access.' },

        { kind: 'content', title: 'By value vs. by pointer',
            a: { art: ` main()                          set_year_by_value(book, 1999)
 +-------------------+           +-------------------+
 | book  year=2010   |  copy --> | b     year=1999   |   the copy changes,
 +-------------------+           +-------------------+   then disappears
          ^
          |                      set_year_by_pointer(&book, 2024)
          |                      +-------------------+
          +----------------------| b = &book         |   writes go to main's book
                                 +-------------------+` }, 
            notes: 'The by-value function changes its own copy, which disappears on return. The by-pointer function writes through the pointer into main\'s book.' },

        { kind: 'demo', title: 'Live demo: struct_pointer.c', ratio: 0.6,
            a: { out: `book.year = 2010
(*p).year = 2010
p->year   = 2010
  inside set_year_by_value: b.year = 1999
after set_year_by_value:   [1] Operating Systems (2010)
after set_year_by_pointer: [1] Operating Systems (2024)
&book       = 0x16b886540
&book.id    = 0x16b886540
&book.title = 0x16b886544
&book.year  = 0x16b886564`, label: './struct_pointer' },
            b: { callout: [
                '`&book` and `&book.id` are the **same address**',
                'Every member sits at a fixed distance from the start',
                'Remember this for Week 08: `container_of()`',
            ] } },

        { kind: 'concept', title: 'A self-referential struct', layout: 'tb', ratio: 0.5,
            what: 'A struct cannot contain a copy of itself, but it can contain a **pointer to its own type**: `struct node { struct book data; struct node *next; };`. Each object can then point to the next one, and the last one points to `NULL`.',
            why: 'An array needs its size in advance and must shift elements to insert in the middle. A chain of objects that point to each other grows one object at a time: that is the whole idea of a linked list, which we build in Week 04.',
            how: { diagram: { type: 'chain', kind: 'singly', nodes: ['[1]', '[2]', '[3]'] } },
            notes: 'This is only a preview; Week 03 adds malloc so the nodes can be created at run time, and Week 04 builds the list.' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB · 45 MIN', title: 'Makefile mini-lab + Week 01 assignment', sub: 'Lab A: write a Makefile from scratch (15 min)\nLab B: the Week 01 assignment (30 min)' },

        { kind: 'content', title: 'Lab A — write a Makefile from scratch', tag: '15 MIN', ratio: 0.5,
            a: { steps: [
                'Outside the repository: create `hello.c` that prints your name',
                'Without copying, write a `Makefile` with `CC`, `CFLAGS`, `TARGET`, `all`, `run`, `clean`, `.PHONY`',
                'Check: `make`, `make` again, `touch hello.c`, `make run`, `make clean`',
                'Replace a TAB with four spaces, read the error, then `cat -et Makefile`',
                'Bonus: `touch clean`; try `make clean` with and without `.PHONY`',
            ], size: 17, rowH: 1.0 },
            b: { term: [
                { cmd: 'make', out: 'gcc -Wall -Wextra -std=c11 hello.c -o hello' },
                { cmd: 'make run', out: './hello\nHello, <your name>!' },
                { cmd: 'cat -et Makefile', out: '$(TARGET): hello.c$\n^I$(CC) $(CFLAGS) hello.c -o $(TARGET)$' },
            ] },
            notes: 'Checkpoint: students show make run output to the instructor or TA.' },

        { kind: 'content', title: 'Lab B — Week 01 assignment', tag: '30 MIN', ratio: 0.58,
            a: { steps: [
                'Build the untouched starter: `make && ./week01` (prints nothing yet)',
                'Store one student\'s ID, name, and score, then print them',
                'Make a `struct student *` to it; change a value **through the pointer**',
                'Use `.` on the variable and `->` on the pointer; no arrays of students',
                'Delete `(void)student;` and rebuild until there are **zero warnings**',
                '`make clean` before you commit',
            ], size: 17, rowH: 0.85 },
            b: { cards: [
                { h: 'Task', body: '`assignments/week01-struct/README.md`', size: 15 },
                { h: 'Self-check', body: ['Name stays within 19 characters?', 'Print function takes `const struct student *`?'], size: 15 },
            ], cols: 1 }, 
            notes: 'Build the untouched starter first so the toolchain is known to work. Then store and print a student, change a value through a pointer, use both . and ->, and finish with zero warnings.' },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            '`gcc -Wall -Wextra -std=c11 main.c -o prog` compiles. Warnings do not stop the build, so you must stop at them',
            'A rule is `target: prerequisites` plus a **TAB**-indented recipe; make rebuilds only when a prerequisite is newer',
            '`make` builds the first target, `make clean` deletes results, `.PHONY` marks actions',
            'A `struct` groups related data; assignment copies the whole struct',
            '`.` on a struct, `->` on a pointer. Pass a pointer when a function must modify the caller\'s object',
        ] },

        { kind: 'quiz', questions: [
            'Does `gcc -Wall -Wextra` refuse to build a program that has warnings?',
            'A recipe line begins with four spaces. What happens when you run `make`?',
            'You run `make` twice in a row without editing. What does the second run print, and why?',
            'Given `struct book *p`, which are valid: `p.year`, `p->year`, `(*p).year`, `*p.year`?',
            'Why does `set_year_by_value()` not change the caller\'s `book`?',
            'A file named `clean` exists and `.PHONY` is missing. What does `make clean` do?',
        ] },

        { kind: 'answers', answers: [
            'No. Warnings are reported, but the executable is still produced',
            '`*** missing separator.  Stop.` Recipe lines must start with a TAB',
            '"Nothing to be done for `all`": `week01` is newer than every prerequisite, so nothing is rebuilt',
            '`p->year` and `(*p).year`. `p.year` is an error; `*p.year` is `*(p.year)`',
            'The parameter is a copy. The copy changes, then disappears',
            'Nothing: make treats `clean` as an up-to-date file and skips the recipe',
        ] },

        { kind: 'next', title: 'Week 02 — Operators and Precedence', sub: 'Today `*p.year` failed to compile. Many similar mistakes do compile, and silently compute the wrong thing.' },
    ],
};
