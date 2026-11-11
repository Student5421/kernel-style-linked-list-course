/*
 * Week 03: resize an owned array without losing it when realloc fails.
 * Dynamic Memory Allocation, pp. 20-27. Zero elements explicitly means free.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

/* A deterministic demonstration of failure, without requesting huge memory. */
static int refuse_next_request;

static void *demo_realloc(void *block, size_t bytes)
{
    if (refuse_next_request) {
        refuse_next_request = 0;
        return NULL;
    }
    return realloc(block, bytes);
}

enum resize_result { RESIZE_OK, RESIZE_OVERFLOW, RESIZE_NO_MEMORY };

static enum resize_result resize_years(int **owner, size_t *count, size_t wanted)
{
    int *temporary;

    if (wanted == 0) {
        free(*owner);
        *owner = NULL;
        *count = 0;
        return RESIZE_OK;
    }
    if (wanted > SIZE_MAX / sizeof **owner)
        return RESIZE_OVERFLOW;

    temporary = demo_realloc(*owner, wanted * sizeof **owner);
    if (temporary == NULL)
        return RESIZE_NO_MEMORY; /* The old owner and count are unchanged. */

    /* realloc preserves old elements, but added elements need initialization. */
    for (size_t i = *count; i < wanted; ++i)
        temporary[i] = 0;
    *owner = temporary; /* On success, any old aliases must be discarded. */
    *count = wanted;
    return RESIZE_OK;
}

static void print_years(const char *label, const int *years, size_t count)
{
    printf("%s (%zu):", label, count);
    for (size_t i = 0; i < count; ++i)
        printf(" %d", years[i]);
    putchar('\n');
}

int main(void)
{
    int *years = NULL;
    size_t count = 0;

    if (resize_years(&years, &count, 3) != RESIZE_OK)
        goto no_memory;
    years[0] = 1978;
    years[1] = 1988;
    years[2] = 2010;
    print_years("initial", years, count);

    if (resize_years(&years, &count, 5) != RESIZE_OK)
        goto no_memory;
    print_years("grown and initialized", years, count);

    refuse_next_request = 1;
    if (resize_years(&years, &count, 8) != RESIZE_NO_MEMORY)
        goto unexpected_result;
    if (count != 5 || years[0] != 1978 || years[1] != 1988 || years[2] != 2010)
        goto unexpected_result;
    print_years("after simulated allocation failure", years, count);

    /* Form an overflowing request only when the element size makes one possible. */
    if (sizeof *years > 1) {
        size_t too_many = SIZE_MAX / sizeof *years + 1;
        if (resize_years(&years, &count, too_many) != RESIZE_OVERFLOW)
            goto unexpected_result;
        printf("overflow rejected before allocation; count=%zu\n", count);
    }

    if (resize_years(&years, &count, 2) != RESIZE_OK)
        goto no_memory;
    print_years("shrunk", years, count);
    if (resize_years(&years, &count, 0) != RESIZE_OK)
        goto unexpected_result;
    printf("released: count=%zu owner is NULL=%d\n", count, years == NULL);
    return EXIT_SUCCESS;

no_memory:
    fputs("allocation failed; releasing the current owner\n", stderr);
    free(years);
    return EXIT_FAILURE;
unexpected_result:
    fputs("unexpected resize result\n", stderr);
    free(years);
    return EXIT_FAILURE;
}
