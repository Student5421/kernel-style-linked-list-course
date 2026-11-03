#include "student.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct student *student_create(int id, const char *name, int score)
{
    /* TODO:
     * Create a student with malloc(),
     * and store id, name, and score.
     * Initialize the list member too.
     *
     * Note: this function does NOT add the student to the list.
     */
    (void)id;
    (void)name;
    (void)score;
    return NULL;
}

struct student *student_find(struct list_head *head, int id)
{
    /* TODO:
     * Walk from head->next until you are back at head.
     * Get each student with container_of() and compare its ID.
     */
    (void)head;
    (void)id;
    return NULL;
}

int student_delete(struct list_head *head, int id)
{
    /* TODO:
     * student_find()
     * -> list_del()
     * -> free()
     * Do the steps in this order.
     */
    (void)head;
    (void)id;
    return -1;
}

void student_print(const struct student *student)
{
    /* TODO */
    (void)student;
}

void student_print_all(struct list_head *head)
{
    /* TODO:
     * Forward traversal
     * container_of()
     */
    (void)head;
}

void student_print_reverse(struct list_head *head)
{
    /* TODO:
     * Backward traversal
     * container_of()
     */
    (void)head;
}

int student_count(struct list_head *head)
{
    /* TODO */
    (void)head;
    return 0;
}

void student_free_all(struct list_head *head)
{
    /* TODO:
     * Remove and free() every student.
     * Afterwards, head must point to itself again.
     */
    (void)head;
}
