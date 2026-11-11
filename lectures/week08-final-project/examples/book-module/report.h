#ifndef LECTURE_BOOK_REPORT_H
#define LECTURE_BOOK_REPORT_H

#include <stdio.h>
#include "book.h"

/* Returns 1 on successful output, 0 on a stream error. */
int book_report(FILE *output, const struct book *book);

#endif
