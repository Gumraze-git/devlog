---
title: "RallyOn"
summary: "RallyOn은 배드민턴 자유게임 운영에 필요한 로그인, 프로필 설정, 장소 검색, 세션 생성, 참가자 관리, 경기 편성, 공유 조회 기능을 제공하는 서비스입니다."
sources:
  - label: "Backend Repository"
    url: "https://github.com/RallyOnPrj/backend"
  - label: "Frontend Repository"
    url: "https://github.com/RallyOnPrj/frontend"
  - label: "Infra Repository"
    url: "https://github.com/RallyOnPrj/infra"
date: "2026-03-18"
hero_images:
  - src: "/assets/projects/rally-on/rallyon_main.png"
    caption: "RallyOn 메인 화면"
    alt: "RallyOn 메인 화면"
  - src: "/assets/projects/rally-on/rallyon-cover.svg"
    caption: "RallyOn 프로젝트 커버"
    alt: "RallyOn 프로젝트 커버 이미지"
thumbnail: "/assets/projects/rally-on/rallyon_main.png"
stack:
  - Spring Boot
  - Spring Security
  - JPA (Hibernate)
  - PostgreSQL
  - Flyway
  - JWT
  - Next.js
  - TypeScript
  - Docker Compose
  - Nginx
period: "2025.09 - 2026.03"
members: "프론트엔드 / 백엔드 / 인프라 협업"
role: "백엔드 개발, 인증 흐름 구현, 자유게임 운영 API 구현"
roles:
  - Backend Development
  - Auth Flow
  - Free Game API
category: "Badminton Operations Service"
project_type: "Team Project"
status: "In Progress"
feature_cards:
  - title: "DDD와 헥사고날 기반 도메인 경계 분리"
    description: "사용자, 자유게임, 외부 의존이 한 레이어에 섞이지 않도록 port-in / app service / domain / port-out / adapter-out 구조로 경계를 재구성했습니다."
  - title: "TDD와 ArchUnit 기반 구조 검증"
    description: "인증 시나리오, 요청 validation, 운영 규칙, 모듈 의존 방향을 테스트와 ArchUnit 규칙으로 함께 검증했습니다."
  - title: "OAuth 2.1 기반 인증·인가 구조 재설계"
    description: "단일 애플리케이션 안에서도 Authorization 역할과 Resource 역할을 분리해 인증 변경이 비즈니스 도메인까지 번지지 않도록 정리했습니다."
  - title: "reverse proxy 기반 브라우저 인증 흐름"
    description: "`auth.rallyon.test` / `api.rallyon.test`, nginx proxy, mkcert, DUMMY provider를 기준으로 secure cookie 브라우저 인증 흐름을 반복 검증했습니다."
results:
  - 사용자, 자유게임, 외부 의존이 한 레이어에 섞이지 않도록 도메인 경계를 분리해 운영 변경 단위를 설명 가능하게 고정
  - 기능 테스트와 ArchUnit 규칙으로 인증 구조와 모듈 경계를 함께 검증하는 기준 확보
  - OAuth 2.1 기준으로 인증·인가 책임을 재정리해 인증 변경이 비즈니스 도메인까지 번지지 않도록 고정
  - reverse proxy와 로컬 HTTPS 환경을 통해 secure cookie 기반 브라우저 인증 흐름을 실제와 비슷한 조건에서 반복 검증 가능하게 정리
published: true
about_organization: "배드민턴 운영 서비스 팀 프로젝트"
about_description: "RallyOn은 배드민턴 자유게임 운영을 더 안정적으로 진행하기 위한 팀 프로젝트입니다. 현재 저장소 기준으로는 인증, 프로필, 지역 조회, 장소 검색, 자유게임 생성/운영, shareCode 기반 공개 조회가 구현돼 있고, 저는 백엔드 관점에서 도메인 경계 분리, 구조 검증, OAuth 2.1 기반 인증·인가 구조 재설계, 브라우저 인증 흐름 설계를 먼저 고정하는 역할에 집중했습니다."
about_tasks:
  - DDD와 헥사고날 아키텍처를 통해 사용자·자유게임·외부 의존의 도메인 경계 분리
  - TDD와 ArchUnit 기반 구조 검증 기준 정리
  - OAuth 2.1 기반 인증·인가 구조 재설계
  - nginx reverse proxy, `.test` 도메인, mkcert 기반 브라우저 인증 실행 환경 정리
---
