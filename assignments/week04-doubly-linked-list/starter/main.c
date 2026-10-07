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
 * Doubly Linked List의 Insert, Delete,
 * Forward Print, Backward Print를 구현하세요.
 */

int main(void)
{
    struct node *head = NULL;

    (void)head;

    return 0;
}
