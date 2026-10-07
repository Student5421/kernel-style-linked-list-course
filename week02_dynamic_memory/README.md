# Week 02 — Dynamic Memory

## 목표

- `malloc()`과 `free()`를 사용한다.
- Stack과 Heap의 차이를 이해한다.
- Dynamic Memory의 lifetime을 관리한다.

## 과제

Student를 Heap에 동적으로 생성하고 해제하세요.

## 요구사항

- `malloc()`으로 `struct student` 공간을 확보합니다.
- 생성된 Student에 정보를 저장합니다.
- 사용 후 반드시 `free()`합니다.
- `malloc()` 실패를 처리합니다.

## 체크

다음 질문에 답할 수 있어야 합니다.

- `malloc(sizeof(struct student))`의 반환값은 무엇인가?
- `free()` 이후 pointer를 계속 사용하면 왜 문제가 되는가?
- Memory leak은 무엇인가?
