// Week 02 — Operators and Precedence
module.exports = {
    week: 2,
    dirName: 'week02-operators',
    title: 'Operators and Precedence',
    short: 'Operators and Precedence',
    subtitle: 'How C groups *, ->, ++, &&, & and friends, and which mistakes compile silently',
    slides: [
        { newSection: 'Introduction', kind: 'title', label: 'macro_parens.c',
            code: { file: 'examples/macro_parens.c', from: /^#define SQUARE_BAD/, to: /^#define DOUBLE\(x\)/ },
            notes: 'Last week *p.year did not compile. Today: how C decides what an expression means, and which mistakes like that one compile without any error at all.' },


        { kind: 'objectives', items: [
            'Tell apart *precedence*, *associativity*, and *order of evaluation*',
            'Parse expressions that mix `*`, `&`, `.`, `->`, `[]`, and `++`',
            'Avoid the integer-division, signed/unsigned, and chained-comparison traps',
            'Use `&&` short-circuiting to guard against `NULL` pointers',
            'Set, clear, toggle, and test bit flags',
            'Write macros that survive precedence; let `-Wall -Wextra` find precedence bugs',
        ] },

        { kind: 'review', title: 'Review of Week 01', questions: [
            'What does `make` do when the target is newer than all of its prerequisites?',
            'Why does a Makefile recipe line need a TAB?',
            '`struct book *p = &b;` — write `p->year` without the arrow',
            'Why can `set_year_by_pointer()` change the caller\'s struct, but `set_year_by_value()` cannot?',
        ], today: 'Today\'s question: last week `*p.year` did not compile. **How does C decide what an expression means**, and which mistakes like this one compile *without* an error?' },

        /* ---------------- Part 1 ---------------- */
        { newSection: 'Part 1 — precedence', kind: 'section', num: 1, label: 'PART 1', title: 'Precedence, arithmetic, comparisons, and logic', sub: 'Grouping rules, integer division, chained comparisons, short-circuit, assignment' },

        { kind: 'concept', title: 'Precedence and associativity', layout: 'tb', ratio: 0.56,
            what: '**Precedence** decides which operator takes its operands first: `a + b * c` is `a + (b * c)`. **Associativity** decides how operators of the same level group: `a - b - c` is `(a - b) - c`, but `a = b = 0` is `a = (b = 0)`. Together they fix how an expression is **grouped**.',
            why: ['The compiler groups by these rules, not by spacing: `*p.year` is `*(p.year)`, and `flags & MASK == 0` is `flags & (MASK == 0)`.', 'They do **not** decide which operand is computed first: that is the order of evaluation (Part 2).'],
            how: { table: { head: ['Rule', 'Question it answers', 'Example'], colW: [2.4, 4.6, 5], size: 15, rows: [
                ['**Precedence**', 'Which operator grabs its operands first?', '`a + b * c` is `a + (b * c)`'],
                ['**Associativity**', 'Same level: group from the left or the right?', '`a - b - c` is `(a - b) - c`; `a = b = 0` is `a = (b = 0)`'],
                ['**Order of evaluation**', 'Which operand is *computed* first?', 'In `f() + g()`, either call may run first'],
            ] } },
            notes: 'Keep the three ideas separate. Precedence and associativity decide how the expression is grouped; they say nothing about which operand runs first. That third rule, order of evaluation, is mostly unspecified in C and comes back in Part 2.' },

        { kind: 'content', title: 'The precedence table, highest first', ratio: 0.5,
            a: { table: { head: ['Level', 'Operators', 'Groups'], colW: [0.9, 3.6, 1.6], size: 15, rows: [
                ['1', '`()` call, `[]`, `.`, `->`, postfix `x++` `x--`', 'left → right'],
                ['2', 'unary `!` `~` `+` `-` `*` `&` `++x` `--x` `(type)` `sizeof`', '**right → left**'],
                ['3', '`*` `/` `%`', 'left → right'],
                ['4', '`+` `-`', 'left → right'],
                ['5', '`<<` `>>`', 'left → right'],
                ['6', '`<` `<=` `>` `>=`', 'left → right'],
                ['7', '`==` `!=`', 'left → right'],
                ['8', '`&`', 'left → right'],
            ] } },
            b: { table: { head: ['Level', 'Operators', 'Groups'], colW: [0.9, 3.6, 1.6], size: 15, rows: [
                ['9', '`^`', 'left → right'],
                ['10', '`|`', 'left → right'],
                ['11', '`&&`', 'left → right'],
                ['12', '`||`', 'left → right'],
                ['13', '`?:`', '**right → left**'],
                ['14', '`=` `+=` `-=` `*=` `/=` `&=` `|=` …', '**right → left**'],
                ['15', '`,`', 'left → right'],
            ] } },
            notes: 'Nobody memorizes all fifteen levels. The next slide lists the five facts worth memorizing; for everything else, add parentheses.' },

        { kind: 'content', title: 'Five facts worth memorizing',
            a: { steps: [
                '**Postfix binds tightest:** `.` `->` `[]` `()` `x++`. So `*p.year` is `*(p.year)`, and `&s->list` is `&(s->list)`',
                '**Unary comes next, right to left:** `*` `&` `!` casts. So `(double)sum / count` casts *first*, then divides',
                '**Arithmetic > shifts > comparisons > equality > bitwise > logical.** So `flags & MASK == 0` is `flags & (MASK == 0)`',
                '**`?:` and assignment are near the bottom, right to left.** So `c = getchar() != EOF` is `c = (getchar() != EOF)`',
                '**The comma operator is the lowest of all.** For everything else: add parentheses',
            ], size: 19, rowH: 1.05 } },

        { kind: 'concept', title: 'Integer division and casts', layout: 'tb', ratio: 0.55,
            what: 'Dividing two `int`s gives an `int`, **truncated toward zero**: `7 / 2` is 3 and `-7 / 2` is -3, and `%` gives the remainder with the sign of the left operand. A **cast** such as `(double)x` converts a value to another type; it is a unary operator, so it binds tighter than `/`.',
            why: ['Put the cast in the wrong place and an average silently loses its fraction: `(double)(sum / count)` divides in `int` first and gives 3.00, not 3.50.', 'No compiler warning catches this: you only see it by checking the result.'],
            how: { stat: [
                { value: '3.50', label: '`(double)sum / count`: convert `sum` first, then divide in `double`' },
                { value: '3.00', label: '`(double)(sum / count)`: divide in `int` first, then convert', color: 'accent3' },
            ] },
            notes: 'With sum = 7 and count = 2. Because a cast is a unary operator, (double)sum / count converts sum before dividing. The live demo on the next slide prints both results, and the truncation of 7 / 2 and -7 / 2.' },

        { kind: 'demo', title: 'Live demo: integer arithmetic', layout: 'tb', ratio: 0.36,
            a: { code: { file: 'examples/arith_logic.c', from: /printf\(" 7 \/ 2/, to: /\(double\)sum \/ count   =/ } },
            b: { out: ` 7 / 2 = 3,  -7 / 2 = -3
 7 % 2 = 1,  -7 % 2 = -1
(double)(sum / count) = 3.00
(double)sum / count   = 3.50`, label: './arith_logic' },
            notes: 'Run make, then ./arith_logic. Only the first four lines matter here; the rest of the output comes back in a few slides.' },

        { kind: 'concept', title: 'Undefined behavior', layout: 'tb', ratio: 0.55,
            what: 'Some operations have **no defined meaning** in C: signed overflow such as `INT_MAX + 1`, modifying a variable twice in one expression, or dereferencing `NULL` or freed memory. For these, the C standard places no requirement on the program at all.',
            why: ['Such a program may print the expected result in testing and then misbehave with another compiler, other flags, or other input.', 'Compilers optimize on the assumption that it never happens, so never rely on wrap-around or on "it worked once".'],
            how: { code: `int big = INT_MAX;
big = big + 1;            /* signed overflow: undefined     */
i = i++ + 1;              /* modified twice: undefined      */
printf("%d\\n", p->id);    /* p is NULL: undefined           */`, label: null },
            notes: 'The notes introduce it with signed overflow (§1.3); Part 2 adds unsequenced modifications, and Week 03 adds dangling pointers. Undefined is not the same as unspecified: unspecified, like evaluation order, means one of several allowed outcomes.' },

        { kind: 'concept', title: 'Mixing signed and unsigned', ratio: 0.5,
            what: '`sizeof` produces an **unsigned** value of type `size_t`. When an `int` meets an unsigned operand in arithmetic or a comparison, the `int` is converted to unsigned first, so `-1` becomes a huge positive number.',
            why: 'Without knowing this rule, `n < sizeof(int)` with `n = -1` looks true but is **false**, and a loop that compares a signed counter with `sizeof` runs the wrong number of times. `-Wextra` warns about it with `-Wsign-compare`.',
            how: { code: `int n = -1;

if (n < sizeof(int))   /* FALSE! */
    printf("-1 < 4\\n");`, label: null, maxFont: 22 },
            notes: 'This is trap 5 in precedence_traps.c. Compare values of the same signedness, or convert deliberately with a cast.' },

        { kind: 'concept', title: 'Comparisons produce 0 or 1', layout: 'tb', ratio: 0.52,
            what: 'The comparison operators (`<`, `<=`, `==`, …) and the logical operators `!`, `&&`, `||` always produce an `int`: **1** for true and **0** for false. A comparison is an ordinary expression with a value.',
            why: ['`0 <= score <= 100` reads like math but means `(0 <= score) <= 100`: the left part is 0 or 1, both are `<= 100`, so it is **always true**.', 'gcc warns about it and recent clang rejects it as an error. Write two comparisons joined by `&&`.'],
            how: { code: `if (0 <= score <= 100)            /* WRONG: always true      */
if (0 <= score && score <= 100)   /* what you meant          */
printf("%d %d\\n", !5, !!5);       /* prints 0 1: !! gives 0/1 */`, label: null },
            notes: 'Comparisons, !, &&, and || always produce an int, 0 or 1. The arith_logic demo prints score in range? 0 for score 150.' },

        { kind: 'concept', title: 'Short-circuit evaluation', layout: 'tb', ratio: 0.52,
            what: '`&&` stops at the first **false** operand and `||` stops at the first **true** one: the right-hand side is then **not evaluated at all**. Both always evaluate their operands from left to right.',
            why: ['Without short-circuiting, `found != NULL && found->year > 2000` would still read `found->year` when `found` is `NULL`, and crash.', 'The order matters: `found->year > 2000 && found != NULL` dereferences `NULL` before it checks.'],
            how: { code: `if (found->year > 2000 && found != NULL)   /* CRASHES when found == NULL */
    printf("found a recent book\\n");

if (found != NULL && found->year > 2000)   /* SAFE: right side skipped   */
    printf("found a recent book\\n");`, label: null },
            notes: 'This guard pattern — check the pointer, then use it, in one condition — appears in every list search from Week 03 to Week 08. The arith_logic demo prints "no book (and no crash)" because found is NULL.' },

        { kind: 'demo', title: 'Live demo: arith_logic.c, the rest', ratio: 0.55,
            a: { out: `score in range? 0
!score = 0, !!score = 1
no book (and no crash)
larger of 7 and 2 is 7
a = 15, b = 5`, label: './arith_logic' },
            b: { bullets: [
                '`score` is 150, so the range check is 0',
                '`!!x` turns any non-zero value into 1',
                '`found` is `NULL`, and `&&` never read `found->year`',
            ] } },

        { kind: 'concept', title: 'Assignment is an expression', layout: 'tb', ratio: 0.56,
            what: 'An assignment such as `b = 5` is itself an expression: its value is the value that was assigned. `=` groups right to left, so `a = b = 5` sets `b` and then `a`. Compound assignment `a += b * 2` means `a = a + (b * 2)`.',
            why: ['The typo `if (year = 2024)` compiles: it assigns 2024, which is non-zero, so the condition is always true. `-Wall` warns about it.', 'The same property gives the idiom `while ((c = getchar()) != EOF)` (next slide).'],
            how: { code: `a = b = 5;          /* right to left: b = 5, then a = 5 */
if (year = 2024)    /* BUG: assigns 2024, always true   */
a += b * 2;         /* a = a + (b * 2)                  */`, label: null },
            notes: 'An assignment has a value: the value that was assigned. When you want an assignment inside a condition, add parentheses, because = has lower precedence than !=.' },

        { kind: 'compare', title: 'An assignment inside a condition',
            intro: 'When you *do* want it, add parentheses: `=` has lower precedence than `!=`. You will use the right form in Week 07 to read files.',
            left: { label: 'RIGHT', kind: 'good', note: 'Assign, then compare', body: { code: 'while ((c = getchar()) != EOF)', label: null, maxFont: 22 } },
            right: { label: 'WRONG', kind: 'bad', note: '`c = (getchar() != EOF)`: `c` is 0 or 1', body: { code: 'while (c = getchar() != EOF)', label: null, maxFont: 22 } } },

        /* ---------------- Part 2 ---------------- */
        { newSection: 'Part 2 — pointers, flags, macros', kind: 'section', num: 2, label: 'PART 2', title: 'Pointer expressions, side effects, bit flags, and macros', sub: 'Postfix first, then unary, right to left' },

        { kind: 'concept', title: 'Reading pointer expressions', layout: 'tb', ratio: 0.5,
            what: 'Pointer code mixes `*`, `&`, `.`, `->`, `[]`, and `++`. Two rules settle all of it: **postfix** operators (`.` `->` `[]` `()` `x++`) bind tightest, and **unary** operators (`*` `&` `!` casts) come next, grouping right to left.',
            why: ['Misread one and the code means something else or does not compile: with `struct book **pp`, `*pp->year` is `*(pp->year)`, an error.', 'Linked-list code is full of these: `&(*link)->next` (Week 03), `&s->list` (Week 05), `(char *)ptr - off` (Week 06).'],
            how: { code: `*pp->year      /* *(pp->year): does not compile with struct book **pp */
(*pp)->year    /* follow pp, then -> : the year                       */
*q++           /* *(q++): reads *q, then moves the POINTER q          */
&s->list       /* &(s->list): the address of a member                 */`, label: null },
            notes: 'The rule from the precedence table settles all of these: postfix first, then unary, right to left. The table on the next slide lists the expressions students will meet in the coming weeks.' },

        { kind: 'content', title: 'Pointer expressions you will meet',
            a: { table: { head: ['Expression', 'Means', 'You will see it in'], colW: [3, 5.5, 3.5], size: 15, rows: [
                ['`p->year`', '`(*p).year`', 'every week'],
                ['`*p->title`', '`*(p->title)`: the first character of the title', ''],
                ['`p->title[1]`', '`(p->title)[1]`', ''],
                ['`&p->year`', '`&(p->year)`: the address of a member', '`&s->list` (Week 05)'],
                ['`(*pp)->year`', 'follow `pp`, then `->`', '`(*link)->next` (Week 03)'],
                ['`&(*link)->next`', 'the address of the `next` field of `*link`', 'Week 03'],
                ['`n->prev->next`', '`(n->prev)->next`, left to right', 'Weeks 04–05'],
                ['`(char *)ptr - off`', '`((char *)ptr) - off`: the cast first', '`container_of()` (Week 06)'],
            ] } } },

        { kind: 'demo', title: 'Live demo: pointer_exprs.c', layout: 'tb', ratio: 0.55,
            a: { code: { file: 'examples/pointer_exprs.c', from: /printf\("p->year/, to: /"yes" : "no"\);/ } },
            b: { out: `p->year     = 2010
*p->title   = 'O'
p->title[1] = 'p'
(*pp)->year = 2010
&p->year == &b.year ? yes`, label: './pointer_exprs' } },

        { kind: 'exercise', title: 'Add the parentheses', minutes: 5,
            intro: 'Show how each expression is grouped. Which one does not compile?',
            a: { steps: [
                '`*pp->year`   (with `struct book **pp`)',
                '`!list_empty(head)`',
                '`p->next->next->id`',
                '`&b->list.next`',
            ], size: 22, rowH: 0.9 } },

        { kind: 'answer', title: 'Add the parentheses',
            a: { steps: [
                '`*(pp->year)`: does **not compile**. `pp` points to a pointer, not to a struct; you need `(*pp)->year`',
                '`!(list_empty(head))`: call first, then logical not',
                '`((p->next)->next)->id`',
                '`&((b->list).next)`: the address of the `next` field inside `b->list`',
            ], kind: 'good', size: 20, rowH: 1.0 } },

        { kind: 'concept', title: 'Prefix and postfix `++` and `--`', layout: 'tb', ratio: 0.4,
            what: 'Both forms add (or subtract) 1. **Postfix** `x++` yields the **old** value and **prefix** `++x` yields the **new** one. Postfix `++` binds tighter than unary `*`, so `*q++` is `*(q++)`.',
            why: ['`*q++;` written to increment the value moves the **pointer** instead; the value never changes.', '`a[i] = i++` reads `i` again in the expression that increments it: undefined.'],
            how: { table: { head: ['Expression', 'Value of the expression', 'Side effect'], colW: [2.6, 4.2, 5.2], size: 14, rows: [
                ['`x++`', 'the **old** `x`', '`x` grows by 1'],
                ['`++x`', 'the **new** `x`', '`x` grows by 1'],
                ['`*q++`', '`*q` (the old target)', '**`q`** moves to the next element'],
                ['`(*q)++`', 'the old `*q`', 'the **value** `*q` grows by 1'],
                ['`++*q`', 'the new `*q`', 'the **value** `*q` grows by 1'],
            ] } },
            notes: 'Postfix ++ binds tighter than *, so *q++ moves the pointer. This is trap 3 in precedence_traps.c. p->year++ increments the member: -> binds before ++. When in doubt, put the increment on its own line.' },

        { kind: 'demo', title: 'Live demo: increments in pointer_exprs.c', layout: 'tb', ratio: 0.66,
            a: { code: { file: 'examples/pointer_exprs.c', from: /p->year\+\+;/, to: /printf\("years/ } },
            b: { out: `after p->year++ and ++p->year: 2012
first = 1978, q now points to years[1]
years = 1978 2007 2010`, label: './pointer_exprs' } },

        { kind: 'concept', title: 'Order of evaluation and side effects', ratio: 0.5,
            what: 'The **order of evaluation** is the order in which operands are computed; for most operators it is **unspecified**, so in `f() + g()` either call may run first. A **side effect** is a change an expression makes, such as `i++`.',
            why: 'Modifying a variable twice in one expression, or modifying it and also reading it for another purpose, is undefined: `i = i++ + 1;`, `a[i] = i++;`. (`i = i + 2;` is fine.) Only `&&`, `||`, `?:`, and the comma operator guarantee left-to-right order.',
            how: { code: `i = i++ + 1;                 /* undefined */
printf("%d %d\\n", i, i++);   /* undefined */
a[i] = i++;                  /* undefined */

i = i + 2;                   /* fine      */`, label: null },
            notes: 'Rule: within one expression, modify a variable at most once, and do not read it anywhere else in that expression, except to compute the value stored into it. clang warns with -Wunsequenced, gcc with -Wsequence-point.' },

        { kind: 'concept', title: 'Bitwise operators', layout: 'tb', ratio: 0.44,
            what: 'Bitwise operators work on the individual bits of an integer: `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), and the shifts `<<` and `>>`. `1u << n` has only bit `n` set.',
            why: 'One `unsigned int` can hold many yes/no facts, one per bit, instead of one variable each. Note that `&` is not `&&`: `2 & 1` is 0 but `2 && 1` is 1.',
            how: { table: { head: ['Operator', 'Name', 'Typical use'], colW: [3, 2, 7], size: 14, rows: [
                ['`a & b`', 'AND', 'test a flag, clear flags'],
                ['`a | b`', 'OR', 'set a flag, combine flags'],
                ['`a ^ b`', 'XOR', 'toggle a flag'],
                ['`~a`', 'NOT', 'invert every bit: a "clear" mask'],
                ['`a << n`, `a >> n`', 'shift', 'build a flag: `1u << n`'],
            ] } },
            notes: 'Use 1u, not 1: shifting a signed 1 into the sign bit is undefined behavior. The next slide turns these operators into the flag-set pattern.' },

        { kind: 'concept', title: 'Bit flags', layout: 'tb', ratio: 0.46,
            what: 'A **flag set** is an unsigned integer in which each bit is one yes/no property, named by a macro. **Set** a flag with `|=`, **clear** it with `&= ~`, **toggle** it with `^=`, and **test** it with `&`.',
            why: ['`flags & BOOK_DAMAGED == 0` means `flags & (BOOK_DAMAGED == 0)`, always 0: `==` binds tighter than `&`.', 'System APIs such as POSIX `open()` use it everywhere: `O_RDONLY | O_CREAT`.'],
            how: { code: `#define BOOK_BORROWED (1u << 0)
#define BOOK_DAMAGED  (1u << 1)
flags |= BOOK_BORROWED;              /* set    */
flags &= ~BOOK_BORROWED;             /* clear  */
flags ^= BOOK_DAMAGED;               /* toggle */
if ((flags & BOOK_DAMAGED) != 0)     /* test: parentheses REQUIRED */`, label: null },
            notes: 'bit_flags.c defines a third flag, BOOK_RESERVED, and print_flags() tests each one. The live demo follows.' },

        { kind: 'demo', title: 'Live demo: bit_flags.c', ratio: 0.55,
            a: { out: `flags = 0x5: borrowed reserved
flags = 0x4: reserved
flags = 0x6: damaged reserved
damaged
2 & 1 = 0, 2 && 1 = 1
(1 << 2) + 1 = 5, 1 << (2 + 1) = 8`, label: './bit_flags' },
            b: { bullets: [
                '`print_flags()` tests each flag with `(flags & BOOK_...)`',
                '`0x5` = borrowed + reserved; clearing borrowed leaves `0x4`',
                'Toggling damaged sets bit 1: `0x6`',
                '`&` and `&&` give different answers for the same operands',
            ] } },

        { kind: 'concept', title: 'The conditional and comma operators', layout: 'tb', ratio: 0.52,
            what: '`c ? a : b` is an expression that yields `a` if `c` is non-zero and `b` otherwise. The **comma operator** `x, y` evaluates `x`, then `y`, and yields `y`; you mostly meet it in `for` loops.',
            why: ['Without `?:`, choosing between two values needs an `if`/`else` and a temporary.', 'Without the comma operator a `for` loop cannot update two variables at once; `list_for_each_safe()` (Week 06) relies on it.'],
            how: { code: `max = a > b ? a : b;   /* comparison, then ?:, then = */

for (i = 0, j = n - 1; i < j; i++, j--)
    swap(&v[i], &v[j]);`, label: null },
            notes: '?: has lower precedence than the comparisons, so a > b ? a : b needs no parentheses; nested ?: gets unreadable fast, so parenthesize or use if. The comma operator guarantees left-to-right order. Commas between function arguments are separators, not the comma operator.' },

        { kind: 'concept', title: 'Macros are text substitution', ratio: 0.5,
            what: 'A `#define` macro is expanded by the **preprocessor**, which pastes the replacement text into the code before the compiler applies any precedence. Each parameter is replaced by the argument\'s text, exactly as written.',
            why: ['`SQUARE_BAD(1 + 2)` expands to `1 + 2 * 1 + 2`, which is 5, not 9; `10 / DOUBLE_BAD(5)` becomes `10 / (5) + (5)`, which is 7.', 'The argument is pasted once per use, so `SQUARE(i++)` increments `i` twice: undefined behavior.'],
            how: { code: { file: 'examples/macro_parens.c', from: /^#define SQUARE_BAD/, to: /^#define DOUBLE\(x\)/ } },
            notes: 'Live demo: ./macro_parens prints SQUARE_BAD(1 + 2) = 5, SQUARE(1 + 2) = 9, 10 / DOUBLE_BAD(5) = 7, and 10 / DOUBLE(5) = 1. The next slide gives the rules that prevent this.' },

        { kind: 'content', title: 'Rules for every macro you write',
            a: { cards: [
                { n: 1, h: 'Parenthesize each parameter', body: 'Write `(x)` everywhere the parameter is used.' },
                { n: 2, h: 'Parenthesize the whole body', body: '`((x) * (x))`, so the macro is one expression wherever it lands.' },
                { n: 3, h: 'Beware side effects', body: 'The argument is pasted once per use: `SQUARE(i++)` increments `i` twice (undefined behavior).' },
            ] },
            foot: 'In Week 06, `container_of()` follows both rules.' },

        { kind: 'demo', title: 'Let the compiler check you', layout: 'tb', ratio: 0.7,
            a: { term: [{ cmd: 'gcc -Wall -Wextra -std=c11 precedence_traps.c -o precedence_traps', out: `:24:15: warning: & has lower precedence than ==       [-Wparentheses]
:29:14: warning: using the result of an assignment as a condition
        without parentheses                            [-Wparentheses]
:32:5:  warning: expression result unused             [-Wunused-value]
:35:10: warning: multiple unsequenced modifications   [-Wunsequenced]
:38:11: warning: comparison of integers of different signs  [-Wsign-compare]` }, { cmd: './precedence_traps', out: `1. damaged?!   2. year is now 2024   4. i = 1
5. -1 < 4 is false?!   6. average = 3.00` }] },
            b: { callout: '`precedence_traps.c` is built by hand on purpose: its Makefile skips it. Five traps produce warnings; the sixth produces **none**.' },
            notes: 'Output shortened; each line starts with precedence_traps.c in the real output.' },

        { kind: 'content', title: 'Six traps, and who catches them',
            a: { table: { head: ['#', 'Trap', 'Caught by', 'Fix'], colW: [0.5, 4.2, 3.6, 3.8], size: 15, rows: [
                ['1', '`flags & BOOK_DAMAGED == 0`', '`-Wparentheses`', '`(flags & BOOK_DAMAGED) == 0`'],
                ['2', '`if (year = 2024)`', '`-Wparentheses`', '`if (year == 2024)`'],
                ['3', '`*p++;` to increment a value', '`-Wunused-value`', '`(*p)++;`'],
                ['4', '`i = i++ + 1;`', '`-Wunsequenced` (gcc: `-Wsequence-point`)', '`i = i + 2;`'],
                ['5', '`-1 < sizeof(int)`', '`-Wsign-compare`', 'same signedness on both sides'],
                ['6', '`(double)(sum / count)`', '**nothing**', '`(double)sum / count`'],
            ] } },
            foot: 'Trap 6 printed `average = 3.00`. `-Wall -Wextra` catch most precedence bugs, not all: test your results too.' },

        /* ---------------- Lab ---------------- */
        { newSection: 'Lab', kind: 'section', num: '>_', label: 'LAB', title: 'Week 02 assignment', sub: 'Fix the starter\'s deliberate warnings, then the bugs no warning catches' },

        { kind: 'content', title: 'Lab — Week 02 assignment',
            a: { steps: [
                'Build the starter **first** and read its three warnings. They are deliberate',
                '`is_valid_score()`: test it with -1, 0, 100, and 101',
                '`is_passing()`: one `&&` expression that checks `NULL` first',
                'Using only `pp`, add 5 to the score; explain why `*pp->score` does not compile',
                'Flags: set `STUDENT_ENROLLED` and `STUDENT_PAID`, clear `STUDENT_PAID`, print',
                '`fix_me()`: fix all five bugs, including the two with **no** warning',
                'Rebuild until there are **zero warnings**',
            ], cols: 2, size: 17, rowH: 1.3 },
            notes: 'Task: assignments/week02-operators/README.md' },

        { kind: 'content', title: 'Stretch goals',
            a: { cards: [
                { n: 1, h: '`HAS_FLAG(flags, f)`', body: 'A macro that is correct even for `HAS_FLAG(a | b, c)`.' },
                { n: 2, h: '`clamp_score()`', body: 'Use `?:` to return a value in 0–100.' },
                { n: 3, h: 'Predict, then check', body: 'What do `*q++ = 0;` and `(*q)++;` each change in an `int` array?' },
            ] } },

        /* ---------------- Wrap-up ---------------- */
        { newSection: 'Wrap-up', kind: 'takeaways', items: [
            'Precedence and associativity decide **grouping**; they do not decide **evaluation order**',
            'Postfix (`.` `->` `[]` `()` `x++`) binds tightest, then unary (`*` `&` `!` casts)',
            'Bitwise `&` `|` bind *looser* than `==`: parenthesize flag tests',
            '`&&` and `||` short-circuit. Put the `NULL` check on the left',
            'Never modify a variable twice in one expression',
            'Parenthesize macro parameters and bodies. `-Wall -Wextra` catch many of these bugs, but not integer division or a bad macro',
        ] },

        { kind: 'quiz', questions: [
            'How is `*p++` grouped, and what does it change?',
            'Why is `if (0 <= score <= 100)` always true?',
            'What does `(double)(7 / 2)` evaluate to? `(double)7 / 2`?',
            'Rewrite `if (p->id == id && p != NULL)` so that it cannot crash',
            'Why must `if (flags & BOOK_DAMAGED == 0)` be rewritten?',
        ] },

        { kind: 'answers', answers: [
            '`*(p++)`: it reads `*p`, then moves the **pointer** `p`. The value is not changed',
            '`0 <= score` yields 0 or 1, and both `0 <= 100` and `1 <= 100` are true',
            '`3.0` (integer division happens first), and `3.5`',
            '`if (p != NULL && p->id == id)`: `p->id` is never evaluated when `p` is `NULL`',
            '`==` binds tighter than `&`: it is `flags & 0`, always 0. Write `(flags & BOOK_DAMAGED) == 0`',
        ] },

        { kind: 'next', title: 'Week 03 — Dynamic Memory and Singly Linked List', sub: 'Every struct so far disappears when its function returns. How do we create objects that outlive their creator, in numbers we do not know in advance, and chain them into a list?' },
    ],
};
