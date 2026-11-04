/*
 * Week 03 demo: returning the address of a local variable.
 * This is a BUG. Build it by hand and read the warning:
 *
 *   gcc -Wall -Wextra -std=c11 dangling_local.c -o dangling_local
 *
 * It is NOT built by 'make' on purpose.
 */
#include <stdio.h>

struct book {
    int id;
    char title[32];
    int year;
};

static struct book *make_book_bad(void)
{
    struct book b = { .id = 1, .title = "Dangling", .year = 2000 };

    return &b;          /* b dies when this function returns */
}

int main(void)
{
    struct book *p = make_book_bad();

    printf("id = %d\n", p->id);   /* undefined behavior */
    return 0;
}
