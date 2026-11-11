/* File I/O PDF pp. 41-48, 53-54, 61: checked line and block copies. */
#include <stdio.h>
#include <stdlib.h>

static int copy_lines(FILE *source, FILE *destination)
{
    char chunk[16];

    /* A long text line arrives in several chunks; fputs adds no newline. */
    while (fgets(chunk, sizeof(chunk), source) != NULL) {
        if (fputs(chunk, destination) == EOF)
            return 0;
    }
    return !ferror(source);
}

static int copy_blocks(FILE *source, FILE *destination)
{
    unsigned char block[7];
    size_t count;

    /* Element size 1 makes count a byte count, including NUL bytes. */
    while ((count = fread(block, 1, sizeof(block), source)) != 0) {
        if (fwrite(block, 1, count, destination) != count)
            return 0;
    }
    return !ferror(source);
}

static int same_bytes(FILE *left, FILE *right, size_t expected_count)
{
    size_t count = 0;
    int a;
    int b;

    /* Positioning is also the required write-to-read transition on tmpfile. */
    if (fseek(left, 0L, SEEK_SET) != 0 || fseek(right, 0L, SEEK_SET) != 0)
        return 0;
    do {
        a = fgetc(left);
        b = fgetc(right);
        if (a != b)
            return 0;
        if (a != EOF)
            ++count;
    } while (a != EOF);
    return !ferror(left) && !ferror(right) && count == expected_count;
}

static int demonstrate(const char *label, const unsigned char *bytes,
                       size_t size, int (*copy)(FILE *, FILE *))
{
    FILE *source = tmpfile();
    FILE *destination = tmpfile();
    int ok = 0;

    if (source == NULL || destination == NULL) {
        perror("tmpfile");
        goto cleanup;
    }
    if (fwrite(bytes, 1, size, source) != size
        || fseek(source, 0L, SEEK_SET) != 0
        || !copy(source, destination)
        || fflush(destination) == EOF
        || !same_bytes(source, destination, size)) {
        fprintf(stderr, "%s: copy or byte comparison failed\n", label);
        goto cleanup;
    }
    printf("%s: %zu bytes matched\n", label, size);
    ok = 1;

cleanup:
    if (source != NULL && fclose(source) != 0)
        ok = 0;
    if (destination != NULL && fclose(destination) != 0)
        ok = 0;
    if (!ok)
        fprintf(stderr, "%s: stream operation failed\n", label);
    return ok;
}

int main(void)
{
    static const unsigned char text[] =
        "C Programming\nA title longer than the small line buffer\n"
        "No final newline";
    static const unsigned char binary[] = {
        'B', 'O', 'O', 'K', 0, 1, 10, 13, 26, 127, 255
    };

    /* Line copying is for text without embedded NUL; block copying handles all. */
    if (!demonstrate("line copy", text, sizeof(text) - 1, copy_lines)
        || !demonstrate("block copy", binary, sizeof(binary), copy_blocks))
        return EXIT_FAILURE;
    return EXIT_SUCCESS;
}
