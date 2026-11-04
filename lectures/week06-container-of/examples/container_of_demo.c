/*
 * Week 06 demo: deriving container_of() step by step.
 *
 * See the macro expanded:  make container_of_demo.i
 */
#include <stddef.h>
#include <stdio.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct book {
    int id;
    char title[32];
    struct list_head all;
    struct list_head borrowed;
};

int main(void)
{
    struct book book = { .id = 42, .title = "Hitchhiker's Guide" };
    struct list_head *ptr = &book.borrowed;   /* all we get from a traversal */
    char *bytes;
    struct book *b;

    printf("&book                = %p\n", (void *)&book);
    printf("ptr = &book.borrowed = %p\n", (void *)ptr);
    printf("offsetof(struct book, all)      = %zu\n", offsetof(struct book, all));
    printf("offsetof(struct book, borrowed) = %zu\n", offsetof(struct book, borrowed));

    /* step by step */
    bytes = (char *)ptr;                               /* 1. count in bytes      */
    bytes = bytes - offsetof(struct book, borrowed);   /* 2. step back           */
    b = (struct book *)bytes;                          /* 3. treat it as a book  */
    printf("by hand      : %p  id = %d\n", (void *)b, b->id);

    /* the macro does the same in one expression */
    b = container_of(ptr, struct book, borrowed);
    printf("container_of : %p  id = %d\n", (void *)b, b->id);

    /* the same macro works for any member of any type */
    b = container_of(&book.all, struct book, all);
    printf("via 'all'    : %p  id = %d\n", (void *)b, b->id);

    /* the macro trusts you: the wrong member gives a wrong pointer, silently */
    b = container_of(ptr, struct book, all);
    printf("WRONG member : %p  (off by %td bytes)\n",
           (void *)b, (char *)b - (char *)&book);
    return 0;
}
