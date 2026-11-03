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
 * Write Insert and Delete for a doubly linked list,
 * plus Forward Print and Backward Print.
 */

int main(void)
{
    struct node *head = NULL;

    (void)head;

    return 0;
}
