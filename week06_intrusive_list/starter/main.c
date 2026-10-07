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
 * 별도의 struct node를 사용하지 않고
 * struct student 내부의 list member를 이용해
 * Circular Doubly Linked List를 구현하세요.
 */

int main(void)
{
    struct list_head head;

    head.next = &head;
    head.prev = &head;

    return 0;
}
