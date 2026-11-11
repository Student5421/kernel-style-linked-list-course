/*
 * File I/O PDF pp. 53-61: an explicit binary format and saved positions.
 * Format: "BK01", then records with two big-endian 16-bit unsigned fields.
 * No struct padding or pointer representations are written.
 */
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

_Static_assert(CHAR_BIT == 8, "this octet-based file format requires 8-bit bytes");

enum { HEADER_SIZE = 4, RECORD_SIZE = 4, RECORD_COUNT = 2 };

static void encode_book(unsigned char record[RECORD_SIZE],
                        unsigned id, unsigned year)
{
    /* The caller supplies values in 0..65535. */
    record[0] = (unsigned char)(id / 256U);
    record[1] = (unsigned char)(id % 256U);
    record[2] = (unsigned char)(year / 256U);
    record[3] = (unsigned char)(year % 256U);
}

static void print_record(const unsigned char record[RECORD_SIZE])
{
    unsigned id = (unsigned)record[0] * 256U + record[1];
    unsigned year = (unsigned)record[2] * 256U + record[3];

    printf("book id=%u year=%u\n", id, year);
}

int main(void)
{
    static const unsigned char header[] = { 0x42, 0x4b, 0x30, 0x31 }; /* ASCII BK01 */
    static const unsigned char expected[] = {
        0x42, 0x4b, 0x30, 0x31, 0, 1, 7, 196, 0, 2, 7, 232
    };
    unsigned char records[RECORD_COUNT][RECORD_SIZE];
    unsigned char record[RECORD_SIZE];
    unsigned char observed[sizeof(expected)];
    FILE *file = tmpfile();
    fpos_t first_record;
    long end;
    int ok = 0;

    if (file == NULL) {
        perror("tmpfile");
        return EXIT_FAILURE;
    }
    encode_book(records[0], 1U, 1988U);
    encode_book(records[1], 2U, 2024U);

    if (fwrite(header, 1, sizeof(header), file) != sizeof(header)
        || fgetpos(file, &first_record) != 0
        || fwrite(records, sizeof(records[0]), RECORD_COUNT, file) != RECORD_COUNT
        || fflush(file) == EOF)
        goto cleanup;
    end = ftell(file);
    if (end == -1L || end != (long)sizeof(expected))
        goto cleanup;
    printf("binary size: %ld bytes\n", end);

    /* Fixed byte offsets are appropriate for this explicitly binary format. */
    if (fseek(file, HEADER_SIZE + RECORD_SIZE, SEEK_SET) != 0
        || fread(record, sizeof(record), 1, file) != 1)
        goto cleanup;
    printf("second record via fseek: ");
    print_record(record);

    /* fpos_t is opaque: save and restore it without doing arithmetic on it. */
    if (fsetpos(file, &first_record) != 0
        || fread(record, sizeof(record), 1, file) != 1)
        goto cleanup;
    printf("first record via fsetpos: ");
    print_record(record);

    rewind(file); /* Also clears the error and EOF indicators. */
    if (fread(observed, 1, sizeof(observed), file) != sizeof(observed)
        || memcmp(observed, expected, sizeof(expected)) != 0
        || fgetc(file) != EOF || ferror(file))
        goto cleanup;
    puts("encoded bytes and round trip matched");
    ok = 1;

cleanup:
    if (fclose(file) != 0)
        ok = 0;
    if (!ok)
        fputs("binary stream operation or format check failed\n", stderr);
    return ok ? EXIT_SUCCESS : EXIT_FAILURE;
}
