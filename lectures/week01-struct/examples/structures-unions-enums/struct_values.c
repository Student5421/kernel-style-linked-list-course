/*
 * Supplement: a typedef, partial initialization, and structs as values.
 * Source topics: Structures, Unions and Enums, PDF pages 9-20.
 */
#include <stdio.h>
#include <string.h>

struct book {
    int id;
    char title[32];
    int year;
};

/* Book is an alias for struct book, not a distinct structure type. */
typedef struct book Book;

static Book make_book(int id, const char *title, int year)
{
    Book result = { .id = id, .year = year };

    /* The caller supplies a string; snprintf bounds the copy to title. */
    snprintf(result.title, sizeof(result.title), "%s", title);
    return result;  /* Return the value, not the address of a local variable. */
}

static int same_book(const Book *left, const Book *right)
{
    /* C has no struct == operator. Compare the meaningful members. */
    return left->id == right->id
        && strcmp(left->title, right->title) == 0
        && left->year == right->year;
}

static void print_book(Book book)
{
    printf("[%d] \"%s\" (%d)\n", book.id, book.title, book.year);
}

int main(void)
{
    Book original = make_book(1, "C Programming", 1988);
    Book partial = { .id = 2 };  /* The omitted members are zero-initialized. */
    struct book copy = original; /* Book and struct book are compatible. */

    print_book(original);
    printf("partial: ");
    print_book(partial);

    printf("same immediately after assignment: %d\n",
           same_book(&original, &copy));
    copy.title[0] = 'c'; /* The embedded array was copied, too. */
    printf("original after changing copy.title[0]: ");
    print_book(original);
    printf("copy: ");
    print_book(copy);
    printf("same after editing the copy: %d\n", same_book(&original, &copy));

    /* After declaration, assign a whole struct using a C99 compound literal. */
    partial = (Book){ .id = 2, .title = "Pointers Revisited", .year = 2025 };
    printf("after whole-struct replacement: ");
    print_book(partial);

    /* memcmp is unsuitable for logical equality: structs may contain padding. */
    return 0;
}
