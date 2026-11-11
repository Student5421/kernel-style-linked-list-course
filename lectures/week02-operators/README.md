# Week 02 — Operators and Precedence

| | |
|---|---|
| **Session** | Lecture + live coding + lab |
| **Assignment** | [Week 02 — Operators and Precedence](../../assignments/week02-operators/) |
| **Demo code** | [`examples/`](examples/) |
| **Previous / Next** | [Week 01](../week01-struct/) · [Week 03](../week03-dynamic-memory-singly-list/) |

## Reference slide reading

Page ranges below use one-based PDF pages. Read the selected sections alongside
the existing demos; the complete reference PDFs are not additional material to
finish in this session.

| Order | Reference pages | Connection to this lecture |
|---|---|---|
| 1 (recap) | [Pointers Revisited](../week01-struct/%5BSlide%5D%2001.%20Pointers%20Revisited.pdf), pp. 13-16, 20-23, 27-39 | Review array sizes, pointer arithmetic, pointer declarations, and 2D argument types after Week 01's pointer basics. Use the [pointer supplement](../week01-struct/examples/pointers-revisited/README.md) before [`pointer_exprs.c`](examples/pointer_exprs.c). |
| 2 | [Strings](%5BSlide%5D%2003.%20Strings.pdf), pp. 3-14, 26-34 | Connect null-terminated character arrays, array/pointer differences, traversal, arrays of strings, and `argv` to `*`, `[]`, and `++`. Revisit [`struct_basics.c`](../week01-struct/examples/struct_basics.c) for a book's embedded title array. |
| 3 (practice) | [Strings](%5BSlide%5D%2003.%20Strings.pdf), pp. 49-63, 74-81 | After precedence and side effects, read copying, concatenation, comparison, length, and the condensed pointer loops. Predict which pointer advances and which character is copied before running or rewriting a loop. |
| 4 | [Low Level Operations](%5BSlide%5D%2006.%20Low%20Level%20Operations.pdf), pp. 2-19 | Read the bitwise operators, shifts, masks, and applications alongside [`bit_flags.c`](examples/bit_flags.c). |
| 5 | [Writing Large Programs](../week08-final-project/%5BSlide%5D%2007.%20Writing%20Large%20Programs.pdf), pp. 8-10, 14-15 | Use the macro sections with [`macro_parens.c`](examples/macro_parens.c); return to the full program-organization reference in Week 08. |

Revisit Strings pp. 15-25, 35-48, 64-67, and 73 with [Week 07's input and
parsing](../week07-file-io/); reserve pp. 68-72 for byte-oriented memory review
in [Week 06](../week06-container-of/). The old `gets()` examples are historical:
`gets()` was removed in C11, so use `fgets()` with a buffer size and check its
return value. String-copy and concatenation destinations need enough capacity
for the result plus `'\0'`; an `n` suffix alone does not establish that capacity.

The [example guide](examples/README.md) maps runnable string and packed-field
demos to these reference pages, with observations and short prediction exercises.
Run the whole set without keyboard input using `make -C examples run` from this
week's directory.

## Learning Objectives

By the end of this session you can:

1. Tell apart *precedence*, *associativity*, and *order of evaluation*.
2. Parse expressions that mix `*`, `&`, `.`, `->`, `[]`, and `++`, such as `*p->title`, `(*pp)->year`, and `*q++`.
3. Avoid the integer-division, signed/unsigned, and chained-comparison traps.
4. Use `&&` short-circuiting to guard against `NULL` pointers.
5. Set, clear, toggle, and test bit flags.
6. Write macros that survive precedence, and let `-Wall -Wextra` find precedence bugs for you.

---

## 0. Review of Week 01

1. What does `make` do when the target is newer than all of its prerequisites?
2. Why does a Makefile recipe line need a TAB?
3. `struct book *p = &b;`: write `p->year` without the arrow.
4. Why can `set_year_by_pointer()` change the caller's struct, but `set_year_by_value()` cannot?

Today's question: **Last week `*p.year` did not compile. How does C decide what an expression means, and which mistakes like this one compile *without* an error?**

