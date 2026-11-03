#ifndef STATS_H
#define STATS_H

#define STATS_TITLE "Score statistics"

struct stats {
    int count;
    int sum;
    int min;
    int max;
};

void stats_init(struct stats *s);
void stats_add(struct stats *s, int value);
void stats_print(const struct stats *s);

#endif
