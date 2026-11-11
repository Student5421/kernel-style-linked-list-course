/* Low Level Operations, pp. 20-21: C bit-fields versus addressable members. */
#include <stddef.h>
#include <stdio.h>

struct book_bits {
    unsigned int id;
    unsigned int borrowed : 1;
    unsigned int reserved : 1;
    unsigned int edition : 4;
    unsigned int year;
};

struct book_members {
    unsigned int id;
    unsigned int borrowed;
    unsigned int reserved;
    unsigned int edition;
    unsigned int year;
};

static int set_edition(struct book_bits *book, unsigned int edition)
{
    if (edition > 15u)
        return 0;
    book->edition = edition;
    return 1;
}

int main(void)
{
    struct book_bits book = { .id = 1, .borrowed = 1, .reserved = 0,
                              .edition = 3, .year = 1978 };
    printf("bit-field struct bytes=%zu; ordinary-member struct bytes=%zu\n",
           sizeof(struct book_bits), sizeof(struct book_members));
    printf("ordinary members inside bit-field struct: id offset=%zu, year offset=%zu\n",
           offsetof(struct book_bits, id), offsetof(struct book_bits, year));
    printf("ordinary-member edition offset=%zu\n",
           offsetof(struct book_members, edition));
    printf("book address=%p, year address=%p\n", (void *)&book, (void *)&book.year);
    printf("borrowed=%u reserved=%u edition=%u\n", (unsigned int)book.borrowed,
           (unsigned int)book.reserved, (unsigned int)book.edition);
    printf("edition 15 accepted=%d\n", set_edition(&book, 15u));
    printf("edition 16 accepted=%d\n", set_edition(&book, 16u));
    printf("edition after rejection=%u\n", (unsigned int)book.edition);

    /* &book.edition, sizeof(book.edition), and offsetof(..., edition) are
     * invalid for a bit-field. Bit order, storage units, alignment, and total
     * size depend on the implementation. Do not infer a wire/file layout
     * from these declarations or use a bit-field with container_of().
     */
    return 0;
}
