/*
 * Pointers Revisited, pp. 10-12, 25-26: C always passes arguments by value.
 * Predict which caller objects change before running each function.
 */
#include <stdio.h>

static void swap_copies(int left, int right)
{
    int temporary = left;
    left = right;
    right = temporary;
    printf("  inside swap_copies: %d %d\n", left, right);
}

static void swap_values(int *left, int *right)
{
    int temporary = *left;
    *left = *right;
    *right = temporary;
}

static void select_copy(int *selected, int *replacement)
{
    selected = replacement; /* changes this local pointer only */
    printf("  inside select_copy: %d\n", *selected);
}

static void select_original(int **selected, int *replacement)
{
    *selected = replacement; /* changes the caller's pointer object */
}

int main(void)
{
    int first_year = 1978;
    int second_year = 2010;
    int *selected = &first_year;
    int **selection = &selected;

    swap_copies(first_year, second_year);
    printf("after swap_copies: %d %d\n", first_year, second_year);
    swap_values(&first_year, &second_year);
    printf("after swap_values: %d %d\n", first_year, second_year);

    printf("**selection = %d\n", **selection);
    select_copy(selected, &second_year);
    printf("after select_copy: %d\n", *selected);
    select_original(&selected, &second_year);
    printf("after select_original: %d\n", *selected);

    /* Both pointers refer to live local objects; no allocation is involved. */
    printf("selected == &second_year: %s\n",
           selected == &second_year ? "yes" : "no");
    return 0;
}
