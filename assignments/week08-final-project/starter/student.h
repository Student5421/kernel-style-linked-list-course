#ifndef STUDENT_H
#define STUDENT_H

#include "list.h"

struct student {
    int id;
    char name[20];
    int score;
    struct list_head list;
};

struct student *student_create(int id, const char *name, int score);
struct student *student_find(struct list_head *head, int id);
int student_delete(struct list_head *head, int id);
void student_print(const struct student *student);
void student_print_all(struct list_head *head);
void student_print_reverse(struct list_head *head);
int student_count(struct list_head *head);
void student_free_all(struct list_head *head);

#endif
