---
title: "영화 리뷰 및 추천 웹 서비스 개발"
summary: "리뷰 감정분석 연동과 API 안정화 중심의 영화 추천 백엔드 프로젝트"
project_title: "Inside Movie / 인사이드 무비"
github_link: "https://github.com/AutoeverInsideMovie"
sources:
  - label: "Demo Monorepo"
    url: "https://github.com/Gumraze-git/Insidemovie"
  - label: "Project Organization"
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

# 1. 프로젝트 개요
인사이드 무비는 리뷰 커뮤니티 기능에 감정분석 기반 추천을 결합한 서비스입니다.

핵심 백엔드 과제는 `리뷰 작성 -> 감정분석 -> 추천 반영` 흐름이 외부 의존성이나 입력 데이터 편차로 깨지지 않도록 안정화하는 것이었습니다.

이 문서에서는 프로젝트 기간 중 제가 직접 해결한 문제를 기준으로, 인증/접근 제어 정합성, 외부 AI 연동 실패 대응, 감정 데이터 정합성 개선 과정을 정리했습니다.

- - -
# 2. 시스템 아키텍처

## 2.1 백엔드 아키텍처 구조 (프로젝트 종료 시점)
```mermaid
%%{init: {'flowchart': {'nodeSpacing': 20, 'rankSpacing': 24, 'diagramPadding': 8}} }%%
flowchart LR

  Client["Client"] --> FE["Frontend<br>(React / Vite)"]

  subgraph Docker["Docker Compose Runtime"]
    direction TB

    subgraph C_BE["Container 1: backend-spring"]
      direction TB
      BSwagger["Swagger UI<br>GET /api-doc"]

      subgraph BController["Controller Layer"]
        direction LR
        C_Auth["Auth & Member"]
        C_Movie["Movie Core"]
        C_Review["Review & Report"]
        C_Rec["Match & Recommend"]
      end

      subgraph BService["Service Layer"]
        direction LR
        S_Auth["Auth/Member Service"]
        S_Movie["Movie Service"]
        S_Review["Review/Report Service"]
        S_Rec["Recommendation Service"]
      end

      subgraph BPersistence["Persistence Layer"]
        direction LR
        P_MemberRepo["Member Repo"]
        P_MovieRepo["Movie/Info Repo"]
        P_ReviewRepo["Review Repo"]
        P_RecRepo["Match/Rec Repo"]
      end

      subgraph BIntegration["Integration Layer"]
        direction LR
        I_AI["AI Client (RestClient)"]
        I_OAuth["OAuth Client"]
        I_Mail["Mail Sender"]
        I_MovieAPI["Movie Data Clients"]
      end
    end

    subgraph C_AI["Container 2: backend-ai"]
      direction TB
      subgraph AApi["API Layer"]
        direction LR
        A_R_Emotion["/emotion-predictions"]
        A_R_Rec["/movie-recommendations"]
      end
      subgraph AApp["Application Layer"]
        direction LR
        A_S_Emotion["Emotion Prediction Svc"]
        A_S_Rec["Recommendation Svc"]
      end
      subgraph AInfra["Infrastructure Layer"]
        direction LR
        A_I_Repo["Emotion Summary Repo"]
        A_I_Model["KoBERT Predictor"]
      end
      Model["KoBERT Model File<br>.safetensors"]
    end

    subgraph C_DB["Container 3: mysql-db"]
      direction TB
      MySQLSrv[("MySQL 8.0 Server")]
      SchemaBackend["Schema: insidemovie_backend"]
      SchemaAI["Schema: insidemovie_ai"]
      MySQLSrv --- SchemaBackend
      MySQLSrv --- SchemaAI
    end
  end

  subgraph EXT["External APIs"]
    direction LR
    ExtKakao["Kakao Auth API"]
    ExtKOBIS["KOBIS API"]
    ExtKMDb["KMDb API"]
    ExtSMTP["SMTP Server"]
  end

  FE -- REST --> C_Auth
  Client -. Docs .-> BSwagger

  C_Auth --> S_Auth
  C_Movie --> S_Movie
  C_Review --> S_Review
  C_Rec --> S_Rec

  S_Auth --> P_MemberRepo & I_OAuth & I_Mail
  S_Movie --> P_MovieRepo & I_MovieAPI
  S_Review --> P_ReviewRepo
  S_Rec --> P_RecRepo & I_AI

  I_AI -- HTTP POST --> A_R_Emotion
  A_R_Emotion --> A_S_Emotion
  A_R_Rec --> A_S_Rec
  A_S_Emotion --> A_I_Repo & A_I_Model
  A_S_Rec --> A_I_Repo

  P_MemberRepo -- JDBC --> SchemaBackend
  P_MovieRepo -- JDBC --> SchemaBackend
  P_ReviewRepo -- JDBC --> SchemaBackend
  P_RecRepo -- JDBC --> SchemaBackend
  A_I_Repo -- PyMySQL --> SchemaAI
  A_I_Model -- Load --> Model

  I_OAuth -- OAuth2 --> ExtKakao
  I_Mail -- SMTP --> ExtSMTP
  I_MovieAPI -- BoxOffice --> ExtKOBIS
  I_MovieAPI -- Metadata --> ExtKMDb

  C_Auth:::be_comp
  C_Movie:::be_comp
  C_Review:::be_comp
  C_Rec:::be_comp
  S_Auth:::be_comp
  S_Movie:::be_comp
  S_Review:::be_comp
  S_Rec:::be_comp
  P_MemberRepo:::be_comp
  P_MovieRepo:::be_comp
  P_ReviewRepo:::be_comp
  P_RecRepo:::be_comp
  I_AI:::be_comp
  I_OAuth:::be_comp
  I_Mail:::be_comp
  I_MovieAPI:::be_comp
  BSwagger:::be_comp
  A_R_Emotion:::ai_comp
  A_R_Rec:::ai_comp
  A_S_Emotion:::ai_comp
  A_S_Rec:::ai_comp
  A_I_Model:::ai_comp
  A_I_Repo:::ai_comp
  MySQLSrv:::db
  SchemaBackend:::db
  SchemaAI:::db
  Model:::db
  Client:::client
  FE:::frontend
  ExtKakao:::external
  ExtKOBIS:::external
  ExtKMDb:::external
  ExtSMTP:::external

  classDef client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
  classDef frontend fill:#b3e5fc,stroke:#0277bd,stroke-width:2px,color:#000
  classDef be_comp fill:#fff9c4,stroke:#f9a825,stroke-width:1px,color:#000
  classDef ai_comp fill:#e1bee7,stroke:#8e24aa,stroke-width:1px,color:#000
  classDef db fill:#cfd8dc,stroke:#455a64,stroke-width:2px,color:#000
  classDef external fill:#f8bbd0,stroke:#c2185b,stroke-width:2px,color:#000

  style BPersistence fill:none,stroke:#fbc02d,stroke-width:1px,stroke-dasharray: 2 2
  style BIntegration fill:none,stroke:#fbc02d,stroke-width:1px,stroke-dasharray: 2 2
  style BController fill:none,stroke:#fbc02d,stroke-width:1px,stroke-dasharray: 2 2
  style BService fill:none,stroke:#fbc02d,stroke-width:1px,stroke-dasharray: 2 2
  style AApi fill:none,stroke:#ab47bc,stroke-width:1px,stroke-dasharray: 2 2
  style AApp fill:none,stroke:#ab47bc,stroke-width:1px,stroke-dasharray: 2 2
  style AInfra fill:none,stroke:#ab47bc,stroke-width:1px,stroke-dasharray: 2 2
  style Docker fill:#fafafa,stroke:#64748b,stroke-width:2px,stroke-dasharray: 4 3
  style C_BE fill:#fffde7,stroke:#f9a825,stroke-width:2px,stroke-dasharray: 4 3
  style C_AI fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,stroke-dasharray: 4 3
  style C_DB fill:none,stroke:#455a64,stroke-width:2px,stroke-dasharray: 4 3
  style EXT fill:#fce4ec,stroke:#c2185b,stroke-width:2px,stroke-dasharray: 4 3
```

