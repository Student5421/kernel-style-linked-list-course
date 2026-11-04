/*
 * Week 07 demo: reading a file one character at a time.
 *
 *   ./count_chars books.txt
 *   ./count_chars missing.txt ; echo $?
 */
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    FILE *fp;
    int c;                  /* int, not char: EOF must differ from every character */
    long chars = 0;
    long lines = 0;

    if (argc != 2) {
        fprintf(stderr, "usage: %s FILE\n", argv[0]);
        return EXIT_FAILURE;
    }

    fp = fopen(argv[1], "r");
    if (fp == NULL) {
        perror(argv[1]);    /* e.g. "missing.txt: No such file or directory" */
        return EXIT_FAILURE;
    }

    while ((c = fgetc(fp)) != EOF) {
        chars++;
        if (c == '\n')
            lines++;
    }
    if (ferror(fp))
        perror(argv[1]);
    fclose(fp);

    printf("%s: %ld lines, %ld characters\n", argv[1], lines, chars);
    return 0;
}
