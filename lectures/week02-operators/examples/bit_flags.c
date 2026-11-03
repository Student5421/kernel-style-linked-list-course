/*
 * Week 02 demo: bitwise operators and flag sets.
 */
#include <stdio.h>

#define BOOK_BORROWED (1u << 0)
#define BOOK_DAMAGED  (1u << 1)
#define BOOK_RESERVED (1u << 2)

static void print_flags(unsigned int flags)
{
    printf("flags = 0x%x:%s%s%s\n", flags,
           (flags & BOOK_BORROWED) ? " borrowed" : "",
           (flags & BOOK_DAMAGED) ? " damaged" : "",
           (flags & BOOK_RESERVED) ? " reserved" : "");
}

int main(void)
{
    unsigned int flags = 0;

    flags |= BOOK_BORROWED;                 /* set    */
    flags |= BOOK_RESERVED;
    print_flags(flags);

    flags &= ~BOOK_BORROWED;                /* clear  */
    print_flags(flags);

    flags ^= BOOK_DAMAGED;                  /* toggle */
    print_flags(flags);

    if ((flags & BOOK_DAMAGED) != 0)        /* test: the parentheses are required */
        printf("damaged\n");

    printf("2 & 1 = %d, 2 && 1 = %d\n", 2 & 1, 2 && 1);
    printf("(1 << 2) + 1 = %d, 1 << (2 + 1) = %d\n", (1 << 2) + 1, 1 << (2 + 1));
    return 0;
}
