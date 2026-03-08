---
title: "[OpenAPI] Swagger를 분리해보자"
slug: "Swagger를-분리해보자"
description: "Swagger(OpenAPI)를 사용하며 겪은 컨트롤러 비대화 문제를 기반으로,\nAPI 문서와 요청 처리 책임을 분리하는 구조를 고민하고 정리한 기록."
date: "2026-02-05T07:56:10.457Z"
thumbnail: "https://velog.velcdn.com/images/gumraze/post/0900d436-b4ce-4cb7-b95b-de05c8b3ac7d/image.png"
tags:
  - "Swagger"
  - "TROUBLESHOOTING"
published: true
velog_url: "https://velog.io/@gumraze/Swagger%EB%A5%BC-%EB%B6%84%EB%A6%AC%ED%95%B4%EB%B3%B4%EC%9E%90"
---
# 서론
이번 글은 부트캠프에서 겪은 문제 상황과 이후에 고민한 해결 방법에 대해 공유한 내용으로 **트러블 슈팅 기록**이다.

개발자 부트캠프에서 여러 프로젝트를 진행하면서, API 개발은 대체로 다음과 같은 흐름으로 진행되어 왔다.


![](https://velog.velcdn.com/images/gumraze/post/abbbc06e-9644-4a66-9797-25c3487d44b9/image.png)



이 과정에서 나는 항상 같은 지점에서 불편함을 느꼈다.
바로 **문서를 2번 작성하게 된다는 점이다.**
- 하나는 사람이 읽기 위한 **API 명세**
- 테스트 및 실행 가능한 명세로 **OpenAPI(Swagger) 명세**

물론, OpenAPI 문서는 필수가 아니다.
Notion 등에 API 명세를 정리하고, 이를 기준으로 구현과 테스트를 진행해도 프로젝트는 충분히 진행할 수 있다.
그러나 실제로 그렇게 작업해보면 다음과 같은 한계가 있다.
- 문서 변경 이력을 추적하기 어렵고
- 누가, 언제, 왜 수정했는지 맥락이 남지 않으며
- GitHub Pull Request와 같은 보호 장치를 적용하기도 어렵다.

이런 이유로 나는 **OpenAPI를 코드로 관리하는 방식**이 훨씬 많은 이점을 가진다고 생각한다.
**OpenAPI를 사용하면 다음 이점이 있다.**
- API 명세와 테스트 기준을 함께 고정할 수 있고
- 코드 기반이기 때문에 형상 관리가 가능하며
- 요청•응답 DTO 구조를 통해 자원의 표현 구조를 명확히 드러낼 수 있다.

그래서 나는 API의 역할과 책임, 비즈니스 맥락은 **사람이 읽는 API 명세서로 작성**하고,
실제 요청과 응답의 형태, 상태 코드, 스키마 정의는 **OpenAPI(Swagger)로 관리하는 방식이 가장 이상적**이라고 생각한다.

> 잘 작성된 문서는 많으면 많을수록 좋다고 생각한다.

하지만 아주 기본적인 Swagger 작성 방법으로 작성하게 되면 다음 문제가 있다.
아래는 현재 복습용으로 수행하고 있는 배드민턴 관련 애플리케이션의 내 컨트롤러 코드이다.


![](https://velog.velcdn.com/images/gumraze/post/da578f84-c85e-446d-82d5-16520536c004/image.png)



컨트롤러에 붙는 Swagger 어노테이션의 양이 실제 비즈니스 코드보다 훨씬 많아지는 문제가 있다.
**위 단일 메서드에서의 Swagger 코드가 컨트롤러 코드의 적어도 2.5배 이상이다.**
이런 컨트롤러 메서드를 1개 구현 할 때마다 컨트롤러는 2.5배의 속도로 비대해지게 되는 것이다.

이러한 구조는 정작 **중요한 컨트롤러의 요청 처리 로직에 집중하기 어려운 상태**로 만든다.
따라서, **생산성 측면에서도, 이후 유지보수 관점**에서도 바람직하지 않은 구조인 것은 알 수 있다.

따라서 이번 글은 단순한 Swagger 사용법 소개가 아니라,
**OpenAPI(Swagger) 적용 시 컨트롤러 비대화 문제를 어떻게 해결할 수 있을지**에 대한 나의 고민을 정리한 기록이다.

이번 글의 목표는 다음과 같다.
- OpenAPI와 Swagger의 역할 구분하여 이해한다.
- Spring Boot 환경에서 OpenAPI(Swagger)를 적용한 데모 프로젝트 구성한다.
- Swagger 어노테이션을 컨트롤러에서 분리하는 구조를 제안한다.

> 본 글에서 설명하는 모든 구조와 예제 코드는  
> 다음 데모 프로젝트에 그대로 구현되어 있다.  
> 🔗 https://github.com/Gumraze-git/devlog-demo-openapi-swagger

- - -
# 1. OpenAPI와 Swagger
Swagger를 분리하는 것 이전에 먼저 **OpenAPI와 Swagger를 구분하여 이해할 필요가 있다.**

일반적으로 실무나 학습 과정에서
- "Swagger 문서를 작성한다."
- "OpenAPI를 적용한다."
와 같은 표현을 혼용해서 사용하는 경우가 많다.
그래서 먼저 두 용어를 명확히 하는 것이 좋다고 생각했다.
- - -
## 1.1 OpenAPI?
OpenAPI는 기존에 **Swagger Specification**으로 시작된 API 명세의 형식이었다.
이후 표준화 과정을 거치며 **OpenAPI Specification(OAS)**로 명명되었다.

공식 문서에서는 OpenAPI를 다음과 같이 정의한다.

> **OAS는 HTTP API를 기술하기 위한 표준적이며 프로그래밍 언어에 종속되지 않는 인터페이스 설명 방식으로,
> 소스 코드나 추가 문서, 네트워크 트래픽을 직접 분석하지 않고도
> 사람과 컴퓨터가 서비스의 기능을 발견하고 이해할 수 있도록 한다.**

위 내용에서 우리는 다음을 알 수 있다.
- 소스 코드 없이도 API의 기능을 이해할 수 있도록 하고,
- 사람이 읽을 수 있는 동시에
- 도구가 자동으로 처리할 수 있는 구조를 가져야 한다.

**즉, ** OpenAPI는 **API의 구현 방법**을 설명하는 것이 아니라,
API가 제공하는 기능과 입출력 규칙을 정의하는 **계약(Contract)**이다.

OpenAPI가 정의하는 범위는 다음과 같다.
- 리소스 경로(URI)
- HTTP 메서드/상태 코드
- 요청(응답)의 구조 및 방식
- 인증 및 인가 방식
- 데이터 스키마

위를 기준으로 알 수 있는 것은,
**OpenAPI가 다루는 영역과, 일반적으로 작성하는 API 명세의 역할은 다르다**는 것이다.

이미 **OpenAPI가 요청•응답 구조와 규칙을 표현할 수 있기 때문에**,
**사람이 읽는 API 명세서**는 다음만 있으면 된다고 생각한다.
- 해당 API가 왜 존재하는지
- 어떤 책임과 역할을 가지는지

와 같은 **의도와 맥락**에 더 집중할 수 있다.
- - -
### 1.1.1 OpenAPI의 등장 배경
OpenAPI는 다음과 같은 문제에서 등장하게 되었다.
- API 명세가 코드와 분리되어 관리되고 있음.
- 문서와 실제 동작이 쉽게 불일치함.
- 클라이언트와 서버 간 계약이 명확하지 않음.
- 자동화 도구(테스트, 코드 생성) 적용이 어려움.

이 문제를 해결하고,
사람과 기계가 동시에 이해할 수 있는 **표준화된 API 명세 형식**이 필요했고,
그 결과로 OpenAPI(당시 Swagger)가 등장하게 되었다.

그리고 현재 OpenAPI는 리눅스 파운데이션에서 관리되며,
특정 언어나 벤더에 종속되지 않는 형식을 가져,
**사실상 HTTP API 명세에 대한 표준으로 자리잡았다.**

- - -
## 1.2 Swagger?
Swagger는 **OpenAPI 명세를 중심으로 한 도구 모음**이다.

초기에는 Swagger Specification이라는 단일 프로젝트로 시작되었으며,
API 문서 자동화 도구로 업계 전반에서 사용되었다고 한다.

그러나 **공식 표준으로 관리되기에는 한계**가 있었고,
그 결과 Swagger Specification은 리눅스로 관리의 주체가 편입되면서 OpenAPI Specification으로 분리•표준화되었다.

현재 구조는 다음과 같다.
- **OpenAPI:** API 명세를 표현하기 위한 표준
- **Swagger:** OpenAPI를 작성•검증•시각화•활용하기 위한 도구 모음

Swagger 공식 문서에도 이를 다음과 같이 설명한다.
> **OpenAPI는 REST API를 설명하는 방식이며,
Swagger는 OAS를 기반으로 구축된 오픈소스 도구 모음이다.**

Swagger는 다음과 같은 도구를 제공한다.
- Swagger Editor: API 명세 작성 및 검증
- Swagger UI: API 문서 시각화 및 실행
- Swagger Codegen: API 인터페이스 코드, 클라이언트 SDK 등의 코드 생성

이 글에서 다루는 대상은 이 중 **Spring Boot 환경에서 사용되는 Swagger UI**이다.
- - -
# 2. 문제 상황: Swagger를 Controller에 직접 작성할 때의 문제

앞에서 본 것처럼, Swagger는 OpenAPI 명세를 기반으로 API 문서를 시각화하고,
**직접 실행(try-out)**까지 가능하게 하는 좋은 도구이다.

Spring Boot 환경에서는 `springdoc-openapi`를 통해 간단히 Swagger UI를 붙일 수 있고,
문서를 코드로 관리할 수 있는 장점이 있다.

그런데 문제는 Swagger를 사용하는 것은 쉽지만,
**Swagger 문서를 상세히 작성하다보면 컨트롤러 코드가 비대해지는 문제가 있다.**

> 실제 요청 처리보다 Swagger 문서 어노테이션이 더 많은 비중을 차지하게 된다.

즉, Swagger 문서를 잘 쓰려고, 친절하게 작성하려 노력할수록 컨트롤러가
**요청 처리 코드**가 아니라 **문서 코드 저장소**가 되는 문제가 있다.
- - -
## 2.1 데모 프로젝트 개요
데모 프로젝트를 기반으로 내가 겪은 문제를 재현하고 직접 해결한 전략을 공유하고자 한다.

데모 프로젝트에 대해 간단히 설명하면 다음과 같으며,
본 글의 모든 예제와 구조는 아래 GitHub 저장소를 기준으로 설명한다.
🔗 https://github.com/Gumraze-git/devlog-demo-openapi-swagger

- 도메인: 커피 주문 시스템
- 제공 API(기본 CRUD 기반)
  - POST: 주문 생성
  - GET: 주문 목록 조회, 주문 단건 조회
  - PUT: 주문 수정
  - DELETE: 주문 삭제
- 기술 스택
  - Spring Boot 4.0.2
  - springdoc-openapi + Swagger UI
  - etc...

프로젝트 구조는 다음과 같다.
```markdown
com/gumraze/opanapi
├── OpenapiSwaggerDemoApplication.java
├── config
│   ├── OpenApiConfig.java
│   └── SecurityConfig.java
├── controller
│   ├── OrderController.java
│   └── api
│       ├── CommonErrorResponses.java
│       └── OrderApi.java
├── dto
│   ├── OrderCreateRequest.java
│   ├── OrderItemRequest.java
│   ├── OrderItemResponse.java
│   ├── OrderResponse.java
│   └── OrderUpdateRequest.java
├── entity
│   ├── Coffee.java
│   ├── Order.java
│   ├── OrderItem.java
│   └── OrderStatus.java
├── exception
│   └── GlobalExceptionHandler.java
├── repository
│   ├── CoffeeRepository.java
│   └── OrderRepository.java
└── service
    ├── OrderService.java
    └── OrderServiceImpl.java
```

본 데모 프로젝트에서는 다음을 다루지 않는다.
- 도메인 모델링
- 트랜잭션 설계, 예외 처리 전략
- 컨트롤러 및 서비스 구현의 디테일

다음을 목표로 한다.
- Swagger 문서 작성 시의 문제점
- 구조적 분리 방법 제안

- - -
## 2.2 Swagger + Controller 코드
이제 실제로 Swagger 문서를 상세히 작성한 컨트롤러 코드를 살펴보자.
다음은 **주문 생성 API**에 대한 `OrderController`의 메서드 일부이다.

```java
@PostMapping
@Operation(summary = "주문 생성", description = "주문 항목을 포함해 새로운 주문을 생성합니다.")
@RequestBody(
		required = true,
	    content = @Content(
                schema = @Schema(implementation = OrderCreateRequest.class),
                examples = @ExampleObject(
                        name = "주문 생성 예시",
                        value = """
                                {
                                  "items": [
                                    {
                                     "coffeeId": 1,
                                      "coffeeName": "아메리카노",
                                      "unitPrice": 3500,
                                      "quantity": 2
                                    },
                                    {
                                      "coffeeId": 2,
                                      "coffeeName": "라떼",
                                      "unitPrice": 4200,
                                      "quantity": 1
                                    }
                                  ]
                                }
                               """
                )
       )
)
@ApiResponses({
       @ApiResponse(responseCode = "201", description = "생성됨",
                content = @Content(schema = @Schema(implementation = OrderResponse.class))),
       @ApiResponse(responseCode = "400", description = "요청 검증 실패", content = @Content)
})
public ResponseEntity<OrderResponse> createOrder(
        @Valid @RequestBody OrderCreateRequest request
) {
	OrderResponse response = orderService.createOrder(request);
	return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

Swagger 문서 관점에서 보면,
요청 예시와 응답 스키마가 명확히 정의된 친절한 문서라고 볼 수 있다.
다음으로 실제로 Swagger UI에서도 다음과 같이 잘 정리된 화면을 볼 수 있다.


![](https://velog.velcdn.com/images/gumraze/post/a1fb4c9f-b6fd-44ca-8f30-1cab1970270e/image.png)



- - -
그러나 컨트롤러 코드 관점에서 보면 Swagger 관련 어노테이션이 많아 다음 문제가 존재한다.
- 요청 처리 흐름에 대한 가독성이 떨어진다.
- 컨트롤러의 책임이 불분명해진다.

즉, **컨트롤러가 가져야 할 역할과 책임이 흐려지는 문제**가 있다고 생각한다.
따라서 **문서화 영역과 컨트롤러의 역할과 책임이 구분될 필요성**을 느끼고,
**Swagger 관련 코드를 컨트롤러에서 분리하는 구조**에 대해 고민하게 되었다.
- - -
# 3. 해결 전략 1: Swagger 전용 API 인터페이스 분리
앞에서 살펴본 문제를 해결하기 위해 가장 먼저 떠올린 방법은
**Swagger 관련 코드를 컨트롤러 밖으로 분리하는 것이었다.**

이 때 참고한 구조는 익숙한 패턴으로
바로 **Service 인터페이스와 구현체를 분리하는 구조이다.**

일반적으로 Service 계층에서는
- 인터페이스에 역할과 계약을 정의하고
- 구현체에서 실제 비즈니스 로직을 처리한다.

이 구조에 착안해서 **컨트롤러의 역할과 문서(계약)을 분리할 수 있지 않을까?**라는 생각이 들었다.

![](https://velog.velcdn.com/images/gumraze/post/37ef65a5-0d4c-48fc-92ae-dc778b895e74/image.png)



- - -
## 3.1 Swagger 전용 인터페이스로 분리
먼저 Swagger 관련 어노테이션을 모두 담은 `OrderApi` 인터페이스를 정의했다.
이 인터페이스는 HTTP 엔드포인트의 계약(contract) 역할만 수행한다.
```java
@Operation(summary = "주문 생성", description = "주문 항목을 포함해 새로운 주문을 생성합니다.")
@RequestBody(
        required = true,
        content = @Content(
                schema = @Schema(implementation = OrderCreateRequest.class),
                examples = @ExampleObject(
                        name = "주문 생성 예시",
                        value = """
                                {
                                  "items": [
                                    {
                                      "coffeeId": 1,
                                      "coffeeName": "아메리카노",
                                      "unitPrice": 3500,
                                      "quantity": 2
                                    }
                                  ]
                                }
                                """
                )
        )
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "생성됨",
                content = @Content(schema = @Schema(implementation = OrderResponse.class))),
        @ApiResponse(responseCode = "400", description = "요청 검증 실패", content = @Content)
})
ResponseEntity<OrderResponse> createOrder(OrderCreateRequest request);
```
이 인터페이스에는 다음 특징이 있다.
- Swagger(OpenAPI) 관련 어노테이션만 존재한다.
- 비즈니스 로직은 포함하지 않는다.
- 요청과 응답에 대한 계약을 드러낸다.

즉, `OrderApi`는 문서이자 계약에 집중하게 된다.

- - -
## 3.2 분리 후 Controller 코드의 변화
이제 `OrderController`는 `OrderApi`를 구현하도록 한다.
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController implements OrderApi {

    @Override
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderCreateRequest request
    ) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```
