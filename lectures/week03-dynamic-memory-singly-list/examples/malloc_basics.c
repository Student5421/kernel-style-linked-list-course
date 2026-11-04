/*
 * Week 03 demo: malloc(), calloc(), free(), and the NULL check.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct book {
    int id;
    char title[32];
    int year;
};

int main(void)
{
    int *number;
    struct book *b;
    int *scores;
    int n = 5;
    int i;

    /* one int */
    number = malloc(sizeof(*number));
    if (number == NULL) {
        fprintf(stderr, "Error: out of memory\n");
        return EXIT_FAILURE;
    }
    *number = 42;
    printf("*number = %d\n", *number);
    free(number);
    number = NULL;              /* do not leave a dangling pointer behind */

    /* one struct: the memory is NOT initialized */
    b = malloc(sizeof(*b));
    if (b == NULL) {
        fprintf(stderr, "Error: out of memory\n");
        return EXIT_FAILURE;
    }
    b->id = 1;
    snprintf(b->title, sizeof(b->title), "%s", "Modern Operating Systems");
    b->year = 2014;
    printf("book: [%d] %s (%d)\n", b->id, b->title, b->year);
    free(b);
    b = NULL;

    /* n ints, all zero: calloc(count, size) */
    scores = calloc(n, sizeof(*scores));
    if (scores == NULL) {
        fprintf(stderr, "Error: out of memory\n");
        return EXIT_FAILURE;
    }
    for (i = 0; i < n; i++)
        printf("scores[%d] = %d\n", i, scores[i]);
    free(scores);
    scores = NULL;

    /* free(NULL) is allowed and does nothing */
    free(scores);
    return 0;
}