---

## 1. Precedence, Arithmetic, Comparisons, and Logic

### 1.1 Three different rules

| Rule | Question it answers | Example |
|---|---|---|
| **Precedence** | Which operator grabs its operands first? | `a + b * c` is `a + (b * c)` |
| **Associativity** | Same level: group from the left or from the right? | `a - b - c` is `(a - b) - c`; `a = b = 0` is `a = (b = 0)` |
| **Order of evaluation** | Which operand is *computed* first? | In `f() + g()`, either call may run first |

Precedence and associativity decide how the expression is **grouped**. They say nothing about which operand runs first. That is a third, separate rule, and for most operators C leaves it **unspecified**.

### 1.2 The precedence table

From highest (binds tightest) to lowest:

| Level | Operators | Groups |
|---|---|---|
| 1 | `()` call, `[]`, `.`, `->`, postfix `x++` `x--` | left to right |
| 2 | unary `!` `~` `+` `-` `*` `&` `++x` `--x` `(type)` `sizeof` | **right to left** |
| 3 | `*` `/` `%` | left to right |
| 4 | `+` `-` | left to right |
| 5 | `<<` `>>` | left to right |
| 6 | `<` `<=` `>` `>=` | left to right |
| 7 | `==` `!=` | left to right |
| 8 | `&` | left to right |
| 9 | `^` | left to right |
| 10 | `\|` | left to right |
| 11 | `&&` | left to right |
| 12 | `\|\|` | left to right |
| 13 | `?:` | **right to left** |
| 14 | `=` `+=` `-=` `*=` `/=` `%=` `<<=` `>>=` `&=` `^=` `\|=` | **right to left** |
| 15 | `,` | left to right |

You do not need to memorize fifteen levels. Memorize **five facts**, and add parentheses for everything else:

1. **Postfix operators bind tightest:** `.`, `->`, `[]`, `()`, `x++`. So `*p.year` is `*(p.year)`, and `&s->list` is `&(s->list)`.
2. **Unary operators come next and group right to left:** `*`, `&`, `!`, casts. So `(double)sum / count` casts *first*, then divides.
3. **Arithmetic > shifts > comparisons > equality > bitwise > logical.** So `flags & MASK == 0` is `flags & (MASK == 0)`.
4. **`?:` and assignment are near the bottom, right to left.** So `c = getchar() != EOF` is `c = (getchar() != EOF)`.
5. **The comma operator is the lowest of all.**

### 1.3 Integer arithmetic

**Live demo** — [`examples/arith_logic.c`](examples/arith_logic.c):

```text
 7 / 2 = 3,  -7 / 2 = -3
 7 % 2 = 1,  -7 % 2 = -1
(double)(sum / count) = 3.00
(double)sum / count   = 3.50
```

- Dividing two `int`s gives an `int`. The result **truncates toward zero**.
- `%` gives the remainder, with the sign of the left operand.
- A cast is a unary operator, so it binds tighter than `/`:
  - `(double)sum / count` converts `sum`, then divides in `double`: **3.5**.
  - `(double)(sum / count)` divides in `int` first (3), then converts: **3.0**.
- Signed integer overflow (for example `INT_MAX + 1`) is **undefined behavior**. Do not rely on it wrapping around.

**Mixing signed and unsigned.** `sizeof` produces an *unsigned* value (`size_t`). When an `int` meets an unsigned operand, the `int` is converted to unsigned:

```c
int n = -1;
if (n < sizeof(int))      /* -1 becomes a huge unsigned number: FALSE */
```

`-Wextra` warns about this (`-Wsign-compare`).

### 1.4 Comparisons and logical operators

Comparisons and `!`, `&&`, `||` always produce an `int`: **0** or **1**.

**The chained comparison trap:**

```c
if (0 <= score <= 100)          /* (0 <= score) <= 100: 0 or 1 is always <= 100 */
if (0 <= score && score <= 100) /* what you meant */
```

gcc warns about the first line (`-Wparentheses`), and recent clang versions reject it as an error. Either way, it never means what it looks like.