Swagger 관련 어노테이션 분리 이후로 컨트롤러 코드는 다음 이점이 있다.
- 가독성 향상
- 책임 분리
- 유지보수성 향상

이것으로 컨트롤러는 다시 **요청 처리 계층**으로서의 역할을 되찾게 되었다.
- - -
# 4. 해결 전략 2: 공통 Swagger 응답 분리
위와 같이 분리함으로 각각의 역할과 책임은 이미 잘 분리되었다고 생각한다.

그러나 Swagger 문서를 다시 살펴보며 또 하나의 반복 패턴을 발견하게 되었다.
바로 **에러 응답 정의의 중복**이다.
- - -
## 4.1 공통 에러 응답의 성격
대부분의 API는 다음과 같은 에러 응답을 공통적으로 가진다.
- `400 Bad Request`: 요청 값 검증 실패
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

이 응답들은
- 엔드포인트마다 의미가 크게 달라지지 않고
- 응답 스키마 역시 거의 동일하다.

따라서 Swagger 문서를 작성하다 보면
이 공통 에러 응답 정의가 모든 API 메서드에 반복적으로 등장하게 된다.
그래서 이 부분들을 공통 처리 로직으로 분리해두면 개발하는 데 더 편리할 것으로 생각했다.
- - -
## 4.2 `@CommonErrorResponse` 설계
위 중복을 제거하기 위해,
다음 **공통 에러 응답을 하나의 커스텀 어노테이션으로 분리**했다.
```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses({
        @ApiResponse(
                responseCode = "400",
                description = "요청 검증 실패",
                content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "리소스를 찾을 수 없음",
                content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
                responseCode = "500",
                description = "서버 오류",
                content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        )
})
public @interface CommonErrorResponses {
}
```
이 어노테이션을 적용하면,
Swagger 문서에서 공통 에러 응답을 일관된 형태로 표현할 수 있다.
```java
@CommonErrorResponses
ResponseEntity<OrderResponse> createOrder(OrderCreateRequest request);
```
- - -
## 4.3 성공 응답을 공통화하지 않은 이유
반면에 성공 응답은 공통 어노테이션으로 분리하지 않았다.
그 이유는 성공 응답이 가지는 성격이 에러 응답과 다르기 때문인데,
- 성공 상태 코드는 `200`, `201`, `204`등으로 다양하고
- 엔드포인트마다 응답 스키마가 다르며
- 의미 역시 API마다 명확히 구분된다.

