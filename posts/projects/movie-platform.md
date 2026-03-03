---
title: "영화 리뷰 및 추천 웹 서비스 개발"
summary: "리뷰 감정분석 연동과 API 안정화 중심의 영화 추천 백엔드 프로젝트"
project_title: "Inside Movie / 인사이드 무비"
github_link: "https://github.com/AutoeverInsideMovie"
sources:
  - label: "프로젝트 데모 모노레포"
    url: "https://github.com/Gumraze-git/Insidemovie"
  - label: "프로젝트 조직 레포지토리"
    url: "https://github.com/AutoeverInsideMovie"
date: "2025-07-30"
thumbnail: "/devlog-placeholder.svg"
stack:
  - Spring Boot
  - Spring Security
  - JPA (Hibernate)
  - FastAPI
  - MySQL
  - Swagger/OpenAPI
  - OAuth
period: "2025.06 - 2025.07"
members: "프론트엔드 / 백엔드"
role: "백엔드 개발, 데이터 모델링, 외부 API/AI 연동"
published: true
education: "현대오토에버 SW 스쿨 2기"
---

# 1. 프로젝트 개요 및 목표

**인사이드 무비**는 **사용자들의 리뷰 텍스트를 AI를 이용하여 감정 분석**하고,
이를 기반으로 영화를 추천해 주는 **커뮤니티 서비스**입니다.

| 기술적 배경 및 달성 목표

**SOILD 원칙 준수**를 통한 유지보수하기 용이한 객체지향적 설계와 **안정적인 시스템 구동**에 목표를 둔 프로젝트입니다.

*   **SRP, 역할 분리를 통한 병목 방지:** 리뷰 텍스트를 감정 수치로 변환하기 위해 AI 모델(KoBERT) 연동이 필요했습니다. AI 모듈의 무거운 추론 리소스 소모가 메인 트래픽에 영향을 주지 않도록, **메인 도메인 서버(Spring Boot)와 AI 추론 서버(FastAPI)를 분리**하여 아키텍처를 구성했습니다.
*   **OCP/DIP, 유연한 외부 연동:** KOBIS, KMDb 등 외부 영화 데이터 API 통신망과 Kakao OAuth 등 외부 의존성이 높은 연동 계층을 인터페이스로 추상화했습니다. 향후 다른 외부 서비스로 교체되더라도 핵심 비즈니스 로직의 변경을 최소화하도록 설계했습니다.
*   **분산 환경에서의 안정성 확보:** 두 개의 서버로 분리되면서 `리뷰 작성 -> 감정분석(FastAPI) -> 추천 반영`으로 이어지는 핵심 흐름이 네트워크 장애나 응답 지연에도 훼손되지 않아야 했습니다. 이를 위해 일관된 예외 처리와 데이터 정합성 보장에 집중했습니다.

| 역할 및 기여
*   **백엔드 API 설계 및 구현:** 리뷰, 영화 정보, 공통 응답 처리 등 서비스 핵심 도메인의 백엔드 API 시스템을 구축했습니다.
*   **AI 모델링 및 연동망 구축:** 텍스트 감정 분석을 위한 AI 모델(KoBERT)을 설계하고, AI 추론 서버(FastAPI)와 메인 서버 간의 내부 통신망을 구축했습니다.
*   **데이터 모델링:** JPA 기반 영화, 회원, 리뷰 엔티티 간의 관계 매핑 및 데이터 정합성을 고려한 RDBMS 스키마를 설계했습니다.
*   **외부 연동망 구축:** 외부 영화 데이터(KOBIS, KMDb), OAuth(Kakao) 인증 시스템 연동을 담당했습니다.

- - -
# 2. 시스템 아키텍처

