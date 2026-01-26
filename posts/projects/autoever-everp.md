---
title: "ERP 시스템 개발"
summary: "엔터프라이즈 ERP를 MSA로 설계하고 웹·모바일·백엔드(인증/GW/SCM/Business)를 통합해 견격→주문→조달→생산→정산을 자동화한 프로젝트"
date: "2025-11-12"
thumbnail: "/devlog-placeholder.svg"
stack:
  - Spring Boot
  - PostgreSQL
  - AWS ECS
  - Swift
  - Kotlin
  - Kafka
  - OAuth
period: "2025.09 - 2025.11"
members: "총 6명 (프론트 3, 백엔드 3)"
role: "백엔드"
repo: "https://github.com/AutoEver-4Ever"
published: true
education: "현대오토에버 모빌리티 SW 스쿨 2기"
---

## 역할
- **프로젝트 팀장**: 일정/범위 관리, MSA 구조 설계, 서비스별 우선순위 정리
- **iOS 리드**: 검색/대시보드/프로필 등 핵심 UX 플로우 설계 및 상태 관리 리팩터링
- **백엔드(OAuth)**: 인증·GW·Business·SCM 모듈의 권한/세션/알림 로직 개선 및 API 품질 정리

## 주요 기능
- **영업→주문**: 견적 등록·검색·승인 후 주문 전환, 주문/견적 상태 변경 알림
- **조달/재고/SCM**: 발주서 생성, 입·출고 처리, 창고/재고 검증, BOM 기반 자재 흐름 관리
- **생산/배송**: 생산 오더 연계 후 출고/배송 처리, 매입/매출 전표 생성
- **정산/권한**: 미수 승인·정산 흐름, 부서/역할별 RBAC 및 모바일 전용 로그인 제한
- **대시보드/검색**: 주문·견적·재고 현황 실시간 대시보드, 전표/발주/견적 다중 조건 검색·필터·정렬

## 모바일(iOS)
- 검색/필터 확장: 전표·견적·발주 검색 코디네이터 도입, 추천 섹션·필터·정렬 UX 확장, 검색 상태/라우팅 정리
- 대시보드/프로필: 대시보드 워크플로우 UI 추가, 홈/프로필 레이아웃 및 상태 관리 리팩터링, 프로필 모델 확장
- UX 개선: 불필요 렌더 제거, 검색/필터 전환 시 지연 최소화, 메인 앱 검색 로직 개선으로 사용성 향상

## 백엔드
- AUTH: OAuth 2.0 Authorization Code + PKCE로 iOS/AOS 통합 로그인, refresh token 로테이션/만료 처리, 모바일 전용 로그인 제한, 로그아웃 시 세션 쿠키 무효화, 배포 도메인 CORS 허용 추가
- BUSINESS: 대시보드 주문/견적 조회 로직 개선, 제품 정보 조회 추가, 다중 ID 조회 API, 상태 변경 알림 연동, HRM 데이터 정리
- GW: 생산/구매/재고/영업/HRM 엔드포인트 권한 검사 추가로 접근 제어 강화, Auth 발급 JWT 서명/만료 검증 및 스코프 기반 라우팅
- SCM: BOM 트리 DTO 수정, 창고/주문 상태 검증, 입·출고 응답 보완으로 재고 프로세스 안정화

## MSA 구조
- Auth 서비스가 OAuth 인증/토큰 발급·갱신을 담당하고 Gateway(WebFlux)에서 JWT 서명 검증 후 도메인 서비스로 라우팅 (Auth/Business/SCM/Payment/Alarm 등)
- 서비스별 Spring Boot 마이크로서비스 + 개별 PostgreSQL 인스턴스, Kafka 이벤트로 서비스 간 연계
- 권한·세션은 Auth, 주문·견적·재고·생산·정산은 Business/SCM, 권한 필터링은 GW에서 1차 적용
- SAGA 코레오그래피 방식으로 견적→주문→재고/생산→정산 이벤트를 처리해 분산 트랜잭션 보상
- Docker Compose로 공통 인프라(Kafka, PostgreSQL)와 서비스 컨테이너를 일괄 기동, GitHub Actions로 CI

![MSA 구조 다이어그램](/assets/everp_msa_stru.png)

## Contribution
- iOS: SwiftUI + 코디네이터 패턴, 검색 상태 관리, 대시보드/프로필 UI 리팩터링
- 백엔드: Spring Boot OAuth 2.0 인증/세션, CORS·OAuth 클라이언트 관리, refresh 로테이션/블랙리스트 처리, GW 권한 필터, SCM/Business DTO·검증·알림 로직 정리
