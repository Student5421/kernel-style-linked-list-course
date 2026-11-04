/*
 * Week 05 demo: when list_head is the FIRST member, a cast is enough.
 *
 * The C standard says a struct and its first member start at the same
 * address (C11 6.7.2.1p15). So here &t and &t.list are the same address.
 */
#include <stdio.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct tagged_book {
    struct list_head list;     /* FIRST member */
    int id;
    char title[32];
};

int main(void)
{
    struct tagged_book t = { .id = 7, .title = "First Member" };
    struct list_head *pos = &t.list;
    struct tagged_book *back = (struct tagged_book *)pos;

    printf("&t      = %p\n", (void *)&t);
    printf("&t.list = %p   (same address)\n", (void *)&t.list);
    printf("back->id = %d, back->title = %s\n", back->id, back->title);
    return 0;
}
