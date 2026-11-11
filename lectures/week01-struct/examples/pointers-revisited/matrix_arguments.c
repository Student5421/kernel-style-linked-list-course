/*
 * Pointers Revisited, pp. 28-39: match the parameter to the actual storage.
 * No casts are needed between a real matrix and a pointer to one of its rows.
 */
#include <stdio.h>

enum { ROWS = 2, COLS = 3 };

static void print_array_parameter(size_t rows, int matrix[][COLS])
{
    for (size_t i = 0; i < rows; ++i) {
        for (size_t j = 0; j < COLS; ++j)
            printf(" %d", matrix[i][j]);
        putchar('\n');
    }
}

/* Equivalent adjusted parameter type to int matrix[][COLS]. */
static void print_row_pointer(size_t rows, int (*matrix)[COLS])
{
    for (size_t i = 0; i < rows; ++i) {
        for (size_t j = 0; j < COLS; ++j)
            printf(" %d", *(*(matrix + i) + j));
        putchar('\n');
    }
}

static void print_pointer_table(size_t rows, size_t columns, int **table)
{
    for (size_t i = 0; i < rows; ++i) {
        for (size_t j = 0; j < columns; ++j)
            printf(" %d", table[i][j]);
        putchar('\n');
    }
}

static void print_flat(size_t rows, size_t columns, const int *data)
{
    for (size_t i = 0; i < rows; ++i) {
        for (size_t j = 0; j < columns; ++j)
            printf(" %d", data[i * columns + j]);
        putchar('\n');
    }
}

int main(void)
{
    int matrix[ROWS][COLS] = { { 1, 2, 3 }, { 4, 5, 6 } };
    int *row_table[ROWS] = { matrix[0], matrix[1] };
    /* A separate, genuinely flat array is safe for single-pointer indexing. */
    int flat[ROWS * COLS] = { 1, 2, 3, 4, 5, 6 };
    int (*row)[COLS] = matrix;

    puts("array parameter:");
    print_array_parameter(ROWS, matrix);
    puts("pointer to row:");
    print_row_pointer(ROWS, matrix);
    puts("real table of row pointers (int **):");
    print_pointer_table(ROWS, COLS, row_table);
    puts("separate flat array:");
    print_flat(ROWS, COLS, flat);

    puts("addresses via pointer expressions:");
    for (size_t i = 0; i < ROWS; ++i)
        for (size_t j = 0; j < COLS; ++j)
            printf("matrix[%zu][%zu]: %p value=%d\n", i, j,
                   (void *)(*(row + i) + j), *(*(row + i) + j));

    /* Reordering the table does not move or change matrix's actual rows. */
    row_table[0] = matrix[1];
    row_table[1] = matrix[0];
    puts("reversed row view:");
    print_pointer_table(ROWS, COLS, row_table);
    printf("original matrix[0][0] = %d\n", matrix[0][0]);

    /* Do not cast matrix to int **. Do not advance matrix[0]'s int * past
     * its row and dereference it as if all rows formed one int array.
     */
    return 0;
}
