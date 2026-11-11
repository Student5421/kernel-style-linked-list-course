/*
 * Pointers Revisited, pp. 13-16, 27: array size, decay, and pointer arithmetic.
 * Addresses and sizeof values vary between machines; element counts do not.
 */
#include <stddef.h>
#include <stdio.h>

static void print_years(const int *years, size_t count)
{
    /* An array parameter is adjusted to a pointer; pass its count separately. */
    printf("inside function: sizeof(years) = %zu (pointer size)\n", sizeof years);
    for (size_t i = 0; i < count; ++i)
        printf("  years[%zu] = %d, *(years + %zu) = %d\n",
               i, years[i], i, *(years + i));
}

int main(void)
{
    int years[] = { 1978, 1988, 2005, 2010 };
    size_t count = sizeof years / sizeof years[0];
    int *cursor = years;
    int *end = years + count; /* one past: valid for comparison, never *end */
    ptrdiff_t distance = end - cursor;

    printf("array bytes = %zu, element bytes = %zu, count = %zu\n",
           sizeof years, sizeof years[0], count);
    printf("sizeof(cursor) = %zu (pointer size)\n", sizeof cursor);
    printf("end - cursor = %td elements\n", distance);
    printf("cursor     = %p\n", (void *)cursor);
    printf("cursor + 1 = %p (one int, %zu bytes, later)\n",
           (void *)(cursor + 1), sizeof *cursor);

    print_years(years, count);
    printf("pointer walk:");
    while (cursor != end) {
        printf(" %d", *cursor);
        ++cursor;
    }
    putchar('\n');

    --cursor; /* stepping back from one past is valid */
    printf("last year after --cursor = %d\n", *cursor);
    /* Subtraction and ordering above are within the same array. */
    return 0;
}
