#include <stdio.h>

struct student {
    int id;
    char name[20];
    int score;
};

#define STUDENT_ENROLLED (1u << 0)
#define STUDENT_HONORS   (1u << 1)
#define STUDENT_PAID     (1u << 2)

#define SQUARE(x) x * x

int is_valid_score(int score)
{
    /* TODO: Return 1 if score is between 0 and 100 (inclusive), else 0.
     * Careful: 0 <= score <= 100 does not mean what it looks like.
     */
    (void)score;
    return 0;
}

int is_passing(const struct student *s)
{
    /* TODO: Return 1 if s is not NULL and its score is 60 or more.
     * Check for NULL first, using the short-circuit of &&.
     */
    (void)s;
    return 0;
}

void print_flags(unsigned int flags)
{
    /* TODO: Use & to check each flag, and print the ones that are set. */
    (void)flags;
}

/* This function has 5 operator-precedence bugs.
 * Fix each line so that it does what its comment says,
 * and add a comment that explains what was wrong.
 */
void fix_me(struct student *s)
{
    int sum = 171;
    int count = 2;
    int *p = &s->score;
    unsigned int flags = STUDENT_ENROLLED;
    double average;

    /* Goal: print a message if the HONORS flag is NOT set. */
    if (flags & STUDENT_HONORS == 0)
        printf("not an honors student\n");

    /* Goal: check whether the score is 100. */
    if (s->score = 100)
        printf("perfect score\n");

    /* Goal: add 1 to the score that p points to. */
    *p++;

    /* Goal: compute the average, 85.5. */
    average = (double)(sum / count);
    printf("average = %.1f\n", average);

    /* Goal: print the square of (score - 50). */
    printf("square = %d\n", SQUARE(s->score - 50));
}

int main(void)
{
    struct student student = { .id = 1, .name = "Alice", .score = 85 };
    struct student *p = &student;
    struct student **pp = &p;
    unsigned int flags = 0;

    /* TODO:
     * 1. Test is_valid_score() with -1, 0, 100, and 101.
     * 2. Test is_passing() with &student and with NULL.
     * 3. Using only pp, add 5 to the score and print it.
     * 4. Set ENROLLED and PAID in flags, clear PAID, then call print_flags().
     * 5. Fix the bugs in fix_me().
     */
    fix_me(&student);

    (void)pp;
    (void)flags;
    return 0;
}
