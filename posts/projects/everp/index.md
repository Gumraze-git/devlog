---
title: "MSA 기반 ERP 시스템 개발"
summary: "팀장과 백엔드 역할로 참여해 Auth·Gateway·Business·SCM 서비스를 연결하고, 권한 경계와 대시보드 집계 흐름을 정리한 엔터프라이즈 ERP 프로젝트. 본편 이후 2026.03에는 저장소 기준의 후속 개선도 별도로 진행했습니다."
project_title: "4EVER / everp"
sources:
  - label: "프로젝트 통합 레포"
    url: "https://github.com/Gumraze-git/everp"
  - label: "프로젝트 조직"
    url: "https://github.com/AutoEver-4Ever"
date: "2025-11-12"
hero_images:
  - src: "/assets/projects/everp/everp-logo.svg"
    caption: "4EVER 프로젝트 아이덴티티"
    alt: "4EVER ERP 프로젝트 로고"
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
role: "팀장, 백엔드 아키텍처 설계 및 구현"
roles:
  - Team Lead
  - Backend Architecture
  - Auth / Gateway
  - Business / SCM
category: "ERP Platform"
project_type: "Team Project"
status: "Completed"
feature_cards:
  - title: "서비스 경계가 분리된 ERP 구조"
    description: "Auth, Gateway, Business, SCM, Alarm을 분리해 견적부터 생산·정산까지 흐름을 나눠 설계했습니다."
  - title: "권한 경계와 인증 흐름 정리"
    description: "OAuth 기반 인증과 Gateway 권한 검사를 통해 모바일/웹 접근 제어 기준을 명확히 했습니다."
  - title: "대시보드 집계와 데이터 연결"
    description: "여러 도메인의 주문·견적·매입·사용자 데이터를 대시보드용 API로 집계하고 연결했습니다."
results:
  - Auth와 Gateway를 중심으로 사용자 유형별 접근 정책과 서비스 라우팅 기준을 정리
  - Business/SCM 서비스에서 대시보드 집계, 제품 조회, 공급사 정보 연계를 구현
  - 초기화·목업 데이터 구조를 보강해 모듈별 테스트 계정과 도메인 데이터 정합성을 개선
published: true
education: "현대오토에버 모빌리티 SW 스쿨 2기"
about_organization: "현대오토에버 모빌리티 SW 스쿨 2기"
about_description: "4EVER는 견적, 주문, 발주, 재고, 생산, 정산, 인사 기능을 하나의 업무 플랫폼으로 연결하는 ERP 프로젝트였습니다. 프로젝트 본편은 2025.09-2025.11에 진행했고, 팀장과 백엔드 역할을 함께 맡아 서비스 경계를 정리하고 인증·권한·집계 API·초기화 데이터 같은 운영 관점의 기반을 먼저 고정하는 방식으로 프로젝트를 이끌었습니다. 이후 2026.03에는 현재 저장소 기준의 후속 개선도 별도로 진행했습니다."
about_tasks:
  - 팀 단위 일정과 범위를 조율하며 Auth, Gateway, Business, SCM 서비스 구조를 정리
  - OAuth 기반 인증 서버와 Gateway 권한 검사 정책 설계 및 구현
  - 대시보드용 주문·견적·매입 데이터 집계 API 설계 및 구현
  - Kafka 기반 공급사 정보 조회와 모듈별 초기화 데이터 정합성 개선
---
