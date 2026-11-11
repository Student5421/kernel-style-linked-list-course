/* Strings, pp. 43-60, 74: reserve space for the terminating null character. */
#include <stdio.h>
#include <string.h>

/* These teaching helpers accept C strings in non-overlapping source storage.
 * Return 0 without changing the destination when the result will not fit.
 */
static int copy_text(char *destination, size_t capacity, const char *source)
{
    size_t length = strlen(source);
    if (length >= capacity)
        return 0;
    memcpy(destination, source, length + 1); /* copy the null, too */
    return 1;
}

static int append_text(char *destination, size_t capacity, const char *suffix)
{
    size_t used = 0;
    size_t extra = strlen(suffix);
    while (used < capacity && destination[used] != '\0')
        ++used;
    if (used == capacity || extra >= capacity - used)
        return 0;
    memcpy(destination + used, suffix, extra + 1);
    return 1;
}

int main(void)
{
    char title[16] = "";
    char exact[2] = "";
    char empty[1] = "";
    char unterminated[2] = { 'C', 'C' };
    char description[32];
    char short_description[8];
    int copied = copy_text(title, sizeof title, "C");
    int appended = append_text(title, sizeof title, " Programming");

    printf("copy=%d append=%d title=%s length=%zu capacity=%zu\n",
           copied, appended, title, strlen(title), sizeof title);
    printf("oversized append accepted=%d\n",
           append_text(title, sizeof title, " Language"));
    printf("after rejection: %s\n", title);
    printf("exact fit=%d, empty fit=%d, zero capacity=%d\n",
           copy_text(exact, sizeof exact, "C"),
           copy_text(empty, sizeof empty, ""), copy_text(NULL, 0, "C"));
    printf("unterminated destination accepted=%d\n",
           append_text(unterminated, sizeof unterminated, "!"));

    int needed = snprintf(description, sizeof description, "%s (%d)", title, 1978);
    if (needed < 0 || (size_t)needed >= sizeof description)
        return 1;
    printf("formatted: %s\n", description);
    needed = snprintf(short_description, sizeof short_description,
                      "%s (%d)", title, 1978);
    if (needed < 0)
        return 1;
    printf("short format: %s; truncated=%s; needed=%d bytes plus null\n",
           short_description, (size_t)needed >= sizeof short_description ? "yes" : "no",
           needed);
    /* strncpy may omit the null; strncat's n limits appended characters,
     * not the total destination capacity. Neither automatically solves this.
     */
    return copied && appended ? 0 : 1;
}
