/*
 * File I/O PDF pp. 34-40, 47-52; Strings PDF pp. 42-48.
 * strtol adds explicit numeric-overflow and trailing-input checks.
 * Default: prepared edge cases in tmpfile. --stdin: read your own text lines.
 */
#include <ctype.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum line_result { LINE_OK, LINE_LONG, LINE_END, LINE_ERROR };
enum parse_result { PARSE_OK, PARSE_EMPTY, PARSE_INVALID, PARSE_RANGE,
                    PARSE_TRAILING };

static enum line_result read_line(FILE *input, char line[64])
{
    char *newline;
    int c;

    if (fgets(line, 64, input) == NULL)
        return ferror(input) ? LINE_ERROR : LINE_END;
    newline = strchr(line, '\n');
    if (newline != NULL) {
        *newline = '\0';
        return LINE_OK;
    }

    /* Probe once: exactly 63 characters followed by newline/EOF still fit. */
    c = fgetc(input);
    if (c == '\n')
        return LINE_OK;
    if (c == EOF)
        return ferror(input) ? LINE_ERROR : LINE_OK;
    while ((c = fgetc(input)) != '\n' && c != EOF)
        ;
    return ferror(input) ? LINE_ERROR : LINE_LONG;
}

static enum parse_result parse_year(const char *line, int *year)
{
    char *end;
    long value;

    while (isspace((unsigned char)*line))
        ++line;
    if (*line == '\0')
        return PARSE_EMPTY;
    errno = 0;
    value = strtol(line, &end, 10);
    if (end == line)
        return PARSE_INVALID;
    if (errno == ERANGE || value < 1450 || value > 2100)
        return PARSE_RANGE;
    while (isspace((unsigned char)*end))
        ++end;
    if (*end != '\0')
        return PARSE_TRAILING;
    *year = (int)value; /* The validated year range also fits int in C11. */
    return PARSE_OK;
}

static const char *parse_message(enum parse_result result)
{
    switch (result) {
    case PARSE_OK: return "valid";
    case PARSE_EMPTY: return "empty";
    case PARSE_INVALID: return "not a number";
    case PARSE_RANGE: return "outside 1450-2100";
    case PARSE_TRAILING: return "trailing characters";
    }
    return "unknown";
}

static int prepare_cases(FILE *input)
{
    if (fputs("1988\n 2001 \t\n\nabc\n2147483648\n"
              "999999999999999999999999999999\n2000junk\n1449\n2101\n",
              input) == EOF)
        return 0;
    for (int i = 0; i < 90; ++i) {
        if (fputc('9', input) == EOF)
            return 0;
    }
    /* A valid final line proves recovery after the long line; no final '\n'. */
    return fputs("\n2024", input) != EOF && fseek(input, 0L, SEEK_SET) == 0;
}

int main(int argc, char *argv[])
{
    FILE *input = stdin;
    char line[64];
    size_t number = 0;
    int ok = 1;

    if (argc > 2 || (argc == 2 && strcmp(argv[1], "--stdin") != 0)) {
        fprintf(stderr, "usage: %s [--stdin]\n", argv[0]);
        return EXIT_FAILURE;
    }
    if (argc == 1) {
        input = tmpfile();
        if (input == NULL) {
            perror("tmpfile");
            return EXIT_FAILURE;
        }
        if (!prepare_cases(input)) {
            fputs("could not prepare input\n", stderr);
            fclose(input);
            return EXIT_FAILURE;
        }
    }
    for (;;) {
        enum line_result read = read_line(input, line);
        enum parse_result parsed;
        int year;

        if (read == LINE_END)
            break;
        if (read == LINE_ERROR) {
            fputs("input read failed\n", stderr);
            ok = 0;
            break;
        }
        ++number;
        if (read == LINE_LONG) {
            printf("line %zu: too long\n", number);
            continue;
        }
        parsed = parse_year(line, &year);
        if (parsed == PARSE_OK)
            printf("line %zu: year %d\n", number, year);
        else
            printf("line %zu: %s\n", number, parse_message(parsed));
    }
    if (input != stdin && fclose(input) != 0)
        ok = 0;
    return ok ? EXIT_SUCCESS : EXIT_FAILURE;
}
