#include <stdio.h>

struct student {
    int id;
    char name[20];
    int score;
};

int main(void)
{
    struct student student = {0};
    (void)student;

    /* TODO:
     * 1. Store one student's information (or read it from input).
     * 2. Print the student's information.
     * 3. Add code that changes a value through a pointer.
     */

    return 0;
}
