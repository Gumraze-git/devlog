## 4. 핵심 트러블슈팅

~~~troubleshooting
제목: secure cookie 인증을 로컬에서 재현하기 어려움

문제:
- 인증 토큰을 `HttpOnly + Secure` 쿠키로 다루면 단순 `http://localhost` 환경에서는 실제 브라우저 동작을 안정적으로 재현하기 어려웠습니다.
- 프런트와 백엔드가 분리된 상태에서 카카오 로그인과 refresh 흐름까지 검증하려면 도메인, 프록시, 인증서 구성이 함께 맞아야 했습니다.

원인:
- 인증 로직은 백엔드 코드만으로 끝나지 않고, 브라우저의 쿠키 정책과 HTTPS 조건에 직접 영향을 받습니다.
- 개발 환경이 로컬 포트 조합에 머무르면 secure cookie, redirect URI, 프록시 경로 문제를 계속 우회하게 됩니다.

해결:
- `infra` 레포에 `.test` 도메인, nginx 프록시, `mkcert` 기반 로컬 인증서 흐름을 문서화했습니다.
- 로컬 반복 테스트를 위해 DUMMY provider를 활성화하고, 프런트 로그인 화면에서 빠른 테스트 계정을 바로 사용할 수 있게 했습니다.
- `make up-live fe` 같은 live dev 워크플로를 추가해 secure cookie 환경을 유지한 채 프런트 개발 속도를 확보했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```text
> http://localhost:3000 + 별도 백엔드 포트 조합
> -> Secure cookie 검증과 redirect 동작이 매번 흔들림
> ```
>
> ```chips
> To-Be | | tobe
> ```
> ```text
> https://rallyon.test / https://api.rallyon.test
> + nginx proxy
> + mkcert
> + DUMMY login
> -> 브라우저 기준 인증 흐름을 로컬에서도 반복 검증
> ```

결과:
브라우저 인증을 로컬 포트 우회가 아니라 `rallyon.test` 실행 경계 기준으로 다루게 되면서, secure cookie와 redirect 흐름을 실제와 비슷한 조건에서 반복 검증할 수 있게 됐습니다.
~~~

~~~troubleshooting
제목: 라운드/매치 편성에서 중복 배정과 무권한 수정 위험

문제:
- 같은 참가자가 한 라운드에 여러 코트에 중복 배정되거나, 운영자가 아닌 사용자가 세션을 수정하면 자유게임 운영 결과가 바로 깨질 수 있었습니다.
- 특히 편성 보드는 UI 편의보다 **도메인 제약**이 더 중요한 화면이라, 서버에서 규칙을 반드시 보장해야 했습니다.

원인:
- 참가자 배정은 라운드, 코트, 팀 슬롯이 동시에 얽히는 구조라 단순 CRUD로는 정합성을 유지하기 어렵습니다.
- organizer 권한과 참가자 중복 여부를 별도 규칙으로 검증하지 않으면, 운영 화면의 실수나 악의적 요청을 막기 어렵습니다.

해결:
- `FreeGameService`에서 organizer만 라운드/매치 수정이 가능하도록 강제하고, 중복 참가자 배정을 서버 검증으로 막았습니다.
- 컨트롤러 validation 테스트와 서비스 테스트를 분리해 요청 필드 오류와 도메인 규칙 오류를 각각 검증했습니다.
- 프런트 create/game 화면에서도 같은 코트, 같은 라운드 중복 배정을 사전 경고하도록 보조 검증을 추가했습니다.

> !compare
> ```chips
> As-Is | | asis
> ```
> ```text
> 편성 수정 요청이 들어오면 UI 상태를 그대로 저장
> -> 같은 참가자가 같은 라운드에 여러 번 들어갈 수 있음
> ```
>
> ```chips
> To-Be | | tobe
> ```
> ```text
> organizer 권한 검증
> + 요청 validation
> + 라운드 내 중복 참가자 검증
> + 서비스 테스트로 회귀 방지
> ```

결과:
organizer 권한과 참가자 배정 규칙을 서버 계약으로 고정할 수 있었고, 이후 구조 변경이나 UUID 전환이 생겨도 같은 운영 경계를 테스트로 계속 확인할 수 있게 됐습니다.
~~~

~~~troubleshooting
제목: 프로필 온보딩과 지역/장소 검색 계약이 서로 어긋남

문제:
- 신규 사용자는 로그인 후 프로필을 작성해야 하지만, 지역 선택과 장소 검색 흐름이 불안정하면 온보딩과 자유게임 생성 경험이 동시에 깨집니다.
- 프로필에는 행정구역 기반 입력이 필요하고, 게임 생성에는 검색 기반 장소 입력이 필요해 서로 다른 계약을 함께 맞춰야 했습니다.

원인:
- 사용자 프로필과 자유게임 생성이 각자 독립적인 폼처럼 보이지만, 실제로는 둘 다 "운영자가 세션을 만들기 전에 필요한 기본 정보"를 채우는 과정입니다.
- 지역 조회, 장소 검색, location 길이 제한 같은 세부 규칙이 정리되지 않으면 프런트와 백엔드의 기대치가 계속 어긋납니다.

해결:
- 프로필 작성은 `provinces -> districts` 계층형 조회 계약으로 고정하고, 자유게임 생성은 `/places/search` 결과를 location 입력에 반영하도록 정리했습니다.
- 자유게임 생성 시 location 길이 제한과 필수 입력 validation을 테스트로 고정했습니다.
- 프런트는 프로필 완성 여부에 따라 `/profile/setup`과 운영 화면을 명확히 분기하도록 구현했습니다.

```chips
PlaceSearchController | https://github.com/RallyOnPrj/backend/blob/7c54b37e8aff815764cf8ba7de69c7b96201e399/src/main/java/com/gumraze/rallyon/backend/application/adapter/in/web/PlaceSearchController.java | code
CourtManagerControllerValidationTest | https://github.com/RallyOnPrj/backend/blob/7c54b37e8aff815764cf8ba7de69c7b96201e399/src/test/java/com/gumraze/rallyon/backend/courtManager/controller/CourtManagerControllerValidationTest.java | code
feat: 자유게임 장소 검색 API 추가 | https://github.com/RallyOnPrj/backend/commit/730e44b55543884c896c48e750e2d94e87c684ff | commit
feat: 자유게임 location 계약 정렬 | https://github.com/RallyOnPrj/backend/commit/86368c1d0f89864cbb2c77aa14eae8a676c2af2f | commit
```

결과:
로그인 후 프로필 작성과 자유게임 생성이 하나의 운영 진입 흐름으로 정리되면서, 지역·장소 입력 계약도 같은 기준 안에서 안정화할 수 있었습니다.
~~~
