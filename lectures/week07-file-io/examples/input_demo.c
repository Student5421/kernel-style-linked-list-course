/*
 * Week 07 demo: reading numbers and words safely with scanf().
 *
 *   ./input_demo               type the input by hand
 *   ./input_demo < input.txt   feed a prepared test file (make test)
 */
#include <stdio.h>

#define YEAR_MIN 1450
#define YEAR_MAX 2100

/* Throw away the rest of the current input line, including the '\n'. */
static void discard_line(void)
{
    int c;

    while ((c = getchar()) != '\n' && c != EOF)
        ;
}

/* Returns 1 on success, 0 if the input was not a number, EOF at end of input. */
static int read_int(const char *prompt, int *out)
{
    int rc;

    printf("%s", prompt);
    rc = scanf("%d", out);
    if (rc == EOF)
        return EOF;
    discard_line();             /* on failure this removes the bad characters */
    return rc == 1;
}

/* Reads one word into title[32]: at most 31 characters, the rest is dropped. */
static int read_title(const char *prompt, char title[32])
{
    int rc;

    printf("%s", prompt);
    rc = scanf("%31s", title);  /* width = array size - 1, written in the format */
    if (rc == EOF)
        return EOF;
    discard_line();
    return rc == 1;
}

int main(void)
{
    char title[32];
    int id;
    int year;
    int rc;

    for (;;) {
        rc = read_int("ID (0 to quit): ", &id);
        if (rc == EOF)
            break;
        if (rc == 0 || id < 0) {        /* check rc first: id is unset if rc == 0 */
            printf("Error: Invalid input.\n");
            continue;
        }
        if (id == 0)
            break;

        if (read_title("Title: ", title) == EOF)
            break;

        rc = read_int("Year: ", &year);
        if (rc == EOF)
            break;
        if (rc == 0 || year < YEAR_MIN || year > YEAR_MAX) {
            printf("Error: Year must be %d-%d.\n", YEAR_MIN, YEAR_MAX);
            continue;
        }

        printf("OK: [%d] %s (%d)\n", id, title, year);
    }
    printf("bye\n");
    return 0;
}
