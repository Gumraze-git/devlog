## 4. 핵심 트러블슈팅

~~~troubleshooting
제목: Auth와 Gateway의 권한 경계 모호성

문제:
- 인증 성공 사용자가 모든 클라이언트와 모든 도메인 API에 동일하게 접근 가능한 구조였습니다.
- 특히 모바일 클라이언트는 고객사/공급사 전용임에도 내부 사용자 경로까지 노출되는 보안 위험이 있었습니다.

원인:
- 로그인 인증 자체와 서비스 접근 권한(UserType/Client-specific)을 동일 레이어에서 처리하여 Auth와 Gateway의 책임이 혼재되었습니다.
- 결과적으로 세밀한 진입 제어 로직이 각 서비스 구현부에 파편화될 위험이 컸습니다.

해결:
- Auth의 `LoginSuccessHandler`에서 `client_id`와 `UserType` 기반의 모바일 클라이언트 접근 필터링을 강화했습니다.
- Gateway 계층에서 각 도메인(생산/구매/재고 등) 엔드포인트에 역할별 `@PreAuthorize` 기준을 일관되게 적용했습니다.

> !compare
> ```java
> // 문제: 인증 여부만 확인하고 클라이언트별 접근 제어가 부재함
> public void onLoginSuccess(...) {
>     // 모든 사용자가 모든 클라이언트로 로그인 가능
>     response.sendRedirect(homeUrl);
> }
> 
> // Gateway: 엔드포인트에 명확한 역할 권한이 없음
> @PostMapping("/quotation-simulations")
> public ResponseEntity<Object> simulate(...) { ... }
> ```
> 
> ```java
> // Auth: 클라이언트 유형별 로그인 대상 제한
> private static final Set<String> RESTRICTED_CLIENTS = Set.of("everp-ios", "everp-aos");
> private static final EnumSet<UserType> ALLOWED_USER_TYPES = EnumSet.of(UserType.CUSTOMER, UserType.SUPPLIER);
> 
> if (shouldDenyForClient(user, originalAuthUrl)) {
>     handleRestrictedClientLogin(request, response, authentication, originalAuthUrl);
>     return;
> }
> 
> // Gateway: 도메인 서비스별 권한 고정
> @PreAuthorize("hasAnyAuthority('PP_USER', 'PP_ADMIN', 'ALL_ADMIN')")
> @PostMapping("/quotation-simulations")
> public ResponseEntity<Object> simulateQuotation(...) { ... }
> ```

결과:
- 인증과 인가(접근 제어)의 책임을 명확히 분리하여, 사용자 유형 및 클라이언트 환경에 따른 강력한 보안 경계를 확보했습니다.
~~~

~~~troubleshooting
제목: Problem Detail 기반 응답 계약 부재

문제:
- 서비스마다 성공/실패 응답 형태가 제각각이라 프런트와 다른 팀원이 예외를 같은 기준으로 해석하기 어려웠습니다.
- 특히 Gateway를 거쳐 여러 도메인 API를 다루는 화면에서는 어떤 실패가 인증 문제인지, 입력 문제인지, 업무 규칙 문제인지 구분이 잘 되지 않았습니다.

원인:
- 초기에는 예외 응답을 서비스별 DTO나 문자열 메시지 수준에서 처리해, 공통 오류 계약이 먼저 정해져 있지 않았습니다.
- 결과적으로 프런트는 화면마다 예외 케이스를 따로 해석해야 했고, 팀 내에서도 실패 기준을 같은 언어로 설명하기 어려웠습니다.

해결:
- Spring Problem Detail을 기준으로 공통 오류 응답 형식을 정리하고, Gateway와 하위 서비스가 같은 실패 해석 기준을 따르도록 맞췄습니다.
- 인증/인가 오류, 입력 오류, 도메인 규칙 오류를 상태 코드와 응답 본문 기준으로 일관되게 구분하도록 정리했습니다.

> !compare
> ```java
> // 문제: 서비스마다 제각각인 오류 응답 형식
> return ResponseEntity.badRequest().body(Map.of("message", "invalid state"));
> ```
> 
> ```java
> // 공통 기준: Problem Detail 기반 오류 응답
> return ResponseEntity.badRequest().body(
>     ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "invalid state")
> );
> ```

