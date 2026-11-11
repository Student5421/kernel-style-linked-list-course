/*
 * Week 03: separately allocated rows versus a genuinely flat allocation.
 * Dynamic Memory Allocation, pp. 28-29; Pointers Revisited, pp. 28-39.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

struct book_grid {
    size_t rows;
    size_t columns;
    int **years;
};

static void grid_destroy(struct book_grid *grid)
{
    for (size_t row = 0; row < grid->rows; ++row)
        free(grid->years[row]);
    free(grid->years);
    *grid = (struct book_grid){0};
}

/* out must be empty. fail_row < rows simulates failure before that row. */
static int grid_create(struct book_grid *out, size_t rows, size_t columns,
                       size_t fail_row)
{
    struct book_grid temporary = {0};

    if (rows == 0 || columns == 0 || rows > SIZE_MAX / sizeof *temporary.years
        || columns > SIZE_MAX / sizeof **temporary.years)
        return 0;
    temporary.years = malloc(rows * sizeof *temporary.years);
    if (temporary.years == NULL)
        return 0;
    temporary.columns = columns;
    for (size_t row = 0; row < rows; ++row) {
        if (row == fail_row)
            goto failed;
        temporary.years[row] = malloc(columns * sizeof **temporary.years);
        if (temporary.years[row] == NULL)
            goto failed;
        ++temporary.rows; /* Count only rows we can safely release. */
        for (size_t column = 0; column < columns; ++column)
            temporary.years[row][column] = 0;
    }
    *out = temporary; /* Transfer ownership only after every row succeeds. */
    return 1;

failed:
    printf("row allocation stopped at %zu; releasing %zu completed rows\n",
           temporary.rows, temporary.rows);
    grid_destroy(&temporary);
    return 0;
}

static int *flat_create(size_t rows, size_t columns)
{
    if (rows == 0 || columns == 0 || rows > SIZE_MAX / columns)
        return NULL;
    size_t count = rows * columns;
    if (count > SIZE_MAX / sizeof(int))
        return NULL;
    return calloc(count, sizeof(int));
}

int main(void)
{
    const size_t rows = 2;
    const size_t columns = 3;
    struct book_grid grid = {0};
    int *flat;

    if (grid_create(&grid, rows, columns, 1)) {
        grid_destroy(&grid);
        return EXIT_FAILURE;
    }
    if (grid.years != NULL || grid.rows != 0 || grid.columns != 0) {
        grid_destroy(&grid);
        return EXIT_FAILURE;
    }
    printf("failed create leaves output empty: %d\n", grid.years == NULL);
    if (grid_create(&grid, 0, columns, SIZE_MAX))
        return EXIT_FAILURE;
    printf("zero dimension rejected\n");
    if (flat_create(SIZE_MAX, 2) != NULL)
        return EXIT_FAILURE;
    printf("flat size overflow rejected before allocation\n");

    if (!grid_create(&grid, rows, columns, SIZE_MAX))
        return EXIT_FAILURE;
    flat = flat_create(rows, columns);
    if (flat == NULL) {
        grid_destroy(&grid);
        return EXIT_FAILURE;
    }
    for (size_t row = 0; row < rows; ++row) {
        for (size_t column = 0; column < columns; ++column) {
            int year = 2000 + (int)(row * columns + column);
            grid.years[row][column] = year;
            flat[row * columns + column] = year;
        }
    }
    for (size_t row = 0; row < rows; ++row) {
        printf("row %zu, row table:", row);
        for (size_t column = 0; column < columns; ++column)
            printf(" %d", grid.years[row][column]);
        printf("; flat:");
        for (size_t column = 0; column < columns; ++column)
            printf(" %d", flat[row * columns + column]);
        putchar('\n');
    }
    printf("row-table allocations=%zu; flat allocations=1\n", rows + 1);
    free(flat);
    grid_destroy(&grid);
    printf("destroy resets dimensions: %zu x %zu\n", grid.rows, grid.columns);
    /* A flat int array is not an int **. No cast changes its storage layout. */
    return EXIT_SUCCESS;
}
