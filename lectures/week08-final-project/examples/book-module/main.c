#include <stdio.h>
#include <stdlib.h>
#include "book.h"
#include "report.h" /* Includes book.h again: the guard makes this harmless. */

int main(void)
{
    struct book first;
    struct book second;
    struct book rejected;

    if (!book_init(&first, 1, "C Programming", 1988)
        || !book_init(&second, 2, "Operating Systems", 2024)) {
        fputs("book initialization failed\n", stderr);
        return EXIT_FAILURE;
    }
    printf("== %s ==\n", book_module_name);
    if (!book_report(stdout, &first) || !book_report(stdout, &second))
        return EXIT_FAILURE;
    printf("year 1000 accepted: %d\n",
           book_init(&rejected, 3, "Invalid year", 1000));
    return EXIT_SUCCESS;
}
