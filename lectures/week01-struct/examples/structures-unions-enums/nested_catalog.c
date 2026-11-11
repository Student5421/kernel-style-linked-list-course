/*
 * Supplement: arrays of structs, nested structs, and nested member access.
 * Source topics: Structures, Unions and Enums, PDF pages 24-29.
 */
#include <stdio.h>

struct author {
    char first[20];
    char last[20];
};

struct book {
    int id;
    char title[32];
    struct author author;
};

static const struct book *find_book(const struct book books[], size_t count,
                                    int id)
{
    for (size_t i = 0; i < count; ++i) {
        if (books[i].id == id)
            return &books[i];
    }
    return NULL;
}

static void print_catalog(const struct book books[], size_t count)
{
    for (size_t i = 0; i < count; ++i) {
        printf("[%d] %s / %s %s\n", books[i].id, books[i].title,
               books[i].author.first, books[i].author.last);
    }
}

int main(void)
{
    struct book books[] = {
        { .id = 1, .title = "C Programming",
          .author = { .first = "Brian", .last = "Kernighan" } },
        { .id = 2, .title = "Operating Systems",
          .author = { .first = "Andrew", .last = "Tanenbaum" } },
        { .id = 3, .title = "Programming Pearls",
          .author = { .first = "Jon", .last = "Bentley" } }
    };
    size_t count = sizeof(books) / sizeof(books[0]);
    struct author replacement = { .first = "Herbert", .last = "Bos" };
    const struct book *found;

    printf("catalog has %zu books\n", count);
    print_catalog(books, count);

    /* One struct assignment copies both embedded name arrays. */
    books[1].author = replacement;
    printf("updated books[1].author: %s %s\n",
           books[1].author.first, books[1].author.last);

    found = find_book(books, count, 2);
    if (found != NULL)
        printf("found through pointer: %s / %s\n", found->title,
               found->author.last);
    printf("missing book returns NULL: %d\n",
           find_book(books, count, 99) == NULL);
    return 0;
}
