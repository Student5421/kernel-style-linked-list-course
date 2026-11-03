#include <stdio.h>
#include <stdlib.h>

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

/* TODO:
 * Do not add a separate struct node.
 * Use the list member inside struct student
 * to build a circular doubly linked list.
 */

int main(void)
{
    struct list_head head;

    head.next = &head;
    head.prev = &head;

    return 0;
}