**Short-circuit evaluation.** `&&` stops at the first false operand, and `||` stops at the first true one. The right side is **not evaluated at all**:

```c
if (found != NULL && found->year > 2000)    /* safe: found->year is read only if found != NULL */
if (found->year > 2000 && found != NULL)    /* crash: dereferences NULL before checking */
```

This guard pattern, *check the pointer, then use it, in one condition*, appears in every list search from Week 03 to Week 08.

### 1.5 Assignment is an expression

An assignment has a value: the value that was assigned. Two consequences:

```c
a = b = 5;          /* right to left: b = 5, then a = 5 */
if (year = 2024)    /* BUG: assigns 2024, which is non-zero, so always true */
```

`-Wall` warns about the second line. When you *do* want an assignment inside a condition, add parentheses, because `=` has lower precedence than `!=`:

```c
while ((c = getchar()) != EOF)   /* right: assign, then compare            */
while (c = getchar() != EOF)     /* wrong: c = (getchar() != EOF), so 0 or 1 */
```

You will use the correct form in Week 07 to read files character by character.

Compound assignment applies the whole right side first: `a += b * 2` is `a = a + (b * 2)`.

---

## 2. Pointer Expressions, Side Effects, Bit Flags, and Macros

### 2.1 Reading pointer expressions

The rule from §1.2 settles all of these: **postfix first, then unary, right to left.**

**Live demo** — [`examples/pointer_exprs.c`](examples/pointer_exprs.c):

| Expression | Means | You will see it in |
|---|---|---|
| `p->year` | `(*p).year` | every week |
| `*p->title` | `*(p->title)`: the first character of the title | |
| `p->title[1]` | `(p->title)[1]` | |
| `&p->year` | `&(p->year)`: the address of a member | `&s->list` (Week 05) |
| `(*pp)->year` | follow `pp`, then `->` | `(*link)->next` (Week 03) |
| `&(*link)->next` | the address of the `next` field of `*link` | Week 03 |
| `n->prev->next` | `(n->prev)->next` (left to right) | Weeks 04–05 |
| `(char *)ptr - off` | `((char *)ptr) - off`: the cast first | `container_of()` (Week 06) |

```text
p->year     = 2010
*p->title   = 'O'
p->title[1] = 'p'
(*pp)->year = 2010
&p->year == &b.year ? yes
```

**In-class exercise (5 min):** add parentheses to show how each expression is grouped. Which one does not compile?

1. `*pp->year` (with `struct book **pp`)
2. `!list_empty(head)`
3. `p->next->next->id`
4. `&b->list.next`

<details>
<summary>Answers</summary>

1. `*(pp->year)`. This does **not compile**: `pp` points to a pointer, not to a struct. You need `(*pp)->year`.
2. `!(list_empty(head))`: call first, then logical not.
3. `((p->next)->next)->id`
4. `&((b->list).next)`: the address of the `next` field inside `b->list`.

</details>

### 2.2 `++` and `--`

| Expression | Value of the expression | Side effect |
|---|---|---|
| `x++` | the **old** `x` | `x` grows by 1 |
| `++x` | the **new** `x` | `x` grows by 1 |
| `*q++` | `*q` (the old target) | **`q`** moves to the next element |
| `(*q)++` | the old `*q` | the **value** `*q` grows by 1 |
| `++*q` | the new `*q` | the **value** `*q` grows by 1 |
| `p->year++` | the old `p->year` | `p->year` grows by 1 |

`*q++` is the one that bites. Postfix `++` binds tighter than `*`, so it increments the **pointer**. If you meant to increment the value, write `(*q)++`. When in doubt, put the increment on its own line.

### 2.3 Side effects and order of evaluation

Modifying a variable twice in one expression, or modifying it and also reading it for another purpose in the same expression, is **undefined behavior**:

```c
i = i++ + 1;                 /* undefined */
printf("%d %d\n", i, i++);   /* undefined */
a[i] = i++;                  /* undefined */
```

The rule: **within one expression, modify a variable at most once, and do not read it anywhere else in that expression, except to compute the value you store into it.** `i = i + 2;` is fine; `a[i] = i++;` is not.

