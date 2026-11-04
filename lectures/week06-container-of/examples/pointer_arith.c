/*
 * Week 06 demo: adding 1 to a pointer moves it by the size of the type it points to.
 */
#include <stdio.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

int main(void)
{
    int numbers[3] = { 10, 20, 30 };
    int *ip = numbers;
    char *cp = (char *)numbers;
    struct list_head pair[2];
    struct list_head *lp = pair;

    printf("ip     = %p\n", (void *)ip);
    printf("ip + 1 = %p   (+%zu bytes: sizeof(int))\n", (void *)(ip + 1), sizeof(int));
    printf("cp + 1 = %p   (+1 byte: sizeof(char) is always 1)\n", (void *)(cp + 1));
    printf("*(ip + 2) = %d, ip[2] = %d\n", *(ip + 2), ip[2]);

    printf("lp              = %p\n", (void *)lp);
    printf("(char *)(lp + 1) = %p   (+%zu bytes)\n",
           (void *)((char *)(lp + 1)), sizeof(struct list_head));
    printf("(char *)lp + 1   = %p   (+1 byte: parentheses matter!)\n",
           (void *)((char *)lp + 1));

    printf("(char *)&numbers[2] - (char *)&numbers[0] = %td bytes\n",
           (char *)&numbers[2] - (char *)&numbers[0]);
    printf("&numbers[2] - &numbers[0]                 = %td elements\n",
           &numbers[2] - &numbers[0]);
    return 0;
}
