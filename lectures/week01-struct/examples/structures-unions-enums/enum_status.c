/*
 * Supplement: named integer constants and validating an external status code.
 * Source topics: Structures, Unions and Enums, PDF pages 40-45.
 */
#include <stdio.h>

enum book_status {
    BOOK_AVAILABLE,      /* 0 */
    BOOK_LOANED,         /* 1 */
    BOOK_REPAIR = 10,    /* An explicit value starts a new sequence. */
    BOOK_RETIRED         /* 11 */
};

typedef enum book_status BookStatus;

static const char *status_name(BookStatus status)
{
    switch (status) {
    case BOOK_AVAILABLE: return "available";
    case BOOK_LOANED: return "loaned";
    case BOOK_REPAIR: return "under repair";
    case BOOK_RETIRED: return "retired";
    default: return "unknown";
    }
}

static int status_from_int(int raw, BookStatus *status)
{
    /* Validate first. A cast alone would not reject an unknown number. */
    switch (raw) {
    case BOOK_AVAILABLE:
    case BOOK_LOANED:
    case BOOK_REPAIR:
    case BOOK_RETIRED:
        *status = (BookStatus)raw;
        return 1;
    default:
        return 0;
    }
}

int main(void)
{
    const int raw_codes[] = { 0, 1, 10, 11, 2, 99 };
    BookStatus current = BOOK_AVAILABLE;

    printf("available=%d loaned=%d repair=%d retired=%d\n",
           BOOK_AVAILABLE, BOOK_LOANED, BOOK_REPAIR, BOOK_RETIRED);
    printf("initial status: %s\n", status_name(current));
    current = BOOK_LOANED;
    printf("after borrowing: %s\n", status_name(current));

    for (size_t i = 0; i < sizeof(raw_codes) / sizeof(raw_codes[0]); ++i) {
        BookStatus parsed;

        if (status_from_int(raw_codes[i], &parsed))
            printf("code %d -> %s\n", raw_codes[i], status_name(parsed));
        else
            printf("code %d -> rejected\n", raw_codes[i]);
    }
    return 0;
}
