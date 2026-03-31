## 1. 프로젝트 개요 및 목표

**Everp**는 견적, 주문, 발주, 재고, 생산, 정산, 인사 흐름을 하나의 업무 체계로 다뤄본 **ERP 성격의 팀 프로젝트**입니다.

### 배경 및 목적

이 프로젝트는 부트캠프 최종 프로젝트 요구사항인 "대규모 이벤트 관리 시스템"을 ERP로 구현하는 과제에서 출발했습니다. 다만 여기서 말하는 대규모 이벤트를 저희 팀은 단순한 트래픽 규모보다, 견적, 주문, 발주, 재고, 생산, 정산, 사용자 생성처럼 업무 이벤트가 연쇄적으로 이어지는 상황으로 해석했습니다. 한 단계의 상태 변경이 다음 단계의 업무를 바로 발생시키는 ERP 특성상, 기능을 빠르게 늘리는 것보다 먼저 인증, API 진입 경계, 응답 계약, 초기화 데이터 기준을 고정하는 일이 더 중요했습니다.

그래서 프로젝트 초반 제가 집중한 목적은 세 가지였습니다. 첫째, Auth와 Gateway를 기준으로 공통 인증과 API 진입 경계를 먼저 고정하는 것. 둘째, Business와 SCM의 책임이 어디까지인지 팀이 같은 언어로 설명할 수 있게 기준을 정리하는 것. 셋째, 프런트와 백엔드, 팀원이 모두 같은 시나리오로 개발할 수 있도록 응답 계약과 초기화 데이터를 정리하는 것이었습니다. 화면 구현과 목업 API는 빠르게 진행되고 있었지만, 이 기준이 먼저 고정되지 않으면 서비스 경계, 권한, 조회 계약, 시드 데이터가 모두 흔들릴 수 있다고 판단했습니다.

### 역할 및 기여
프로젝트에서는 **팀장 + 백엔드** 역할을 맡았습니다. 제가 깊게 맡은 축은 공통 인증 서버(Auth), Gateway 권한 처리, **Problem Detail 기반 공통 오류 응답 계약**, 대시보드/업무 API의 조회 계약, 초기화 데이터 기준 정리였습니다. 산업공학과 배경 덕분에 ERP의 업무 흐름과 데이터 묶음을 빠르게 이해할 수 있었고, 이를 바탕으로 팀이 같은 기준으로 구현할 수 있도록 인증 경계, 권한 해석 위치, 조합형 조회 방식, 오류 응답 규칙, 초기화 데이터 규칙을 정리하는 역할을 많이 담당했습니다.

- **공통 인증 서버 구축**: Auth 서버에 PostgreSQL 기반 OAuth2 Authorization Server 구조를 올리고, 로그인 성공 핸들러, 클라이언트 등록, 모바일 클라이언트 제한까지 이어지는 인증 흐름을 직접 정리했습니다.
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

- **응답 계약과 초기화 데이터 기준 정리**: Problem Detail 기반 공통 오류 응답과 대시보드용 조합형 조회 모델, 반복 가능한 시드 데이터를 정리해, 팀 전체가 같은 업무 시나리오를 기준으로 개발할 수 있게 만들었습니다.
  ```chips
  대시보드 주문/견적 조회 로직 개선 | https://github.com/Gumraze-git/everp/commit/c248722b02edd1d4a0f67e6b9a88eb86bb030d14 | commit
  견적 및 통계 api 필터, 정렬, 페이지네이션 기능 추가 | https://github.com/Gumraze-git/everp/commit/241dae8b266ab9950cc0dfbbe5be9cc11e78c49e | commit
  모듈별 내부 사용자 초기화 | https://github.com/Gumraze-git/everp/commit/dbb294be4765c8faf0e5228246487203c97001ae | commit
  제품 초기화 product_id 보강 | https://github.com/Gumraze-git/everp/commit/dc261fb1d1159cc76c92bdf5dfbf219b9ad0da9e | commit
  ```

### 기술적 달성 목표
- Auth와 Gateway를 기준으로 공통 인증·권한 진입 경계를 정리
- OAuth2 Authorization Server와 Gateway Resource Server 조합으로 인증/인가 체계를 정립
- Problem Detail 기반 공통 오류 응답과 조회 계약을 정리해 프런트와 백엔드의 해석 기준을 통일
- 주문/견적/매입 데이터를 화면 요구사항에 맞는 조합형 조회 API로 재구성
- 초기화 데이터와 테스트 계정 규칙을 반복 가능한 개발 환경 자산으로 정리

결과적으로 이 프로젝트에서 제 역할은 ERP 전체를 완결 설계하는 데 있었다기보다, 여러 업무 모듈이 동시에 개발되는 상황에서 공통 인증, Gateway 진입 정책, 응답 계약, 초기화 데이터 기준을 먼저 고정해 팀이 같은 언어로 개발할 수 있게 만드는 데 더 가까웠습니다.
