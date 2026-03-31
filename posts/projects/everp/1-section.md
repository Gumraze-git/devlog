## 1. 프로젝트 개요 및 목표

**Everp**는 현대오토에버 모빌리티 코딩 스쿨에서 현대오토에버 ERP 시스템 개발을 목표로 진행한 **DDD 기반 MSA 팀 프로젝트**입니다.

### 프로젝트 성격과 목적

Everp는 현대오토에버 모빌리티 코딩 스쿨에서 진행한 대규모 팀 프로젝트로, 현대오토에버 ERP 시스템을 개발하는 것을 목표로 했습니다. 요구사항에서 MSA 구성이 전제되어 있었고, 저희 팀은 이를 단순한 CRUD 모듈 묶음이 아니라 견적, 주문, 발주, 재고, 생산, 정산, 인사 흐름이 이어지는 ERP 도메인으로 해석했습니다.

그래서 먼저 도메인을 정리하고 유비쿼터스 언어를 맞춘 뒤, DDD 기반으로 경계를 나누고 MSA 구조를 설계하는 방향을 택했습니다. 핵심은 기능을 많이 붙이는 것보다, 복합 업무 흐름을 어떤 서버 경계와 공통 기준으로 설명 가능하게 만들지 정하는 데 있었습니다.

### 기술적 배경과 목표

이 프로젝트에서 가장 먼저 고민한 것은 **모든 모듈을 개별 서버로 나누는 것이 정말 현실적인가**였습니다. ERP 도메인은 넓었지만, 주어진 인원과 기간 안에서 모든 기능을 세분 MSA로 쪼개면 서비스 간 트랜잭션과 연계 비용이 과도하게 늘어날 가능성이 컸습니다. 그래서 DDD 관점에서 업무 경계를 먼저 설명 가능하게 만들고, 트랜잭션을 가장 적게 발생시키면서도 MSA 요구사항을 만족할 수 있는 구조를 찾는 것이 핵심 목표였습니다.

그 결과 공통 인증은 Auth로, 외부 진입과 권한 해석은 Gateway로, 핵심 도메인은 Business 서버와 SCM 서버 두 축으로 크게 나누는 방향을 선택했습니다. 이 구조 위에서 ERP 도메인과 유비쿼터스 언어를 정리하고, 팀이 같은 언어로 각 서버 경계를 설명하고 구현할 수 있게 만드는 것을 목표로 삼았습니다.

- ERP 도메인을 Business / SCM 중심 bounded context로 정리
- 유비쿼터스 언어를 맞춰 팀이 같은 경계를 설명 가능하게 정리
- Auth와 Gateway를 기준으로 인증/권한 경계를 분리
- 과도한 서비스 분할보다 최소 트랜잭션과 현실적인 운영 복잡도를 우선한 MSA 구조 선택

### 역할 및 기여

프로젝트에서는 **팀장 + 백엔드** 역할을 맡았습니다. 제가 주요하게 맡은 축은 DDD 기반 MSA 서버 분리, Bounded Context 정리, Auth / Gateway 권한 처리였습니다. 핵심은 ERP 전체를 세밀하게 쪼개는 것이 아니라, 주어진 자원 안에서 설명 가능한 경계와 최소 트랜잭션 구조를 먼저 고정하는 것이었습니다.

#### DDD 기반 MSA 서버 분리

가장 먼저 고민한 것은 "ERP 도메인을 모두 개별 서버로 나눌 것인가, 아니면 현재 자원에서 운영 가능한 경계를 먼저 고정할 것인가"였습니다. 기능 단위로 무조건 서버를 쪼개면 서비스 간 연계와 트랜잭션이 빠르게 늘어나고, 팀이 각 경계를 설명하기도 어려워집니다. 그래서 Business와 SCM 두 축으로 핵심 도메인을 크게 나누고, 공통 인증은 Auth로, 외부 진입과 권한 해석은 Gateway로 분리하는 구조를 선택했습니다.

