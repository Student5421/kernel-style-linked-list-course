/*
 * Week 04 demo: a doubly linked list of books with head and tail pointers.
 *
 * Shown in class: create, push_front, push_back, forward print,
 *                 an invariant checker, a link dump, free.
 * Left for the lab: backward print and delete.
 */
#include <stdio.h>
#include <stdlib.h>

struct book {
    int id;
    char title[32];
    int year;
};

struct node {
    struct book data;
    struct node *next;
    struct node *prev;
};

struct dlist {
    struct node *head;     /* first node, or NULL */
    struct node *tail;     /* last node, or NULL  */
};

static struct node *node_create(int id, const char *title, int year)
{
    struct node *n = malloc(sizeof(*n));

    if (n == NULL)
        return NULL;

    n->data.id = id;
    snprintf(n->data.title, sizeof(n->data.title), "%s", title);
    n->data.year = year;
    n->prev = NULL;
    n->next = NULL;
    return n;
}

static void dlist_push_front(struct dlist *list, struct node *n)
{
    n->prev = NULL;
    n->next = list->head;
    if (list->head != NULL)
        list->head->prev = n;      /* old first node points back to n */
    else
        list->tail = n;            /* empty list: n is also the last node */
    list->head = n;
}

static void dlist_push_back(struct dlist *list, struct node *n)
{
    n->next = NULL;
    n->prev = list->tail;
    if (list->tail != NULL)
        list->tail->next = n;      /* old last node points forward to n */
    else
        list->head = n;            /* empty list: n is also the first node */
    list->tail = n;
}

static void dlist_print_forward(const struct dlist *list)
{
    const struct node *cur;

    printf("forward :");
    for (cur = list->head; cur != NULL; cur = cur->next)
        printf(" [%d]", cur->data.id);
    printf("\n");
}

/* Debugging aid: print every node's prev/self/next addresses. */
static void dlist_dump(const struct dlist *list)
{
    const struct node *cur;

    printf("head = %p, tail = %p\n", (void *)list->head, (void *)list->tail);
    for (cur = list->head; cur != NULL; cur = cur->next)
        printf("  [%d] prev = %-14p self = %-14p next = %p\n", cur->data.id,
               (void *)cur->prev, (void *)cur, (void *)cur->next);
}

/* Returns 1 if every link is consistent, 0 (and prints why) otherwise. */
static int dlist_check(const struct dlist *list)
{
    const struct node *cur;
    const struct node *prev = NULL;

    for (cur = list->head; cur != NULL; prev = cur, cur = cur->next) {
        if (cur->prev != prev) {
            printf("BROKEN: node [%d] has the wrong prev\n", cur->data.id);
            return 0;
        }
    }
    if (list->tail != prev) {
        printf("BROKEN: tail does not point to the last node\n");
        return 0;
    }
    return 1;
}

static void dlist_free(struct dlist *list)
{
    struct node *cur = list->head;
    struct node *next;

    while (cur != NULL) {
        next = cur->next;
        free(cur);
        cur = next;
    }
    list->head = NULL;
    list->tail = NULL;
}

int main(void)
{
    struct dlist list = { NULL, NULL };
    struct node *n;

    n = node_create(2, "Understanding the Linux Kernel", 2005);
    if (n == NULL)
        goto out_of_memory;
    dlist_push_front(&list, n);

    n = node_create(1, "The C Programming Language", 1978);
    if (n == NULL)
        goto out_of_memory;
    dlist_push_front(&list, n);

    n = node_create(3, "Linux Device Drivers", 2005);
    if (n == NULL)
        goto out_of_memory;
    dlist_push_back(&list, n);

    dlist_print_forward(&list);
    dlist_dump(&list);
    printf("check: %s\n", dlist_check(&list) ? "OK" : "FAILED");

    /* break a link on purpose to see the checker work */
    list.head->next->prev = NULL;
    printf("after breaking a link, check: %s\n", dlist_check(&list) ? "OK" : "FAILED");
    list.head->next->prev = list.head;

    dlist_free(&list);
    printf("after free, check: %s\n", dlist_check(&list) ? "OK" : "FAILED");
    return 0;

out_of_memory:
    fprintf(stderr, "Error: out of memory\n");
    dlist_free(&list);
    return EXIT_FAILURE;
}
