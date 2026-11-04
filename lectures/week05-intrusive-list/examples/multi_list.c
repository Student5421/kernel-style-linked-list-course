/*
 * Week 05 demo: one object in two lists at the same time.
 *
 * Every book is in 'all'. Borrowed books are also in 'borrowed'.
 * Returning a book removes it from 'borrowed' only.
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

static void list_init(struct list_head *head)
{
    head->next = head;
    head->prev = head;
}

static int list_empty(const struct list_head *head)
{
    return head->next == head;
}

static void list_insert_between(struct list_head *new,
                                struct list_head *prev, struct list_head *next)
{
    next->prev = new;
    new->next = next;
    new->prev = prev;
    prev->next = new;
}

static void list_add_tail(struct list_head *new, struct list_head *head)
{
    list_insert_between(new, head->prev, head);
}

/* Unlink entry and make it an empty ring again, so list_empty(entry) is true. */
static void list_del_init(struct list_head *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
    list_init(entry);
}

/* ------------------------------------------------------------------ */

struct book {
    int id;
    char title[32];
    struct list_head all;        /* link in the list of every book     */
    struct list_head borrowed;   /* link in the list of borrowed books */
};

/* Two almost identical helpers: Week 06 replaces both with one macro. */
static struct book *book_from_all(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, all));
}

static struct book *book_from_borrowed(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, borrowed));
}

static void print_all(struct list_head *head)
{
    struct list_head *pos;

    printf("all      :");
    for (pos = head->next; pos != head; pos = pos->next)
        printf(" [%d]", book_from_all(pos)->id);
    printf("\n");
}

static void print_borrowed(struct list_head *head)
{
    struct list_head *pos;

    printf("borrowed :");
    if (list_empty(head))
        printf(" (none)");
    for (pos = head->next; pos != head; pos = pos->next)
        printf(" [%d]", book_from_borrowed(pos)->id);
    printf("\n");
}

/* Returns a new book that is in no list yet, or NULL if out of memory. */
static struct book *book_create(int id)
{
    struct book *b = malloc(sizeof(*b));

    if (b == NULL)
        return NULL;

    b->id = id;
    snprintf(b->title, sizeof(b->title), "Book %d", id);
    list_init(&b->all);
    list_init(&b->borrowed);
    return b;
}

/* 'all' owns the books: remove each book from every list, then free it. */
static void free_all(struct list_head *all)
{
    struct list_head *pos = all->next;
    struct list_head *next;

    while (pos != all) {
        struct book *b = book_from_all(pos);

        next = pos->next;
        if (!list_empty(&b->borrowed))
            list_del_init(&b->borrowed);
        list_del_init(&b->all);
        free(b);
        pos = next;
    }
}

int main(void)
{
    struct list_head all;
    struct list_head borrowed;
    struct book *b2 = NULL;
    struct book *b4 = NULL;
    int id;

    list_init(&all);
    list_init(&borrowed);

    for (id = 1; id <= 4; id++) {
        struct book *b = book_create(id);

        if (b == NULL) {
            fprintf(stderr, "Error: out of memory\n");
            free_all(&all);
            return EXIT_FAILURE;
        }
        list_add_tail(&b->all, &all);
        if (id == 2)
            b2 = b;
        if (id == 4)
            b4 = b;
    }

    printf("borrow 2 and 4\n");
    list_add_tail(&b2->borrowed, &borrowed);
    list_add_tail(&b4->borrowed, &borrowed);
    print_all(&all);
    print_borrowed(&borrowed);

    printf("return 2\n");
    list_del_init(&b2->borrowed);
    print_all(&all);
    print_borrowed(&borrowed);

    free_all(&all);
    printf("after free_all: all empty = %s, borrowed empty = %s\n",
           list_empty(&all) ? "yes" : "no", list_empty(&borrowed) ? "yes" : "no");
    return 0;
}
