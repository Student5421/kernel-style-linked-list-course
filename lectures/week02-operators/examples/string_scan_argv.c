/* Strings, pp. 26-27, 33-41, 75-81: pointer scans and command-line strings. */
#include <ctype.h>
#include <stdio.h>
#include <string.h>

static void inspect_title(const char *title)
{
    const char *cursor = title;
    size_t spaces = 0;
    size_t digits = 0;
    printf("title=\"%s\" uppercase=\"", title);
    while (*cursor != '\0') {
        unsigned char character = (unsigned char)*cursor;
        if (isspace(character))
            ++spaces;
        if (isdigit(character))
            ++digits;
        putchar(toupper(character));
        ++cursor;
    }
    printf("\" length=%td library-length=%zu spaces=%zu digits=%zu\n",
           cursor - title, strlen(title), spaces, digits);
    /* cursor now points AT the null character, not beyond it. */
}

int main(int argc, char *argv[])
{
    if (argc < 2) {
        puts("No title arguments; using built-in examples.");
        inspect_title("C Programming 2");
        inspect_title("");
    } else {
        /* argv[argc] is NULL; do not assume argv[1] exists without checking. */
        for (int i = 1; i < argc; ++i)
            inspect_title(argv[i]);
    }
    /* ctype functions require EOF or an unsigned-char value, never a
     * possibly negative plain char. Their true results need not equal 1.
     * This counts C bytes/characters, not UTF-8 code points.
     */
    return 0;
}
