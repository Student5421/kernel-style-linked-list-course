#ifndef LECTURE_BOOK_H
#define LECTURE_BOOK_H

#define BOOK_TITLE_CAPACITY 32
#define BOOK_MODULE_NAME "Book module"

struct book {
    int id;
    char title[BOOK_TITLE_CAPACITY];
    int year;
};

/* Declaration only; book.c provides exactly one definition. */
extern const char book_module_name[];

/* Returns 1 on success, 0 for invalid arguments; never truncates the title. */
int book_init(struct book *book, int id, const char *title, int year);

#endif
