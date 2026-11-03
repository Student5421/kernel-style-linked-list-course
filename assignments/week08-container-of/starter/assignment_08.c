#include <stdio.h>
#include <stddef.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

int main(void)
{
    struct student student = {
        .id = 1,
        .score = 90
    };

    struct list_head *list = &student.list;

    /* TODO:
     * Get the original student pointer from the list pointer,
     * then print id and score.
     */

    (void)list;

    return 0;
}
