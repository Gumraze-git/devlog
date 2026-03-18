## 1. 프로젝트 개요 및 목표

**4EVER / everp**는 견적, 주문, 발주, 재고, 생산, 정산, 인사 관리를 하나의 흐름으로 연결하는 **MSA 기반 ERP 플랫폼**입니다.

이 문서는 프로젝트 본편(2025.09-2025.11)의 문제의식과 설계 판단을 중심으로 정리하고, 2026.03에 진행한 저장소 기준의 후속 개선은 평가 섹션 안에서 함께 정리합니다.

### 배경 및 목적

이 프로젝트는 부트캠프 최종 프로젝트 요구사항인 "대규모 이벤트 관리 시스템"을 ERP로 구현하는 과제에서 출발했습니다. 다만 여기서 말하는 대규모 이벤트를 저희 팀은 단순한 트래픽 규모보다, 견적, 주문, 발주, 재고, 생산, 정산, 사용자 생성처럼 업무 이벤트가 대량으로 그리고 연쇄적으로 이어지는 상황으로 해석했습니다. 한 단계의 상태 변경이 다음 단계의 업무를 바로 발생시키는 ERP 특성상, 기능을 빨리 늘리는 것보다 먼저 어떤 이벤트를 어느 도메인이 책임질지와 실패 시 트랜잭션을 어떻게 다룰지가 더 중요했습니다.

그래서 프로젝트 초반 제가 집중한 목적은 두 가지였습니다. 첫째, ERP 도메인을 기준으로 MSA 경계를 나눠 Business와 SCM이 무엇을 소유할지 결정하는 것. 둘째, OAuth 기반 인증/인가와 Gateway 권한 해석, Kafka 기반 비동기 연계를 묶어 실제 업무 이벤트가 여러 서비스에 걸쳐 흘러도 추적 가능한 구조를 만드는 것이었습니다. 화면 구현과 목업 API는 빠르게 진행되고 있었지만, 이 기준이 먼저 고정되지 않으면 서비스 경계, 권한, 조회 계약, 시드 데이터가 모두 흔들릴 수 있다고 판단했습니다.

### 역할 및 기여
프로젝트에서는 **팀장 + 백엔드** 역할을 맡았습니다. 산업공학과 배경 덕분에 ERP의 업무 흐름과 데이터 묶음을 상대적으로 빨리 이해할 수 있었고, 이를 바탕으로 영업·재무·인사와 발주·재고·생산을 어떤 기준으로 분리할지, 그리고 인증/인가와 비동기 트랜잭션을 어떤 서비스가 맡아야 할지를 결정하는 역할을 많이 담당했습니다. Gateway는 권한과 진입 경계를 통제하고, 실제 비동기 트랜잭션 처리는 Auth, Business, SCM에서 Kafka와 `transactionId` 중심으로 풀어가는 구도를 잡았습니다.

- **OAuth 인증/인가 프레임워크 정착**: Auth 서버에 PostgreSQL 기반 OAuth2 Authorization Server 구조를 올리고, 로그인 성공 핸들러, 클라이언트 등록, 모바일 클라이언트 제한까지 이어지는 인증 흐름을 직접 정리했습니다.
  ```chips
  postgresql 기반 oauth2 schema 추가 | https://github.com/Gumraze-git/everp/commit/44fe122c91cab85d6e9787fbd8580ef55e7f7268 | commit
  oauth2 인증 요청 처리 로직 및 로그인 성공 핸들러 추가 | https://github.com/Gumraze-git/everp/commit/ce20ac4ff7d75de69b112da323a89a3f68f38557 | commit
  ios 및 aos oauth 클라이언트 등록 로직 추가 | https://github.com/Gumraze-git/everp/commit/cb00690fee775d8890ca8ba3988f24b45d73caf2 | commit
  모바일 클라이언트 로그인 제한 | https://github.com/Gumraze-git/everp/commit/ab79ce1af4dca9c3733c8dba4c7dc354de903950 | commit
  LoginSuccessHandler | https://github.com/Gumraze-git/everp/blob/ab79ce1af4dca9c3733c8dba4c7dc354de903950/src/main/java/org/ever/_4ever_be_auth/auth/account/handler/LoginSuccessHandler.java | code
  ```

