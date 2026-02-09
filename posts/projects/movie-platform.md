---
title: "영화 리뷰 및 추천 웹 서비스 개발"
summary: "영화 리뷰 커뮤니티 및 리뷰/댓글 기반 영화 추천 서비스"
project_title: "Inside Movie / 인사이드 무비"
github_link: "https://github.com/inside-movie/inside-movie"
date: "2025-07-30"
thumbnail: "/devlog-placeholder.svg"
stack:
  - Spring Boot
  - FastAPI
  - OAuth
  - MongoDB
  - MySQL
period: "2025.06 - 2025.07"
members: "프론트엔드 / 백엔드"
role: "백엔드 / AI 기능 통합?"
published: true
education: "현대오토에버 SW 스쿨 2기"
---

# 1. 프로젝트 개요
| 프로젝트 소개

Inside Movie는 영화 리뷰 커뮤니티와 추천 기능을 결합한 웹 애플리케이션입니다.  
사용자 리뷰/댓글 데이터를 기반으로 감정을 분석하고, 분석 결과를 추천 로직에 반영해 맞춤형 영화를 제안합니다.

| 목표/기획 의도
- 영화 리뷰 커뮤니티 기능과 추천 기능을 하나의 서비스 흐름으로 통합
- 백엔드 기본기(SOLID, 계층 분리, CRUD, API 설계)를 실전 프로젝트에 적용
- 외부 API 연동 및 AI 모델 연계를 포함한 데이터 처리 파이프라인 경험 확보

| 핵심 기능
```step
1. 사용자 인증/인가 및 권한 관리
2. 영화 리뷰/댓글 CRUD 및 커뮤니티 기능
3. 박스오피스/TMDB 외부 데이터 연동
4. 댓글 감정 분석 기반 추천 영화 제공
```
- - -
# 2. 시스템 아키텍처 및 기술 스택
## 2.1 전체 구조(요청 흐름 포함)
DDD 기반 계층 구조를 의식해 도메인 로직과 외부 연동 로직을 분리했습니다.

1. 클라이언트가 인증/리뷰/조회 요청을 Spring Boot API로 전달
2. Spring Boot가 인증 처리 및 도메인 로직(CRUD, 추천 요청 준비) 수행
3. 영화 메타데이터는 박스오피스/TMDB API 연동으로 보강
4. 사용자 댓글 텍스트를 FastAPI 감정 분석 서비스로 전달
5. 감정 분석 결과와 사용자 활동 데이터를 조합해 추천 결과 응답

## 2.2 기술 스택과 선정 이유
- **Spring Boot 3.5.3 / Java 17**: 안정적인 백엔드 애플리케이션 구조와 계층형 설계 적용
- **MySQL**: 정형 데이터(회원, 권한, 리뷰, 영화 메타데이터) 관리
- **Spring Security / OAuth 2.0(2.1 규격 반영)**: 인증/인가 체계 구현
- **FastAPI**: 감정 분석 모델 연동을 위한 경량 AI 서빙 API 구성
- **OpenAPI/Swagger**: 프론트엔드 협업 및 API 명세 공유
- **Lombok**: 반복 코드 최소화로 도메인/서비스 구현 집중
- - -
# 3. 담당 역할
| 담당 역할 요약

