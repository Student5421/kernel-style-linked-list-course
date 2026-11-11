/* Low Level Operations, pp. 22-24; Strings, pp. 68-70: bytes and memory copies. */
#include <limits.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

static void print_bytes(const unsigned char *bytes, size_t count)
{
    for (size_t i = 0; i < count; ++i)
        printf(" %02x", (unsigned int)bytes[i]);
    putchar('\n');
}

int main(void)
{
    unsigned int year = 1978u;
    unsigned int restored = 0;
    unsigned char representation[sizeof year];
    char title[32] = "C books";
    const char prefix[] = "Read ";
    size_t prefix_length = sizeof prefix - 1;

    printf("CHAR_BIT=%d, sizeof year=%zu\n", CHAR_BIT, sizeof year);
    memcpy(representation, &year, sizeof year);
    printf("year object bytes:");
    print_bytes(representation, sizeof representation);
    memcpy(&restored, representation, sizeof restored);
    printf("same-type round trip: %u\n", restored);

#if defined(UINT32_MAX) && CHAR_BIT == 8
    /* The exact-width type is optional in C11; do not assume it exists. */
    uint32_t marker = UINT32_C(0x01020304);
    unsigned char marker_bytes[sizeof marker];
    const unsigned char little[] = { 4, 3, 2, 1 };
    const unsigned char big[] = { 1, 2, 3, 4 };
    memcpy(marker_bytes, &marker, sizeof marker);
    printf("0x01020304 bytes:");
    print_bytes(marker_bytes, sizeof marker_bytes);
    printf("observed byte order: %s\n",
           memcmp(marker_bytes, little, sizeof little) == 0 ? "little-endian" :
           memcmp(marker_bytes, big, sizeof big) == 0 ? "big-endian" : "other order");
#else
    puts("Exact 32-bit / 8-bit-byte endian demonstration unavailable here.");
#endif

    /* The ranges overlap. Move the terminating null along with the title. */
    memmove(title + prefix_length, title, strlen(title) + 1);
    memcpy(title, prefix, prefix_length); /* these source/destination do not overlap */
    printf("after overlapping right shift and prefix: %s\n", title);
    memmove(title, title + prefix_length, strlen(title + prefix_length) + 1);
    printf("after overlapping left shift: %s\n", title);
    /* This observes local object representations; it is not a portable file
     * format. Never serialize linked-list pointers or raw struct padding.
     */
    return 0;
}
