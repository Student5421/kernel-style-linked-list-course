# Instructor Tests

이 디렉터리는 교수자가 자동 채점용 테스트를 추가할 수 있는 공간입니다.

추천 테스트 순서:

1. Empty list
2. Add one student
3. Add multiple students
4. Duplicate ID
5. Search existing ID
6. Search missing ID
7. Delete first student
8. Delete middle student
9. Delete last student
10. Delete only student
11. Forward order
12. Reverse order
13. Count
14. Delete all
15. Add after delete-all
16. Invalid score
17. Invalid ID
18. Long name
19. malloc failure handling
20. Memory leak

자동 채점에서는 출력 문자열보다 자료구조 invariant와 return value를 함께 검사하는 것이 좋습니다.
