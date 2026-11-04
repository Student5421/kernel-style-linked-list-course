/*
 * Week 06 demo: sizeof, offsetof, alignment, and padding.
 */
#include <stddef.h>
#include <stdio.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;
};

struct padded {          /* members in a careless order */
    char a;
    int b;
    char c;
};

struct reordered {       /* same members, largest first */
    int b;
    char a;
    char c;
};

/* sizeof never runs its operand, so ((type *)0)->member is safe here */
#define SHOW(type, member) \
    printf("  %-10s offset %2zu  size %2zu\n", #member, \
           offsetof(type, member), sizeof(((type *)0)->member))

int main(void)
{
    printf("struct book: sizeof = %zu, alignment of list_head = %zu\n",
           sizeof(struct book), _Alignof(struct list_head));
    SHOW(struct book, id);
    SHOW(struct book, title);
    SHOW(struct book, year);
    SHOW(struct book, list);

    printf("struct padded: sizeof = %zu\n", sizeof(struct padded));
    SHOW(struct padded, a);
    SHOW(struct padded, b);
    SHOW(struct padded, c);

    printf("struct reordered: sizeof = %zu\n", sizeof(struct reordered));
    SHOW(struct reordered, b);
    SHOW(struct reordered, a);
    SHOW(struct reordered, c);
    return 0;
}
