## 4. 핵심 트러블슈팅 및 성능 개선

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
제목: 대시보드 다중 도메인 데이터 결합 병목

문제:
- ERP 대시보드는 여러 도메인(주문, 견적, 제품 등) 정보를 통합 제공해야 하지만, 각 도메인 API가 파편화되어 있었습니다.
- 프런트엔드에서 조합 로직을 부담하면서 화면 로딩 속도가 저하되고 개발 복잡도가 증가했습니다.

원인:
- 도메인별 원시 CRUD API와 운영 화면용 집계 API의 목적이 혼재되어 있었습니다.
- 특히 외부 서비스 연동이 필요한 데이터(공급사 회사명 등)의 동기 조회 방식이 전체 응답 시간을 지연시켰습니다.

해결:
- `DashboardOrderServiceImpl`을 도입하여 필요한 원천 데이터를 사전 가공하는 workflow item 모델로 구조화했습니다.
- 공급사 정보 등 외부 연계는 Kafka 기반 비동기 Resolver 패턴(`SupplierCompanyResolverImpl`)으로 전환하여 서비스 간 결합도를 낮췄습니다.

> !compare
> ```java
> // 문제: 프런트엔드에서 각 도메인을 순차 조회하거나 동기식으로 무겁게 결합
> Order order = orderRepo.findById(id);
> Product product = restTemplate.getForObject("/products/" + order.getPid()); // 동기 호출 병목
> return new DashboardDto(order, product);
> ```
> 
> ```java
> // 집계 서비스: 주문 아이템과 제품 정보를 Workflow 모델로 가공
> Map<String, List<OrderItem>> itemsByOrder = mapOrderItems(orders);
> Map<String, ProductInfoResponseDto.ProductDto> productMap = buildProductMap(itemsByOrder);
> 
> // 비동기 연계: Kafka를 통한 공급사 정보 확인 요청
> SupplierCompanyResolveRequestEvent event = SupplierCompanyResolveRequestEvent.builder()
>         .transactionId(transactionId)
>         .supplierUserId(supplierUserId)
>         .build();
> ```

결과:
- 파편화된 CRUD API를 운영 목적에 맞춘 전용 집계 API로 재구성하여, 대시보드 로딩 성능을 개선하고 프런트엔드 협업 효율을 극대화했습니다.
~~~

~~~troubleshooting
제목: 개발 환경별 초기 데이터 정합성 불일치

문제:
- 모듈별 테스트 계정과 목업 데이터가 개발자마다 다르게 관리되어 재현 불가능한 버그가 자주 발생했습니다.
- 특히 권한 및 대시보드 시나리오를 전체 팀이 동일하게 테스트할 수 있는 기준 데이터가 부족했습니다.

원인:
- 사용자 계정, 제품 식별자, 조직 정보 등이 하나의 초기화 규칙으로 묶여 있지 않고 각 서비스에 산재되어 있었습니다.

해결:
- `InternalUserInitializer`를 도입하여 Auth 계정 ID와 도메인 데이터를 매핑하는 전역 시드 규칙을 설정했습니다.
- 제품 시드(`ProductInitializer`)에 고유 `productId` 필드와 소재 기반 구조를 적용하여 식별 정합성을 확보했습니다.

> !compare
> ```java
> // 문제: 각 개발자가 필요에 따라 임의의 ID로 데이터를 산발적으로 생성
> userRepository.save(new User("test1", "ROLE_USER"));
> productRepository.save(new Product("p1", "sample"));
> ```
> 
> ```java
> // 시드 설정: 모듈별 권한 및 인원 기반 초기화 규칙 고정
> private static final List<ModuleSeedConfig> MODULE_SEED_CONFIGS = List.of(
>     new ModuleSeedConfig("MM", "DEPT-001", "mm-user", 10, "mm-admin", 2),
>     new ModuleSeedConfig("SD", "DEPT-002", "sd-user", 10, "sd-admin", 2),
>     new ModuleSeedConfig("IM", "DEPT-003", "im-user", 10, "im-admin", 2)
> );
> ```

결과:
- 시드 데이터가 단순 샘플링을 넘어 "재현 가능한 개발 인프라"로 구축되었으며, 팀 전체가 동일한 테스트 데이터 세트 위에서 안정적으로 개발할 수 있게 되었습니다.
~~~

