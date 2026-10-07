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
 * Sentinel HEAD를 이용한 Circular Doubly Linked List를 구현하세요.
 *
 * 빈 리스트:
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
