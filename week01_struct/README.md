# Week 01 — Struct와 Student

## 목표

- `struct`를 이용해 Student 자료형을 정의한다.
- 구조체 변수와 pointer를 이해한다.
- 함수에 구조체를 전달하고 수정한다.

## 과제

`starter/main.c`를 완성하여 Student 한 명의 정보를 생성하고 출력하세요.

Student는 다음 정보를 가집니다.

```c
int id;
char name[20];
int score;
```

## 요구사항

1. `struct student`를 정의합니다.
2. Student를 생성합니다.
3. ID, name, score를 저장합니다.
4. Student 정보를 출력합니다.
5. pointer를 이용해 Student의 값을 수정하는 함수를 최소 1개 구현합니다.

## 학습 질문

- `student.id`와 `student_ptr->id`의 차이는 무엇인가?
- 구조체를 함수에 pointer로 전달하면 어떤 장점이 있는가?
