#include <stdio.h>
#include <stdlib.h>

struct student {
    int id;
    char name[20];
    int score;
};

struct node {
    struct student data;
    struct node *next;
    struct node *prev;
};

/* TODO:
 * Write a circular doubly linked list that uses a sentinel head.
 *
 * Empty list:
 *     head.next == &head
 *     head.prev == &head
 */

int main(void)
{
    struct node head;

    head.next = &head;
    head.prev = &head;

    return 0;
}
