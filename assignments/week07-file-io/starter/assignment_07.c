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

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};

/* TODO: Copy in the list functions you wrote in Weeks 05-06. */
void list_init(struct list_head *head)
{
    (void)head;
}

void list_add_tail(struct list_head *new, struct list_head *head)
{
    (void)new;
    (void)head;
}

void list_del(struct list_head *entry)
{
    (void)entry;
}

struct student *student_create(int id, const char *name, int score)
{
    /* TODO: Create a student with malloc(), and initialize its list member too. */
    (void)id;
    (void)name;
    (void)score;
    return NULL;
}

/* File format: one student per line, "id name score" (e.g. 1 Alice 95).
 * Empty lines and lines that start with '#' are skipped.
 * Returns the number of students read, or -1 if the file cannot be opened.
 */
int student_load(struct list_head *head, const char *path)
{
    /* TODO:
     * 1. Open the file with fopen(). If that fails, call perror() and return -1.
     * 2. Read one line at a time with fgets(), then get id, name, score with sscanf().
     * 3. If a line has the wrong format, or a score outside 0-100,
     *    print it to stderr like "students.txt:5: invalid line" and skip it.
     * 4. For a good line, call student_create(), then list_add_tail().
     * 5. Call fclose().
     */
    (void)head;
    (void)path;
    return 0;
}

/* Saves in the same format. Returns 0 on success, -1 on failure. */
int student_save(struct list_head *head, const char *path)
{
    /* TODO: fopen(path, "w") -> fprintf() -> fclose() */
    (void)head;
    (void)path;
    return 0;
}

void student_print_all(struct list_head *head)
{
    /* TODO: Get each student with container_of() and print it. */
    (void)head;
}

void student_free_all(struct list_head *head)
{
    /* TODO: Remove every student with list_del(), then free() it. */
    (void)head;
}

int main(int argc, char *argv[])
{
    const char *in = argc > 1 ? argv[1] : "students.txt";
    const char *out = argc > 2 ? argv[2] : "students_out.txt";
    struct list_head head;
    int n;

    list_init(&head);

    n = student_load(&head, in);
    if (n < 0)
        return EXIT_FAILURE;
    printf("loaded %d students from %s\n", n, in);
    student_print_all(&head);

    if (student_save(&head, out) != 0) {
        student_free_all(&head);
        return EXIT_FAILURE;
    }
    printf("saved to %s\n", out);

    student_free_all(&head);
    return 0;
}
