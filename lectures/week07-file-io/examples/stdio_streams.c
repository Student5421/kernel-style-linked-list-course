/*
 * Week 07 demo: the three standard streams.
 *
 *   ./stdio_streams                 both lines appear on the terminal
 *   ./stdio_streams > out.txt       only the stderr line stays on the terminal
 *   ./stdio_streams 2> err.txt      only the stdout line stays on the terminal
 */
#include <stdio.h>

int main(void)
{
    printf("normal output goes to stdout\n");         /* same as fprintf(stdout, ...) */
    fprintf(stderr, "error messages go to stderr\n");
    return 0;
}
