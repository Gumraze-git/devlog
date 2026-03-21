---
title: "배드민턴 운영 서비스 플랫폼"
summary: "배드민턴 동호회와 지인 모임의 자유게임 및 대회 운영을 돕고, 플레이어 간의 소통을 연결하는 종합 배드민턴 서비스 플랫폼입니다."
project_title: "RallyOn / 랠리온"
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
role: "백엔드 개발, 인증/프로필 흐름 설계, 로컬 개발 인프라 정리"
roles:
  - Backend Development
  - Auth / Profile Flow
  - Free Game Operations
  - Infra Collaboration
category: "Badminton Service Platform"
project_type: "Team Project"
status: "In Progress"
feature_cards:
  - title: "쿠키 기반 OAuth와 프로필 온보딩"
    description: "Kakao OAuth와 로컬 DUMMY 로그인, secure cookie 세션, 프로필 작성 흐름을 하나의 사용자 여정으로 정리했습니다."
  - title: "자유게임 라운드·코트 운영"
    description: "게임 생성부터 참가자 등록, 라운드/매치 편성, organizer 전용 수정 규칙까지 운영 중심 계약으로 구현했습니다."
  - title: "로컬 HTTPS·Docker 협업 환경"
    description: "frontend/backend/infra를 sibling 구조로 분리하고, .test 도메인과 live dev 워크플로를 맞춰 팀 협업 비용을 줄였습니다."
results:
  - secure cookie 기반 로그인, 프로필 온보딩, 자유게임 운영 API를 하나의 플로우로 연결
  - 자유게임 생성·공개 공유 조회·라운드 편성 규칙을 테스트와 함께 정리
  - Docker Compose, nginx, mkcert 기반의 로컬 HTTPS 협업 환경을 문서화
published: true
about_organization: "배드민턴 서비스 플랫폼 팀 프로젝트"
about_description: "RallyOn은 배드민턴 자유게임 운영을 시작점으로, 이후 대회 운영과 콘텐츠 영역까지 확장해갈 서비스 플랫폼입니다. 현재 저장소 기준으로는 인증, 프로필, 지역 조회, 장소 검색, 자유게임 생성/운영, 공유 코드 공개 조회가 구현돼 있고, 뉴스 허브와 정식 대회 운영은 후속 확장 범위로 남아 있습니다. 저는 백엔드와 인프라 협업 관점에서 인증/프로필/운영 코어의 핵심 계약을 먼저 고정하는 역할에 집중했습니다."
about_tasks:
  - Kakao/Dummy OAuth 로그인과 secure cookie 인증 흐름 정리
  - 사용자 프로필 작성, 지역 조회, 장소 검색 API 및 연동 구조 설계
  - 자유게임 생성, 라운드/매치 편성, 공개 공유 조회 API 구현과 검증
  - Docker Compose, nginx, mkcert 기반 로컬 HTTPS 협업 환경 정리
---
