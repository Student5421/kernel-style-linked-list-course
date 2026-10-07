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
};

/* TODO: Insert, Search, Delete, Print를 구현하세요. */

int main(void)
{
    struct node *head = NULL;

    (void)head;

    return 0;
}
