/*
 * Supplement (after Week 03): a heap struct with its own heap string.
 * Source topic: Structures, Unions and Enums, PDF page 23.
 * Extension: assignment copies pointer values; it does not clone allocations.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct book {
    int id;
    char *title;
};

static struct book *book_create(int id, const char *title)
{
    struct book *book = malloc(sizeof(*book));
    size_t length = strlen(title);

    if (book == NULL)
        return NULL;
    book->title = malloc(length + 1); /* Include the terminating '\0'. */
    if (book->title == NULL) {
        free(book); /* Clean up the first allocation if the second fails. */
        return NULL;
    }
    book->id = id;
    memcpy(book->title, title, length + 1);
    return book;
}

static struct book *book_clone(const struct book *source)
{
    /* A deep copy creates new storage for every owned allocation. */
    return book_create(source->id, source->title);
}

static void book_destroy(struct book *book)
{
    if (book != NULL) {
        free(book->title);
        free(book);
    }
}

int main(void)
{
    struct book *original = book_create(1, "C Programming");
    struct book *deep_copy;

    if (original == NULL) {
        fprintf(stderr, "could not allocate the original book\n");
        return EXIT_FAILURE;
    }

    /* This stack value borrows original->title; it does not own that string. */
    struct book shallow_copy = *original;

    deep_copy = book_clone(original);
    if (deep_copy == NULL) {
        fprintf(stderr, "could not clone the book\n");
        book_destroy(original);
        return EXIT_FAILURE;
    }

    printf("shallow copy shares title storage: %d\n",
           shallow_copy.title == original->title);
    printf("deep copy shares title storage: %d\n",
           deep_copy->title == original->title);

    shallow_copy.title[0] = 'c';
    printf("after editing shallow_copy.title: original=\"%s\"\n",
           original->title);
    printf("deep copy is independent: \"%s\"\n", deep_copy->title);

    /* Never free shallow_copy.title: original owns the shared allocation. */
    book_destroy(deep_copy);
    book_destroy(original);
    /* Neither original nor shallow_copy.title may be used after this point. */
    return EXIT_SUCCESS;
}
