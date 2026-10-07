# Grading

총점: 100점

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

- 컴파일되지 않음: 구현 정도에 따라 큰 폭 감점
- Student 배열을 사용하여 전체 데이터를 관리: 핵심 요구사항 위반
- 별도의 `struct node` 사용: 핵심 요구사항 위반
- `list_del()`에서 Student를 직접 `free()`하도록 설계: API 책임 분리 위반
- `malloc()` 후 `free()` 누락: Memory Management 감점
- `container_of()` 대신 별도 mapping table 사용: 핵심 요구사항 위반
- Circular invariant가 깨짐: Circular List 항목 감점
