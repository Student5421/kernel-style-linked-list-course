/* Low Level Operations, pp. 15-19: enum masks, any/all, and a 3-bit field. */
#include <stdio.h>

enum book_flag {
    BOOK_AVAILABLE = 1u << 0,
    BOOK_REFERENCE = 1u << 1,
    BOOK_DIGITAL = 1u << 2
};
enum { EDITION_SHIFT = 4, EDITION_MAX = 7 };
#define EDITION_MASK (7u << EDITION_SHIFT)

static int set_edition(unsigned int *record, unsigned int edition)
{
    if (edition > EDITION_MAX)
        return 0;
    *record = (*record & ~EDITION_MASK) | (edition << EDITION_SHIFT);
    return 1;
}

static void report_flags(unsigned int record, unsigned int wanted)
{
    printf("flags=0x%x any=%s all=%s\n", record,
           (record & wanted) != 0 ? "yes" : "no",
           (record & wanted) == wanted ? "yes" : "no");
}

int main(void)
{
    unsigned int record = BOOK_AVAILABLE;
    unsigned int wanted = BOOK_AVAILABLE | BOOK_REFERENCE;
    report_flags(record, wanted);
    record |= BOOK_REFERENCE;
    report_flags(record, wanted);
    set_edition(&record, 7);
    printf("edition=%u record=0x%x\n", (record >> EDITION_SHIFT) & 7u, record);
    set_edition(&record, 2); /* clear old field bits before storing new ones */
    printf("edition=%u record=0x%x\n", (record & EDITION_MASK) >> EDITION_SHIFT, record);
    printf("edition 8 accepted=%d\n", set_edition(&record, 8));
    printf("after rejection: edition=%u, available/reference preserved=%s\n",
           (record & EDITION_MASK) >> EDITION_SHIFT,
           (record & wanted) == wanted ? "yes" : "no");
    record &= ~wanted;
    report_flags(record, wanted);
    /* Unsigned operands and constant shift 4 are valid even on 16-bit int.
     * These are explicit integer bit positions, not a C struct bit-field.
     */
    return 0;
}