## 2.1 시스템 컨텍스트
```mermaid
flowchart LR
  FrontendDev["Frontend Developer"]
  Client["Client"] -- "화면 요청" --> FE["Frontend<br/>(React / Vite)"]
  FE -- "서비스 API 요청" --> BE["Spring Boot Backend"]
  FrontendDev -. "API 문서 조회" .-> Swagger["Swagger UI"]

  BE -- "감정 분석/추천 요청" --> AI["FastAPI AI Server"]
  BE -- "도메인 데이터 CRUD" --> DBBackend[("MySQL<br/>insidemovie_backend")]
  AI -- "영화 감정 요약 조회(Read)" --> DBAI[("MySQL<br/>insidemovie_ai")]
  AI -- "모델 로드/추론" --> Model["KoBERT Model"]

  BE -- "외부 API 연동" --> External["External APIs"]
  External -- "소셜 로그인 인증" --> Kakao["Kakao OAuth"]
  External -- "박스오피스 조회" --> KOBIS["KOBIS API"]
  External -- "영화 메타데이터 조회" --> KMDb["KMDb API"]
  External -- "인증 메일 발송" --> SMTP["SMTP"]

  class Client,FrontendDev actor
  class FE frontend
  class BE spring
  class AI ai
  class Swagger docs
  class DBBackend,DBAI data
  class Model model
  class External,Kakao,KOBIS,KMDb,SMTP external

  classDef actor fill:#eef2ff,stroke:#6366f1,color:#0f172a,stroke-width:1px
  classDef frontend fill:#ecfeff,stroke:#0891b2,color:#0f172a,stroke-width:1px
  classDef spring fill:#f0fdf4,stroke:#16a34a,color:#0f172a,stroke-width:1px
  classDef ai fill:#fff7ed,stroke:#f97316,color:#0f172a,stroke-width:1px
  classDef docs fill:#f8fafc,stroke:#64748b,color:#0f172a,stroke-width:1px
  classDef data fill:#eff6ff,stroke:#2563eb,color:#0f172a,stroke-width:1px
  classDef model fill:#fef9c3,stroke:#ca8a04,color:#0f172a,stroke-width:1px
  classDef external fill:#fff1f2,stroke:#e11d48,color:#0f172a,stroke-width:1px
```

## 2.2 Spring Boot 내부 구조
```mermaid
flowchart LR
  subgraph C["Controller Layer"]
    C_Auth["Auth / Member"]
    C_Movie["Movie"]
    C_Review["Review"]
    C_Report["Report"]
    C_Match["Match"]
    C_Recommend["Recommend"]
  end

  subgraph S["Service Layer"]
    S_Auth["Auth/Member Service"]
    S_Movie["Movie Service"]
    S_Review["Review Service"]
    S_Report["Report Service"]
    S_Match["Match Service"]
    S_Recommend["Recommendation Service"]
  end

  subgraph I["Integration Layer"]
    I_AI["AI Client"]
    I_OAuth["OAuth Client"]
    I_MovieAPI["Movie API Client"]
    I_Mail["Mail Sender"]
  end

  subgraph P["Persistence Layer"]
    P_Member["Member Repo"]
    P_Movie["Movie Repo"]
    P_Review["Review Repo"]
    P_Report["Report Repo"]
    P_Match["Match/Vote Repo"]
  end

  DB[("MySQL<br/>insidemovie_backend")]

  C_Auth -- "인증·회원 요청" --> S_Auth
  C_Movie -- "영화/박스오피스 요청" --> S_Movie
  C_Review -- "리뷰 CRUD 요청" --> S_Review
  C_Report -- "신고 요청" --> S_Report
  C_Match -- "매치/투표 요청" --> S_Match
  C_Recommend -- "추천 요청" --> S_Recommend

  S_Auth -- "회원 조회/저장" --> P_Member
  S_Auth -- "카카오 인증 연동" --> I_OAuth
  S_Auth -- "인증 메일 발송" --> I_Mail
  S_Movie -- "영화 데이터 조회" --> P_Movie
  S_Movie -- "외부 영화 API 조회" --> I_MovieAPI
  S_Review -- "리뷰/감정 저장" --> P_Review
  S_Review -- "감정 분석 요청" --> I_AI
  S_Report -- "신고 저장" --> P_Report
  S_Report -- "대상 리뷰 조회" --> P_Review
  S_Match -- "매치/투표 저장" --> P_Match
  S_Match -- "매치 후보 조회" --> P_Movie
  S_Match -- "평점 집계 조회" --> P_Review
  S_Recommend -- "추천 대상 조회" --> P_Movie
  S_Recommend -- "리뷰 통계 조회" --> P_Review
  S_Recommend -- "추천 계산 요청" --> I_AI

  P_Member -- "JPA" --> DB
  P_Movie -- "JPA" --> DB
  P_Review -- "JPA" --> DB
  P_Report -- "JPA" --> DB
  P_Match -- "JPA" --> DB

  class C_Auth,C_Movie,C_Review,C_Report,C_Match,C_Recommend controller
  class S_Auth,S_Movie,S_Review,S_Report,S_Match,S_Recommend service
  class I_AI,I_OAuth,I_MovieAPI,I_Mail integration
  class P_Member,P_Movie,P_Review,P_Report,P_Match repo
  class DB data

  classDef controller fill:#ecfeff,stroke:#0891b2,color:#0f172a,stroke-width:1px
  classDef service fill:#f0fdf4,stroke:#16a34a,color:#0f172a,stroke-width:1px
  classDef integration fill:#fff7ed,stroke:#f97316,color:#0f172a,stroke-width:1px
  classDef repo fill:#f8fafc,stroke:#64748b,color:#0f172a,stroke-width:1px
  classDef data fill:#eff6ff,stroke:#2563eb,color:#0f172a,stroke-width:1px

  style C fill:#f8fafc,stroke:#38bdf8,stroke-dasharray: 4 3
  style S fill:#f8fafc,stroke:#4ade80,stroke-dasharray: 4 3
  style I fill:#f8fafc,stroke:#fb923c,stroke-dasharray: 4 3
  style P fill:#f8fafc,stroke:#94a3b8,stroke-dasharray: 4 3
```