## 2.2 요청 흐름 (핵심 시나리오)
`리뷰 작성 -> ReviewService -> /api/v1/emotion-predictions -> Emotion 저장 -> 요약 재계산`

## 2.3 Multi-Schema 실제 구성 (Insidemovie-monorepo 기준)
- MySQL 초기화 SQL에서 두 스키마를 생성합니다.
  - `insidemovie_backend`
  - `insidemovie_ai`
- Backend(Spring Boot)는 `insidemovie_backend`를 사용합니다.
  - `application-prod.yml`: `${BACKEND_DB_NAME:insidemovie_backend}`
- AI(FastAPI)는 `insidemovie_ai`를 사용합니다.
  - `docker-compose.yml`: `DATABASE_URL=.../insidemovie_ai`
- 확인한 근거 파일:
  - `docker/mysql/initdb/01-create-databases.sql`
  - `docker-compose.yml`
  - `apps/backend/src/main/resources/application-prod.yml`

- - -
# 3. 핵심 트러블슈팅 Top3 (프로젝트 기간 중)

## 3.1 인증/접근 제어 정합성
| As-Is
공개 조회 API와 인증 필요 API 경계가 일관되지 않아 비인증 조회에서 401/403 오동작이 발생했습니다.

| Root Cause
보안 경로 정책과 토큰 검증 로직이 분산되어 실제 공개해야 할 경로가 누락되었습니다.

