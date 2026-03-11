## 1. 프로젝트 개요 및 목표

**4EVER / everp**는 견적, 주문, 발주, 재고, 생산, 정산, 인사 관리를 하나의 흐름으로 연결하는 **MSA 기반 ERP 플랫폼**입니다.

### 배경 및 목적
팀 프로젝트 초반에는 화면 구현과 목업 API 개발이 빠르게 진행되고 있었지만, 실제로는 인증 경계, 서비스 간 역할 분리, 대시보드 집계 기준, 초기화 데이터 규칙이 먼저 정리되지 않으면 기능이 늘수록 협업 비용이 커지는 상태였습니다.

이 프로젝트에서 제가 집중한 목표는 다음 세 가지였습니다.

- Auth, Gateway, Business, SCM이 각각 어떤 책임을 가져야 하는지 정리하기
- ERP 도메인 흐름을 대시보드와 운영 시나리오에 맞게 API로 연결하기
- 초기화 데이터, 권한, 연계 규칙을 코드 수준에서 반복 가능하게 만들기

### 역할 및 기여
프로젝트에서는 **팀장 + 백엔드** 역할을 맡았습니다. 팀 리딩은 일정과 범위를 정리하는 수준에 머무르지 않고, 어떤 기능을 어느 서비스가 담당할지와 API 계약을 어떻게 끊을지를 함께 결정하는 역할에 가까웠습니다.

#### 역할 및 기여
- **권한 경계와 인증 흐름 정리**: Auth 서버에서 사용자 유형별 로그인 제한을 두고, Gateway에서는 도메인별 엔드포인트에 권한 검사를 추가해 서비스 진입 기준을 정리했습니다.
  ```chips
  모바일 클라이언트 로그인 제한 | https://github.com/Gumraze-git/everp/commit/ab79ce1af4dca9c3733c8dba4c7dc354de903950 | commit
  LoginSuccessHandler | https://github.com/Gumraze-git/everp/blob/ab79ce1af4dca9c3733c8dba4c7dc354de903950/src/main/java/org/ever/_4ever_be_auth/auth/account/handler/LoginSuccessHandler.java | code
  생산 엔드포인트 권한 검사 추가 | https://github.com/Gumraze-git/everp/commit/4170435828364713508b7087335ee1d20c1ab05a | commit
  PpController | https://github.com/Gumraze-git/everp/blob/4170435828364713508b7087335ee1d20c1ab05a/src/main/java/org/ever/_4ever_be_gw/scm/pp/controller/PpController.java | code
  ```
- **대시보드 집계 API 설계 및 구현**: 주문·견적·매입 정보를 단순 리스트가 아니라 대시보드에 바로 쓸 수 있는 workflow item으로 가공하고, 제품 정보와 사용자 정보를 연결하는 로직을 정리했습니다.
  ```chips
  대시보드 주문/견적 조회 로직 개선 | https://github.com/Gumraze-git/everp/commit/c248722b02edd1d4a0f67e6b9a88eb86bb030d14 | commit
  DashboardOrderServiceImpl | https://github.com/Gumraze-git/everp/blob/c248722b02edd1d4a0f67e6b9a88eb86bb030d14/src/main/java/org/ever/_4ever_be_business/sd/service/impl/DashboardOrderServiceImpl.java | code
  견적 필터/정렬/페이지네이션 | https://github.com/Gumraze-git/everp/commit/241dae8b266ab9950cc0dfbbe5be9cc11e78c49e | commit
  SdController | https://github.com/Gumraze-git/everp/blob/241dae8b266ab9950cc0dfbbe5be9cc11e78c49e/src/main/java/org/ever/_4ever_be_gw/business/controller/SdController.java | code
  ```
- **서비스 간 데이터 연계 구조 보강**: 공급사 매입 전표 조회에 필요한 회사 정보를 Kafka 기반 비동기 요청/응답으로 연결해, Business와 SCM의 데이터 경계를 유지하면서 필요한 정보를 조회하도록 구성했습니다.
  ```chips
  공급사 정보 Kafka 연계 | https://github.com/Gumraze-git/everp/commit/cd8e5f36bafa250cc24762ee6ed9cb3c561427af | commit
  SupplierCompanyResolverImpl | https://github.com/Gumraze-git/everp/blob/cd8e5f36bafa250cc24762ee6ed9cb3c561427af/src/main/java/org/ever/_4ever_be_business/fcm/service/impl/SupplierCompanyResolverImpl.java | code
  공급사 정보 요청/응답 이벤트 처리 | https://github.com/Gumraze-git/everp/commit/69a082878a6f2a650516af745038e52c07fd6368 | commit
  SupplierCompanyKafkaAdapter | https://github.com/Gumraze-git/everp/blob/69a082878a6f2a650516af745038e52c07fd6368/src/main/java/org/ever/_4ever_be_scm/scm/mm/integration/SupplierCompanyKafkaAdapter.java | code
  ```
- **초기화·목업 데이터 정합성 개선**: 모듈별 내부 사용자 계정과 제품 목업 데이터를 정리해 개발 환경에서도 반복 가능한 시드 구조를 만들었습니다.
  ```chips
  모듈별 내부 사용자 초기화 | https://github.com/Gumraze-git/everp/commit/dbb294be4765c8faf0e5228246487203c97001ae | commit
  InternalUserInitializer | https://github.com/Gumraze-git/everp/blob/dbb294be4765c8faf0e5228246487203c97001ae/src/main/java/org/ever/_4ever_be_business/config/InternalUserInitializer.java | code
  제품 초기화 product_id 보강 | https://github.com/Gumraze-git/everp/commit/dc261fb1d1159cc76c92bdf5dfbf219b9ad0da9e | commit
  ProductInitializer | https://github.com/Gumraze-git/everp/blob/dc261fb1d1159cc76c92bdf5dfbf219b9ad0da9e/src/main/java/org/ever/_4ever_be_scm/config/ProductInitializer.java | code
  ```

### 기술적 달성 목표
- OAuth 기반 인증 서버와 Gateway를 분리해 인증과 권한 필터링 책임을 구분
- 주문/견적/매입/생산 데이터를 대시보드 관점의 집계 API로 재구성
- 서비스 경계를 넘는 데이터는 Kafka 이벤트와 어댑터 계층으로 연결
- 목업과 초기화 데이터를 단순 샘플이 아니라 반복 가능한 개발 환경 자산으로 정리
- 모듈별 역할과 권한 정책을 코드 레벨에서 추적 가능한 구조로 고정
