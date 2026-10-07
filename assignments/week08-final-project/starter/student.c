#include "student.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct student *student_create(int id, const char *name, int score)
{
    /* TODO:
     * malloc()으로 Student를 생성하고
     * id, name, score를 저장하세요.
     * list member도 초기화하세요.
     *
     * 주의: 이 함수는 List에 삽입하지 않습니다.
     */
    (void)id;
    (void)name;
    (void)score;
    return NULL;
}

struct student *student_find(struct list_head *head, int id)
{
    /* TODO:
     * head->next부터 head가 나올 때까지 순회하면서
     * container_of()로 Student를 얻어 ID를 비교하세요.
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
     * 순서로 구현하세요.
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
     * 모든 Student를 제거하고 free하세요.
     * 종료 후 head는 다시 자기 자신을 가리켜야 합니다.
     */
    (void)head;
}