이 판단은 단순히 서버 수를 줄이기 위한 선택이 아니라, DDD 관점에서 설명 가능한 경계를 만들고 MSA 요구사항 안에서 가장 현실적인 운영 복잡도를 유지하기 위한 기준이었습니다.

#### Bounded Context 정리

서버를 나누기 전에 먼저 정리한 것은 ERP 도메인을 어떤 업무 언어로 설명할 것인가였습니다. 저는 견적, 주문, 고객사, 전표, 인사처럼 사무형 흐름은 Business 축으로, 공급사, 제품, 발주, 재고, BOM, 생산처럼 자재·생산 흐름은 SCM 축으로 묶는 기준을 잡았습니다.

이렇게 해야 팀이 같은 단어로 같은 경계를 설명할 수 있고, 이후 API나 데이터 소유권, 조회 계약을 논의할 때도 기준이 흔들리지 않습니다. 결국 Bounded Context 정리는 도메인 분류 작업이 아니라, 유비쿼터스 언어를 맞추고 서버 경계를 설명 가능하게 만드는 작업에 가까웠습니다.

#### Auth / Gateway 권한 처리

권한 처리에서는 인증과 인가를 어디서 나눌지가 가장 중요했습니다. Auth는 Authorization Server와 로그인 흐름, 클라이언트 등록, JWT claims 구성을 맡고, Gateway는 Resource Server와 `@PreAuthorize` 기반 권한 해석을 맡도록 역할을 분리했습니다.

이렇게 해야 인증 성공 여부와 업무 API 접근 허용 여부를 별개 문제로 다룰 수 있고, 권한 해석 위치도 팀 전체가 같은 기준으로 이해할 수 있습니다. 특히 모바일 클라이언트 제한과 도메인별 엔드포인트 접근 제어는 이 구조를 실제로 고정하는 데 중요한 구현 포인트였습니다.

```chips
postgresql 기반 oauth2 schema 추가 | https://github.com/Gumraze-git/everp/commit/44fe122c91cab85d6e9787fbd8580ef55e7f7268 | commit
oauth2 인증 요청 처리 로직 및 로그인 성공 핸들러 추가 | https://github.com/Gumraze-git/everp/commit/ce20ac4ff7d75de69b112da323a89a3f68f38557 | commit
ios 및 aos oauth 클라이언트 등록 로직 추가 | https://github.com/Gumraze-git/everp/commit/cb00690fee775d8890ca8ba3988f24b45d73caf2 | commit
모바일 클라이언트 로그인 제한 | https://github.com/Gumraze-git/everp/commit/ab79ce1af4dca9c3733c8dba4c7dc354de903950 | commit
oauth2 리소스 서버 설정 추가 | https://github.com/Gumraze-git/everp/commit/dde95488c8c6bb7af6899a80df1bfdfc25da7bf9 | commit
견적 및 고객 관련 엔드포인트에 권한 검사 추가 | https://github.com/Gumraze-git/everp/commit/2682eb67053b82d666a18592d70db269bd349b14 | commit
생산 관리 엔드포인트에 권한 검사 추가 | https://github.com/Gumraze-git/everp/commit/4170435828364713508b7087335ee1d20c1ab05a | commit
LoginSuccessHandler | https://github.com/Gumraze-git/everp/blob/ab79ce1af4dca9c3733c8dba4c7dc354de903950/src/main/java/org/ever/_4ever_be_auth/auth/account/handler/LoginSuccessHandler.java | code
PpController | https://github.com/Gumraze-git/everp/blob/4170435828364713508b7087335ee1d20c1ab05a/src/main/java/org/ever/_4ever_be_gw/scm/pp/controller/PpController.java | code
```

결과적으로 이 프로젝트에서 제 역할은 ERP 전체를 세밀하게 쪼개고 구현 범위를 넓히는 데 있었다기보다, DDD 기반 MSA 서버 경계와 Bounded Context를 먼저 설명 가능하게 만들고, Auth와 Gateway 권한 처리 구조를 팀이 같은 기준으로 구현할 수 있게 고정하는 데 더 가까웠습니다.