따라서 성공 응답까지 공통화하려 하면,
- 어노테이션이 지나치게 복잡해지거나
- 오히려 문서의 명확성이 떨어질 수 있다고 생각했다.

- - -
# 5. 정리

![](https://velog.velcdn.com/images/gumraze/post/efb5bb84-38c4-44c2-9c49-353ff752bc23/image.png)



간단히 정리하자면 Swagger는 좋은 도구인 만큼 잘 사용해야 하는데,
컨트롤러가 비대해져서 가독성이 떨어지는 문제를 경험했으며,
해당 문제를 해결하는 과정을 기록해봤다.

해결하는 과정은 다음과 같았다.
- Swagger 문서와 API 계약은 **전용 API 인터페이스로 분리함.**
- 컨트롤러는 요청 처리만 집중하도록 **역할 명확화.**
- 반복되는 에러 응답 정의는 **공통 어노테이션으로 추출**함.
- 성공 응답 공통화는 과한 분리라고 판단하여 수행하지 않음.

그래서 위 구조처럼 해야만 하는 것인가?
그렇지 않다.

필요에 의해 선택하면 되며,
나와 같은 고민을 가진 사람들에게 도움이 되었으면 좋겠다.
- - -
# 마치며,,

이번 글에서는 부트캠프에서 일련의 API 개발과정에서 느낀 점을 기반으로 작성하게 되었다.
먼저 API 명세 작성에 대한 고민과 OpenAPI/Swagger 문서에 대한 고민을 기반으로 이번 글을 작성하게 되었다.

이번 글에서 다룬 내용이 그렇게 복잡하지는 않지만, 나에게는 문서 작성이 코드를 이해하고 협업을 하는데 많은 도움이 되어 그 중요성을 느꼈고 항상 강조하고 싶다. 그러나, 부트캠프에서 느낀점은 이러한 부분을 많이 간과하고 있다고 생각한다. 

부트캠프 특성상 짧은 기간에 프로젝트를 구현해야한다고 생각하는 것 같은데, 나는 실무 환경에서는 이것보다 시간이 없을 것 같다는 생각이 든다. 그래서 항상 글로서 내가 고민했던 내용과 기술의 사용 방법 등이라던지 문서를 항상 남기는 습관을 들여서 이것을 하나의 나의 무기로 남기고 싶다.

# 참고자료
- [OpenAPI 공식 소개 - What is OpenAPI?](https://www.openapis.org/what-is-openapi)
- [OpenAPI Specification 공식 문서 (Toss Payments Glossary)](https://docs.tosspayments.com/resources/glossary/oas)
- [Swagger 공식 문서 - OpenAPI Specification 개요](https://spec.openapis.org/oas/v3.2.0.html)
- [Swagger 공식 문서 - OpenAPI Specification v3.0](https://swagger.io/docs/specification/v3_0/about/)
- [springdoc-openapi 공식 문서 - Getting Started](https://springdoc.org/#getting-started)
- [springdoc-openapi GitHub Repository](https://github.com/springdoc/springdoc-openapi)
