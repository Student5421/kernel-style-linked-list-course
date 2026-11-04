/*
 * Week 04 demo: a circular doubly linked list with a sentinel head.
 *
 * Shown in class: init, insert_between, insert_front, insert_back,
 *                 forward print, an assert-based checker, free.
 * Left for the lab: unlink/delete and backward print.
 *
 *   ./clist_book          normal run
 *   ./clist_book break    corrupt one link and let assert() catch it
 */
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct book {
    int id;
    char title[32];
    int year;
};

struct node {
    struct book data;      /* unused in the sentinel */
    struct node *next;
    struct node *prev;
};

/* An empty list is a sentinel that points to itself in both directions. */
static void list_init(struct node *head)
{
    head->next = head;
    head->prev = head;
}

static int list_is_empty(const struct node *head)
{
    return head->next == head;
}

/* Insert n between two neighbors: prev <-> n <-> next. */
static void insert_between(struct node *n, struct node *prev, struct node *next)
{
    next->prev = n;
    n->next = next;
    n->prev = prev;
    prev->next = n;
}

/* Right after the sentinel: becomes the first node. */
static void insert_front(struct node *head, struct node *n)
{
    insert_between(n, head, head->next);
}

/* Right before the sentinel: becomes the last node. */
static void insert_back(struct node *head, struct node *n)
{
    insert_between(n, head->prev, head);
}

static struct node *node_create(int id, const char *title, int year)
{
    struct node *n = malloc(sizeof(*n));

    if (n == NULL)
        return NULL;

    n->data.id = id;
    snprintf(n->data.title, sizeof(n->data.title), "%s", title);
    n->data.year = year;
    n->next = NULL;
    n->prev = NULL;
    return n;
}

static void print_forward(const struct node *head)
{
    const struct node *pos;

    printf("forward :");
    if (list_is_empty(head))
        printf(" (empty)");
    for (pos = head->next; pos != head; pos = pos->next)
        printf(" [%d]", pos->data.id);
    printf("\n");
}

static void dump(const struct node *head)
{
    const struct node *pos = head;

    do {
        if (pos == head)
            printf("  HEAD");
        else
            printf("  [%d] ", pos->data.id);
        printf(" prev = %-14p self = %-14p next = %p\n",
               (void *)pos->prev, (void *)pos, (void *)pos->next);
        pos = pos->next;
    } while (pos != head);
}

/* Checks the circular invariant at every node; returns the number of nodes. */
static int list_check(const struct node *head)
{
    const struct node *pos;
    int count = 0;

    assert(head->next->prev == head);
    assert(head->prev->next == head);
    for (pos = head->next; pos != head; pos = pos->next) {
        assert(pos->next->prev == pos);
        assert(pos->prev->next == pos);
        count++;
    }
    return count;
}

static void free_all(struct node *head)
{
    struct node *pos = head->next;
    struct node *next;

    while (pos != head) {
        next = pos->next;
        free(pos);
        pos = next;
    }
    list_init(head);
}

int main(int argc, char *argv[])
{
    struct node head;
    struct node *n;

    list_init(&head);
    print_forward(&head);
    printf("nodes = %d, empty = %s\n", list_check(&head),
           list_is_empty(&head) ? "yes" : "no");

    n = node_create(2, "Understanding the Linux Kernel", 2005);
    if (n == NULL)
        goto out_of_memory;
    insert_back(&head, n);
    printf("after the first insert:\n");
    dump(&head);

    n = node_create(3, "Linux Device Drivers", 2005);
    if (n == NULL)
        goto out_of_memory;
    insert_back(&head, n);

    n = node_create(1, "The C Programming Language", 1978);
    if (n == NULL)
        goto out_of_memory;
    insert_front(&head, n);

    print_forward(&head);
    printf("after three inserts:\n");
    dump(&head);

    if (argc > 1 && strcmp(argv[1], "break") == 0) {
        printf("corrupting one prev link...\n");
        head.next->next->prev = &head;
    }
    printf("nodes = %d, links OK\n", list_check(&head));

    free_all(&head);
    print_forward(&head);
    printf("nodes = %d, empty = %s\n", list_check(&head),
           list_is_empty(&head) ? "yes" : "no");
    return 0;

out_of_memory:
    fprintf(stderr, "Error: out of memory\n");
    free_all(&head);
    return EXIT_FAILURE;
}
