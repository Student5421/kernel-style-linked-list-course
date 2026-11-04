/*
 * Week 06 demo: list iteration macros built on container_of().
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

#define list_entry(ptr, type, member) \
    container_of(ptr, type, member)

#define list_for_each(pos, head) \
    for ((pos) = (head)->next; (pos) != (head); (pos) = (pos)->next)

#define list_for_each_prev(pos, head) \
    for ((pos) = (head)->prev; (pos) != (head); (pos) = (pos)->prev)

/* n remembers pos->next, so the loop body may unlink and free pos */
#define list_for_each_safe(pos, n, head) \
    for ((pos) = (head)->next, (n) = (pos)->next; (pos) != (head); \
         (pos) = (n), (n) = (pos)->next)

static void list_init(struct list_head *head)
{
    head->next = head;
    head->prev = head;
}

static void list_add_tail(struct list_head *new, struct list_head *head)
{
    struct list_head *prev = head->prev;

    head->prev = new;
    new->next = head;
    new->prev = prev;
    prev->next = new;
}

static void list_del(struct list_head *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
    entry->next = NULL;
    entry->prev = NULL;
}

/* ------------------------------------------------------------------ */

struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;
};

static void print_books(const char *label, struct list_head *head)
{
    struct list_head *pos;

    printf("%-9s:", label);
    list_for_each(pos, head)
        printf(" [%d %d]", list_entry(pos, struct book, list)->id,
               list_entry(pos, struct book, list)->year);
    printf("\n");
}

int main(void)
{
    static const struct { int id; const char *title; int year; } data[] = {
        { 1, "The C Programming Language", 1978 },
        { 2, "Understanding the Linux Kernel", 2005 },
        { 3, "Lions' Commentary on UNIX", 1996 },
        { 4, "Linux Kernel Development", 2010 },
    };
    struct list_head library;
    struct list_head *pos;
    struct list_head *n;
    size_t i;

    list_init(&library);
    for (i = 0; i < sizeof(data) / sizeof(data[0]); i++) {
        struct book *b = malloc(sizeof(*b));

        if (b == NULL) {
            fprintf(stderr, "Error: out of memory\n");
            break;
        }
        b->id = data[i].id;
        snprintf(b->title, sizeof(b->title), "%s", data[i].title);
        b->year = data[i].year;
        list_add_tail(&b->list, &library);
    }
    print_books("all", &library);

    printf("backward :");
    list_for_each_prev(pos, &library)
        printf(" [%d]", list_entry(pos, struct book, list)->id);
    printf("\n");

    /* delete while iterating: requires the _safe variant */
    list_for_each_safe(pos, n, &library) {
        struct book *b = list_entry(pos, struct book, list);

        if (b->year < 2000) {
            list_del(&b->list);
            free(b);
        }
    }
    print_books("since2000", &library);

    /* free the rest */
    list_for_each_safe(pos, n, &library) {
        struct book *b = list_entry(pos, struct book, list);

        list_del(&b->list);
        free(b);
    }
    print_books("at exit", &library);
    return 0;
}
