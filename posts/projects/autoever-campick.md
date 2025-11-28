---
title: "중고 캠핑 자동차 모바일 애플리케이션"
summary: "모바일 중고 캠핑 자동차 거래 앱 구현 프로젝트"
date: "2025-10-15"
thumbnail: "/devlog-placeholder.svg"
stack:
  - Swift
  - Kotlin
  - Spring Boot
  - MySql
  - EC2
period: "2025.07 - 2025.10"
members: "총 4명 (프론트 2, 백엔드 2)"
repo: "https://github.com/autoever-ob"
published: true
highlights:
  - "VIN 기반 차량 이력 조회와 시세 데이터(오픈 API)를 결합해 신뢰도 점수를 계산."
  - "채팅/푸시 알림을 Firebase로 구현하여 실시간 상담 플로우를 완성."
  - "오프라인 캐시 + 이미지 프리페치로 느린 네트워크에서도 주요 화면이 1초 내 로드."
---

## 역할
- 모바일 프론트엔드 리드, UX 프로토타이핑, 상태/네트워크 레이어 설계.

## 주요 기능
- **맞춤 추천**: 검색 히스토리 기반 유사 매물 추천 카드.
- **차량 이력/시세**: VIN 조회 → 사고/소유 이력, 오픈 API 시세 평균을 조합한 신뢰도 점수 표시.
- **실시간 상담**: 판매자-구매자 채팅, 푸시 알림, 매물 공유 딥링크.
- **오프라인 대응**: React Query + cache persistence, 이미지 프리페치로 저속망 UX 개선.

## 기술 포인트
- React Native/TypeScript, Recoil로 UI 상태 관리, React Query로 네트워크/캐시 계층 구성.
- Firebase Auth/Firestore/FCM을 사용해 인증·실시간 채팅·푸시 알림 구현.
- 지도/필터/목록 간 전환 시 메모이제이션으로 리렌더 최소화, 이미지 CDN 프리페치.
