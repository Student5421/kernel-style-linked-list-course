#ifndef LIST_H
#define LIST_H

#include <stddef.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

void list_init(struct list_head *head);
void list_add(struct list_head *new, struct list_head *head);
void list_del(struct list_head *entry);

#endif
