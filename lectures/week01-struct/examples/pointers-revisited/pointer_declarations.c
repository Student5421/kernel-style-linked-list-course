/*
 * Pointers Revisited, pp. 20-23, 49: parentheses change a declaration's meaning.
 */
#include <stdio.h>

int main(void)
{
    int first_row[3] = { 1978, 1988, 2005 };
    int second_row[3] = { 1999, 2010, 2024 };
    int *row_pointers[2] = { first_row, second_row }; /* array of two int * */
    int (*row)[3] = &first_row;                      /* pointer to 3 ints */
    int shelves[2][3] = { { 1, 2, 3 }, { 4, 5, 6 } };
    const char *titles[] = { "C", "Operating Systems", "Linux" };

    printf("row_pointers: %zu pointer elements\n",
           sizeof row_pointers / sizeof row_pointers[0]);
    printf("row_pointers[1][2] = %d\n", row_pointers[1][2]);
    printf("(*row)[2] = %d\n", (*row)[2]);
    printf("sizeof(*row) = %zu bytes (one row)\n", sizeof *row);

    row = shelves; /* shelves decays to a pointer to its first row */
    printf("row     = %p\n", (void *)row);
    printf("row + 1 = %p (one row, %zu bytes, later)\n",
           (void *)(row + 1), sizeof *row);
    printf("(*(row + 1))[2] = %d\n", (*(row + 1))[2]);

    /* The first table holds pointer objects, which can be reordered. */
    row_pointers[0] = second_row;
    printf("after reseating row_pointers[0]: %d\n", row_pointers[0][0]);
    for (size_t i = 0; i < sizeof titles / sizeof titles[0]; ++i)
        printf("titles[%zu] = %s\n", i, titles[i]);

    /* titles[i] may be reseated, but writing a string literal is undefined.
     * A 2D array holds row arrays, not int * objects: it is not an int **.
     */
    return 0;
}