## 2.3 FastAPI 내부 구조
```mermaid
flowchart LR
  subgraph API["API Router Layer"]
    A_Emotion["Emotion Prediction Router"]
    A_Recommend["Movie Recommendation Router"]
  end

  subgraph APP["Application Service Layer"]
    S_Emotion["EmotionPredictionService"]
    S_Recommend["MovieRecommendationService"]
  end

  subgraph INFRA["Infrastructure Layer"]
    Repo["Movie Emotion Summary Repository"]
    Predictor["KoBERT Predictor"]
  end

  DBAI[("MySQL<br/>insidemovie_ai")]
  Model["KoBERT .safetensors"]

  A_Emotion -- "예측 입력 전달" --> S_Emotion
  A_Recommend -- "추천 입력 전달" --> S_Recommend
  S_Emotion -- "텍스트 추론 요청" --> Predictor
  S_Recommend -- "감정 벡터 조회" --> Repo
  Repo -- "요약 데이터 조회(Read)" --> DBAI
  Predictor -- "모델 로드/추론" --> Model

  class A_Emotion,A_Recommend api
  class S_Emotion,S_Recommend appsvc
  class Repo,Predictor infra
  class DBAI data
  class Model model

  classDef api fill:#ecfeff,stroke:#0891b2,color:#0f172a,stroke-width:1px
  classDef appsvc fill:#f0fdf4,stroke:#16a34a,color:#0f172a,stroke-width:1px
  classDef infra fill:#fff7ed,stroke:#f97316,color:#0f172a,stroke-width:1px
  classDef data fill:#eff6ff,stroke:#2563eb,color:#0f172a,stroke-width:1px
  classDef model fill:#fef9c3,stroke:#ca8a04,color:#0f172a,stroke-width:1px

  style API fill:#f8fafc,stroke:#38bdf8,stroke-dasharray: 4 3
  style APP fill:#f8fafc,stroke:#4ade80,stroke-dasharray: 4 3
  style INFRA fill:#f8fafc,stroke:#fb923c,stroke-dasharray: 4 3
```

## 2.4 요청 흐름 (핵심 시나리오)
`리뷰 작성 -> ReviewService -> 감정 분석 연동 -> Emotion 저장 -> MovieEmotionSummary 재계산/저장 -> AI 추천 시 요약 조회`

## 2.5 Multi-Schema 실제 구성 (Insidemovie-monorepo 기준)
- MySQL 초기화 SQL에서 두 스키마를 생성합니다.
  - `insidemovie_backend`
  - `insidemovie_ai`
- Backend(Spring Boot)는 `insidemovie_backend`를 사용합니다.
  - `application-prod.yml`: `${BACKEND_DB_NAME:insidemovie_backend}`
- AI(FastAPI)는 `insidemovie_ai`를 사용합니다.
  - `docker-compose.yml`: `DATABASE_URL=.../insidemovie_ai`
