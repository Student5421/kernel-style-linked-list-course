/*
 * Week 01 demo: pointer to struct, '->', and passing structs to functions.
 */
#include <stdio.h>

struct book {
    int id;
    char title[32];
    int year;
};

/* read-only access: take a const pointer */
static void print_book(const struct book *b)
{
    printf("[%d] %s (%d)\n", b->id, b->title, b->year);
}

/* the parameter is a copy of the caller's struct */
static void set_year_by_value(struct book b, int year)
{
    b.year = year;
    printf("  inside set_year_by_value: b.year = %d\n", b.year);
}

/* the parameter points to the caller's struct */
static void set_year_by_pointer(struct book *b, int year)
{
    b->year = year;
}

int main(void)
{
    struct book book = { .id = 1, .title = "Operating Systems", .year = 2010 };
    struct book *p = &book;

    printf("book.year = %d\n", book.year);
    printf("(*p).year = %d\n", (*p).year);
    printf("p->year   = %d\n", p->year);

    set_year_by_value(book, 1999);
    printf("after set_year_by_value:   ");
    print_book(&book);

    set_year_by_pointer(&book, 2024);
    printf("after set_year_by_pointer: ");
    print_book(p);

    /* members are stored in declaration order */
    printf("&book       = %p\n", (void *)&book);
    printf("&book.id    = %p\n", (void *)&book.id);
    printf("&book.title = %p\n", (void *)&book.title);
    printf("&book.year  = %p\n", (void *)&book.year);
    return 0;
}
