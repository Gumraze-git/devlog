## 4. 핵심 트러블슈팅 및 성능 개선

~~~troubleshooting
제목: 인증/접근 제어 정합성

문제:
공개 조회 API와 인증 필요 API의 경계가 일관되지 않아 비인증 요청에서 401/403 오동작이 발생했습니다.
그 결과, 비인증 사용자의 조회 플로우가 차단되거나 보호 경로 정책이 오인될 가능성이 있었습니다.

원인:
보안 경로 정책과 토큰 검증 기준이 분산되어, 공개 경로 정의가 Security 설정에 일관되게 반영되지 않았습니다.

해결:
공개 GET 경로를 `requestMatchers`에서 명시적으로 분리하고 `/api/v1/boxoffice/**`를 `permitAll`로 고정했습니다.
또한 JWT `null/blank` 입력을 먼저 차단해 토큰 검증 동작을 단순화했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: boxoffice 공개 경로가 빠져 비인증 조회 정책이 누락됨
> .requestMatchers(
>         HttpMethod.GET,
>         "/api/v1/movies/*/emotion-summary",
>         "/api/v1/movies/emotions/*",
>         "/api/v1/movies/*/reviews"
> ).permitAll();
> 
> public boolean validateToken(String token) {
>     // 문제: null/blank 토큰을 선차단하지 않아 불필요한 파싱 예외가 발생할 수 있음
>     try {
>         Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
>         return true;
>     } catch (Exception e) {
>         log.info("JWT 검증 실패: {}", e.getMessage());
>     }
>     return false;
> }
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: boxoffice 경로를 공개 목록에 명시해 조회 정책을 명확히 분리
> .requestMatchers(
>         HttpMethod.GET,
>         "/api/v1/movies/*/emotion-summary",
>         "/api/v1/movies/emotions/*",
>         "/api/v1/movies/*/reviews",
>         "/api/v1/boxoffice/**"
> ).permitAll();
> 
> public boolean validateToken(String token) {
>     // 개선: null/blank 토큰을 선차단해 검증 흐름을 단순화
>     if (token == null || token.isBlank()) {
>         return false;
>     }
>     try {
>         Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
>         return true;
>     } catch (ExpiredJwtException e) {
>         log.debug("JWT expired: {}", e.getMessage());
>     } catch (Exception e) {
>         log.debug("JWT invalid: {}", e.getMessage());
>     }
>     return false;
> }
> ```

**Commit Evidence**
- `236db2a` (boxoffice 공개 경로 반영)
- `346f551` (JWT 검증 구조 개선)

결과:
공개 조회와 보호 경로의 책임이 분리되어, 사용자 입장에서는 조회 실패 혼선을 줄이고 팀 입장에서는 보안 정책 해석이 쉬워졌습니다.
**Verification**
- 비인증 요청으로 `GET /api/v1/boxoffice/daily` 호출 -> `200` 응답으로 조회되는지 확인
- 비인증 요청으로 `POST /api/v1/review` 호출 -> `401/403`으로 차단되는지 확인

**Recurrence Prevention**
- 공개 API 추가 시 `requestMatchers` 공개 경로 목록부터 갱신하고 PR 체크리스트에 반영
- 보안 정책 변경 시 공개/보호 엔드포인트를 분리해 리뷰하고 테스트 시나리오를 함께 점검
~~~

~~~troubleshooting
제목: 외부 연동 실패 대응 (FastAPI 감정분석)

문제:
리뷰 저장 과정에서 FastAPI 호출 실패 시 예외 응답이 일관되지 않아 API 계약이 흔들렸습니다.
그 결과, 핵심 사용자 플로우인 리뷰 작성이 외부 장애에 의해 중단될 가능성이 있었습니다.

원인:
외부 연동 실패(`null` 응답, `RestClientException`)를 단일 도메인 예외로 수렴하지 않아 처리 기준이 분산되었습니다.

해결:
FastAPI `null` 응답과 호출 예외를 `ExternalServiceException`으로 통일해 상위 계층의 오류 계약을 단일화했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: 리뷰 저장 후 즉시 반환되어 감정분석 호출/검증이 수행되지 않음
> Review review = Review.builder()
>         .content(reviewCreateDTO.getContent())
>         .rating(reviewCreateDTO.getRating())
>         .spoiler(reviewCreateDTO.isSpoiler())
>         .watchedAt(reviewCreateDTO.getWatchedAt())
>         .likeCount(0)
>         .modify(false)
>         .member(member)
>         .movie(movie)
>         .build();
> 
> Review savedReview = reviewRepository.save(review);
> // 문제: 외부 연동 실패를 도메인 예외로 표준화할 지점이 없음
> return savedReview.getId();
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> Review savedReview = reviewRepository.save(review);
> 
> // 개선: 외부 호출 결과를 검증하고 실패를 도메인 예외로 수렴
> try {
>     PredictRequestDTO request = new PredictRequestDTO(savedReview.getContent());
>     PredictResponseDTO response = fastApiRestTemplate.postForObject(
>             "/predict/overall_avg", request, PredictResponseDTO.class
>     );
>     if (response == null || response.getProbabilities() == null) {
>         throw new ExternalServiceException(ErrorStatus.EXTERNAL_SERVICE_ERROR.getMessage());
>     }
>     Map<String, Double> probabilities = response.getProbabilities();
>     Emotion emotion = Emotion.builder()
>             .anger(probabilities.get("anger"))
>             .fear(probabilities.get("fear"))
>             .joy(probabilities.get("joy"))
>             .neutral(probabilities.get("neutral"))
>             .sadness(probabilities.get("sadness"))
>             .review(savedReview)
>             .build();
>     emotionRespository.save(emotion);
> } catch (RestClientException e) {
>     // 보완: 네트워크 예외를 동일한 ExternalServiceException으로 표준화
>     throw new ExternalServiceException(ErrorStatus.EXTERNAL_SERVICE_ERROR.getMessage());
> }
> 
> return savedReview.getId();
> ```