- 역할 분리는 아래와 같습니다.
  - Backend(Spring Boot): 리뷰 감정(`emotion`) 기반으로 `movie_emotion_summary`/`member_emotion_summary` 계산 및 저장(업서트) 담당
  - AI(FastAPI): 추천 계산 시 `movie_emotion_summary` 조회(Read) 담당
- 확인한 근거 파일:
  - `docker/mysql/initdb/01-create-databases.sql`
  - `docker-compose.yml`
  - `apps/backend/src/main/resources/application-prod.yml`
  - `apps/backend/src/main/java/com/insidemovie/backend/api/movie/service/MovieEmotionSummaryService.java`
  - `apps/ai/infrastructure/repositories/movie_emotion_summary_repository.py`

- - -
# 3. 핵심 트러블슈팅 Top3 (프로젝트 기간 중)

~~~troubleshooting
제목: 3.1 인증/접근 제어 정합성

문제:
공개 조회 API와 인증 필요 API 경계가 일관되지 않아 비인증 조회에서 401/403 오동작이 발생했습니다.

원인:
보안 경로 정책과 토큰 검증 로직이 분산되어 실제 공개해야 할 경로가 누락되었습니다.

해결:
공개 GET 경로를 상수로 분리하고 `boxoffice` 경로를 명시적으로 permitAll 처리했습니다. 또한 JWT null/blank 검증을 선행해 인증 필터 동작을 단순화했습니다.

**Code Evidence**
```java
private static final String[] PUBLIC_GET_ENDPOINTS = {
    "/api/v1/movies/search/**",
    "/api/v1/movies/popular",
    "/api/v1/boxoffice/**"
};

.requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll();

public boolean validateToken(String token) {
    if (token == null || token.isBlank()) return false;
    // parse + validate
}
```

**Commit Evidence**
- `1eb2561` (boxoffice endpoint 정합화)
- `236db2a` (boxoffice 공개 경로 반영)
- `346f551` (JWT 검증 구조 개선)

결과:
**Verification**
- 비인증 사용자로 `GET /api/v1/boxoffice/**` 호출 시 정상 조회
- 인증 필요 엔드포인트는 기존대로 401/403 보안 정책 유지

**Recurrence Prevention**
- 공개 API 추가 시 `PUBLIC_GET_ENDPOINTS`/`PUBLIC_POST_ENDPOINTS`에 먼저 반영
- 보안 정책 변경 시 공개/보호 엔드포인트를 체크리스트로 리뷰
~~~

~~~troubleshooting
제목: 3.2 외부 연동 실패 대응 (FastAPI 감정분석)

문제:
리뷰 저장 흐름에서 FastAPI 호출 실패가 발생하면 서비스 응답이 불안정해졌습니다.

원인:
외부 연동 실패를 도메인 예외로 표준화하지 않아 실패 케이스 처리 일관성이 낮았습니다.

해결:
FastAPI 응답 null/호출 예외를 `ExternalServiceException`으로 통일해 상위 계층에서 동일한 예외 계약으로 처리하도록 정리했습니다.

**Code Evidence**
```java
try {
    PredictResponseDTO response = fastApiRestClient.post()
        .uri("/api/v1/emotion-predictions")
        .body(request)
        .retrieve()
        .body(PredictResponseDTO.class);

    if (response == null || response.getProbabilities() == null) {
        throw new ExternalServiceException(ErrorStatus.EXTERNAL_SERVICE_ERROR.getMessage());
    }
} catch (RestClientException e) {
    throw new ExternalServiceException(ErrorStatus.EXTERNAL_SERVICE_ERROR.getMessage());
}
```

**Commit Evidence**
- `efc1427` (리뷰 작성 시 감정분석 연동 + 실패 처리)
- `6c8bdef` (외부 서비스 예외 타입 추가)

결과:
**Verification**
- FastAPI 비정상 응답/네트워크 실패 상황에서 예외 코드 일관성 확인
- 리뷰 작성/수정 API에서 동일한 실패 응답 포맷 유지 확인

**Recurrence Prevention**
- 외부 시스템 연동 시 `null 응답 + 클라이언트 예외`를 기본 실패 템플릿으로 강제
- 신규 외부 연동 API는 동일한 도메인 예외 타입 사용
~~~

