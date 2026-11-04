/*
 * Week 05 demo: an intrusive circular doubly linked list.
 *
 * The list code knows only struct list_head. Each book embeds one.
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

/* Insert right after head (front). */
static void list_add(struct list_head *new, struct list_head *head)
{
    list_insert_between(new, head, head->next);
}

/* Insert right before head (back). */
static void list_add_tail(struct list_head *new, struct list_head *head)
{
    list_insert_between(new, head->prev, head);
}

/* ------------------------------------------------------------------ */

struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;     /* the links live INSIDE the book */
};

/* Explained in Week 06: get the book that contains this list_head. */
static struct book *book_from_list(struct list_head *pos)
{
    return (struct book *)((char *)pos - offsetof(struct book, list));
}

static struct book *book_create(int id, const char *title, int year)
{
    struct book *b = malloc(sizeof(*b));

    if (b == NULL)
        return NULL;

    b->id = id;
    snprintf(b->title, sizeof(b->title), "%s", title);
    b->year = year;
    list_init(&b->list);       /* not in any list yet */
    return b;
}

static void print_forward(struct list_head *head)
{
    struct list_head *pos;

    printf("forward :");
    if (list_empty(head))
        printf(" (empty)");
    for (pos = head->next; pos != head; pos = pos->next)
        printf(" [%d]", book_from_list(pos)->id);
    printf("\n");
}

static void print_backward(struct list_head *head)
{
    struct list_head *pos;

    printf("backward:");
    for (pos = head->prev; pos != head; pos = pos->prev)
        printf(" [%d]", book_from_list(pos)->id);
    printf("\n");
}

static void free_all(struct list_head *head)
{
    struct list_head *pos = head->next;
    struct list_head *next;

    while (pos != head) {
        next = pos->next;
        free(book_from_list(pos));  /* NOT free(pos): pos points inside the book */
        pos = next;
    }
    list_init(head);
}

int main(void)
{
    static const struct { int id; const char *title; int year; } data[] = {
        { 1, "The C Programming Language", 1978 },
        { 2, "Understanding the Linux Kernel", 2005 },
        { 3, "Linux Device Drivers", 2005 },
    };
    struct list_head library;          /* the sentinel is just a list_head */
    struct list_head *pos;
    size_t i;

    list_init(&library);
    print_forward(&library);

    for (i = 0; i < sizeof(data) / sizeof(data[0]); i++) {
        struct book *b = book_create(data[i].id, data[i].title, data[i].year);

        if (b == NULL) {
            fprintf(stderr, "Error: out of memory\n");
            free_all(&library);
            return EXIT_FAILURE;
        }
        list_add_tail(&b->list, &library);
    }

    /* list_add() inserts at the front instead */
    {
        struct book *b = book_create(0, "Preface", 2026);

        if (b == NULL) {
            fprintf(stderr, "Error: out of memory\n");
            free_all(&library);
            return EXIT_FAILURE;
        }
        list_add(&b->list, &library);
    }

    print_forward(&library);
    print_backward(&library);

    printf("sizeof(struct list_head) = %zu, sizeof(struct book) = %zu\n",
           sizeof(struct list_head), sizeof(struct book));
    for (pos = library.next; pos != &library; pos = pos->next) {
        struct book *b = book_from_list(pos);

        printf("pos = %p  ->  book = %p  (%td bytes earlier)  [%d] %s\n",
               (void *)pos, (void *)b, (char *)pos - (char *)b, b->id, b->title);
    }

    free_all(&library);
    print_forward(&library);
    return 0;
}
