---
title: "Everp"
summary: "공통 인증 서버, Gateway 권한 처리, Problem Detail 기반 응답 계약, 조회 계약과 초기화 데이터 기준을 정리한 ERP 팀 프로젝트입니다."
sources:
  - label: "프로젝트 통합 레포"
    url: "https://github.com/Gumraze-git/everp"
  - label: "프로젝트 조직"
    url: "https://github.com/AutoEver-4Ever"
date: "2025-11-12"
hero_images:
  - src: "/assets/projects/everp/Auth.png"
    caption: "Auth 인증 흐름 화면"
    alt: "4EVER ERP Auth 인증 흐름 화면"
  - src: "/assets/everp_msa_stru.png"
    caption: "MSA 시스템 아키텍처"
    alt: "4EVER ERP MSA 구조 다이어그램"
  - src: "/assets/projects/everp/dashboard.png"
    caption: "ERP 대시보드 화면"
    alt: "4EVER ERP 대시보드 화면"
  - src: "/assets/projects/everp/fcm.png"
    caption: "FCM 알림 연동 화면"
    alt: "4EVER ERP FCM 알림 연동 화면"
  - src: "/assets/projects/everp/mm.png"
    caption: "MM 모듈 화면"
    alt: "4EVER ERP MM 모듈 화면"
  - src: "/assets/projects/everp/sd.png"
    caption: "SD 모듈 화면"
    alt: "4EVER ERP SD 모듈 화면"
thumbnail: "/assets/projects/everp/Auth.png"
stack:
  - Spring Boot
  - Spring Security
  - Spring Cloud Gateway
  - PostgreSQL
  - JPA (Hibernate)
  - Kafka
  - Redis
  - Next.js
  - Docker Compose
  - OAuth 2.1
period: "2025.09 - 2025.11"
members: "총 6명 (프론트엔드 3, 백엔드 3)"
role: "팀장, 공통 인증 서버·Gateway 권한 처리·응답 계약 중심 백엔드"
roles:
  - Shared Auth
  - Gateway Authorization
  - API Contract
  - Query / Seed Data
category: "ERP Workflow Service"
project_type: "교육 기반 팀 프로젝트"
status: "Completed"
feature_cards:
  - title: "공통 인증과 클라이언트 경계"
    description: "Spring Authorization Server 기반 OAuth2.1/OIDC 인증 서버를 구축하고 클라이언트 유형별 로그인 흐름을 정리했습니다."
  - title: "Gateway 권한 해석"
    description: "JWT Claims를 역할과 사용자 유형으로 해석해 화면/API 권한 기준을 일관되게 연결했습니다."
  - title: "응답 계약과 팀 기준 정렬"
    description: "Problem Detail 기반 오류 응답, 조회 계약, 초기화 데이터를 정리해 프론트 연동과 팀 개발 기준을 맞췄습니다."
results:
  - Auth와 Gateway 경계를 먼저 고정해 모바일·웹·백엔드 접근 정책을 같은 기준으로 맞춤
  - Problem Detail 기반 공통 오류 응답으로 프런트 연동 규칙과 서비스 간 디버깅 기준을 통일
  - 조회 계약과 초기화 데이터를 정리해 팀이 같은 시나리오와 같은 언어로 개발할 수 있는 기준을 마련
published: true
education: "현대오토에버 모빌리티 SW 스쿨 2기"
about_organization: "현대오토에버 모빌리티 SW 스쿨 2기"
about_description: "Everp는 견적, 주문, 발주, 재고, 생산, 정산, 인사 흐름을 하나의 업무 체계로 다뤄본 ERP 성격의 팀 프로젝트였습니다. 저는 팀장과 백엔드 역할을 함께 맡아 공통 인증 서버, Gateway 권한 처리, Problem Detail 기반 응답 계약, 조회 계약과 초기화 데이터를 먼저 고정해 팀이 같은 기준으로 개발할 수 있도록 만드는 데 집중했습니다."
about_tasks:
  - 팀 단위 일정과 범위를 조율하며 공통 인증, Gateway, 조회 계약 중심의 기준을 정리
  - OAuth2.1/OIDC 인증 서버와 Gateway 권한 검사 정책 구현
  - Problem Detail 기반 오류 응답과 대시보드용 조회 계약 구현
  - 초기화 데이터와 모듈별 테스트 시나리오 기준 정리
---