~~~troubleshooting
제목: 3.3 감정 데이터 정합성 (입력 범위 + 대표감정 계산)

문제:
감정 입력 스케일과 요약 계산 로직 불일치로 대표 감정 결과가 왜곡될 수 있었습니다.

원인:
입력 DTO 검증 범위와 실제 전달 데이터 스케일이 달랐고, 요약 재계산 시 대표 감정 계산 시점이 일관되지 않았습니다.

해결:
감정 입력 검증을 `0~100`으로 정합화하고, 요약 재계산 단계에서 대표 감정을 명시적으로 계산 후 반영하도록 변경했습니다.

**Code Evidence**
```java
@NotNull @Min(0) @Max(100)
private Float joy;

EmotionAvgDTO avgDto = emotionRepository.findAverageEmotionsByMovieId(movieId)
    .orElseGet(() -> EmotionAvgDTO.builder().joy(0.0).sadness(0.0)
        .anger(0.0).fear(0.0).disgust(0.0).repEmotionType(EmotionType.NONE).build());

EmotionType rep = movieService.calculateRepEmotion(avgDto);
avgDto.setRepEmotionType(rep);
summary.updateFromDTO(avgDto);
```

**Commit Evidence**
- `53aeac7` (감정 DTO 범위 0~100)
- `ff72cbc` (대표 감정 계산 오류 개선)

결과:
**Verification**
- 감정 입력값 100 초과 시 검증 실패 확인
- 리뷰 등록/수정 후 대표 감정 필드가 재계산되어 반영되는지 확인

**Recurrence Prevention**
- 감정 도메인 입력/응답 스케일을 API 계약에 고정
- 집계 로직 변경 시 대표 감정 계산 테스트 케이스를 필수화
~~~

- - -
# 4. ERD
| ERD 이미지

`[프로젝트 종료 시점 ERD 이미지 첨부 예정]`

| 설명 초안
- 핵심 엔티티 관계는 `Member - Review - Movie`를 중심으로 구성했습니다.
- `MemberEmotionSummary`, `MovieEmotionSummary`는 집계/추천용 읽기 모델 역할입니다.
- 리뷰-감정은 1:1 제약으로 중복 감정 저장을 방지했습니다.
- 쓰기 모델과 요약 모델을 분리해 추천 조회 계산 비용을 줄이도록 설계했습니다.

- - -
# 5. 프로젝트 평가 및 개선
## 5.1 모노레포/실행 재현성
- 개선 전: 서비스별 실행/설정 경로가 분산되어 온보딩 비용이 높았습니다.
- 개선 후: `docker-compose`, `make` 기반으로 프론트/백엔드/AI 통합 실행 경로를 표준화했습니다.
- 관련 이력: `5b3edfb`, `47a8b1d`, `1359d00`

## 5.2 REST/ProblemDetail 정합화
- 개선 전: 도메인별 엔드포인트/오류 응답 포맷 차이로 계약 관리가 어려웠습니다.
- 개선 후: `/api/v1` REST 경로와 ProblemDetail 오류 응답을 백엔드/AI에서 정합화했습니다.
- 관련 이력: `3d8225f`, `70ba945`, `933fbba`

## 5.3 Swagger 계약 고도화
- 개선 전: 구현과 문서의 동기화가 늦어 협업 시 해석 차이가 있었습니다.
- 개선 후: Swagger/OpenAPI를 최신 계약(`userId`, `users`) 기준으로 정비했습니다.
- 관련 이력: `4e4aea2`, `9938488`

- - -
# 6. 회고
```reflection
이번 프로젝트를 통해 기능 구현보다도
인증 정책, 외부 연동 실패 처리, 데이터 정합성과 같은
운영 안정성 요소를 먼저 설계하는 것이 중요하다는 점을 배웠습니다.

또한 프로젝트 종료 이후 모노레포, REST 계약, Swagger 문서화를 진행하며
"동작하는 코드"와 "재현 가능하고 협업 가능한 구조"는 다르다는 점을 체감했습니다.
앞으로도 안정성/정합성/협업 계약을 우선순위로 두고 백엔드 설계를 고도화할 계획입니다.
```
