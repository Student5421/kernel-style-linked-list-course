/*
 * Week 05: intrusive membership borrows stack-owned payloads; it cannot free them.
 * Structures, Unions and Enums, pp. 17, 21-27; Dynamic Memory, pp. 25-27.
 * Extension: copying an intrusive object must reset the copy's embedded links.
 */
#include <stdio.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct book {
    struct list_head list; /* First member: the first-member cast is valid. */
    int id;
    char title[32];
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

static void add_tail(struct list_head *head, struct list_head *entry)
{
    entry->prev = head->prev;
    entry->next = head;
    head->prev->next = entry;
    head->prev = entry;
}

static void unlink_book(struct list_head *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
    list_init(entry);
}

/* destination must be a distinct book that is not currently in any list. */
static void copy_detached(struct book *destination, const struct book *source)
{
    *destination = *source; /* Includes title characters AND link pointer values. */
    list_init(&destination->list); /* The copied links must never be followed. */
}

static void print_catalog(const struct list_head *head)
{
    const struct list_head *cursor;

    printf("catalog:");
    for (cursor = head->next; cursor != head; cursor = cursor->next) {
        const struct book *book = (const struct book *)cursor;
        printf(" [%d] %s", book->id, book->title);
    }
    putchar('\n');
}

int main(void)
{
    struct list_head catalog;
    struct book original = { .id = 1, .title = "C Programming" };
    struct book copy = {0};
    struct book *saved = &original;

    list_init(&catalog);
    list_init(&original.list);
    list_init(&copy.list);
    add_tail(&catalog, &original.list);

    copy_detached(&copy, &original); /* Safe even though source is linked. */
    copy.id = 2;
    copy.title[0] = 'c';
    printf("copy starts detached: %d\n", list_empty(&copy.list));
    add_tail(&catalog, &copy.list);
    print_catalog(&catalog);

    unlink_book(&original.list);
    printf("after unlink, original still alive: [%d] %s\n",
           saved->id, saved->title);
    saved->title[0] = 'A';
    add_tail(&catalog, &original.list);
    printf("reinsertion preserves object identity: %d\n", saved == &original);
    print_catalog(&catalog);

    /* The list only borrows; detach both before their enclosing scope ends. */
    unlink_book(&copy.list);
    unlink_book(&original.list);
    printf("empty after detaching stack-owned books: %d\n", list_empty(&catalog));
    /* No malloc/free: membership does not determine an object's storage duration. */
    return 0;
}
