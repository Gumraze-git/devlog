## 5. 프로젝트 평가 및 개선

~~~troubleshooting
제목: REST API 경로 및 오류 응답 포맷의 비표준화

문제:
- 경로/식별자 계약이 `members/memberId`와 `users/userId`로 도메인별로 혼재되어 API 해석 비용이 높았습니다.
- 예외 응답 포맷이 공통 계약으로 고정되지 않아 클라이언트의 오류 처리 로직이 파편화되었습니다.

원인:
- 리소스 중심 URI 규칙과 식별자 네이밍 규칙이 도메인별로 다르게 유지되면서 계약 경계가 일관되지 않았습니다.
- 예외 처리도 공통 Problem 포맷이 아닌 도메인별 처리 방식이 섞여 계약 통일이 어려웠습니다.

해결:
- Devlog: [REST 시리즈](https://velog.io/@gumraze/series/REST)
- 백엔드를 `/api/v1` 리소스 중심 계약과 `ProblemDetail` 기반 오류 응답으로 정리했습니다.
- 회원 도메인 식별자를 `users/userId` 기준으로 통일하고 내부 연동 URI도 v1 계약으로 정렬했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: ApiResponse.fail 중심 처리로 ProblemDetail 공통 계약이 미적용됨
> @ExceptionHandler(BaseException.class)
> public ResponseEntity<ApiResponse<Void>> handleGlobalException(BaseException ex) {
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
> // 개선: ProblemDetailFactory로 공통 오류 payload를 일관 생성
> @ExceptionHandler(BaseException.class)
> public ResponseEntity<ProblemDetail> handleGlobalException(BaseException ex, HttpServletRequest request) {
>     HttpStatus status = HttpStatus.valueOf(ex.getStatusCode());
>     ProblemDetail pd = problemDetailFactory.create(status, code, ex.getResponseMessage(), request);
>     return ResponseEntity.status(status).body(pd);
> }
> ```
> 
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
> 
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: 구버전 내부 URI(/predict/overall_avg) 사용
> .uri("/predict/overall_avg")
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: v1 내부 계약 URI(/api/v1/emotion-predictions)로 정렬
> .uri("/api/v1/emotion-predictions")
> ```

결과:
Devlog 내용을 기반으로 URI/식별자/오류 포맷의 API 계약을 일관되게 정립하여, 협업 시 발생하던 계약 해석 오차를 획기적으로 줄였습니다.
~~~

~~~troubleshooting
제목: 컨트롤러와 Swagger 문서의 과도한 결합

문제:
- 컨트롤러 구현부와 Swagger 어노테이션이 강하게 결합되어 코드 가독성이 저해되고 문서 최신화 관리가 어려웠습니다.
- 공통 에러 응답 및 보안 요구사항 등의 문서화 코드가 도메인별로 중복되어 일관성이 결여되었습니다.

원인:
- 문서화에 대한 책임이 컨트롤러 구현 내부에 혼재되어 있어, 비즈니스 로직과 문서 메타데이터가 뒤섞인 구조였습니다.
- 공통 Swagger 규칙을 자동화하여 보정하는 레이어가 없어 문서 품질이 수동 관리에 의존했습니다.

해결:
- Devlog: [Swagger를 분리해보자](https://velog.io/@gumraze/Swagger%EB%A5%BC-%EB%B6%84%EB%A6%AC%ED%95%B4%EB%B3%B4%EC%9E%90)
- `*Api` 인터페이스 패턴을 도입하여 문서 책임을 컨트롤러 구현부에서 명확히 분리했습니다.
- `OpenApiContractCustomiser`와 공통 어노테이션을 구현하여 전역적인 문서화 표준을 자동 적용했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: 구현과 문서 책임이 컨트롤러에 결합되어 비즈니스 로직 파악이 어려움
> @RestController
> @RequestMapping("/api/v1/members")
> public class MeController { 
>     @Operation(summary = "내 정보 조회", ...)
>     @ApiResponses(...)
>     public ResponseEntity<MemberResponse> getMe() { ... }
> }
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: 문서 계약을 MeApi 인터페이스로 격리하고 컨트롤러는 구현에만 집중
> @RestController
> @RequestMapping("/api/v1/users")
> public class MeController implements MeApi { 
>     @Override
>     public ResponseEntity<MemberResponse> getMe() { ... }
> }
> ```
> 
> ```chips
> As-Is | | asis
> ```
> ```java
> // 문제: ProblemDetail 예시 경로가 members 기준으로 남아 최신 규약과 불일치
> @Schema(description = "Request URI", example = "/api/v1/members/me")
> private String instance;
> ```
> 
> ```chips
> To-Be | | tobe
> ```
> ```java
> // 개선: users 기준 전역 예시 경로로 일괄 대응하여 문서 신뢰도 확보
> @Schema(description = "Request URI", example = "/api/v1/users/me")
> private String instance;
> ```

결과:
문서와 구현의 책임을 물리적으로 분리하고 공통 커스터마이저를 통해 전역 표준을 강제함으로써, API 문서의 정확성과 코드 유지보수성을 동시에 확보했습니다.
~~~
