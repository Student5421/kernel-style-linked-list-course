# Grading

총점: **100점**

| 평가 항목 | 배점 |
|---|---:|
| Student 구조체 및 Dynamic Memory | 10 |
| `list_head` 및 List 기본 구현 | 10 |
| Circular Doubly Linked List | 20 |
| 삽입/삭제 정확성 | 15 |
| 검색/출력 기능 | 10 |
| `container_of()` | 15 |
| 예외 처리 | 5 |
| Memory Management | 5 |
| 코드 가독성 및 구조화 | 5 |
| README 및 설명 | 5 |
| **합계** | **100** |

## 주요 감점 예시

- 컴파일되지 않음
- Student 배열로 전체 데이터를 관리함
- 별도의 `struct node`를 사용함
- `list_del()`에서 Student를 직접 `free()`하도록 설계함
- `malloc()` 후 `free()`를 누락함
- `container_of()` 대신 별도 mapping table을 사용함
- Circular List의 `next`/`prev` invariant가 깨짐
