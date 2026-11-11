/* Strings, pp. 3-14, 16-20, 28-32: characters, strings, arrays, and pointers. */
#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *literal = "C Programming";
    char title[] = "C Programming"; /* independent, writable character array */
    char spare[24] = "C Programming";
    char not_a_string[3] = { 'C', '1', '1' };
    char shelves[][8] = { "C", "Linux", "Systems" };
    const char *labels[] = { "C", "Linux", "Operating Systems" };

    printf("title: length=%zu, array bytes=%zu\n", strlen(title), sizeof title);
    printf("spare: length=%zu, capacity=%zu\n", strlen(spare), sizeof spare);
    printf("literal pointer bytes=%zu, literal array bytes=%zu\n",
           sizeof literal, sizeof "C Programming");
    printf("sizeof 'C'=%zu (int), sizeof \"C\"=%zu (includes null)\n",
           sizeof 'C', sizeof "C");

    title[0] = 'c';
    printf("writable title: %s; literal: %s\n", title, literal);
    printf("suffix: %s; first character: %c\n", title + 2, title[0]);
    printf("bounded non-string output: %.*s\n", (int)sizeof not_a_string,
           not_a_string); /* precision prevents reading past these 3 bytes */
    printf("field width/precision: |%10.5s|\n", literal);

    shelves[0][0] = 'c';
    for (size_t i = 0; i < sizeof shelves / sizeof shelves[0]; ++i)
        printf("shelf[%zu]=%s; label[%zu]=%s\n", i, shelves[i], i, labels[i]);
    printf("fixed row bytes=%zu; pointer-table bytes=%zu\n",
           sizeof shelves[0], sizeof labels);
    /* Never write through literal or labels[i]. Their string literals are
     * not writable, regardless of where an implementation stores them.
     * A char array without a null terminator is not a C string.
     */
    return 0;
}
