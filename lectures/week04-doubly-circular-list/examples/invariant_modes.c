/*
 * Week 04: keep operations and required validation outside assert().
 * Writing Large Programs, pp. 16-18: #if, #ifdef, and command-line -D.
 * This small ring uses stack storage, so every inspected pointer stays live.
 */
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

#ifndef DEBUG
#define DEBUG 0
#endif

struct book {
    int id;
    struct book *next;
    struct book *prev;
};

static void ring_init(struct book *head)
{
    head->next = head;
    head->prev = head;
}

static void append(struct book *head, struct book *book)
{
    book->next = head;
    book->prev = head->prev;
    head->prev->next = book;
    head->prev = book;
}

/* Bounded checking detects wrong links among live nodes, not invalid addresses. */
static int ring_valid(const struct book *head, size_t expected)
{
    const struct book *cursor = head;

    if (head->next == NULL || head->prev == NULL)
        return 0;
    if (head->next->prev != head || head->prev->next != head)
        return 0;
    for (size_t i = 0; i < expected; ++i) {
        cursor = cursor->next;
        if (cursor == NULL || cursor == head || cursor->next == NULL
            || cursor->prev == NULL || cursor->next->prev != cursor
            || cursor->prev->next != cursor)
            return 0;
    }
    return cursor->next == head;
}

static void trace(const char *stage, const struct book *head)
{
#if DEBUG
    printf("debug %s: first=%d last=%d\n", stage,
           head->next->id, head->prev->id);
#else
    (void)stage;
    (void)head;
#endif
}

int main(void)
{
    struct book head = { .id = 0 };
    struct book first = { .id = 1 };
    struct book second = { .id = 2 };
    size_t insertions = 0;
    int valid;

    ring_init(&head);
    append(&head, &first); /* These operations also run with -DNDEBUG. */
    ++insertions;
    append(&head, &second);
    ++insertions;
    trace("after insertions", &head);

#ifdef NDEBUG
    puts("assertions: disabled");
#else
    puts("assertions: enabled");
#endif
    printf("DEBUG=%d; insertions=%zu\n", DEBUG, insertions);
    valid = ring_valid(&head, insertions);
    if (!valid) /* Required runtime validation must not disappear in release. */
        return EXIT_FAILURE;
    assert(valid); /* No allocation, mutation, or required call inside assert. */
    printf("valid ring: %d\n", valid);

    /* Deliberately wrong topology, using only live objects; do not traverse it. */
    first.prev = &first;
    valid = ring_valid(&head, insertions);
    printf("wrong prev link rejected by runtime check: %d\n", !valid);
    first.prev = &head;
    if (valid || !ring_valid(&head, insertions))
        return EXIT_FAILURE;
    printf("restored ring: %d\n", ring_valid(&head, insertions));
    return EXIT_SUCCESS;
}
