/*
 * Supplement: structs store every member; union members share storage.
 * Source topics: Structures, Unions and Enums, PDF pages 32-35 and 38.
 */
#include <stdio.h>

struct separate_fields {
    int pages;
    double price;
    char category;
};

union shared_fields {
    int pages;
    double price;
    char category;
};

int main(void)
{
    struct separate_fields record = { 120, 29.95, 'C' };
    union shared_fields value = { 120 }; /* Positional init: first member. */
    union shared_fields designated = { .price = 19.50 }; /* C99 and later. */

    printf("struct: pages=%d price=%.2f category=%c\n",
           record.pages, record.price, record.category);
    printf("member sizes: int=%zu double=%zu char=%zu\n",
           sizeof(value.pages), sizeof(value.price), sizeof(value.category));
    printf("sizeof struct=%zu, sizeof union=%zu\n",
           sizeof(record), sizeof(value));
    /* Both sizes include any padding required by this implementation. */

    printf("union address = %p\n", (void *)&value);
    printf("pages address = %p\n", (void *)&value.pages);
    printf("price address = %p\n", (void *)&value.price);
    printf("category address = %p\n", (void *)&value.category);

    printf("after initializing pages: %d\n", value.pages);
    value.price = 29.95;
    printf("after assigning price: %.2f\n", value.price);
    /* The former pages value is no longer stored as a separate value. */
    value.category = 'C';
    printf("after assigning category: %c\n", value.category);

    union shared_fields copy = value;
    printf("copied union's current member: %c\n", copy.category);
    printf("designated price initializer: %.2f\n", designated.price);

    /* Read only the member whose value we last stored in this demo. */
    return 0;
}
