/*
 * Week 02 demo: expressions that compile but do not mean what they say.
 * Build it by hand and compare the warnings with the comments:
 *
 *   gcc -Wall -Wextra -std=c11 precedence_traps.c -o precedence_traps
 *
 * Traps 1-5 produce warnings. Trap 6 produces NO warning at all.
 * It is NOT built by 'make' on purpose.
 */
#include <stdio.h>

#define BOOK_DAMAGED (1u << 1)

int main(void)
{
    unsigned int flags = 0;
    int year = 1978;
    int sum = 7;
    int count = 2;
    int i = 0;
    int n = -1;
    int *p = &year;

    if (flags & BOOK_DAMAGED == 0)      /* 1. flags & (BOOK_DAMAGED == 0) */
        printf("1. not damaged\n");
    else
        printf("1. damaged?!\n");

    if (year = 2024)                    /* 2. assignment, not comparison */
        printf("2. year is now %d\n", year);

    *p++;                               /* 3. *(p++): moves p, does not touch *p */
    p = &year;

    i = i++ + 1;                        /* 4. i modified twice: undefined behavior */
    printf("4. i = %d\n", i);

    if (n < sizeof(int))                /* 5. n is converted to a huge unsigned value */
        printf("5. -1 < 4\n");
    else
        printf("5. -1 < 4 is false?!\n");

    printf("6. average = %.2f\n", (double)(sum / count));   /* 3.00, not 3.50 */
    return 0;
}
