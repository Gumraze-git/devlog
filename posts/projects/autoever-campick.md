---
title: "중고 캠핑 자동차 모바일 애플리케이션"
summary: "모바일 중고 캠핑 자동차 거래 앱 구현 프로젝트"
date: "2025-09-25"
thumbnail: "/assets/campick.png"
stack:
  - Swift
highlights:
  - Clean Architecture + MVVM 패턴을 적용한 견고한 iOS 앱 아키텍처 설계
  - 매물 검색/필터 및 상세 조회를 위한 반응형 UX 플로우 구현
  - 차량 및 프로필 이미지 업로드를 위한 안정적인 미디어 처리 시스템 구축
period: "2025.09.15 ~ 2025.09.25"
members: "총 5명 (모바일 3, 백엔드 2)"
repo: "https://github.com/autoever-ob/OB-iOS"
role: "iOS (Swift) 개발 / 모바일 UX·아키텍처 리드 / 프로젝트 팀장"
published: true
education: "현대오토에버 모빌리티 SW 스쿨 2기"
---

## 역할
- iOS 아키텍처 리드: Clean Architecture + MVVM 재구성, Domain/Data/Presentation 분리, DI 컨테이너 설계  
- Vehicle·Auth 도메인 구현: UseCase/Repository 추상화, DTO→Domain 매핑, VehicleAPIClient 작성  
- UX 플로우 구축: 매물 목록/상세/검색·필터/찜/등록 화면 연결
- 미디어 처리: 차량·프로필 이미지 업로드 및 권한 매니저 적용, 업로드 실패 복구 로직 추가

## 주요 기능
- 매물 추천/목록/상세 조회 + 찜/좋아요 토글  
- 검색·필터·정렬 뷰모델 기반 결과 제공  
- 매물 등록/수정 + 메인/서브 이미지 업로드 및 검증  
- 회원가입/로그인/비밀번호 찾기  
- 판매자-구매자 채팅 안정화(낙관적 렌더링, WebSocket 연결 보강)  
- 프로필/내 매물 관리, 관심 매물 확인

## Contribution
- Clean Architecture + MVVM 도입: UseCase/Repository 인터페이스 분리, DTO→Domain→ViewData 매퍼 정리  
- VehicleAPIClient로 API 호출 공통화, ErrorMapper로 에러 매핑 일관성 확보  
- Auth/Vehicle DI 컨테이너로 ViewModel 생성 시 의존성 주입 자동화  
- 이미지 업로드 서비스 프로토콜 분리 및 권한 매니저로 갤러리/카메라 접근 제어
