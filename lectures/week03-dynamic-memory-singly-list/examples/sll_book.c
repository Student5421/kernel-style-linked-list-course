/*
 * Week 03 demo: a singly linked list of books on the heap.
 *
 * Shown in class: create, push_front, push_back, print, count, free.
 * Left for the lab: search and delete.
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
};

/* Returns a new unlinked node, or NULL if out of memory. */
static struct node *node_create(int id, const char *title, int year)
{
    struct node *n = malloc(sizeof(*n));

    if (n == NULL)
        return NULL;

    n->data.id = id;
    snprintf(n->data.title, sizeof(n->data.title), "%s", title);
    n->data.year = year;
    n->next = NULL;
    return n;
}

/* headp points to the caller's head variable, so we can change it. */
static void push_front(struct node **headp, struct node *n)
{
    n->next = *headp;   /* 1. new node points to the old first node */
    *headp = n;         /* 2. head now points to the new node       */
}

/* Walk the links, not the nodes: no special case for an empty list. */
static void push_back(struct node **headp, struct node *n)
{
    struct node **link = headp;

    while (*link != NULL)
        link = &(*link)->next;
    *link = n;
}

static void print_list(const struct node *head)
{
    const struct node *cur;

    if (head == NULL) {
        printf("(empty)\n");
        return;
    }
    for (cur = head; cur != NULL; cur = cur->next)
        printf("[%d] %s (%d)\n", cur->data.id, cur->data.title, cur->data.year);
}

static int count_list(const struct node *head)
{
    int count = 0;

    for (; head != NULL; head = head->next)
        count++;
    return count;
}

static void free_list(struct node **headp)
{
    struct node *cur = *headp;
    struct node *next;

    while (cur != NULL) {
        next = cur->next;   /* save it BEFORE free(): cur->next is gone after */
        free(cur);
        cur = next;
    }
    *headp = NULL;
}

int main(void)
{
    struct node *head = NULL;   /* empty list */
    struct node *n;

    print_list(head);

    n = node_create(2, "Understanding the Linux Kernel", 2005);
    if (n == NULL)
        goto out_of_memory;
    push_front(&head, n);

    n = node_create(1, "The C Programming Language", 1978);
    if (n == NULL)
        goto out_of_memory;
    push_front(&head, n);

    n = node_create(3, "Linux Device Drivers", 2005);
    if (n == NULL)
        goto out_of_memory;
    push_back(&head, n);

    print_list(head);
    printf("count = %d\n", count_list(head));

    free_list(&head);
    print_list(head);
    return 0;

out_of_memory:
    fprintf(stderr, "Error: out of memory\n");
    free_list(&head);
    return EXIT_FAILURE;
}
