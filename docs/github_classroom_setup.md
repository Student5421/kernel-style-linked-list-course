# GitHub Classroom 운영 권장안

## Repository 구성

### 1. 수업 자료 Repository

```text
kernel-style-linked-list-course
```

학생에게 Read 권한으로 제공합니다.

### 2. 과제별 Assignment

가능하면 GitHub Classroom에서 주차별 Assignment를 별도로 생성합니다.

예:

```text
Week 03 - Singly Linked List
Week 04 - Doubly Linked List
Week 05 - Circular Doubly Linked List
...
Week 08 - Final Project
```

최종 프로젝트에서는 starter repository를 Assignment template으로 사용합니다.

## 최종 제출

학생이 생성한 repository의 기본 branch를 제출 대상으로 합니다.

권장 제출 마감 시점에는 commit을 추가로 받지 않도록 안내하고,
필요하다면 Classroom의 deadline 기능을 사용합니다.

## 교수자 Repository와 학생 Repository 분리

수업 자료에는 완성 답안을 넣지 않는 것을 권장합니다.

```text
Course Repository
    └── starter code

Student Repository
    └── student's implementation
```

교수자만 보유하는 별도의 private repository에 reference solution과
자동 채점 코드를 보관하는 것이 좋습니다.
