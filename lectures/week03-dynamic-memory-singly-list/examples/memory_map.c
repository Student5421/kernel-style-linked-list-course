/*
 * Week 03 demo: where do variables live?
 * Prints one address from each memory region.
 */
#include <stdio.h>
#include <stdlib.h>

int global_counter = 1;            /* data segment (initialized global) */
int global_zero;                   /* bss segment (zero-initialized)    */

static void show_stack_frame(int depth)
{
    int local = depth;             /* stack: a new copy per call */

    printf("  depth %d: &local = %p\n", depth, (void *)&local);
    if (depth < 3)
        show_stack_frame(depth + 1);
}

int main(void)
{
    static int static_local = 2;   /* data segment, even though it is inside main */
    int local = 3;                 /* stack */
    int *heap = malloc(sizeof(*heap));

    if (heap == NULL) {
        fprintf(stderr, "Error: out of memory\n");
        return EXIT_FAILURE;
    }
    *heap = 4;

    printf("data  : &global_counter = %p\n", (void *)&global_counter);
    printf("bss   : &global_zero    = %p\n", (void *)&global_zero);
    printf("data  : &static_local   = %p\n", (void *)&static_local);
    printf("heap  : heap            = %p\n", (void *)heap);
    printf("stack : &local          = %p\n", (void *)&local);
    printf("stack : &heap           = %p   (the pointer itself is on the stack)\n",
           (void *)&heap);

    printf("each call gets its own stack frame:\n");
    show_stack_frame(1);

    free(heap);
    return 0;
}