결과:
- 서비스와 프런트가 같은 기준으로 실패를 해석할 수 있게 되면서, 인증 경계와 응답 계약을 팀 전체가 더 일관되게 설명하고 사용할 수 있게 됐습니다.
~~~

~~~troubleshooting
제목: 대시보드와 목록용 조회 계약 부재

문제:
- ERP 화면은 주문, 견적, 제품, 공급사처럼 여러 도메인 데이터를 함께 보여줘야 했지만, 초기 API는 원시 CRUD 중심이라 프런트가 화면 조합 로직을 많이 떠안고 있었습니다.
- 목록 API도 페이징·필터·정렬 계약이 충분히 정리되지 않아 운영 화면 요구사항과 API 형태가 계속 어긋났습니다.

원인:
- 도메인별 원시 데이터와 운영 화면용 조회 계약을 같은 수준에서 다뤘고, 화면이 실제로 필요한 조합형 응답을 먼저 정의하지 못했습니다.
- 특히 외부 연계 데이터와 목록 제어 파라미터가 조회 계약에 포함되지 않아, 화면마다 별도 조합 로직이 생기기 쉬웠습니다.

해결:
- `DashboardOrderServiceImpl` 같은 집계용 조회 모델을 두고, 운영 화면이 바로 사용할 수 있는 응답 형태로 가공했습니다.
- 견적 및 통계 API에 날짜 범위, 상태 필터, 검색어, 페이지네이션, 정렬 같은 목록 계약을 추가해 화면 요구사항과 API 기준을 맞췄습니다.
- 외부 연계가 필요한 데이터는 Resolver 패턴으로 분리해 조회 계약을 더 예측 가능하게 만들었습니다.

> !compare
> ```java
> // 문제: 원시 CRUD 응답을 화면에서 직접 조합
> return quotationRepo.findAll();
> ```
> 
> ```java
> // 운영 화면 기준 조회 계약과 목록 제어 파라미터
> public ResponseEntity<Object> getQuotationList(
>     @RequestParam int page,
>     @RequestParam int size,
>     @RequestParam(required = false) String sortBy
> ) { ... }
> ```

결과:
- 화면 요구사항을 API 계약으로 다시 정리하면서, 프런트와 백엔드가 같은 조회 기준으로 개발할 수 있게 됐고 운영 화면 연동도 더 단순해졌습니다.
~~~

~~~troubleshooting
제목: 초기 데이터 정합성 불일치

문제:
- 모듈별 테스트 계정과 목업 데이터가 개발자마다 다르게 관리되어 재현 불가능한 버그가 자주 발생했습니다.
- 특히 권한과 대시보드 시나리오를 전체 팀이 동일하게 테스트할 수 있는 기준 데이터가 부족했습니다.

원인:
- 사용자 계정, 제품 식별자, 조직 정보가 하나의 초기화 규칙으로 묶여 있지 않고 각 서비스에 흩어져 있었습니다.
- 결과적으로 어떤 계정과 어떤 데이터 조합으로 화면을 검증해야 하는지 팀마다 다르게 이해하기 쉬웠습니다.

해결:
- `InternalUserInitializer`를 도입해 Auth 계정 ID와 도메인 데이터를 매핑하는 전역 시드 규칙을 설정했습니다.
- `ProductInitializer`에 고유 `productId`와 소재 기반 구조를 적용해 식별 정합성을 확보했습니다.
- 모듈별 테스트 계정과 권한 시나리오를 같은 규칙으로 반복 실행할 수 있게 정리했습니다.

> !compare
> ```java
> // 문제: 개발자마다 다른 샘플 데이터와 계정 규칙
> userRepository.save(new User("test1", "ROLE_USER"));
> ```
> 
> ```java
> // 시드 규칙: 모듈별 권한과 인원 기준 초기화
> private static final List<ModuleSeedConfig> MODULE_SEED_CONFIGS = List.of(...);
> ```

결과:
- 시드 데이터가 단순 샘플이 아니라 재현 가능한 개발 기준이 되면서, 팀 전체가 같은 계정과 같은 업무 시나리오 위에서 개발하고 검증할 수 있게 됐습니다.
~~~
