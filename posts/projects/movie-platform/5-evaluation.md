## 5. 프로젝트 평가 및 개선

### 5.1 REST/ProblemDetail 정합화
~~~troubleshooting
제목: REST/ProblemDetail 학습 적용

문제:
- 경로/식별자 계약이 `members/memberId`와 `users/userId`로 혼재되어 API 해석 비용이 높았습니다.
- 문제: 예외 응답 포맷이 공통 계약으로 고정되지 않아 클라이언트 오류 처리 기준이 분산되어 있었습니다.

원인:
리소스 중심 URI 규칙과 식별자 네이밍 규칙이 도메인별로 다르게 유지되면서 계약 경계가 일관되지 않았습니다.
예외 처리도 공통 Problem 포맷이 아닌 도메인별 처리 방식이 섞여 계약 통일이 어려웠습니다.

해결:
- 학습 근거: [REST 시리즈](https://velog.io/@gumraze/series/REST)
- 백엔드를 `/api/v1` 리소스 중심 계약과 `ProblemDetail` 기반 오류 응답으로 정리했습니다.
- 회원 도메인 식별자를 `users/userId` 기준으로 DTO/URI에 일관되게 반영했습니다.
- Spring -> FastAPI 내부 연동 URI도 v1 계약으로 정렬했습니다.

**Code Evidence - 오류 응답 계약**
> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> @ExceptionHandler(BaseException.class)
> public ResponseEntity<ApiResponse<Void>> handleGlobalException(BaseException ex) {
>     // 문제: ApiResponse.fail 중심 처리로 ProblemDetail 공통 계약이 미적용됨
>     return ResponseEntity
>             .status(ex.getStatusCode())
>             .body(ApiResponse.fail(ex.getStatusCode(), ex.getResponseMessage()));
> }
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> @ExceptionHandler(BaseException.class)
> public ResponseEntity<ProblemDetail> handleGlobalException(BaseException ex, HttpServletRequest request) {
>     // 개선: ProblemDetailFactory로 공통 오류 payload(code/trace 등)를 일관 생성
>     HttpStatus status = HttpStatus.valueOf(ex.getStatusCode());
>     String code = ErrorStatus.fromMessage(ex.getResponseMessage())
>             .map(ErrorStatus::getCode).orElse("UNKNOWN_ERROR");
>     ProblemDetail pd = problemDetailFactory.create(status, code, ex.getResponseMessage(), request);
>     return ResponseEntity.status(status).body(pd);
> }
> ```

**Code Evidence - URI/식별자 정합화**
> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: members/memberId 계약으로 users/userId 기준과 불일치
> @RequestMapping("/api/v1/members")
> public class MemberRegistrationController {
>     Long memberId = ((Number) result.get("memberId")).longValue();
> }
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: users/userId 기준으로 URI와 식별자 키를 통일
> @RequestMapping("/api/v1/users")
> public class MemberRegistrationController {
>     Long userId = ((Number) result.get("userId")).longValue();
> }
> ```

**Code Evidence - Spring -> AI 내부 URI**
> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> PredictRequestDTO request = new PredictRequestDTO(savedReview.getContent());
> PredictResponseDTO response = fastApiRestClient.post()
>         // 문제: 구버전 내부 URI(/predict/overall_avg) 사용
>         .uri("/predict/overall_avg")
>         .body(request)
>         .retrieve()
>         .body(PredictResponseDTO.class);
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> PredictRequestDTO request = new PredictRequestDTO(savedReview.getContent(), "overall_avg");
> PredictResponseDTO response = fastApiRestClient.post()
>         // 개선: v1 내부 계약 URI(/api/v1/emotion-predictions)로 정렬
>         .uri("/api/v1/emotion-predictions")
>         .body(request)
>         .retrieve()
>         .body(PredictResponseDTO.class);
> ```

```chips
REST 시리즈 | https://velog.io/@gumraze/series/REST
백엔드 REST v1 경로·오류 계약 전환 | https://github.com/Gumraze-git/Insidemovie/commit/3d8225f | commit
회원 도메인 users/userId 계약 통일 | https://github.com/Gumraze-git/Insidemovie/commit/933fbba | commit
AI 서버 v1 URI/ProblemDetail 계약 정렬 | https://github.com/Gumraze-git/Insidemovie/commit/70ba945 | commit
ControllerExceptionAdvice | https://github.com/Gumraze-git/Insidemovie/blob/3d8225f/apps/backend/src/main/java/com/insidemovie/backend/common/advice/ControllerExceptionAdvice.java | code
ProblemDetailFactory | https://github.com/Gumraze-git/Insidemovie/blob/3d8225f/apps/backend/src/main/java/com/insidemovie/backend/common/problem/ProblemDetailFactory.java | code
MemberRegistrationController | https://github.com/Gumraze-git/Insidemovie/blob/933fbba/apps/backend/src/main/java/com/insidemovie/backend/api/member/controller/MemberRegistrationController.java | code
apps/ai/main.py | https://github.com/Gumraze-git/Insidemovie/blob/70ba945/apps/ai/main.py | code
```

결과:
학습 내용을 URI/식별자/오류 포맷의 API 계약 일관성으로 구체화해, 협업 시 계약 해석 오차를 줄였습니다.
~~~

### 5.2 Swagger 계약 고도화
~~~troubleshooting
제목: Swagger 문서 분리 학습 적용

문제:
컨트롤러 구현과 문서 어노테이션이 결합되어 변경 시 문서 drift 위험이 있었습니다.
공통 에러 응답/보안 요구/`201 Location` 문구가 도메인별로 반복되어 문서 일관성이 낮았습니다.

원인:
문서 책임이 컨트롤러 구현 내부에 흩어져 있어 도메인별 중복과 누락이 동시에 발생했습니다.
공통 Swagger 규칙을 자동 보정하는 레이어가 없어 문서 품질이 수동 관리에 의존했습니다.

해결:
- 학습 근거: [Swagger를 분리해보자](https://velog.io/@gumraze/Swagger%EB%A5%BC-%EB%B6%84%EB%A6%AC%ED%95%B4%EB%B3%B4%EC%9E%90)
- `*Api` 인터페이스 패턴으로 문서 책임을 컨트롤러 구현에서 분리했습니다.
- `ApiCommonErrorResponses` 등 공통 메타 어노테이션을 도입해 중복 문서화를 줄였습니다.
- `OpenApiContractCustomiser`로 공통 Problem 응답, `Location` 헤더, 정렬 규칙을 표준화했습니다.
- Swagger 계약 테스트를 추가해 문서 회귀를 검증 가능하게 만들었습니다.

**Code Evidence - 문서 책임 분리**
> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> @RestController
> @RequestMapping("/api/v1/members")
> public class MeController {
>     // 문제: 구현과 문서 책임이 컨트롤러에 결합되어 변경 시 drift 위험이 큼
> }
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> @RestController
> @RequestMapping("/api/v1/members")
> public class MeController implements MeApi {
>     // 개선: 구현 책임만 유지하고 문서 계약은 MeApi 인터페이스로 분리
> }
> ```

**Code Evidence - 공통 규약 정합화**
> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: ProblemDetail 예시 경로가 members 기준으로 남아 최신 계약과 불일치
> @Schema(description = "Request URI", example = "/api/v1/members/me")
> private String instance;
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: users 기준 예시 경로로 정렬해 Swagger 문서 계약을 일치시킴
> @Schema(description = "Request URI", example = "/api/v1/users/me")
> private String instance;
> ```

```chips
Swagger 학습 글 | https://velog.io/@gumraze/Swagger%EB%A5%BC-%EB%B6%84%EB%A6%AC%ED%95%B4%EB%B3%B4%EC%9E%90
Swagger 문서 책임 분리(*Api 패턴 도입) | https://github.com/Gumraze-git/Insidemovie/commit/9938488 | commit
Swagger users/userId 계약 문서 정합화 | https://github.com/Gumraze-git/Insidemovie/commit/4e4aea2 | commit
MeApi | https://github.com/Gumraze-git/Insidemovie/blob/9938488/apps/backend/src/main/java/com/insidemovie/backend/api/member/docs/MeApi.java | code
MeController | https://github.com/Gumraze-git/Insidemovie/blob/9938488/apps/backend/src/main/java/com/insidemovie/backend/api/member/controller/MeController.java | code
ApiCommonErrorResponses | https://github.com/Gumraze-git/Insidemovie/blob/9938488/apps/backend/src/main/java/com/insidemovie/backend/common/swagger/annotation/ApiCommonErrorResponses.java | code
OpenApiContractCustomiser | https://github.com/Gumraze-git/Insidemovie/blob/9938488/apps/backend/src/main/java/com/insidemovie/backend/common/config/swagger/OpenApiContractCustomiser.java | code
ProblemDetailContract | https://github.com/Gumraze-git/Insidemovie/blob/4e4aea2/apps/backend/src/main/java/com/insidemovie/backend/common/swagger/schema/ProblemDetailContract.java | code
SwaggerContractDocumentationTest | https://github.com/Gumraze-git/Insidemovie/blob/4e4aea2/apps/backend/src/test/java/com/insidemovie/backend/SwaggerContractDocumentationTest.java | code
```

결과:
문서와 구현의 책임을 분리하고 테스트로 계약을 검증하는 구조를 갖춰, API 문서 변경 추적성과 신뢰도를 높였습니다.
~~~

- - -