Four operators do guarantee left-to-right order: `&&`, `||`, `?:`, and the comma operator. That is why `p != NULL && p->id == id` is safe.

### 2.4 Bitwise operators and flags

| Operator | Name | Typical use |
|---|---|---|
| `a & b` | AND | test a flag, clear flags |
| `a \| b` | OR | set a flag, combine flags |
| `a ^ b` | XOR | toggle a flag |
| `~a` | NOT | invert every bit, to build a "clear" mask |
| `a << n`, `a >> n` | shift | build a flag: `1u << n` |

The flag-set pattern, used throughout C system interfaces (for example in file-open flags like `O_RDONLY | O_CREAT`):

```c
#define BOOK_BORROWED (1u << 0)
#define BOOK_DAMAGED  (1u << 1)
#define BOOK_RESERVED (1u << 2)

flags |= BOOK_BORROWED;              /* set    */
flags &= ~BOOK_BORROWED;             /* clear  */
flags ^= BOOK_DAMAGED;               /* toggle */
if ((flags & BOOK_DAMAGED) != 0)     /* test: parentheses REQUIRED */
```

**Live demo** — [`examples/bit_flags.c`](examples/bit_flags.c):

```text
flags = 0x5: borrowed reserved
flags = 0x4: reserved
flags = 0x6: damaged reserved
damaged
2 & 1 = 0, 2 && 1 = 1
(1 << 2) + 1 = 5, 1 << (2 + 1) = 8
```

- `&` is **not** `&&`: `2 & 1` is 0 (no common bits), but `2 && 1` is 1 (both are non-zero).
- Use `1u` (unsigned). Shifting a signed `1` into the sign bit is undefined behavior.

### 2.5 `?:` and the comma operator

```c
max = a > b ? a : b;        /* comparison first, then ?:, then = */
```

Nested `?:` gets unreadable quickly, so parenthesize or use `if`.

The comma operator evaluates its left operand, then its right one, and yields the right one. You mostly see it in `for` loops:

```c
for (i = 0, j = n - 1; i < j; i++, j--)
```

`list_for_each_safe()` in Week 06 uses exactly this. Note that the commas between function arguments are separators, not the comma operator.

### 2.6 Macros and precedence

A macro is **text substitution**, done before the compiler sees any precedence:

**Live demo** — [`examples/macro_parens.c`](examples/macro_parens.c):

```c
#define SQUARE_BAD(x)  x * x
#define SQUARE(x)      ((x) * (x))
#define DOUBLE_BAD(x)  (x) + (x)
#define DOUBLE(x)      ((x) + (x))
```

```text
SQUARE_BAD(1 + 2) = 5   (1 + 2 * 1 + 2)
SQUARE(1 + 2)     = 9
10 / DOUBLE_BAD(5) = 7  (10 / (5) + (5))
10 / DOUBLE(5)     = 1
```

Two rules for every macro you write:

1. Parenthesize **each parameter** where it is used.
2. Parenthesize the **whole body**.

A third caution: the argument is pasted in once per use, so `SQUARE(i++)` increments `i` twice, which is undefined behavior. In Week 06, `container_of()` follows both rules.

### 2.7 Let the compiler check you

**Live demo** — [`examples/precedence_traps.c`](examples/precedence_traps.c), built by hand:

```bash
gcc -Wall -Wextra -std=c11 precedence_traps.c -o precedence_traps
```

```text
precedence_traps.c:24:15: warning: & has lower precedence than ==; == will be evaluated first [-Wparentheses]
precedence_traps.c:29:14: warning: using the result of an assignment as a condition without parentheses [-Wparentheses]
precedence_traps.c:32:5: warning: expression result unused [-Wunused-value]
precedence_traps.c:35:10: warning: multiple unsequenced modifications to 'i' [-Wunsequenced]
precedence_traps.c:38:11: warning: comparison of integers of different signs: 'int' and 'unsigned long' [-Wsign-compare]
```

```bash
./precedence_traps
```

```text
1. damaged?!
2. year is now 2024
4. i = 1
5. -1 < 4 is false?!
6. average = 3.00
```

