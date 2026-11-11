/* Writing Large Programs PDF pp. 3-20: expansion, tokens, and conditions. */
#include <stdio.h>

#ifndef DEBUG
#define DEBUG 0
#endif

#define JOIN_IMPL(left, right) left##right
#define JOIN(left, right) JOIN_IMPL(left, right)
#define FIELD year
#define SHOW_INT(expression) printf(#expression " = %d\n", (expression))
#define MAX_MACRO(left, right) ((left) > (right) ? (left) : (right))

static int calls;

static int next_year(void)
{
    ++calls;
    return 2000 + calls;
}

static inline int max_value(int left, int right)
{
    return left > right ? left : right;
}

int main(void)
{
    int JOIN(book_, FIELD) = 1988; /* Two expansion steps produce book_year. */
    int result;

    SHOW_INT(book_year);
    SHOW_INT(book_year + 1); /* # preserves the expression's spelling. */

    calls = 0;
    result = MAX_MACRO(next_year(), 2000);
    printf("macro: result=%d calls=%d\n", result, calls);
    /* The ?: condition is sequenced before its chosen branch: no UB here. */
    calls = 0;
    result = max_value(next_year(), 2000);
    printf("inline function: result=%d calls=%d\n", result, calls);

#ifdef DEBUG
    puts("#ifdef DEBUG: defined (including DEBUG=0)");
#endif
#if DEBUG
    puts("#if DEBUG: enabled");
#else
    puts("#if DEBUG: disabled");
#endif

    /* Inspect the generated C with: gcc -std=c11 -E preprocessor_demo.c */
    return 0;
}
