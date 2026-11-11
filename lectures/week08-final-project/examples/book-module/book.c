#include "book.h"
#include <string.h>

const char book_module_name[] = BOOK_MODULE_NAME;

/* File-private implementation detail, absent from the public header. */
static int valid_year(int year)
{
    return year >= 1450 && year <= 2100;
}

int book_init(struct book *book, int id, const char *title, int year)
{
    size_t length;

    if (book == NULL || title == NULL || id <= 0 || !valid_year(year))
        return 0;
    length = strlen(title);
    if (length >= sizeof(book->title))
        return 0;
    book->id = id;
    memmove(book->title, title, length + 1);
    book->year = year;
    return 1;
}
