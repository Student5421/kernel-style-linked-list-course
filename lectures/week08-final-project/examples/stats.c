#include "stats.h"
#include <stdio.h>

void stats_init(struct stats *s)
{
    s->count = 0;
    s->sum = 0;
    s->min = 0;
    s->max = 0;
}

void stats_add(struct stats *s, int value)
{
    if (s->count == 0 || value < s->min)
        s->min = value;
    if (s->count == 0 || value > s->max)
        s->max = value;
    s->sum += value;
    s->count++;
}

void stats_print(const struct stats *s)
{
    printf("== %s ==\n", STATS_TITLE);
    if (s->count == 0) {
        printf("no values\n");
        return;
    }
    printf("count   : %d\n", s->count);
    printf("min/max : %d / %d\n", s->min, s->max);
    printf("average : %.2f\n", (double)s->sum / s->count);
}
