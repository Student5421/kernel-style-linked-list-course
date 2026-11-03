/*
 * Week 02 demo: macros are text substitution, so parenthesize everything.
 */
#include <stdio.h>

#define SQUARE_BAD(x)  x * x
#define SQUARE(x)      ((x) * (x))

#define DOUBLE_BAD(x)  (x) + (x)
#define DOUBLE(x)      ((x) + (x))

int main(void)
{
    printf("SQUARE_BAD(1 + 2) = %d   (1 + 2 * 1 + 2)\n", SQUARE_BAD(1 + 2));
    printf("SQUARE(1 + 2)     = %d\n", SQUARE(1 + 2));
    printf("10 / DOUBLE_BAD(5) = %d  (10 / (5) + (5))\n", 10 / DOUBLE_BAD(5));
    printf("10 / DOUBLE(5)     = %d\n", 10 / DOUBLE(5));
    return 0;
}
