---
title: "RallyOn"
summary: "secure cookie 기반 브라우저 인증 흐름, organizer 전용 운영 API와 공개 share 조회 경계, 테스트 기반 구조 검증에 집중한 배드민턴 운영 서비스입니다."
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
  - title: "secure cookie 기반 브라우저 인증 흐름"
    description: "Kakao/Dummy OAuth, `auth.rallyon.test`/`api.rallyon.test` 호스트 분리, access/refresh 쿠키 경계를 구현했습니다."
  - title: "운영 API와 공개 share 조회 경계"
    description: "organizer 전용 수정 API와 shareCode 기반 공개 조회를 분리해 운영 규칙과 외부 조회 계약이 섞이지 않도록 했습니다."
  - title: "테스트 기반 구조 검증"
    description: "인증 흐름, 요청 validation, 운영 규칙, 모듈 의존 방향을 테스트와 ArchUnit 규칙으로 검증했습니다."
results:
  - secure cookie를 전제로 한 브라우저 인증 흐름을 로컬 HTTPS 환경에서도 반복 검증할 수 있게 정리
  - organizer 전용 운영 API와 공개 share 조회 API를 분리해 운영 규칙 변경이 조회 경계로 번지지 않도록 고정
  - 기능 테스트와 ArchUnit 규칙으로 인증 구조와 모듈 경계를 함께 검증할 수 있게 정리
published: true
about_organization: "배드민턴 운영 서비스 팀 프로젝트"
about_description: "RallyOn은 배드민턴 자유게임 운영을 더 안정적으로 진행하기 위한 팀 프로젝트입니다. 현재 저장소 기준으로는 인증, 프로필, 지역 조회, 장소 검색, 자유게임 생성/운영, shareCode 기반 공개 조회가 구현돼 있고, 저는 백엔드 관점에서 브라우저 인증 흐름, 자유게임 운영 API, 테스트 기반 구조 검증을 정리하는 역할에 집중했습니다."
about_tasks:
  - Kakao/Dummy OAuth 로그인과 secure cookie 기반 브라우저 인증 흐름 구현
  - organizer 전용 운영 API와 공개 share 조회 API 경계 구현
  - 자유게임 생성, 라운드/매치 편성, 공개 공유 조회 API 구현과 검증
  - 기능 테스트, ArchUnit, Docker Compose, nginx 기반 로컬 HTTPS 실행 환경 정리
---
