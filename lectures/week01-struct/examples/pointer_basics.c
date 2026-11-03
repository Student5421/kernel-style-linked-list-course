/*
 * Week 01 demo: address-of (&), dereference (*), and NULL.
 */
#include <stdio.h>

int main(void)
{
    int x = 10;
    int *p = &x;
    int *q = NULL;

    printf("x  = %d\n", x);
    printf("&x = %p\n", (void *)&x);
    printf("p  = %p\n", (void *)p);
    printf("*p = %d\n", *p);

    /* writing through the pointer changes x */
    *p = 20;
    printf("after *p = 20, x = %d\n", x);

    /* NULL means "points nowhere": never dereference it */
    if (q == NULL)
        printf("q is NULL\n");

    return 0;
}