| # | Trap | Caught by | Fix |
|---|---|---|---|
| 1 | `flags & BOOK_DAMAGED == 0` | `-Wparentheses` | `(flags & BOOK_DAMAGED) == 0` |
| 2 | `if (year = 2024)` | `-Wparentheses` | `if (year == 2024)` |
| 3 | `*p++;` to increment a value | `-Wunused-value` | `(*p)++;` |
| 4 | `i = i++ + 1;` | `-Wunsequenced` (gcc: `-Wsequence-point`) | `i = i + 2;` or two statements |
| 5 | `-1 < sizeof(int)` | `-Wsign-compare` | compare values of the same signedness |
| 6 | `(double)(sum / count)` | **nothing** | `(double)sum / count` |

The output shows trap 6 printing `average = 3.00`. `-Wall -Wextra` catches most precedence bugs, but not all of them. Test your results too.

---

## 3. Lab

Task: [assignments/week02-operators/README.md](../../assignments/week02-operators/README.md)

1. Build the starter **first** and read its three warnings. They are deliberate.
2. `is_valid_score()`: test it with -1, 0, 100, and 101.
3. `is_passing()`: one `&&` expression that checks `NULL` first. Test it with `&student` and `NULL`.
4. Using only `pp`, add 5 to the score: `(*pp)->score += 5;`. Explain why `*pp->score` does not compile.
5. Flags: set `STUDENT_ENROLLED` and `STUDENT_PAID`, clear `STUDENT_PAID`, and print them with `print_flags()`.
6. `fix_me()`: fix all five bugs, including the two that produce **no** warning, and explain each one in a comment.
7. Rebuild until there are **zero warnings**.

**Stretch goals:**

- Write a macro `HAS_FLAG(flags, f)` that is correct for `HAS_FLAG(a | b, c)`.
- Write `clamp_score(int score)` using `?:` so that it returns a value in 0–100.
- Predict, then check: what do `*q++ = 0;` and `(*q)++;` each change in an `int` array?

---

## 4. Wrap-up

### Key takeaways

- Precedence and associativity decide **grouping**. They do not decide **evaluation order**.
- Postfix (`.` `->` `[]` `()` `x++`) binds tightest, then unary (`*` `&` `!` casts). This explains `*p.year`, `&s->list`, `*q++`, and `(double)sum / count`.
- Bitwise `&` `|` bind *looser* than `==`, so `flags & MASK == 0` is wrong. Parenthesize flag tests.
- `&&` and `||` short-circuit. Put the `NULL` check on the left.
- Never modify a variable twice in one expression.
- Parenthesize macro parameters and macro bodies.
- `-Wall -Wextra` catch many of these, but not integer division or a badly written macro.

### Exit quiz

1. How is `*p++` grouped, and what does it change?
2. Why is `if (0 <= score <= 100)` always true?
3. What does `(double)(7 / 2)` evaluate to? `(double)7 / 2`?
4. Rewrite `if (p->id == id && p != NULL)` so that it cannot crash.
5. Why must `if (flags & BOOK_DAMAGED == 0)` be rewritten?

<details>
<summary>Answers</summary>

1. `*(p++)`: it reads `*p`, then moves the **pointer** `p`. The value is not changed.
2. `0 <= score` is evaluated first and yields 0 or 1. Then `0 <= 100` or `1 <= 100` is always true.
3. `3.0` (integer division happens first), and `3.5`.
4. `if (p != NULL && p->id == id)`. With the check on the left, `p->id` is never evaluated when `p` is `NULL`.
5. `==` binds tighter than `&`, so it means `flags & (BOOK_DAMAGED == 0)`, that is, `flags & 0`, which is always 0. Write `(flags & BOOK_DAMAGED) == 0`.

</details>

### Next week

Every struct so far has been a local variable that disappears when its function returns. What if a function needs to **create** an object that outlives it, or we do not know in advance how many objects we need? → **Week 03 — Dynamic Memory and Singly Linked List** (`malloc()`, `free()`, the heap, and our first linked list).
