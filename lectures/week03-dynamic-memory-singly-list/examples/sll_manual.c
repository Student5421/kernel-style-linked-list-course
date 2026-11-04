/*
 * Week 03 demo: three nodes linked by hand, then traversed.
 * No malloc() yet, so we can focus on the links.
 */
#include <stdio.h>

struct book {
    int id;
    char title[32];
    int year;
};

struct node {
    struct book data;
    struct node *next;
};

int main(void)
{
    struct node c = { .data = { 3, "Linux Device Drivers", 2005 }, .next = NULL };
    struct node b = { .data = { 2, "Understanding the Linux Kernel", 2005 }, .next = &c };
    struct node a = { .data = { 1, "The C Programming Language", 1978 }, .next = &b };
    struct node *head = &a;
    struct node *cur;

    for (cur = head; cur != NULL; cur = cur->next)
        printf("node at %p: [%d] %-32s next = %p\n",
               (void *)cur, cur->data.id, cur->data.title, (void *)cur->next);

    return 0;
}
