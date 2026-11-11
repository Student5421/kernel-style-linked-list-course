#include "report.h"

int book_report(FILE *output, const struct book *book)
{
    return fprintf(output, "[%d] %s (%d)\n", book->id, book->title,
                   book->year) >= 0;
}