~~~troubleshooting
제목: 대량 목록 조회 시 N+1 반복 요청 병목

문제:
- 주문/견적 목록에서 각 항목의 상세 데이터를 건별로 반복 조회하는 구조로 인해, 데이터 증가에 따라 응답 속도가 기하급수적으로 느려졌습니다.
- 대화형 대시보드 환경에서 목록 확장 시 발생하는 반복 조회 패턴이 주요 병목 지점이 되었습니다.

원인:
- 레파지토리 수준에서 개별 ID 기반 조회 메서드만 존재하여, 다건의 하위 항목을 일괄 조회할 수 있는 인터페이스가 부재했습니다.

해결:
- `In` 연산자를 활용한 다중 ID 기반 조회(`findByOrder_IdIn` 등)를 도입하여 목록 단위 데이터를 일괄 배치 조회하도록 전환했습니다.
- `DashboardOrderServiceImpl`에서 수집한 ID 목록을 맵 형태로 결합하여 메모리 내에서 데이터 매핑을 처리하도록 개선했습니다.

> !compare
> ```java
> // 문제: 목록 루프 내에서 건별로 상세 정보를 조회 (N+1 발생)
> for (Order order : orders) {
>     List<OrderItem> items = orderItemRepo.findByOrderId(order.getId()); // 반복 쿼리
>     order.setItems(items);
> }
> ```
> 
> ```java
> // 레파지토리: 다중 ID 기반 일괄 조회 인터페이스 도입
> List<OrderItem> findByOrder_IdIn(List<String> orderIds);
> 
> // 서비스: 스트림을 활용한 효율적인 맵 매핑 처리
> List<String> orderIds = orders.stream().map(Order::getId).toList();
> return orderItemRepository.findByOrder_IdIn(orderIds).stream()
>         .collect(Collectors.groupingBy(item -> item.getOrder().getId()));
> ```

결과:
- 반복 조회 비용을 근본적으로 제거하여 목록 조회 성능을 대폭 향상시켰으며, 대량 데이터 환경에서도 안정적인 응답을 보장하게 되었습니다.
~~~

~~~troubleshooting
제목: 비표준화된 목록 조회 응답 제어

문제:
- ERP 목록 API가 페이징이나 필터 없이 전체 데이터를 반환하여, 시스템 부하와 응답 크기가 지속적으로 증가하는 문제가 있었습니다.
- UI 요구사항(검색, 정렬)이 API 계약에 포함되지 않아 불필요한 데이터 통신이 과다하게 발생했습니다.

원인:
- 초기 API 설계가 고정된 전체 조회 방식에 머물러 있어, 대용량 데이터를 처리하기 위한 제어 파라미터가 누락되었습니다.

해결:
- 견적 및 통계 API에 날짜 범위, 상태 필터 검색어, 0-base 기준 페이지네이션을 표준 계약으로 추가했습니다.
- 정렬 기준(`sortBy`)을 동적으로 수용할 수 있도록 컨트롤러 레이어를 고도화했습니다.

> !compare
> ```java
> // 문제: 파라미터 제어 없이 전체 결과를 리스트로 반환
> @GetMapping("/quotations")
> public List<Quotation> getAll() {
>     return quotationRepo.findAll();
> }
> ```
> 
> ```java
> // 컨트롤러: 페이징 및 검색 필터 파라미터 표준화
> @GetMapping("/quotations")
> public ResponseEntity<Object> getQuotationList(
>         @RequestParam(defaultValue = "0") int page,
>         @RequestParam(defaultValue = "10") int size,
>         @RequestParam(required = false) String sortBy,
>         @RequestParam(required = false) String status) { ... }
> ```

결과:
- 필요한 범위만 전송하는 효율적인 API 계약을 정립하여 네트워크 부하를 줄이고 관리 화면의 반응 속도를 개선했습니다.
~~~

~~~troubleshooting
제목: Kafka 비동기 흐름의 결과 추적 부재

문제:
- 서비스 간 비동기 이벤트 흐름에서 중복 수신이나 실패 시 상태 불일치가 발생해도 이를 감지하거나 복구할 장치가 부족했습니다.
- 특히 이벤트 소비 후 자동 커밋 시점 문제로 인해 유실되거나 재처리가 반복되는 현상이 있었습니다.

