/*
 * Week 02 demo: reading expressions that mix *, &, ., ->, [], and ++.
 */
#include <stdio.h>

struct book {
    int id;
    char title[32];
    int year;
};

int main(void)
{
    struct book b = { 1, "Operating Systems", 2010 };
    struct book *p = &b;
    struct book **pp = &p;
    int years[3] = { 1978, 2005, 2010 };
    int *q = years;
    int first;

    printf("p->year     = %d\n", p->year);          /* (*p).year            */
    printf("*p->title   = '%c'\n", *p->title);      /* *(p->title)          */
    printf("p->title[1] = '%c'\n", p->title[1]);    /* (p->title)[1]        */
    printf("(*pp)->year = %d\n", (*pp)->year);      /* follow pp, then ->   */
    printf("&p->year == &b.year ? %s\n",            /* &(p->year)           */
           &p->year == &b.year ? "yes" : "no");

    p->year++;                                      /* (p->year)++          */
    ++p->year;                                      /* ++(p->year)          */
    printf("after p->year++ and ++p->year: %d\n", b.year);

    first = *q++;                                   /* *(q++): read, then move q */
    printf("first = %d, q now points to years[%td]\n", first, q - years);
    (*q)++;                                         /* change the value     */
    ++*q;                                           /* ++(*q)               */
    printf("years = %d %d %d\n", years[0], years[1], years[2]);
    return 0;
}
