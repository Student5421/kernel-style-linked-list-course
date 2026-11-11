/*
 * Pointers Revisited, pp. 41-45: select behavior with function pointers.
 * qsort is a library callback example; the comparator must match its prototype.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct book {
    const char *title;
    int year;
};

static int add(int left, int right) { return left + right; }
static int subtract(int left, int right) { return left - right; }

static int by_year(const void *left, const void *right)
{
    const struct book *a = left;
    const struct book *b = right;
    /* Relational comparisons avoid signed overflow from a->year - b->year. */
    int order = (a->year > b->year) - (a->year < b->year);
    return order != 0 ? order : strcmp(a->title, b->title);
}

static int by_title(const void *left, const void *right)
{
    const struct book *a = left;
    const struct book *b = right;
    return strcmp(a->title, b->title);
}

static void print_books(const struct book *books, size_t count)
{
    for (size_t i = 0; i < count; ++i)
        printf("  %d %s\n", books[i].year, books[i].title);
}

int main(void)
{
    int (*operation)(int, int) = add;
    int (*operations[])(int, int) = { add, subtract };
    const char *labels[] = { "add", "subtract" };
    struct book books[] = {
        { "Operating Systems", 2010 },
        { "The C Programming Language", 1978 },
        { "Code Complete", 2004 }
    };
    size_t count = sizeof books / sizeof books[0];

    printf("operation(7, 2) = %d\n", operation(7, 2));
    operation = subtract;
    printf("(*operation)(7, 2) = %d\n", (*operation)(7, 2));
    for (size_t i = 0; i < sizeof operations / sizeof operations[0]; ++i)
        printf("dispatch %s: %d\n", labels[i], operations[i](7, 2));

    qsort(books, count, sizeof books[0], by_year);
    puts("sorted by year:");
    print_books(books, count);
    qsort(books, count, sizeof books[0], by_title);
    puts("sorted by title:");
    print_books(books, count);

    /* A function pointer is not an object pointer. ISO C provides no %p
     * conversion for function pointers, so demonstrate it by calling it.
     */
    return 0;
}
