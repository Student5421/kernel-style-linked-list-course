#include <stdio.h>
#include "student.h"

static void print_menu(void)
{
    printf("\n===== Student Management System =====\n");
    printf("1. Add Student\n");
    printf("2. Delete Student\n");
    printf("3. Search Student\n");
    printf("4. Print Students (Forward)\n");
    printf("5. Print Students (Backward)\n");
    printf("6. Student Count\n");
    printf("7. Exit\n");
    printf("Select: ");
}

int main(void)
{
    struct list_head head;
    int choice;

    list_init(&head);

    while (1) {
        print_menu();

        if (scanf("%d", &choice) != 1) {
            printf("Error: Invalid input.\n");
            break;
        }

        switch (choice) {
        case 1:
            /* TODO: Add Student */
            break;

        case 2:
            /* TODO: Delete Student */
            break;

        case 3:
            /* TODO: Search Student */
            break;

        case 4:
            student_print_all(&head);
            break;

        case 5:
            student_print_reverse(&head);
            break;

        case 6:
            printf("Student count: %d\n", student_count(&head));
            break;

        case 7:
            student_free_all(&head);
            return 0;

        default:
            printf("Error: Invalid menu selection.\n");
            break;
        }
    }

    student_free_all(&head);
    return 0;
}
