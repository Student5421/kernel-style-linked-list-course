/* Strings, pp. 61-67: compare contents, check search results, tokenize a copy. */
#include <stdio.h>
#include <string.h>

static void report_search(const char *title, const char *needle)
{
    const char *found = strstr(title, needle);
    if (found != NULL)
        printf("find \"%s\": offset=%td, suffix=%s\n", needle, found - title, found);
    else
        printf("find \"%s\": absent\n", needle);
}

static void print_tokens(char *text)
{
    size_t count = 0;
    for (char *token = strtok(text, ",;"); token != NULL;
         token = strtok(NULL, ",;"))
        printf("  token[%zu]=%s\n", count++, token);
    printf("token count=%zu\n", count);
}

int main(void)
{
    char first[] = "C Programming";
    char second[] = "C Programming";
    const char *title = "C Programming Language";
    char catalog[] = "C,,Linux;Systems";
    char empty[] = "";

    printf("same contents=%s, same first-element address=%s\n",
           strcmp(first, second) == 0 ? "yes" : "no",
           &first[0] == &second[0] ? "yes" : "no");
    printf("prefix \"C \" matches=%s\n", strncmp(title, "C ", 2) == 0 ? "yes" : "no");
    /* Only the sign of strcmp's nonzero result is guaranteed. */
    printf("Linux vs Systems comparison sign=%d\n",
           (strcmp("Linux", "Systems") > 0) - (strcmp("Linux", "Systems") < 0));
    const char *space = strchr(title, ' ');
    if (space != NULL)
        printf("first space offset=%td\n", space - title);
    report_search(title, "Language");
    report_search(title, "Python");
    report_search(title, "");

    printf("before strtok: %s\n", catalog);
    print_tokens(catalog);
    printf("after strtok, first C string: %s\n", catalog);
    puts("empty input:");
    print_tokens(empty);
    /* strtok modifies this writable buffer and skips repeated delimiters.
     * It maintains hidden state: do not nest another strtok loop here.
     */
    return 0;
}