| To-Be
공개 GET 경로를 상수로 분리하고 `boxoffice` 경로를 명시적으로 permitAll 처리했습니다. 또한 JWT null/blank 검증을 선행해 인증 필터 동작을 단순화했습니다.

| Code Evidence
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

| Commit Evidence
- `1eb2561` (boxoffice endpoint 정합화)
- `236db2a` (boxoffice 공개 경로 반영)
- `346f551` (JWT 검증 구조 개선)

| Verification
- 비인증 사용자로 `GET /api/v1/boxoffice/**` 호출 시 정상 조회
- 인증 필요 엔드포인트는 기존대로 401/403 보안 정책 유지

| Recurrence Prevention
- 공개 API 추가 시 `PUBLIC_GET_ENDPOINTS`/`PUBLIC_POST_ENDPOINTS`에 먼저 반영
- 보안 정책 변경 시 공개/보호 엔드포인트를 체크리스트로 리뷰

## 3.2 외부 연동 실패 대응 (FastAPI 감정분석)
| As-Is
리뷰 저장 흐름에서 FastAPI 호출 실패가 발생하면 서비스 응답이 불안정해졌습니다.

| Root Cause
외부 연동 실패를 도메인 예외로 표준화하지 않아 실패 케이스 처리 일관성이 낮았습니다.

| To-Be
FastAPI 응답 null/호출 예외를 `ExternalServiceException`으로 통일해 상위 계층에서 동일한 예외 계약으로 처리하도록 정리했습니다.

| Code Evidence
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

| Commit Evidence
- `efc1427` (리뷰 작성 시 감정분석 연동 + 실패 처리)
- `6c8bdef` (외부 서비스 예외 타입 추가)

| Verification
- FastAPI 비정상 응답/네트워크 실패 상황에서 예외 코드 일관성 확인
- 리뷰 작성/수정 API에서 동일한 실패 응답 포맷 유지 확인

| Recurrence Prevention
- 외부 시스템 연동 시 `null 응답 + 클라이언트 예외`를 기본 실패 템플릿으로 강제
- 신규 외부 연동 API는 동일한 도메인 예외 타입 사용

## 3.3 감정 데이터 정합성 (입력 범위 + 대표감정 계산)
| As-Is
감정 입력 스케일과 요약 계산 로직 불일치로 대표 감정 결과가 왜곡될 수 있었습니다.

| Root Cause
입력 DTO 검증 범위와 실제 전달 데이터 스케일이 달랐고, 요약 재계산 시 대표 감정 계산 시점이 일관되지 않았습니다.

| To-Be
감정 입력 검증을 `0~100`으로 정합화하고, 요약 재계산 단계에서 대표 감정을 명시적으로 계산 후 반영하도록 변경했습니다.

| Code Evidence
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

| Commit Evidence
- `53aeac7` (감정 DTO 범위 0~100)
- `ff72cbc` (대표 감정 계산 오류 개선)

| Verification
- 감정 입력값 100 초과 시 검증 실패 확인
- 리뷰 등록/수정 후 대표 감정 필드가 재계산되어 반영되는지 확인

| Recurrence Prevention
- 감정 도메인 입력/응답 스케일을 API 계약에 고정
- 집계 로직 변경 시 대표 감정 계산 테스트 케이스를 필수화

## 3.4 공개 API/인터페이스/타입 변경 사항
- `GET /api/v1/boxoffice/**` 공개 접근 정책 반영
- 내부-외부 연동 계약: `POST /api/v1/emotion-predictions` + 실패 예외 표준화
- 타입 검증 변경: `MemberEmotionSummaryRequestDTO` 감정 값 범위 `0~100`

## 3.5 테스트/검증 시나리오
1. 비인증 사용자 `GET /api/v1/boxoffice/**` 접근 성공 여부
2. FastAPI 오류/무응답 시 일관된 예외 응답 확인
3. 감정 입력값 100 초과 시 검증 실패 확인
4. 리뷰 등록/수정 후 감정 요약 재계산 반영 확인

- - -
# 4. ERD (프로젝트 종료 시점)
| ERD 이미지
`[프로젝트 종료 시점 ERD 이미지 첨부 예정]`

| 설명 초안
- 핵심 엔티티 관계는 `Member - Review - Movie`를 중심으로 구성했습니다.
- `MemberEmotionSummary`, `MovieEmotionSummary`는 집계/추천용 읽기 모델 역할입니다.
- 리뷰-감정은 1:1 제약으로 중복 감정 저장을 방지했습니다.
- 쓰기 모델과 요약 모델을 분리해 추천 조회 계산 비용을 줄이도록 설계했습니다.

- - -
# 5. 프로젝트 개선 (종료 이후)
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
