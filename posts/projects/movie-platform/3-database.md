## 3. 도메인 데이터 구조
Inside Movie의 데이터 구조는 단순 게시판형 리뷰 서비스가 아니라, 리뷰가 감정 데이터와 추천 입력으로 이어지는 흐름을 반영하도록 설계했습니다. 그래서 회원, 영화, 리뷰 같은 기본 엔티티 위에 감정 집계, 공개 조회, 운영성 로그를 분리해 두는 방식이 중요했습니다.
#### 핵심 도메인 ERD (회원/영화/리뷰/신고/매치)
핵심 사용자 플로우(회원 활동, 리뷰 작성, 신고, 매치 투표) 중심 관계입니다.

```mermaid
---
config:
  layout: elk
  er:
    fontSize: 15
    entityPadding: 16
    minEntityWidth: 228
    minEntityHeight: 74
    layoutDirection: LR
    nodeSpacing: 140
    rankSpacing: 110
---
erDiagram
  MEMBER ||--o{ REVIEW : writes
  MOVIE ||--o{ REVIEW : receives
  REVIEW ||--|| EMOTION : has_one
  REVIEW ||--o{ REPORT : is_reported
  MEMBER ||--o{ REPORT : files
  MEMBER ||--o{ REPORT : is_reported_as
  MATCH ||--o{ VOTE : has_votes
  MEMBER ||--o{ VOTE : casts
  MOVIE ||--o{ VOTE : selected
  MATCH ||--o{ MOVIE_MATCH : has_candidates
  MOVIE ||--o{ MOVIE_MATCH : participates

  MEMBER {
    bigint member_id PK
    varchar email
    varchar nickname
    varchar social_id
    varchar refresh_token
    enum authority
    boolean is_banned
    int report_count
  }

  MOVIE {
    bigint movie_id PK
    varchar kofic_id UK
    varchar title
    date release_date
    boolean is_matched
  }

  REVIEW {
    bigint review_id PK
    bigint member_id FK
    bigint movie_id FK
    double rating
    bigint like_count
    boolean is_reported
    boolean is_concealed
  }

  EMOTION {
    bigint emotion_id PK
    bigint review_id FK,UK
    double joy
    double sadness
    double anger
    double fear
    double disgust
  }

  REPORT {
    bigint report_id PK
    bigint review_id FK
    bigint reporter_id FK
    bigint reported_member_id FK
    enum status
    enum reason
  }

  MATCH {
    bigint match_id PK
    date match_date
    int match_number
    bigint winner_id
  }

  VOTE {
    bigint id PK
    bigint member_id FK
    bigint match_id FK
    bigint movie_id FK
    datetime voted_at
  }

  MOVIE_MATCH {
    bigint fight_id PK
    bigint match_id FK
    bigint movie_id FK
    bigint vote_count
  }
```

#### 상세 도메인 ERD (선호/장르/집계 읽기모델)
핵심 도메인 위에서 동작하는 선호(Like), 장르 매핑, 감정 집계용 읽기 모델 관계입니다.

```mermaid
---
config:
  er:
    fontSize: 15
    entityPadding: 16
    minEntityWidth: 220
    minEntityHeight: 70
    layoutDirection: LR
    nodeSpacing: 120
    rankSpacing: 90
---
erDiagram
  MOVIE ||--o{ MOVIE_LIKE : liked_by
  MEMBER ||--o{ MOVIE_LIKE : likes
  REVIEW ||--o{ REVIEW_LIKE : liked_by
  MEMBER ||--o{ REVIEW_LIKE : likes
  MOVIE ||--o{ MOVIE_GENRE : has
  MEMBER ||--|| MEMBER_EMOTION_SUMMARY : has_summary
  MOVIE ||--|| MOVIE_EMOTION_SUMMARY : has_summary

  MOVIE_LIKE {
    bigint movie_like_id PK
    bigint movie_id FK
    bigint member_id FK
  }

  REVIEW_LIKE {
    bigint review_like_id PK
    bigint review_id FK
    bigint member_id FK
  }

  MOVIE_GENRE {
    bigint movie_genre_id PK
    bigint movie_id FK
    enum genre
  }

  MEMBER_EMOTION_SUMMARY {
    bigint member_id PK,FK
    float joy
    float sadness
    float anger
    float fear
    float disgust
    enum rep_emotion_type
  }

  MOVIE_EMOTION_SUMMARY {
    bigint movie_id PK,FK
    float joy
    float sadness
    float anger
    float fear
    float disgust
    enum dominant_emotion
  }
```

#### 상세 도메인 ERD (운영/로그/박스오피스)
운영성 데이터(친구, 시청 이력, 박스오피스 수집 데이터)를 분리한 관계입니다.

```mermaid
---
config:
  er:
    fontSize: 15
    entityPadding: 16
    minEntityWidth: 220
    minEntityHeight: 68
    layoutDirection: LR
    nodeSpacing: 112
    rankSpacing: 88
---
erDiagram
  MEMBER ||--o{ FRIEND : owns
  MEMBER ||--o{ MOVIE_HISTORY : watches
  MOVIE ||--o{ MOVIE_HISTORY : watched_in
  FRIEND ||--o{ MOVIE_HISTORY : with_friend
  MOVIE o|--o{ DAILY_BOX_OFFICE : mapped_by_movie_cd
  MOVIE o|--o{ WEEKLY_BOX_OFFICE : mapped_by_movie_cd

  FRIEND {
    bigint friend_id PK
    bigint member_id FK
    varchar kakao_friend_id
    varchar friend_nickname
  }

  MOVIE_HISTORY {
    bigint movie_history_id PK
    bigint member_id FK
    bigint movie_id FK
    bigint friend_id FK
    datetime watched_at
  }

  DAILY_BOX_OFFICE {
    bigint id PK
    date target_date
    varchar movie_cd
    varchar movie_rank
  }

  WEEKLY_BOX_OFFICE {
    bigint id PK
    varchar year_week_time
    varchar movie_cd
    varchar movie_rank
  }
```

- - -
