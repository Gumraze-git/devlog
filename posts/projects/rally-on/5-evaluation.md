## 5. 프로젝트 평가 및 남은 과제

RallyOn은 현재 저장소 기준으로 **코트 운영 코어는 구현됐고, 제품 외연은 아직 확장 중인 상태**라고 보는 것이 가장 정확합니다. 포트폴리오 관점에서는 "배드민턴 플랫폼 전체"보다, 이미 코드와 테스트로 확인되는 운영 코어를 중심으로 설명하는 편이 더 설득력 있다고 판단했습니다.

### 잘 된 점

- **자유게임 도메인 규칙을 테스트와 함께 고정했다는 점**
  - 생성, 수정, 공개 조회, validation, organizer 권한, 중복 배정 같은 핵심 규칙에 테스트가 붙어 있습니다.
  - 라운드/매치 UUID 전환 같은 저장소 수준 리팩토링도 이 테스트 기반 위에서 진행됐습니다.

- **인증 -> 프로필 -> 운영 화면으로 이어지는 사용자 여정을 닫았다는 점**
  - 로그인만 되는 상태에서 끝나지 않고, `PENDING` 사용자 온보딩과 운영 화면 진입 조건을 명확히 분리했습니다.
  - secure cookie와 refresh 흐름을 실제 브라우저 조건에 맞춰 검증한 것도 장점이었습니다.

- **협업 가능한 로컬 실행 환경을 별도 레포에서 정리했다는 점**
  - `frontend / backend / infra`를 sibling 구조로 나누고, `make up`, `make up-live fe`, `.test` 도메인, mkcert 가이드를 공통화했습니다.
  - 인증과 프록시 문제를 "각자 알아서 맞추는 로컬 환경"이 아니라 팀 단위 운영 자산으로 정리할 수 있었습니다.

```chips
FreeGameServiceImplTest | https://github.com/RallyOnPrj/backend/blob/7c54b37e8aff815764cf8ba7de69c7b96201e399/src/test/java/com/gumraze/rallyon/backend/courtManager/service/FreeGameServiceImplTest.java | code
CourtManagerControllerAuthTest | https://github.com/RallyOnPrj/backend/blob/7c54b37e8aff815764cf8ba7de69c7b96201e399/src/test/java/com/gumraze/rallyon/backend/courtManager/controller/CourtManagerControllerAuthTest.java | code
fix: 프론트 live dev HMR 웹소켓 프록시 지원 | https://github.com/RallyOnPrj/infra/commit/b13c4cb9e9baf3c05fc9bda4ed6e5c1d1cf1858d | commit
```

### 남은 과제

- **뉴스 허브는 아직 placeholder**
  - 뉴스 목록과 기사 상세는 시각 구조만 준비돼 있고, 실제 콘텐츠 소스 연결은 아직 없습니다.

- **정식 대회 운영은 아직 미구현**
  - 현재 코어는 자유게임 운영이며, 참가비/토너먼트/대회 진행과 같은 고급 운영 기능은 후속 범위입니다.

- **공개 공유 화면은 요약 정보까지만 제공**
  - shareCode 공개 조회는 존재하지만, 참가자 목록과 라운드/매치 보드까지 공개하는 계약은 아직 확장되지 않았습니다.

즉, RallyOn은 이미 **운영 코어를 가진 서비스**이지만, 포트폴리오에서 이를 설명할 때는 "모든 기능이 완성된 플랫폼"처럼 포장하기보다, 현재 검증 가능한 범위와 남은 확장 범위를 분리해서 서술하는 것이 맞다고 판단했습니다.
