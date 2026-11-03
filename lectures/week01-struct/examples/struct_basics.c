/*
 * Week 01 demo: defining, initializing, copying, and printing a struct.
 */
#include <stdio.h>
#include <string.h>

struct book {
    int id;
    char title[32];
    int year;
};

int main(void)
{
    /* positional initializer: values in member order */
    struct book b1 = { 1, "The C Programming Language", 1978 };
    /* designated initializer (C99): name each member */
    struct book b2 = { .id = 2, .title = "Linux Kernel Development", .year = 2010 };
    /* every member set to zero */
    struct book b3 = {0};

    printf("b1: id=%d title=\"%s\" year=%d\n", b1.id, b1.title, b1.year);
    printf("b2: id=%d title=\"%s\" year=%d\n", b2.id, b2.title, b2.year);
    printf("b3: id=%d title=\"%s\" year=%d\n", b3.id, b3.title, b3.year);

    /* struct assignment copies every member, including the array */
    b3 = b1;
    b3.id = 3;
    /* an array cannot be assigned with '=', so copy the characters */
    snprintf(b3.title, sizeof(b3.title), "%s", "A Copy of K&R");

    printf("after copy:\n");
    printf("b1: id=%d title=\"%s\" year=%d\n", b1.id, b1.title, b1.year);
    printf("b3: id=%d title=\"%s\" year=%d\n", b3.id, b3.title, b3.year);

    printf("sizeof(struct book) = %zu bytes\n", sizeof(struct book));
    printf("strlen(b1.title)    = %zu characters\n", strlen(b1.title));
    return 0;
}