```chips
ExternalServiceException | | code
```
```java
public class ExternalServiceException extends BaseException {
    public ExternalServiceException(String message) {
        super(HttpStatus.SERVICE_UNAVAILABLE, message);
    }
}
```

**Commit Evidence**
- `efc1427` (리뷰 작성 시 감정분석 연동 + 실패 처리)
- `6c8bdef` (외부 서비스 예외 타입 추가)

결과:
외부 장애가 발생해도 오류 응답 계약이 고정되어, 클라이언트는 동일한 규칙으로 실패를 처리할 수 있게 되었습니다.
**Verification**
- FastAPI `null` 응답 시 `ExternalServiceException`으로 매핑되는지 확인
- FastAPI 네트워크 오류(`RestClientException`) 시 동일한 오류 코드/메시지로 응답되는지 확인

**Recurrence Prevention**
- 외부 시스템 연동은 `null 응답 + 클라이언트 예외`를 기본 실패 템플릿으로 적용
- 신규 연동 API는 동일한 도메인 예외 타입을 사용해 오류 계약을 유지
~~~

~~~troubleshooting
제목: 감정 데이터 정합성 (입력 범위 + 대표감정 계산)

문제:
감정 입력 스케일과 요약 계산 기준이 일치하지 않아 대표 감정 산출 결과가 왜곡될 여지가 있었습니다.
이 왜곡은 추천 결과의 설명 가능성을 낮추고 사용자 신뢰도 저하로 이어질 수 있었습니다.

원인:
입력 DTO 검증 범위와 실제 데이터 스케일이 달랐고, 요약 재계산 시 대표 감정 반영 시점이 일관되지 않았습니다.

해결:
감정 입력 검증 범위를 `0~100`으로 정합화하고, 요약 재계산 단계에서 대표 감정을 명시적으로 계산해 반영했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: 감정 입력 스케일(0~100) 대비 DTO 검증 범위가 0~1로 불일치
> @NotNull @Min(0) @Max(1)
> private Float joy;
> 
> EmotionAvgDTO avgDto = emotionRepository.findAverageEmotionsByMovieId(movieId)
>     .orElseGet(() -> EmotionAvgDTO.builder()
>         .joy(0.0).sadness(0.0).anger(0.0).fear(0.0)
>         .disgust(0.0).repEmotionType(EmotionType.NONE).build());
> 
> // 문제: 대표 감정 재계산 없이 요약을 갱신해 결과 왜곡 여지가 있음
> summary.updateFromDTO(avgDto);
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: 입력 검증 범위를 실제 데이터 스케일(0~100)로 정합화
> @NotNull @Min(0) @Max(100)
> private Float joy;
> 
> EmotionAvgDTO avgDto = emotionRepository.findAverageEmotionsByMovieId(movieId)
>     .orElseGet(() -> EmotionAvgDTO.builder()
>         .joy(0.0).sadness(0.0).anger(0.0).fear(0.0)
>         .disgust(0.0).repEmotionType(EmotionType.NONE).build());
> 
> // 개선: 저장 전 대표 감정을 명시적으로 계산해 요약 일관성 확보
> EmotionType rep = movieService.calculateRepEmotion(avgDto);
> avgDto.setRepEmotionType(rep);
> summary.updateFromDTO(avgDto);
> ```

**Commit Evidence**
- `53aeac7` (감정 DTO 범위 0~100)
- `ff72cbc` (대표 감정 계산 오류 개선)

결과:
입력 스케일과 집계 계산 기준이 맞춰져, 추천 결과 해석의 일관성과 신뢰도를 함께 확보할 수 있었습니다.
**Verification**
- 감정 입력값 `100` 요청 -> 허용, `101` 요청 -> 검증 실패로 차단되는지 확인
- 리뷰 등록/수정 이후 `recalcMovieSummary` 실행 -> 대표 감정 필드 갱신 여부 확인

**Recurrence Prevention**
- 감정 도메인 입력/응답 스케일을 API 계약에 고정하고 문서화 상태를 함께 관리
- 집계 로직 변경 시 대표 감정 계산 테스트 케이스를 필수로 추가
~~~

- - -
