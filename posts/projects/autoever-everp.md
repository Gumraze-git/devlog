---
title: "대규모 이벤트 관리 플랫폼"
summary: "수만 명 참가자가 등록·결제·체크인·세션 예약을 한 번에 처리하는 이벤트 운영 플랫폼을 구축했습니다."
date: "2025-08-30"
thumbnail: "/devlog-placeholder.svg"
stack:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - PostgreSQL
  - Redis
  - AWS ECS
period: "2025.04 - 2025.08"
members: "총 6명 (프론트 2, 백엔드 3, 디자인 1)"
repo: "https://github.com/AutoEver-4Ever"
published: true
highlights:
  - "대기열/동시성 제어로 피크 타임 초당 500 RPS 등록 트래픽 안정 처리."
  - "세션 예약/좌석 배정을 실시간 락·TTL 큐로 처리해 중복 예약 방지."
  - "운영 대시보드에서 참가자 현황, 결제 실패 리트라이, 입장 QR 스캔 로그를 실시간 모니터링."
---

## 역할
- 프론트엔드 개발 및 운영 대시보드 UI 설계/구현.

## 주요 기능
- **참가자 여정**: 등록 → 결제 → 티켓 발급 → 현장 체크인 → 세션 예약까지 단일 플로우.
- **세션/좌석 관리**: 세션별 좌석 수락/대기열 처리, 중복 예약 방지 로직.
- **운영 대시보드**: 실시간 스냅샷(등록/입장/예약 현황), 결제 실패 리커버리 액션, CSV/엑셀 내보내기.

## 기술 포인트
- Next.js/TypeScript, Tailwind로 대시보드/참가자 UI를 구성하고 서버 컴포넌트로 초기 렌더 성능 확보.
- 백엔드는 PostgreSQL + Redis로 락/TTL 큐, 결제 리트라이 워크플로우를 구현하고 AWS ECS로 배포.
- 프론트는 SWR/React Query 기반 데이터 패칭과 가상 스크롤로 대량 테이블 성능 개선.
