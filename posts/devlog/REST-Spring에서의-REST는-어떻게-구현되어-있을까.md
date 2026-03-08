---
title: "[REST] Spring에서의 REST는 어떻게 구현되어 있을까?"
slug: "REST-Spring에서의-REST는-어떻게-구현되어-있을까"
description: "Spring MVC에서 REST를 어떻게 지원하고 있을까?"
date: "2026-02-02T10:05:23.519Z"
thumbnail: "https://velog.velcdn.com/images/gumraze/post/cde3c179-ee4c-4e72-84eb-b43010c59b59/image.png"
tags:
  - "REST"
  - "Spring"
published: true
velog_url: "https://velog.io/@gumraze/REST-Spring%EC%97%90%EC%84%9C%EC%9D%98-REST%EB%8A%94-%EC%96%B4%EB%96%BB%EA%B2%8C-%EA%B5%AC%ED%98%84%EB%90%98%EC%96%B4-%EC%9E%88%EC%9D%84%EA%B9%8C"
---
# 들어가며
앞선 글에서 **REST의 배경과 제약 조건을 기반으로 RESTful한게 어떤 것을 의미**하는지 다루었다.

![](https://velog.velcdn.com/images/gumraze/post/d3aa9485-2038-4171-b81f-ce271ba9b9d5/image.png)
이전 내용을 잠시 Recap하자면, 다음과 같다.
**REST의 6가지 제약 조건**
**(1) Client-Server**: 클라이언트와 서버를 분리한다.
**(2) Stateless**: 서버는 클라이언트의 상태를 저장하지 않는다.
**(3) Cache**: 응답은 캐시가 가능하며, 캐시 가능 여부를 명시해야 한다.
**(4) Uniform Interface**: 일관된 인터페이스를 가진다.
**├─(4.1) Identification of resource**: 모든 자원은 URI로 구분된다.
**├─(4.2) Manipulation through representations**: 클라이언트는 자원의 표현을 통해 자원을 다룬다.
**├─(4.3) Self-descriptive messages**: 메시지 자체만으로 처리 의미를 해석할 수 있다.
**└─(4.4) HATEOAS**: 응답에 상태 전이를 위한 링크를 포함할 수 있다.
**(5) Layered System**: 시스템은 여러 계층으로 구성 될 수 있다.
**(6) Code-on-Demand (optional)**: 서버가 클라이언트에 실행 가능한 코드를 전달할 수 있다..

그렇다면, 내가 사용하는 Spring에서는 REST를 어떻게 지원하고 있는지 살펴보고자 한다.
- - -
# 1. Spring에서의 REST
REST는 특정 기술이나 프레임워크가 아니라,
클라이언트와 서버가 자원을 주고받는 방식을 정의한 **아키텍처 스타일**이다.

따라서 "Spring이 REST를 제공한다."라는 말은 엄밀히 말하면 정확하지는 않다.
정확하게 표현하자면,
REST 스타일의 애플리케이션을 구현하기에 적합한 **웹 기술 스택과 추상화 계층을 제공한다.** 라고 보는게 더 정확하다.

그러면 이어지는 내용으로 Spring이 어떤 전제를 가진 모델 위에서 동작하며,
그 안에서 REST의 제약을 어떤 방법으로 다루고 있는지 살펴보고자 한다.

- - -
## 1.1 Spring 공식 문서: Web on Servlet Stack
먼저 Spring 프레임워크 공식 문서를 확인해보면,
웹과 관련된 내용은 **Web on Servlet Stack**이라는 섹션 아래에 정리되어 있다. 

이 섹션을 보면, REST와 대놓고 관련되어 보이는 **`REST Clients`**라는 항목이 보인다.
![](https://velog.velcdn.com/images/gumraze/post/ba87aa07-67ef-4ea5-8db9-eab491886618/image.png)

그리고 Web on Servlet Stack 하위에는 다음과 같은 항목들이 있다.
- Spring Web MVC
- REST Clients
- Testing
- WebSockets

이 구조를 보면 Spring은 REST를 하나의 독립된 기술로 다루고 있지 않고,
**Servlet 기반 웹 스택 안에서** 다루고 있다.

따라서 Spring에서의 REST를 이해하기 위해서는
개별 REST 기능을 바로 살펴보기보다는,
**Web on Servlet Stack**에서 말하는 **Servlet(서블릿)이 뭔지?**
다음으로 **Web on Servlet Stack**이 뭔지?
마지막으로는 각 하위 항목들을 살펴보고자 한다.

- - -
## 1.2 서블릿이란 무엇인가?
먼저 Servlet이라는 어원부터 살펴보자면,
서블릿은 `Service`와 "작은 것"을 의미하는 `let`의 합성어로,
직역하면 **작은 서비스 단위** 정도로 이해할 수 있다.

> 어원을 보면 그 의미가 잘 이해가 되는 경우가 많은 것 같다.

이를 서블릿이 어떤 역할을 하는지 중심으로 정리하면 다음과 같다.

> **서블릿은 서블릿 컨테이너로부터 HTTP 요청을 전달받아
> Java 로직을 실행하거나 위임하고,
> 그 결과를 HTTP 응답으로 작성하는 Java 클래스(작은 서비스 단위)이다.**

여기서 중요한 점은,
서블릿이 **HTTP 요청을 직접 수신하는 주체가 아니라는 점**이다.

네트워크 요청의 수신과 연결 관리를 서블릿 컨테이너의 책임이며,
여기서 인지하고 있어야하는 것은,
**서블릿은 요청을 전달받아 애플리케이션 로직을 수행하는 실행 단위**에 가깝다는 것이다.

- - -
### 1.2.1 서블릿의 등장 배경
웹 이전의 Java는 주로 콘솔 프로그램이나 데스크톱 애플리케이션을 만들기 위한 언어였다.

하지만 **웹이 등장하면서 Java에도 다음 요구**가 생겼다.
- **HTTP 요청을 처리**하고
- **Java 코드로 비즈니스 로직을 수행**한 뒤
- **HTTP 응답을 반환**하고 싶다.

따라서 서블릿은 위 요구를 충족시키기 위해서 탄생한 것이,
**Java Servlet API**이다.

서블릿 API를 통해서 웹 애플리케이션은 다음과 같은 실행 구조를 가지게 되었다.
- 브라우저는 HTTP 요청을 전송하고
- Tomcat과 같은 서블릿 컨테이너가 요청을 수신한 뒤
- 적절한 서블릿을 찾아 해당 메서드를 호출한다.
![](https://velog.velcdn.com/images/gumraze/post/a6096d49-097d-41c6-b45b-d5b96e9f4c9d/image.png)

이 구조에서 중요한 점은 다음과 같다.
- 브라우저는 서블릿의 존재를 알 수 없다.
- 서블릿 컨테이너가 요청 수신과 전달을 담당한다.
- 서블릿은 비즈니스 로직 수행과 응답 작성을 담당한다.

이처럼 역할이 분리된 구조는 **클라이언트와 서버의 책임을 구분**한다는 점에서
**REST가 제시하는 Client-Server 제약 조건**과 구조적으로 잘 맞는다.

즉, 서블릿은 HTTP 요청을 직접 처리하는 서버라기보다는,
요청을 전달받아 Java 애플리케이션을 실행하고
그 결과를 응답으로 표현하는 역할을 수행한다고 볼 수 있다.

> 이런 의미에서 서블릿은 네트워크 처리와 애플리케이션 로직 사이에 위치한  
> 실행 단위라고 볼 수 있다.

## 1.2.2 서블릿 기반 실행 모델
따라서 서블릿은 단독으로 실행되는 컴포넌트가 아니라는 것을 알았는데,
서블릿은 항상 서블릿 컨테이너와 함께 동작하며,
이 둘을 중심으로 한 웹 애플리케이션의 실행 방식에는 공통점이 있다.

이를 보통 **서블릿 기반 실행 모델**이라고 부른다.

이 실행 모델은 다음과 같은 특성을 가진다.
- Java Servlet API를 기반으로 한다.
- Tomcat, Jetty, Undertow와 같은 서블릿 컨테이너 위에서 실행된다.
- 하나의 HTTP 요청에 하나의 스레드를 할당하는 구조를 가진다.
- 요청 처리는 기본적으로 Blocking I/O 방식으로 이루어진다.


즉, HTTP 요청이 들어오면
- 서블릿 컨테이너가 요청을 수신하고
- 요청마다 스레드를 할당한 뒤
- 해당 요청을 처리할 서블릿을 호출하는 구조이다.

여기서 중요한 점은,
Spring MVC는 이 실행 모델을 변경하지 않는다는 점이다.

Spring은 새로운 웹 실행 방식을 제안하기 보다는,
이 서블릿 기반 실행 모델을 전제로 하여
HTTP 요청 처리 과정을 더 구조화하고 추상화한다.

이제 다음 섹션에서는 이러한 서블릿 기반 실행 모델 위에서 
Spring이 제공하는 웹 기능 묶음인 **Web on Servlet Stack**에 대해 살펴보자.
- - -
## 1.3 Web on Servlet Stack의 구성

앞서 살펴본 서블릿 기반 실행 모델을 전제로,
Spring 공식 문서에서는 웹 관련 기능을
**Web on Servlet Stack**이라는 이름으로 묶어 설명하고 있다.

여기서 말하는 **"Servlet Stack"**이란 다음과 같은 기술 계층을 의미한다.
- Java 서블릿 API
- 서블릿 컨테이너
- 요청당 스레드 실행 모델
- Blocking I/O 기반 요청 처리 방식

즉, Web on Servlet Stack은 
**서블릿 기반 실행 모델을 전제로 하는 Java 웹 애플리케이션 환경**을 의미한다.

- - -
## 1.4 하위 항목들에 대한 설명
따라서 **Web on Servlet Stack 아래에는 4가지 항목**이 있는데 각각 항목을 먼저 간단히 설명하면 다음과 같다.

- **Spring Web MVC**
  - **HTTP 요청을 받아서 처리하는 서버 프레임워크**로 HTTP 요청을 컨트롤러로 전달하고 응답을 생성하는 역할을 수행한다.
- **REST Clients**
  - 외부 HTTP 서버에 요청을 보내는 클라이언트용 API로 **HTTP 요청을 보내는 클라이언트 도구**이다.
- Testing: 
  - Servlet 기반 웹 애플리케이션을 테스트하기 위한 지원 모듈로 서버 없이 테스트를 할 수 있는 `MockMvc` 등이 담겨 있다.
- WebSockets
  - Servlet 환경에서 양방향 실시간 통신을 제공하는 기능으로 채팅, 알림, 실시간 상태 업데이트 등에 사용된다.
  
REST는 기본적으로 **클라이언트와 서버가 자원을 주고 받는 통신 방식**을 정의한 아키텍처 스타일인데,
해당 관점에서 **Web on Servlet Stack**의 구성 요소 중 REST와 직접적으로 연관되는 항목은 **Spring Web MVC**와 **REST Client**이다.

다만 이 글에서는
**클라이언트 역할을 수행하는 서버**를 설명하기보다는
**서버 측에서 REST 스타일의 API를 어떻게 구성하는지**에 대해 초점을 맞출 예정이다.

따라서 이후 내용에서는 **Spring Web MVC**를 중심으로 살펴보고자 한다.
- - -
# 2. Spring Web MVC와 REST
이제 돌고 돌아서 실제로 Spring 정확히는 **Spring Web MVC에서
REST 스타일의 애플리케이션을 어떻게 지원하고 있는지**를 살펴보고자 한다.

먼저 항상 그렇듯, Spring Web MVC 중 MVC의 어원을 먼저 살펴보고자 한다.
여기서 MVC는 **Model · View · Controller**의 약자로,
사용자 인터페이스를 구성하기 위한 아키텍처 패턴이다.

MVC의 목적은 다음과 같다.
- 데이터(Model)
- 화면(View)
- 입력 및 제어 흐름(Controller)
위 세 가지의 관심사를 분리하여 시스템의 복잡도를 낮추고 변경에 유연하게 대응하는 것이다.

> 느슨한 결합! 이것도 RESTful 하다고 볼 수 있다.

그렇다면 Web MVC는 뭘까?
웹은 HTTP를 기반으로 동작하는데 이를 MVC 패턴으로 해석한 구조이다.

웹 환경에서는 다음과 같은 전제가 존재한다.
- 요청: HTTP Request
- 응답: HTTP Response
- 화면: HTML과 같은 문서의 형태
- 입력: URL, Method, Parameter 등으로 전달됨.

이러한 웹 환경의 특성을 MVC에 대응시키면 다음과 같이 정리할 수 있다.
![](https://velog.velcdn.com/images/gumraze/post/f8bdf05a-64f6-4a03-8618-383ca49065ee/image.png)


- - -
## 2.1 Spring MVC의 요청 처리 구조
Spring Web MVC가 REST 스타일의 애플리케이션을 어떻게 지원하는지 이해하기 위해서는 먼저 **HTTP 요청이 내부에서 어떤 흐름으로 처리되는지**를 살펴볼 필요가 있다.

Spring Web MVC의 공식 문서에서 가장 중심이 되는 구성 요소로
**`DispatcherServlet`**이다.

**`DispatcherServlet`**은 다음과 같은 역할을 수행한다.
- 모든 HTTP 요청의 단일 진입점(Single Entry Point)
- 요청을 직접 처리하지 않고, 적절한 컴포넌트로 위임
- **Front Controller** 패턴의 전형적인 구현체


- - -
### 2.2 Front Controller의 등장 배경
Spring MVC 이전에 전통적인 서블릿 기반 애플리케이션에서는,
요청마다 서로 다른 서블릿을 매핑하는 구조를 사용하는 경우가 있었다.

따라서 다음과 같은 구조를 가지고 있었다.
![](https://velog.velcdn.com/images/gumraze/post/18f79ce4-e1b0-4beb-8333-53cac2e05fe7/image.png)

위 경우에서는 서블릿 컨테이너(Tomcat 등)은 `web.xml`과 같은 설정을 통해서
요청 URL에 따라 어떤 서블릿을 호출할지 결정한다.

이 구조의 문제점은 다음과 같다.
- 공통적인 요청 처리 로직이 각 서블릿에 분산된다.
- 인증, 로깅, 예외 처리와 같은 공통 관심사를 일관되게 적용하기 어렵다.
- 요청 처리 흐름을 한 곳에서 파악하기 어렵다.

Spring은 이러한 상황을 별로 좋아하지 않았다.
따라서 이러한 구조를 개선하기 위해,
**모든 HTTP 요청을 하나의 서블릿에서 받아서 처리하는 구조인`DispatcherServlet`을 도입했다.**

![](https://velog.velcdn.com/images/gumraze/post/11cae300-ede6-47ce-93f4-c47e7166a8f8/image.png)

> `DispatcherServlet`은 HTTP 요청에 대한 처리를 오케스트레이션하는 역할을 한다고 볼 수 있다.

> `Handler*` 관련 내용은 이어 설명하고자 한다.

이처럼 모든 요청을 하나의 진입점에서 받고,
공통 규칙에 따라 처리 흐름을 분기하고 위임하는 패턴을
**Front Controller 패턴**이라고 한다.
- - -
### 2.3 HandlerMapping: 요청은 누가 처리하는가
위 다이어그램을 보면 `DispatcherServlet`이 요청을 받으면,
다음으로 **"이 요청을 누가 처리할 것인지를 결정"**하는 것이 이 컴포넌트이다.

**`HandlerMapping`**은 **HTTP + URI**를 기준으로
어떤 컨트롤러 메서드가 요청을 처리할지를 결정한다.

예시로 다음 요청이 들어온다.
```
// HTTP 요청
GET /users/1
```

Spring은 `HandlerMapping`을 통해 다음과 같은 컨트롤러 메서드를 찾는다.
```java
// GET요청 + URI으로 다음 컨트롤러 메서드를 찾는다.
@GetMapping("/users/{id}")
public UserResponse getUser(@PathVariable Long id) { ... }
```

위 지점은 REST 관점에서 분석해보자면
**Uniform Interface 제약**이 Spring Web MVC 내부에서 반영되는 부분이다.

- 자원은 URI로 식별된다. → `/users/{id}`
- 행위는 HTTP Method로 표현된다. → `GET`

즉, Spring MVC는 URI와 HTTP Method를 조합하여 요청을 매핑함으로써,
REST에서 말하는 자원 중심 인터페이스를 자연스럽게 지원한다.
- - -
### 2.4 HandlerAdapter: 다양한 컨트롤러를 하나의 방식으로
요청을 처리할 컨트롤러가 `HandlerMapping`으로 결정되었다고 해서,
곧바로 해당 메서드를 호출할 수 있는 것은 아니다.

따라서, `HandlerAdapter`가 선택된 컨트롤러를 `DispatcherServlet`이 호출할 수 있는 형태로 adapt(적응)시키는 역할을 수행한다.

다이어그램을 다시 확인하면 `HandlerMapping`이 이후 컨트롤러로 도달하려면 `HandlerAdapter`를 통해서 실제 비즈니스 로직을 수행하는 컨트롤러로 도달하는데 연결하는 역할을 수행한다.
- - -
### 2.5 Controller: 자원에 대한 행위 정의
컨트롤러는 **자원에 대한 표현(행위)를 정의하는 역할을 담당한다.**

```java
@GetMapping("/users/{id}")
public UserResponse getUser(@PathVariable Long id) { ... }
```

REST 관점에서 보면,
이 메서드는 `/users/{id}`라는 자원을 `GET`이라는 HTTP Method를 통해 조회하는 행위를 표현한다.

즉, Spring Web MVC의 컨트롤러는 REST에서 말하는 자원과 행위의 결합 지점이라고 분석할 수 있다.

- - -
### 2.6 HttpMessageConverter - Representation의 구현

컨트롤러가 반환하는 값은 보통 다음과 같은 Java 객체 형태이다.
```java
UserResponse
```

하지만 HTTP 응답은 문자열 또는 바이트 스트림 형태로 전달되어야한다.
따라서 Spring Web MVC는 이 문제를 해결하기 위해 **`HttpMessageConverter`**를 사용한다.
**`HttpMessageConverter`**는 다음 역할을 수행한다.
- Java 객체 ↔ JSON(XML 등) 변환
- `Content-Type`에 따른 표현 방식 결정

이 계층은 REST에서 말하는 Representation이 실제로 구현되는 지점이라고 볼 수 있다.

- - -
### 2.7 ResponseEntity: HTTP 응답의 의미를 표현함
마지막으로, Spring MVC는 `ResponseEntity`를 통해 HTTP 응답의 의미를 명시적으로 표현할 수 있도록 지원한다.

**`ResponseEntity`**는 다음 요소를 포함한다.
- HTTP Status Code
- Response Header
- Response Body

이 **`ResponseEntity`**를 통해 
단순히 데이터를 반환하는 것 뿐만아니라,
HTTP 응답 자체에 의미를 부여할 수 있다.

이 부분 역시 REST 스타일의 API를 구성하는데 있어 중요한 부분이다.
- - -
### 2.8 정리: RESTful함을 어디에서 결정되는가?
지금까지 Spring Web MVC의 요청 처리 구조를 따라가며,
REST 제약이 프레임워크 내부에서 어떻게 드러나는지를 살펴보았다.

이를 통해서 알 수 있었던 점은 **Spring MVC는 일부 REST 제약을 자연스럽게 만족시키는 구조를 제공**하지만,
**REST의 모든 제약을 자동으로 보장하지는 않는다.**라는 것이다.
- - -
#### 2.8.1 Spring MVC가 결정해주지 않는 것들
Spring MVC는 요청 처리의 실행 모델과 구조를 제공할 뿐,
다음 요소에 대해서는 명시적인 결정을 내려주지는 않는다.
- 자원을 어떻게 나눌 것인가.
- URI를 어떤 기준으로 설계할 것인가.
- HTTP Method를 어떤 의미로 사용할 것인가.
- 응답에 어떤 Status Code를 사용할 것인가.
- 캐시 가능 여부를 어떻게 표현할 것인가.
- 상태 전이(HATEOAS)를 포함할 것인가.

따라서 개발자들은 RESTful함에 대해 다음을 고민해야한다.
- 이 API에서 **자원은 무엇인가?**
- 이 요청은 조회인가, 상태 변경인가?
- 이 행위는 **HTTP Method 중 어떤 것으로 표현하는게 맞는가?**
- 이 결과는 **어떤 Status Code인가?**
- 이 응답은 **캐시되어도 되는가?**
- **상태 전이를 사용할 것인가?**

- - -
#### 2.8.2 RESTful함이란,
정리하자면, RESTful함은 어떤 프레임워크를 사용했는지가 아니라,

**REST 제약을 이해하고, 그 제약을 어디까지 적용할지 판단하여 API를 설계했는지**
에 따라 달라지는 것이다.

- - -
# 3. RESTful Spring MVC Demo
이제 실제 코드를 통해 **REST 스타일의 API가 Spring Web MVC에서 어떻게 표현되는지** 확인해 볼 차례이다.

> **전체 Demo 코드는 다음 [Git Repository](https://github.com/Gumraze-git/devlog-demo-spring-mvc-rest)에서 확인 가능합니다!**

이번 Demo의 목표는 다음과 같다.
- RESTful API 설계
  - 자원을 중심으로 URI 설계함.
  - HTTP Method와 Status Code를 의미에 맞게 사용함.
- Spring MVC 요청 처리 구조 확인
  - `Controller` -> `HttpMessageConverter` -> `ResponseEntity` 흐름을 코드로 확인함.
- REST 제약이 코드에서 드러나는 지점 확인
  - Spring MVC가 **지원하는 것**과 **개발자가 결정한 것**을 구분한다.

- - -
## 3.1 Demo 시나리오 개요: 주문
이번 Demo에서는 주문(`Order`)를 자원으로 정의하고,
이 자원이 HTTP 요청/응답에서 표현(representation)이 되는 과정을 확인한다.

- 자원: `Order`
- 자원 컬렉션: `/orders`
- 단일 자원 식별: `/orders/{orderId}`

이를 기준으로 다음 CRUD 기능(행위)를 구현해본다.
- 주문 생성(Create)
- 주문 단건 조회(Read)
- 주문 수정(Update)
- 주문 삭제(Delete)

> 각 단계마다 Spring MVC가 지원하는 것과 개발자가 결정해야하는 것을 구분하면 살펴볼 예정이다.

- - -
## 3.2 API 설계
- 자원 컬렉션: `/orders`
- 단일 자원: `/orders/{orderId}`

| 기능       | HTTP Method  | URI                 | 성공 Status Code           | 응답(Representation) |
| -------- | ------------ | ------------------- | ------------------------ | ------------------ |
| 주문 생성    | POST         | `/orders`           | 201 Created              | 생성된 Order(또는 id)   |
| 주문 단건 조회 | GET          | `/orders/{orderId}` | 200 OK                   | Order              |
| 주문 수정    | PATCH | `/orders/{orderId}` | 204 No Content |없음    |
| 주문 삭제    | DELETE       | `/orders/{orderId}` | 204 No Content(자원 미반환)           | 없음                 |

> 수정의 경우에는 `200` 또는 `204` 모두 가능하지만,
demo에서는 응답 본문을 반환하지 않는 방식으로 단순화하기 때문에 `204 No Content`로 통일한다.

> **Status Code 간단 정리**
- **`200 OK`**: **요청이 성공**하였으며 **처리 결과(representation)를 반환한다.**
- **`201 Created`**: **새로운 자원이 생성되었음을 의미**한다.
  - REST에서는 **`Location`** 헤더로 새 자원의 URI를 함께 제공한다.
- **`204 No Content`**: 요청은 성공했으나, **응답 본문(처리 결과)이 없음을 의미한다.**
- **`400 Bad Request`**: 요청 값이 잘못되었거나 서버가 이해할 수 없다.
- **`404 Not Found`**: 요청한 자원이 서버에 존재하지 않는다.
- **`409 Conflict`**: 서버의 현재 상태와 충돌한다(중복 생성, 상태 충돌 등).
- **`500 Internal Server Error`**: 서버 내부에서 예상치 못한 오류가 발생했다.

## 3.3 DTO 설계
DTO는 **자원의 표현(Representation)을 구성하는 핵심**이다.
즉, REST 관점에서 클라이언트와 서버가 주고 받는 메시지의 구조를 정의한다.
### 주문 생성 요청 DTO
```java
public class CreateOrderRequestDto {
    String name;
    int quantity;
}
```

### 주문 수정 요청 DTO
```java
public class UpdateOrderRequestDto {
    private String name;
    private int quantity;
}
```
### 주문 응답 DTO(HATEOAS 포함)

```java
import org.springframework.hateoas.RepresentationModel;

public class OrderResponseDto extends RepresentationModel<OrderResponseDto> {
    Long id;
    String name;
    int quantity;
}
```
- `RepresentationModel<T>`는 응답에 링크를 추가할 수 있는 기반 타입이다.
- 즉, HATEOAS를 적용하기 위해 응답 DTO가 "링크를 담을 수 있는 구조"를 갖게 된다.
- 링크는 자동 생성되지 않으며 처리는 컨트롤러가 담당한다.
  - 이에 대한 상세 내용은 컨트롤러 구현 코드에서 설명할 예정이다.
- - -
## 3.4 Controller 구현
이번 글의 목적은 **REST가 Spring MVC 코드에서 어떻게 표현되는가?**를 확인하는 것이므로,
비즈니스 로직(서비스)은 다루지 않는다.

먼저 `@RestController`를 사용하여 컨트롤러를 구현했다.
`@RestController`는 Spring MVC에서,
**HTTP 요청을 처리하고, 그 결과를 HTTP 응답 본문으로 직접 반환하는 컨트롤러**임을 의미한다.

이는 다음 두 애노테이션의 조합이다.
- `@Controller`
- `@ResponseBody`

즉, 컨트롤러 메서드의 반환값이
View 이름이 아니라 **HTTP Response Body(Representation)**으로 처리되며,
Spring MVC의 `HttpMessageConverter`를 통해
Java 객체가 JSON 형태로 변환되어 응답으로 전달된다.

이러한 특성 때문에 `@RestController`는 REST 스타일의 API를 구현할 때 기본적으로 사용된다.

```java
@RestController
@RequestMapping("/orders")
@AllArgsConstructor
public class OrderController { ... }
```
- - -
### 3.4.1 주문 생성 API
주문 생성 API의 표현은 `POST /orders`로 정의하며,
요청이 성공적으로 처리되면 **`201 Created`** 상태 코드를 반환한다.

```java
@PostMapping
public ResponseEntity<OrderResponseDto> createOrder(
        @RequestBody CreateOrderRequestDto request
) {
    if (request == null) {
        throw new ResponseStatusException(BAD_REQUEST, "요청 값이 없습니다.");
    }

    OrderResponseDto response = orderService.createOrder(request);
    addLinks(response);

    return ResponseEntity
            .created(
                linkTo(methodOn(OrderController.class)
                .getOrder(response.getId()))
                .toUri()
            )
            .body(response);
}

    
private void addLinks(OrderResponseDto response) {
        response.add(linkTo(methodOn(OrderController.class).getOrder(response.getId())).withSelfRel());
        response.add(linkTo(methodOn(OrderController.class).updateOrder(response.getId(), null)).withRel("update"));
        response.add(linkTo(methodOn(OrderController.class).deleteOrder(response.getId())).withRel("delete"));
    }
``` 
주문 생성 요청이 성공하면,
Spring MVC의 `ResponseEntity.create(URI)`를 통해 다음 의미를 가진 응답이 만들어진다.
- HTTP Status Code: `201 Created`
- `Location` Header: 생성된 자원의 URI(`/orders/{id}`)
- Response Body: 생성된 `Order` 자원의 Representation

이는 단순히 요청이 성공했다는 의미가 아니라,
새로운 자원이 생성되었으며, 해당 자원을 다룰 수 있는 위치가 결정되었음을
HTTP 레벨에서 표현하는 방식이다.
- - -
따라서 **Spring MVC가 지원하는 것**
- `@PostMapping`, `@RequestBody`를 통한 요청 매핑 및 바인딩
- 요청/응답 DTO ↔ JSON 변환 `HttpMessageConverter`가 담당
- `ResponseEntity`를 통한 Status Code, Header, Body 구성

**개발자가 결정해야하는 것**
- 생성 성공의 의미를 **201 Created**로 표현할 것인지
- 생성된 자원의 URI를 `Location` 헤더로 제공할 것인지
- 응답 본문에 자원의 Representation을 포함할 것인지
- 어떤 상태 전이 링크(HATEOAS)를 응답에 포함할 것인지
- - -
다시 돌아와서 응답 성공의 예시를 보면 다음과 같다.
![](https://velog.velcdn.com/images/gumraze/post/6dccf624-d8d4-4c03-8ec3-0754a77d8a71/image.png)
Header에 `Location`과 `_links`로 HATEOAS가 제공되는 것을 확인할 수 있다.
- - -
### 3.4.2 주문 단건 조회 API
주문 단건 조회 API는 `GET /orders/{orderId}`로 정의하며,
요청이 성공적으로 처리되면 `200 OK` 상태 코드와 함께
해당 주문 자원의 표현을 반환한다.
```java
@GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable Long id) {
        OrderResponseDto response = orderService.getOrder(id);
        addLinks(response);
        return ResponseEntity.ok(response);
    }
```
마찬가지로 `addLink`를 통해 HATEOAS를 지원한다.

![](https://velog.velcdn.com/images/gumraze/post/a99a0b47-5813-415f-a025-8a3bb779786e/image.png)


- - -
### 3.4.3 주문 수정 API
주문 수정 API는 `PATCH /orders/{orderId}`로 정의한다.
이번 demo에서는 수정 성공 시, 응답 본문을 반환하지 않는 방식으로 단순화하여,
`204 No Content` 상태 코드를 사용한다.
```java
@PatchMapping("/{id}")
    public ResponseEntity<Void> updateOrder(
        @PathVariable Long id,
        @RequestBody UpdateOrderRequestDto request
    ) {
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "요청 값이 없습니다.");
        }
        request.setId(id);
        orderService.updateOrder(request);
        return ResponseEntity.noContent().build();
    }
```
수정 요청이 성공하는 서버는 요청이 정상적으로 처리되었음을 의미하는 `204 No Content` 응답을 반환한다.

![](https://velog.velcdn.com/images/gumraze/post/e57ca010-7fd5-4cd1-8cb1-fd6500641b62/image.png)

단건 조회로 수정되었음을 확인할 수 있다.
![](https://velog.velcdn.com/images/gumraze/post/e40703c9-b608-44e9-9c7b-01c504dd387c/image.png)

여기서도 마찬가지로 **개발자가 결정하는 것**은
수정 성공 시의 응답을 `200 OK`로 할 것인지, `204 No Content`로 할 것인지 이다.

- - -
### 3.4.4 주문 삭제 API
주문 삭제 API는 `DELETE /orders/{orderId}`로 정의한다.
삭제 성공 시에는 마찬가지로 **`204 No Content`**를 반환한다.
```java
@DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
```

주문 삭제 성공 시, 서버는 다음 의미를 가진 응답을 반환한다.
- 요청을 정상적으로 처리됨.
- 해당 자원은 더 이상 존재하지 않는다.
- 응답 본문은 제공하지 않는다.
![](https://velog.velcdn.com/images/gumraze/post/97b7535b-211c-427c-af37-bb6ba4985a94/image.png)

이후 동일한 자원에 대한 조회 요청을 보내면 **`404 Not Found`**응답을 받게 된다.

![](https://velog.velcdn.com/images/gumraze/post/16ca81ad-8491-4ce8-82b0-1d6f87d3e31c/image.png)
- - -
### 3.4.5 Controller에서 드러나는 REST 제약 정리
이번 Demo의 컨트롤러 코드에서 **REST 제약이 드러나는 지점**을 정리하면 다음과 같다.
- **Client-Server**
  - 클라이언트는 URI와 HTTP Method만 알고 요청을 보낸다
  - 서버는 자원 상태와 Representation만 반환한다.
- **Stateless**
  - 각 요청은 독립적으로 처리되며, 서버는 클라이언트의 이전 요청 상태를 저장하지 않는다.
- **Uniform Interface**
  - 자원은 URI로 식별된다.
  - 행위는 HTTP Method로 표현된다.
  - **HATEOAS**
    - `_links`를 통해 다음 상태 전이를 표현한다.
    - Spring MVC가 강제하지 않으며, Controller에서 명시적으로 구성한다.

> 나머지 REST 제약인 Cache, Layered System, Code-on-Demand는
실제 검증을 위해 캐시 정책, 중간 계층 구성, 클라이언트 동작까지 함께 고려해야 한다.
이는 배포 환경, 중간 계층, 인프라 구성까지 포함하는 논의로 확장되기 때문에,
이번 Demo에서는 Spring Web MVC 코드 레벨에서 확인 가능한 제약에만 집중하였다.

- - -
# 마치며,,
이번 REST에 대한 Recap과 더 깊은 구현까지 공부하면서 느낀 점은,
Spring에서의 REST를 이해하기 위해서는 서블릿, WAS 및 Tomcat과 같은 실행 환경에 대한 이해가 필수적이라는 것이다.

웹에서 데이터가 어떻게 주고 받고 있는지 등에 대한 기본적 구조에 대한 공부를 추가적으로 해야겠다는 생각이 들었다. (정말 공부할 게 많다,, 그런데 재밌긴 하다..)

아무튼 그동안 프레임워크가 추상화해서 지원하는 영역을 물고, 씹고, 뜯어보면서,
HTTP 요청이 실제로 어떻게 전달되고 처리되는지 구조적으로 이해할 수 있었다.

그리고 항상 원리에 대해 공부하다 보면 어디까지 파야 완전히 이해할 수 있는지에 대해 명확하지는 않지만, 적어도 어떤 목표를 위해 구현했는지, 구현이 왜 이런지에 대해 이해하면 된다고 생각이 든다.

Spring에서 REST가 어떻게 적용되는지 확인해보고자 했는데, 서블릿부터 등등 많은 것을 공부해서 재밌었고, 마지막으로 기술 블로그를 작성하는데 사실 내용이 너무 길어서 이거를 누가 읽을까 싶다. 그래서 Mermaid도 사용하고 그랬는데, [토스에서 제공하는 테크니컬 라이팅 소개](https://technical-writing.dev/?utm_source=Nomad+Academy&utm_campaign=a50077c964-EMAIL_CAMPAIGN_2025_05_02&utm_medium=email&utm_term=0_4313d957c9-7ac123137e-357553052)를 참고해서 다음 포스팅은 핵심만 압축해서 작성해보면 좋을 것 같다.

# 참고자료
- [Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
- [Spring HATEOAS](https://spring.io/projects/spring-hateoas)
- [Spring REST Docs](https://spring.io/projects/spring-restdocs)
- [IBM-Servlet](https://www.ibm.com/docs/ko/was/9.0.5?topic=applications-servlets)
- [HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110)
- [Toss payments 개발자 센터, POST, PUT, PATCH의 차이점](https://docs.tosspayments.com/blog/rest-api-post-put-patch)
