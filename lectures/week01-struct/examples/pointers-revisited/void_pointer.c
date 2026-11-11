/*
 * Pointers Revisited, pp. 17-19: a void * stores an object address, not its type.
 * The enum is the caller's explicit promise about the actual pointed-to type.
 */
#include <stdio.h>

enum value_kind { VALUE_YEAR, VALUE_INITIAL, VALUE_TITLE, VALUE_TITLE_POINTER };

static void print_value(const void *object, enum value_kind kind)
{
    if (object == NULL) {
        puts("missing object");
        return;
    }

    switch (kind) {
    case VALUE_YEAR: {
        const int *year = object; /* object-pointer conversion is implicit in C */
        printf("year: %d\n", *year);
        break;
    }
    case VALUE_INITIAL:
        printf("initial: %c\n", *(const char *)object);
        break;
    case VALUE_TITLE:
        printf("title: %s\n", (const char *)object);
        break;
    case VALUE_TITLE_POINTER: {
        /* &title points to a pointer object, so recover that extra level. */
        const char *const *title_pointer = object;
        printf("title through pointer object: %s\n", *title_pointer);
        break;
    }
    }
}

int main(void)
{
    int year = 1978;
    char initial = 'C';
    const char *title = "The C Programming Language";
    void *generic = &year;
    int *recovered = generic;

    printf("round trip preserves address: %s\n",
           recovered == &year ? "yes" : "no");
    print_value(generic, VALUE_YEAR);
    print_value(&initial, VALUE_INITIAL);
    print_value(title, VALUE_TITLE);
    print_value(&title, VALUE_TITLE_POINTER);
    print_value(NULL, VALUE_YEAR);

    /* sizeof cannot identify a type: int and float may have the same size.
     * Do arithmetic on a correctly typed pointer, never on void * in C11.
     * A mismatched kind is a caller error; the pointer cannot detect it.
     */
    return 0;
}
