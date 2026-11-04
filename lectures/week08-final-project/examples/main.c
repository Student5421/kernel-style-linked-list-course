/*
 * Week 08 demo: a program split into main.c, stats.c, and stats.h.
 *
 *   make            compile each .c into a .o, then link
 *   make run        ./stats_demo < numbers.txt
 */
#include <stdio.h>
#include "stats.h"

int main(void)
{
    struct stats s;
    int value;

    stats_init(&s);
    while (scanf("%d", &value) == 1)
        stats_add(&s, value);
    stats_print(&s);
    return 0;
}
