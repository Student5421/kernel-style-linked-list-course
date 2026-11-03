# Grading

Total: **100 points**

| Item | Points |
|---|---:|
| Student struct and dynamic memory | 10 |
| `list_head` and basic list operations | 10 |
| Circular doubly linked list | 20 |
| Correct insert and delete | 15 |
| Search and print features | 10 |
| `container_of()` | 15 |
| Error handling | 5 |
| Memory management | 5 |
| Code readability and structure | 5 |
| README and explanations | 5 |
| **Total** | **100** |

## Common Deductions

- The program does not compile.
- All students are stored in an array.
- A separate `struct node` is used.
- `list_del()` is designed to `free()` the student itself.
- A `free()` is missing after `malloc()`.
- A mapping table is used instead of `container_of()`.
- The `next`/`prev` invariant of the circular list is broken.
