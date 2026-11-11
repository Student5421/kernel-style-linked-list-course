/*
 * Supplement: an enum tag records which union member currently holds a value.
 * Source topics: Structures, Unions and Enums, PDF pages 36-37 and 46-47.
 */
#include <stdio.h>

enum book_format {
    BOOK_PRINT,
    BOOK_EBOOK
};

struct print_details {
    int pages;
    int copies;
};

struct ebook_details {
    double megabytes;
    char file_format[8];
};

struct book {
    int id;
    char title[32];
    enum book_format format;
    union {
        struct print_details print;
        struct ebook_details ebook;
    } details;
};

static void print_book(const struct book *book)
{
    printf("[%d] %s: ", book->id, book->title);
    switch (book->format) {
    case BOOK_PRINT:
        printf("print, %d pages, %d copies\n",
               book->details.print.pages, book->details.print.copies);
        break;
    case BOOK_EBOOK:
        printf("ebook, %.1f MB, %s\n", book->details.ebook.megabytes,
               book->details.ebook.file_format);
        break;
    default:
        printf("unknown format\n");
        break;
    }
}

static void make_ebook(struct book *book, double megabytes)
{
    /* Replace the payload and the tag together: the old print data is gone. */
    book->details.ebook = (struct ebook_details){
        .megabytes = megabytes, .file_format = "EPUB"
    };
    book->format = BOOK_EBOOK;
}

int main(void)
{
    struct book books[] = {
        { .id = 1, .title = "C Programming", .format = BOOK_PRINT,
          .details = { .print = { .pages = 272, .copies = 3 } } },
        { .id = 2, .title = "Operating Systems", .format = BOOK_EBOOK,
          .details = { .ebook = { .megabytes = 4.5, .file_format = "PDF" } } }
    };
    size_t count = sizeof(books) / sizeof(books[0]);

    for (size_t i = 0; i < count; ++i)
        print_book(&books[i]);

    printf("converting book 1 to an ebook:\n");
    make_ebook(&books[0], 1.2);
    print_book(&books[0]);

    /* C does not keep tag and payload consistent automatically; our code must. */
    return 0;
}
