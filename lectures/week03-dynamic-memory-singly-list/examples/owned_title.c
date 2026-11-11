/*
 * Week 03: replace an owned title only after its new allocation succeeds.
 * Dynamic Memory Allocation, pp. 23-27; Strings, pp. 49-60, 68-72, 74-81.
 * Cloning is covered separately by the Week 01 dynamic_struct_copy demo.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct book {
    char *title;
    size_t capacity; /* Bytes allocated, including room for the terminator. */
};

static int refuse_next_request;

static void *title_allocate(size_t bytes)
{
    if (refuse_next_request) {
        refuse_next_request = 0;
        return NULL; /* Deterministic failure for the teaching example. */
    }
    return malloc(bytes);
}

static int set_title(struct book *book, const char *text)
{
    size_t length = strlen(text);
    char *replacement;

    if (length == SIZE_MAX)
        return 0;
    replacement = title_allocate(length + 1);
    if (replacement == NULL)
        return 0;
    memcpy(replacement, text, length + 1);
    /* text may point inside the old title: copy it before releasing the owner. */
    free(book->title);
    book->title = replacement;
    book->capacity = length + 1;
    return 1;
}

/* book must already own a null-terminated title (possibly the empty string). */
static int append_title(struct book *book, const char *suffix)
{
    size_t length = strlen(book->title);
    size_t extra = strlen(suffix);
    char *replacement;

    if (length == SIZE_MAX || extra > SIZE_MAX - length - 1)
        return 0;
    /* Build a new allocation so even a suffix inside the old title is valid. */
    replacement = title_allocate(length + extra + 1);
    if (replacement == NULL)
        return 0;
    memcpy(replacement, book->title, length);
    memcpy(replacement + length, suffix, extra + 1);
    free(book->title);
    book->title = replacement;
    book->capacity = length + extra + 1;
    return 1;
}

static void print_title(const struct book *book)
{
    printf("\"%s\": length=%zu capacity=%zu\n",
           book->title, strlen(book->title), book->capacity);
}

int main(void)
{
    struct book book = {0};

    if (!set_title(&book, "C"))
        goto failed;
    print_title(&book);
    if (!append_title(&book, " Programming"))
        goto failed;
    print_title(&book);
    refuse_next_request = 1;
    if (set_title(&book, "Replacement")
        || strcmp(book.title, "C Programming") != 0)
        goto failed;
    puts("failed replacement preserves the current title");
    /* A borrowed substring is consumed before the old storage is released. */
    if (!set_title(&book, book.title + 2))
        goto failed;
    print_title(&book);
    if (!append_title(&book, book.title))
        goto failed;
    print_title(&book);
    if (!set_title(&book, ""))
        goto failed;
    print_title(&book);
    free(book.title);
    return EXIT_SUCCESS;

failed:
    fputs("title update failed; current owned storage is still valid\n", stderr);
    free(book.title);
    return EXIT_FAILURE;
}