```step
1. 인증/인가 설계 및 구현
2. 영화/리뷰/댓글 도메인 모델링 및 CRUD API 구현
3. 박스오피스/TMDB 외부 API 연동
4. 댓글 감정 분석 결과를 활용한 추천 기능 흐름 통합
5. 프론트엔드 협업을 위한 API 스펙 정리 및 조율
```
- - -
# 4. 구현 및 트러블슈팅
## 4.1 인증/인가 설계 및 구현
### 구현 코드
- Spring Security 필터 체인 기반으로 인증/인가 흐름 구성
- OAuth 토큰 검증 이후 권한 기반 접근 제어 적용
- 인증 실패/인가 실패 응답 포맷을 공통화

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) throws ServletException, IOException {
    try {
        String token = resolveToken(request);
        if (token != null && tokenProvider.validate(token)) {
            Authentication auth = tokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    } catch (AuthenticationException ex) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":\"AUTH_401\",\"message\":\"인증에 실패했습니다.\"}");
    }
}
```

### 트러블슈팅
~~~troubleshooting
제목: 인증 예외 처리 일원화

문제:
인증 토큰 처리와 권한 검사 로직이 기능별로 분산되어
예외 응답 형식이 일관되지 않았습니다.

원인:
필터 체인/예외 처리 책임이 명확히 정리되지 않아
엔드포인트별 응답 형태가 달라졌습니다.

해결:
인증 예외 처리 지점을 필터로 모으고
공통 에러 응답 포맷을 적용했습니다.

결과:
프론트엔드 연동 시 인증 실패 케이스 처리 단순화,
디버깅 시간 단축 효과를 얻었습니다.
~~~
- - -
## 4.2 도메인/DB 설계 및 CRUD 구현
### 구현 코드
- 영화/리뷰/댓글 중심 ERD 설계 후 엔티티 관계 명확화
- Controller-Service-Repository 계층 분리로 비즈니스 로직 집중
- 요청/응답 DTO를 도입해 API 계약 안정화

```java
@Transactional
public ReviewResponse createReview(Long movieId, Long userId, ReviewCreateRequest request) {
    Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new BusinessException("MOVIE_NOT_FOUND"));

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND"));

    Review review = Review.of(movie, user, request.content(), request.rating());
    Review saved = reviewRepository.save(review);
    return ReviewResponse.from(saved);
}
```

### 트러블슈팅
~~~troubleshooting
문제:
초기 구현에서 엔티티/DTO 경계가 불명확해
API 수정 시 파급 범위가 컸습니다.

원인:
Controller에서 엔티티를 직접 다루며
계층 책임이 혼재되었습니다.

해결:
DTO 매핑 지점을 명확히 분리하고
서비스 레이어 중심으로 도메인 로직을 재배치했습니다.

결과:
기능 확장 시 변경 영향 범위가 줄고
코드 가독성/유지보수성이 향상되었습니다.
~~~
- - -
## 4.3 외부 API/추천 기능 연동
### 구현 코드
- 박스오피스/TMDB API에서 영화 메타데이터를 수집해 추천 입력 데이터로 활용
- 댓글 텍스트를 FastAPI 감정 분석 서비스로 전달하고 점수를 수신
- 감정 점수와 사용자 활동 데이터를 조합해 추천 결과 생성

```java
public RecommendationResult recommend(Long userId, String comment) {
    EmotionResult emotion = emotionClient.analyze(comment);
    List<MovieScore> candidates = movieQueryRepository.findCandidates(userId);

    return recommendationService.rank(candidates, emotion.score(), emotion.label());
}
```

### 트러블슈팅
~~~troubleshooting
제목: 감정 분석 지연 대응

문제:
추천 응답에서 FastAPI 호출 구간 지연으로
체감 응답 속도가 저하되었습니다.

원인:
외부 연동 구간의 실패/지연 대비 전략(타임아웃, 폴백)이 부족했습니다.

해결:
호출 타임아웃/예외 처리를 적용하고,
분석 실패 시 기본 추천 로직으로 폴백하도록 구성했습니다.

```java
public RecommendationResult recommend(Long userId, String comment) {
    try {
        EmotionResult emotion = emotionClient.analyze(comment);
        List<MovieScore> candidates = movieQueryRepository.findCandidates(userId);
        return recommendationService.rank(candidates, emotion.score(), emotion.label());
    } catch (Exception e) {
        return recommendationService.defaultRecommend(userId);
    }
}
```

결과:
감정 분석 서비스 상태와 무관하게
추천 API 가용성을 유지할 수 있었습니다.
~~~
# 5. 결과 및 성과
- 백엔드 첫 팀 프로젝트에서 인증, 데이터 모델링, CRUD, 외부 API 연동까지 서비스 핵심 흐름 구현
- FastAPI 기반 AI 모델 연동 경험을 통해 백엔드-모델 서빙 인터페이스 설계 역량 강화
- 프론트엔드와 API 스펙을 지속적으로 조율하며 협업 기반 개발 프로세스 경험 확보
# 6. 회고
```reflection
이번 프로젝트를 통해 기능 구현을 넘어 설계와 구조의 중요성을 체감했습니다.
특히 SOLID 원칙, RESTful API 설계, ERD 기반 데이터 모델링을 실제 기능에 연결하는 과정을 통해 백엔드 개발의 기본기를 다졌습니다.

또한 FastAPI 감정 분석 연동을 직접 다루며 외부 시스템 연동 시 예외 처리, 응답 일관성, 서비스 복원력이 핵심이라는 점을 배웠습니다.
```
