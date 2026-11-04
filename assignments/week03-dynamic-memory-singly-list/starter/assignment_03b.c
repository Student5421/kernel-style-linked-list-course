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

/* TODO: Write Insert, Search, Delete, and Print. */

int main(void)
{
    struct node *head = NULL;

    (void)head;

    return 0;
}
