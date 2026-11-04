/*
 * Week 03 demo: a create/destroy pair and a simple live-object counter.
 *
 * book_create() allocates a book and hands ownership to the caller.
 * book_destroy() releases it. live_books counts books not yet destroyed,
 * so a non-zero value at the end of main() means a leak.
 */
#include <stdio.h>
#include <stdlib.h>

struct book {
    int id;
    char title[32];
    int year;
};

static int live_books;

/* Returns a new heap-allocated book, or NULL if out of memory.
 * The caller owns the result and must call book_destroy() on it. */
static struct book *book_create(int id, const char *title, int year)
{
    struct book *b = malloc(sizeof(*b));

    if (b == NULL)
        return NULL;

    b->id = id;
    snprintf(b->title, sizeof(b->title), "%s", title);
    b->year = year;
    live_books++;
    return b;
}

static void book_destroy(struct book *b)
{
    if (b == NULL)
        return;
    free(b);
    live_books--;
}

static void book_print(const struct book *b)
{
    printf("[%d] %s (%d)\n", b->id, b->title, b->year);
}

int main(void)
{
    struct book *a = book_create(1, "The C Programming Language", 1978);
    struct book *b = book_create(2, "A title that is far too long to fit in 32 bytes", 2024);

    if (a == NULL || b == NULL) {
        fprintf(stderr, "Error: out of memory\n");
        book_destroy(a);
        book_destroy(b);
        return EXIT_FAILURE;
    }

    book_print(a);
    book_print(b);          /* the title was safely truncated */
    printf("live books: %d\n", live_books);

    book_destroy(a);
    book_destroy(b);
    printf("live books at exit: %d\n", live_books);
    return 0;
}