원인:
- 이벤트 발행 이후의 결과 대기, 수동 승인(ack), 보상 트랜잭션 등 비동기 라이프사이클 관리가 연동되지 않았습니다.

해결:
- `GenericAsyncResultManager`와 `DeferredResult`를 활용하여 비동기 처리 결과를 추적하고 성공/실패 여부를 확정 짓는 구조를 도입했습니다.
- Auth 소비자 레이어에 `Acknowledgment` 기반 수동 커밋을 적용하고, 실패 시 롤백 이벤트 발행 또는 보상 트리거가 이어지도록 흐름을 가시화했습니다.

> !compare
> ```java
> // 문제: 결과 확인 없이 발행만 하거나, 자동 커밋으로 인해 실패 조치가 누락됨
> kafkaTemplate.send(topic, event); // 발행 후 추적 불가
> 
> @KafkaListener(...)
> public void handle(Event event) {
>     process(event); // 수동 Ack 부재로 실패 시 유실 가능
> }
> ```
> 
> ```java
> // 결과 관리: 대기 중인 비동기 요청 상태 확인 및 결과 설정
> if (event.isSuccess()) {
>     asyncResultManager.setSuccessResult(transactionId, event, "완료", HttpStatus.CREATED);
> } else {
>     asyncResultManager.setErrorResult(transactionId, "실패", HttpStatus.INTERNAL_SERVER_ERROR);
>     publishRollbackEvent(event);
> }
> acknowledgment.acknowledge(); // 명시적 수동 커밋
> ```

결과:
- 단순 발행-소비에서 한 단계 나아가, `transactionId` 기반 결과 확인과 수동 Ack, 보상 트리거를 갖춘 1차 안정화 구조를 만들었습니다. 다만 공통 DLQ/재시도 정책과 발행-커밋 원자성은 이후 보강 과제로 남았습니다.
~~~

~~~troubleshooting
제목: 서비스 간 분산 트랜잭션의 부분적 실패 위험

문제:
- 공급사 또는 사용자 생성 시 여러 서비스의 DB에 데이터가 저장되어야 하지만, 중간 단계 실패 시 데이터가 반만 생성되는 "파편화" 현상이 있었습니다.
- 로컬 `@Transactional`만으로는 네트워크 너머의 서비스 상태까지 원자성을 보장할 수 없었습니다.

원인:
- 분산 환경에서의 "All or Nothing"을 보장하기 위한 분산 트랜잭션 정책(Saga 패턴 등)이 부재했습니다.

해결:
- `SagaTransactionManager`를 구현하여 트랜잭션 ID 단위로 변경 사항을 수집하고 실패 시 실행할 보상 로직을 등록했습니다.
- 비동기 흐름에서도 전체 작업의 완료를 `DeferredResult`로 관리하며, `SagaCompensationService`를 통해 물리적 롤백을 수행하도록 설계했습니다.

> !compare
> ```java
> // 문제: 로컬 트랜잭션만 사용해 외부 서비스 실패 시 롤백이 불가함
> @Transactional
> public void createSupplier(Dto dto) {
>     repo.save(entity);
>     remoteCall.createAccount(dto.getId()); // 실패해도 위 save는 커밋됨
> }
> ```
> 
> ```java
> // Saga 관리: 변경 내역 수집 및 예외 발생 시 전역 보상 처리
> public <T> T executeSagaWithId(String tid, Supplier<T> action) {
>     try {
>         SagaTransactionContext.setCurrentTransactionId(tid);
>         T result = action.get();
>         changeCollector.persistChanges(tid); // 변경 내역 기록
>         return result;
>     } catch (Exception e) {
>         compensationService.compensate(tid); // 분산 롤백 실행
>         throw e;
>     }
> }
> ```

결과:
- 부분 실패 시 로컬 변경을 되돌릴 수 있는 보상 기반 구조를 도입했고, 분산 트랜잭션을 설계할 때 "실패를 전제로 한 흐름"을 코드로 다루는 경험을 확보했습니다. 다만 outbox처럼 발행-저장 원자성까지 보장하는 구조는 후속 보강 여지로 남았습니다.
~~~
