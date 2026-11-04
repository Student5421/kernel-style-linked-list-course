/*
 * Week 07 demo: saving an intrusive list of books to a text file
 * and loading it back.
 *
 *   ./library_io books.txt saved.txt
 *
 * File format, one book per line:   id,year,title
 * Empty lines and lines starting with '#' are ignored.
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

#define list_for_each(pos, head) \
    for ((pos) = (head)->next; (pos) != (head); (pos) = (pos)->next)

#define list_for_each_safe(pos, n, head) \
    for ((pos) = (head)->next, (n) = (pos)->next; (pos) != (head); \
         (pos) = (n), (n) = (pos)->next)

static void list_init(struct list_head *head)
{
    head->next = head;
    head->prev = head;
}

static void list_add_tail(struct list_head *new, struct list_head *head)
{
    struct list_head *prev = head->prev;

    head->prev = new;
    new->next = head;
    new->prev = prev;
    prev->next = new;
}

static void list_del(struct list_head *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
}

/* ------------------------------------------------------------------ */

struct book {
    int id;
    char title[32];
    int year;
    struct list_head list;
};

static struct book *book_create(int id, const char *title, int year)
{
    struct book *b = malloc(sizeof(*b));

    if (b == NULL)
        return NULL;

    b->id = id;
    snprintf(b->title, sizeof(b->title), "%s", title);
    b->year = year;
    list_init(&b->list);
    return b;
}

static void free_all(struct list_head *head)
{
    struct list_head *pos;
    struct list_head *n;

    list_for_each_safe(pos, n, head) {
        list_del(pos);
        free(container_of(pos, struct book, list));
    }
    list_init(head);
}

static void print_all(struct list_head *head)
{
    struct list_head *pos;

    list_for_each(pos, head) {
        struct book *b = container_of(pos, struct book, list);

        printf("  [%d] %s (%d)\n", b->id, b->title, b->year);
    }
}

/* fgets() stopped in the middle of a long line: throw the rest away. */
static void skip_rest_of_line(FILE *fp)
{
    int c;

    while ((c = fgetc(fp)) != '\n' && c != EOF)
        ;
}

/* Returns the number of books loaded, or -1 if the file cannot be opened. */
static int library_load(struct list_head *head, const char *path)
{
    FILE *fp = fopen(path, "r");
    char line[128];
    int lineno = 0;
    int loaded = 0;

    if (fp == NULL) {
        perror(path);
        return -1;
    }

    while (fgets(line, sizeof(line), fp) != NULL) {
        size_t len = strcspn(line, "\n");
        char title[32];
        int id;
        int year;
        struct book *b;

        lineno++;
        if (line[len] != '\n' && !feof(fp)) {
            fprintf(stderr, "%s:%d: line too long, skipped\n", path, lineno);
            skip_rest_of_line(fp);
            continue;
        }
        line[len] = '\0';                       /* strip the newline */

        if (line[0] == '\0' || line[0] == '#')
            continue;
        if (sscanf(line, "%d,%d,%31[^\n]", &id, &year, title) != 3) {
            fprintf(stderr, "%s:%d: invalid line: %s\n", path, lineno, line);
            continue;
        }

        b = book_create(id, title, year);
        if (b == NULL) {
            fprintf(stderr, "Error: out of memory\n");
            break;
        }
        list_add_tail(&b->list, head);
        loaded++;
    }

    fclose(fp);
    return loaded;
}

/* Returns 0 on success, -1 on failure. */
static int library_save(struct list_head *head, const char *path)
{
    FILE *fp = fopen(path, "w");
    struct list_head *pos;

    if (fp == NULL) {
        perror(path);
        return -1;
    }

    fprintf(fp, "# id,year,title\n");
    list_for_each(pos, head) {
        struct book *b = container_of(pos, struct book, list);

        fprintf(fp, "%d,%d,%s\n", b->id, b->year, b->title);
    }

    if (fclose(fp) != 0) {                      /* buffered data is written here */
        perror(path);
        return -1;
    }
    return 0;
}

int main(int argc, char *argv[])
{
    struct list_head library;
    int n;

    if (argc != 3) {
        fprintf(stderr, "usage: %s INPUT OUTPUT\n", argv[0]);
        return EXIT_FAILURE;
    }

    list_init(&library);
    n = library_load(&library, argv[1]);
    if (n < 0)
        return EXIT_FAILURE;
    printf("loaded %d books from %s\n", n, argv[1]);
    print_all(&library);

    if (library_save(&library, argv[2]) != 0) {
        free_all(&library);
        return EXIT_FAILURE;
    }
    printf("saved to %s\n", argv[2]);

    free_all(&library);
    return 0;
}