- **Gateway 권한 경계와 Resource Server 구조 정리**: Gateway를 Kafka 처리 주체가 아니라 인증 이후의 단일 진입점으로 두고, OAuth2 Resource Server와 `@PreAuthorize` 기반 권한 해석을 각 도메인 엔드포인트에 일관되게 적용했습니다.
  ```chips
  oauth2 리소스 서버 설정 추가 | https://github.com/Gumraze-git/everp/commit/dde95488c8c6bb7af6899a80df1bfdfc25da7bf9 | commit
  견적 및 고객 관련 엔드포인트에 권한 검사 추가 | https://github.com/Gumraze-git/everp/commit/2682eb67053b82d666a18592d70db269bd349b14 | commit
  생산 관리 엔드포인트에 권한 검사 추가 | https://github.com/Gumraze-git/everp/commit/4170435828364713508b7087335ee1d20c1ab05a | commit
  PpController | https://github.com/Gumraze-git/everp/blob/4170435828364713508b7087335ee1d20c1ab05a/src/main/java/org/ever/_4ever_be_gw/scm/pp/controller/PpController.java | code
  ```

- **Kafka 기반 비동기 트랜잭션 흐름 설계**: 내부 사용자 생성, 공급사 생성, 공급사 정보 조회 같은 흐름에 Saga, 수동 Ack, `transactionId`, request/reply를 도입해 서비스 간 상태를 추적할 수 있는 구조를 만들었습니다.
  ```chips
  saga 트랜잭션 관리 및 보상 모듈 추가 | https://github.com/Gumraze-git/everp/commit/284480411fee5fbd904b17c235b9dcd07c2fecc0 | commit
  내부 사용자 생성에 saga 패턴 및 카프카 발행 로직 추가 | https://github.com/Gumraze-git/everp/commit/773c22d27d81c825566d1d3f6e298c7790670740 | commit
  공급사 생성 로직 구현 및 saga 트랜잭션 처리 추가 | https://github.com/Gumraze-git/everp/commit/d7fc92e1a3d06df4275b60af281ceae0f1859841 | commit
  공급사 회사 정보 조회를 위한 kafka 기반 비동기 처리 로직 추가 | https://github.com/Gumraze-git/everp/commit/cd8e5f36bafa250cc24762ee6ed9cb3c561427af | commit
  공급사 정보 요청, 응답 이벤트 처리 로직 추가 | https://github.com/Gumraze-git/everp/commit/69a082878a6f2a650516af745038e52c07fd6368 | commit
  acknowledgment 기반 수동 커밋 로직 추가 | https://github.com/Gumraze-git/everp/commit/7489cca4e9ac2bebe1d4e46a92a84762b898a4a3 | commit
  ```

- **대시보드 조회 계약과 초기화 데이터 정리**: 대시보드에 필요한 조합형 조회 모델과 반복 가능한 시드 데이터를 정리해, 팀 전체가 같은 업무 시나리오를 기준으로 개발할 수 있게 만들었습니다.
  ```chips
  대시보드 주문/견적 조회 로직 개선 | https://github.com/Gumraze-git/everp/commit/c248722b02edd1d4a0f67e6b9a88eb86bb030d14 | commit
  견적 및 통계 api 필터, 정렬, 페이지네이션 기능 추가 | https://github.com/Gumraze-git/everp/commit/241dae8b266ab9950cc0dfbbe5be9cc11e78c49e | commit
  모듈별 내부 사용자 초기화 | https://github.com/Gumraze-git/everp/commit/dbb294be4765c8faf0e5228246487203c97001ae | commit
  제품 초기화 product_id 보강 | https://github.com/Gumraze-git/everp/commit/dc261fb1d1159cc76c92bdf5dfbf219b9ad0da9e | commit
  ```

### 기술적 달성 목표
- ERP 업무 이벤트를 기준으로 Business와 SCM의 도메인 경계를 나누고 MSA 책임을 명확히 정의
- OAuth2 Authorization Server와 Gateway Resource Server 조합으로 인증/인가 체계를 정립
- Kafka, `transactionId`, Saga, `DeferredResult`를 활용해 서비스 간 비동기 흐름을 추적 가능한 구조로 구성
- 주문/견적/매입/생산 데이터를 화면 요구사항에 맞는 조합형 조회 API로 재구성
- 초기화 데이터와 테스트 계정 규칙을 반복 가능한 개발 환경 자산으로 정리
