/*
 * Week 02 demo: integer arithmetic, casts, comparisons, and short-circuit logic.
 */
#include <stdio.h>

struct book {
    int id;
    char title[32];
    int year;
};

int main(void)
{
    int sum = 7;
    int count = 2;
    int score = 150;
    int a, b;
    struct book *found = NULL;

    printf(" 7 / 2 = %d,  -7 / 2 = %d\n", 7 / 2, -7 / 2);   /* truncates toward 0 */
    printf(" 7 %% 2 = %d,  -7 %% 2 = %d\n", 7 % 2, -7 % 2);
    printf("(double)(sum / count) = %.2f\n", (double)(sum / count));
    printf("(double)sum / count   = %.2f\n", (double)sum / count);

    /* comparisons and logical operators produce int 0 or 1 */
    printf("score in range? %d\n", 0 <= score && score <= 100);
    printf("!score = %d, !!score = %d\n", !score, !!score);

    /* && stops at the first false operand: found->year is never read */
    if (found != NULL && found->year > 2000)
        printf("found a recent book\n");
    else
        printf("no book (and no crash)\n");

    /* the conditional operator */
    printf("larger of %d and %d is %d\n", sum, count, sum > count ? sum : count);

    /* assignment is an expression, and = groups right to left */
    a = b = 5;
    a += b * 2;                                     /* a = a + (b * 2) */
    printf("a = %d, b = %d\n", a, b);
    return 0;
}
