## 2. 시스템 아키텍처
시스템은 Spring Boot API 서버와 FastAPI AI 추론 서버로 구성되어 있으며, MySQL 단일 인스턴스 내에 backend/ai 스키마를 분리하여 운영했습니다.

### 시스템 컨텍스트
클라이언트 요청은 Spring Boot가 수신하고, 감정 분석은 FastAPI에게 위임하며, 데이터는 MySQL 스키마 분리 구조로 저장됩니다.
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

  class BE,FE,AI sem-success;
  class External,Kakao,KOBIS,KMDb,SMTP,Swagger,Model,FrontendDev sem-info;

```

### Spring Boot 내부 구조
Spring Boot는 레이어드 아키텍터(`Controller` - `Service` - `Repository`)로 구성하여 인증, 리뷰, 영화/박스오피스 등의 도메인 로직을 분리했습니다.
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

  class S_Auth,S_Movie,S_Review,S_Report,S_Match,S_Recommend sem-success;
  class I_AI,I_OAuth,I_MovieAPI,I_Mail sem-info;

```

### FastAPI 내부 구조
FastAPI는 KoBERT 기반 감정 추론 전용 서버로 동작하며, 예측 결과를 Spring Boot에 반환하는 내부 AI 서비스 역할을 담당합니다.
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

  class S_Emotion,S_Recommend sem-success;
  class A_Emotion,A_Recommend,Repo,Predictor,Model sem-info;

```
- - -
### 핵심 시나리오
#### 리뷰 작성 -> 감정분석 -> 감정 요약 반영

```mermaid
flowchart LR
  U["사용자"]

  subgraph SPR["Spring Boot"]
    RC["Review Controller"]
    RS["Review Service"]
  end

  subgraph FAPI["FastAPI"]
    AI["Predict Router/Service"]
  end

  DB[("MySQL")]

  U -->|"리뷰 작성 요청"| RC
  RC --> RS
  RS -->|"감정 추론 요청"| AI
  AI -->|"감정 확률 반환"| RS
  RS -->|"리뷰/감정 저장"| DB
  RS -->|"영화/회원 감정 요약 재계산"| DB
  RS -->|"응답 반환"| U

  class RC,RS sem-success;
  class AI sem-info;
```

- 목적: 리뷰 이벤트를 감정 데이터로 변환해 추천 기반 데이터에 반영합니다.
- 예외 처리: AI 호출 실패 시 공통 예외로 변환해 일관된 오류 응답을 반환합니다.
- 결과: 리뷰 작성과 감정 요약 갱신이 하나의 흐름으로 연결됩니다.

#### 박스오피스 공개 조회와 인증 API 분리

```mermaid
flowchart LR
  C["클라이언트"]

  subgraph SPR["Spring Boot"]
    SC["Security Config"]
    BO["BoxOffice Controller"]
    RV["Review/Member API"]
  end

  DB[("MySQL")]

  C --> SC
  SC -->|"공개 조회 허용"| BO
  SC -->|"JWT 인증 필요"| RV
  BO --> DB
  RV --> DB

  class BO sem-success;
  class SC,RV sem-warning;
```

- 목적: 비인증 조회 API와 인증 필요 API의 경계를 명확히 분리합니다.
- 예외 처리: 인증이 필요한 경로는 인증 실패 시 401/403으로 처리됩니다.
- 결과: 공개 조회 사용성은 유지하고 보호 API 접근 제어는 강화됩니다.

#### 외부 AI 연동 실패 대응 표준화

```mermaid
flowchart LR
  subgraph SPR["Spring Boot"]
    RS["Review Service"]
    EX["ExternalServiceException"]
    EH["Global Exception Handler"]
    AR["표준 오류 응답"]
  end

  subgraph FAPI["FastAPI"]
    AI["Emotion Predict API"]
  end

  RS -->|"감정 분석 호출"| AI
  AI -->|"타임아웃/오류"| EX
  EX --> EH
  EH --> AR

  class RS sem-success;
  class AI sem-info;
  class EX,EH,AR sem-danger;
```

- 목적: 외부 의존 실패가 전체 API 동작을 불안정하게 만들지 않도록 합니다.
- 처리: 외부 호출 예외를 도메인 예외로 변환하고 공통 포맷으로 응답합니다.
- 결과: 장애 상황에서도 응답 규격이 유지되어 클라이언트 처리 일관성이 높아집니다.

- - -
