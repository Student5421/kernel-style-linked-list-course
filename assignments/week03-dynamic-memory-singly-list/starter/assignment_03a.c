#include <stdio.h>
#include <stdlib.h>

struct student {
    int id;
    char name[20];
    int score;
};

int main(void)
{
    struct student *student = NULL;
    (void)student;

    /* TODO:
     * 1. Create one student with malloc().
     * 2. Handle the case where malloc() fails.
     * 3. Store the student's information and print it.
     * 4. At the end, free() it.
     */

    return 0;
}
