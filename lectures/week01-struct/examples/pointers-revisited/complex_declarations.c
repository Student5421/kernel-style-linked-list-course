/*
 * Pointers Revisited, pp. 47-50: read from the name, then follow precedence.
 * Keep the explicit declarations next to equivalent typedef-based ones.
 */
#include <stdio.h>

/* This object has static storage duration: returning its address is safe. */
static int publication_year = 1978;

static int *get_year(void)
{
    return &publication_year;
}

/* A function returning a pointer to a function returning int *. */
static int *(*choose_getter(void))(void)
{
    return get_year;
}

typedef int *(*year_getter)(void);

static year_getter choose_getter_named(void)
{
    return get_year;
}

int main(void)
{
    /* getters: array of 2 pointers to functions (void) returning int *. */
    int *(*getters[2])(void) = { get_year, get_year };
    year_getter named_getters[2] = { get_year, get_year };

    printf("*getters[0]() = %d\n", *getters[0]());
    printf("*named_getters[1]() = %d\n", *named_getters[1]());
    printf("*choose_getter()() = %d\n", *choose_getter()());
    printf("*choose_getter_named()() = %d\n", *choose_getter_named()());

    *getters[1]() = 1988;
    printf("after update through getter: %d\n", publication_year);
    /* In C11 use (void) for no parameters; empty () means unspecified ones.
     * Never return a pointer to a function's automatic local variable.
     */
    return 0;
}
