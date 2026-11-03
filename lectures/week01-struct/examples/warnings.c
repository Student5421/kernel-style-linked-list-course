/*
 * Week 01 demo: this file compiles, but with warnings.
 * Build it by hand and read every warning:
 *
 *   gcc -Wall -Wextra -std=c11 warnings.c -o warnings
 *
 * It is NOT built by 'make' on purpose.
 */
#include <stdio.h>

int main(void)
{
    int score = 95;
    int unused;

    printf("score = %s\n", score);
    return 0;
}
