# My Trip 프로젝트 TODO 리스트

> PRD.md 기반 개발 체크리스트 (2025-11-05 기준)

---

## 📋 Phase 1: 프로젝트 설정 및 환경 구성

- [x] 환경 변수 설정 (`.env` 파일)
  - [x] 기존 Clerk, Supabase 환경변수 확인 ✅ (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_STORAGE_BUCKET)
  - [x] `NEXT_PUBLIC_TOUR_API_KEY` (한국관광공사 API 키)
  - [x] `TOUR_API_KEY` (서버 사이드용 - 인식 안될 경우 대비)
- [x] `lib/api/` 디렉토리 생성 ✅
  - [x] `tour-api.ts` 파일 (한국관광공사 API 클라이언트) ✅
    - [x] `areaCode2` 함수 (지역코드 조회) ✅
    - [x] `areaBasedList2` 함수 (지역 기반 관광정보 조회) ✅
    - [x] `searchKeyword2` 함수 (키워드 검색) ✅
    - [x] `detailCommon2` 함수 (공통 정보 조회) ✅
    - [x] `detailIntro2` 함수 (소개 정보 조회) ✅
    - [x] `detailImage2` 함수 (이미지 목록 조회) ✅
    - [x] 공통 파라미터 처리 (serviceKey, MobileOS, MobileApp, \_type) ✅
    - [x] 에러 처리 및 재시도 로직 ✅ (지수 백오프, 최대 3회 재시도)
- [x] `lib/types/` 디렉토리 생성 ✅
  - [x] `tour.ts` 파일 ✅
    - [x] `TourItem` 인터페이스 (목록 응답) ✅
    - [x] `TourDetail` 인터페이스 (상세 정보) ✅
    - [x] `TourIntro` 인터페이스 (소개 정보) ✅
    - [x] `TourImage` 인터페이스 (이미지 정보) ✅
    - [x] `ContentTypeId` 타입 (관광 타입) ✅
    - [x] `AreaCode` 타입 (지역 코드) ✅
- [x] `lib/constants/` 디렉토리 생성 ✅
  - [x] `content-types.ts` 파일 (관광 타입 상수) ✅
  - [x] `area-codes.ts` 파일 (지역 코드 상수, 선택 사항) ✅
- [x] `components/ui/` shadcn 컴포넌트 확인/추가
  - [x] `button.tsx` (이미 존재) ✅
  - [x] `input.tsx` (검색창용, 이미 존재) ✅
  - [x] `dialog.tsx` (이미 존재) ✅
  - [x] `form.tsx` (이미 존재) ✅
  - [x] `label.tsx` (이미 존재) ✅
  - [x] `accordion.tsx` (이미 존재) ✅
  - [x] `textarea.tsx` (이미 존재) ✅
  - [x] `card.tsx` (관광지 카드용) ✅
  - [x] `select.tsx` (필터용) ✅
  - [x] `skeleton.tsx` (로딩 상태) ✅
  - [x] `sonner.tsx` (토스트 메시지) ✅
- [x] `supabase/migrations/` 디렉토리 ✅
  - [x] `setup_schema.sql` 마이그레이션 파일 존재 ✅ (users 테이블)
  - [x] `setup_storage.sql` 마이그레이션 파일 존재 ✅
  - [x] Supabase 클라이언트 설정 완료 ✅ (clerk-client.ts, server.ts, client.ts, service-role.ts)
  - [x] `hooks/use-sync-user.ts` 존재 ✅
  - [x] `components/providers/sync-user-provider.tsx` 존재 ✅
  - [x] `YYYYMMDDHHmmss_tour_schema.sql` 마이그레이션 파일 생성 (tour_schema.sql 기반) ✅
    - [x] `users` 테이블 확인 (Clerk 연동) ✅
    - [x] `bookmarks` 테이블 확인 (북마크 기능) ✅
    - [x] 인덱스 확인 (bookmarks.user_id, content_id, created_at) ✅
    - [x] RLS 비활성화 확인 (개발 환경) ✅
- [x] `app/layout.tsx` 기본 구조 ✅
  - [x] ClerkProvider 설정 완료 ✅
  - [x] SyncUserProvider 설정 완료 ✅
  - [x] Navbar 컴포넌트 추가 완료 ✅
  - [x] 메타데이터 기본값 설정 ✅
  - [x] `app/favicon.ico` 존재 ✅
  - [x] `public/logo.png` 존재 ✅
  - [x] `public/og-image.png` 존재 ✅
  - [x] `public/icons/` 디렉토리 및 아이콘 파일들 존재 ✅

---

## 🏠 Phase 2: 홈페이지 (`/`) 구현

### 2.1 페이지 기본 구조

- [x] `app/page.tsx` 업데이트
  - [x] 기본 레이아웃 구조 (헤더, 메인 영역)
  - [x] 검색창, 필터, 목록 영역 구분
  - [x] 반응형 레이아웃 (데스크톱: 전체 너비, 모바일: 전체 너비)

### 2.2 관광지 목록 컴포넌트

- [x] `components/tour-card.tsx` 파일 생성
  - [x] 썸네일 이미지 표시 (없으면 기본 이미지)
  - [x] 관광지명 표시
  - [x] 주소 표시
  - [x] 관광 타입 뱃지 표시
  - [x] 간단한 개요 (1-2줄) - TourItem에 overview 필드 없음으로 현재 제외 (상세페이지에서만 제공)
  - [x] 클릭 시 상세페이지 이동 (`/places/[contentId]`)
  - [x] 호버 효과 및 스타일링
- [x] `components/tour-list.tsx` 파일 생성
  - [x] 관광지 목록을 그리드로 표시
  - [x] 로딩 상태 (Skeleton UI)
  - [x] 빈 상태 처리 (결과 없음)
  - [ ] 페이지네이션 또는 무한 스크롤 (향후 API 연동 시 구현 예정)
  - [x] 하드코딩 데이터로 테스트 먼저 진행 (컴포넌트가 TourItem[] 배열을 받아 표시 가능)

### 2.3 필터 컴포넌트

- [x] `components/tour-filters.tsx` 파일 생성 ✅
  - [x] 지역 필터 (시/도 선택) ✅
    - [x] `areaCode2` API 연동하여 지역 목록 조회 ✅
    - [x] 드롭다운 또는 체크박스 UI ✅
    - [x] "전체" 옵션 ✅
  - [x] 관광 타입 필터 ✅
    - [x] ContentTypeId 선택 (12, 14, 15, 25, 28, 32, 38, 39) ✅
    - [x] 드롭다운 또는 체크박스 UI ✅
    - [x] "전체" 옵션 ✅
  - [x] 필터 상태 관리 (URL 쿼리 또는 상태) ✅
  - [x] 필터 초기화 기능 ✅
- [x] 필터 동작 연결 ✅
  - [x] `areaBasedList2` API 연동 ✅
  - [x] 필터 변경 시 목록 재조회 ✅
  - [x] 로딩 상태 표시 ✅

### 2.4 검색 기능

- [x] `components/tour-search.tsx` 파일 생성 ✅
  - [x] 검색창 UI (헤더 또는 메인 영역) ✅
  - [x] 검색 아이콘 표시 ✅
  - [x] 엔터 또는 검색 버튼 클릭으로 검색 실행 ✅
  - [x] 검색 중 로딩 스피너 ✅
  - [x] 검색어 초기화 기능 ✅
- [x] 검색 API 연동 ✅
  - [x] `searchKeyword2` API 호출 ✅
  - [x] 검색 결과를 `tour-list`에 표시 ✅
  - [x] 검색 결과 개수 표시 ✅
  - [x] 결과 없음 안내 메시지 ✅
- [x] 검색 + 필터 조합 ✅
  - [x] 키워드 + 지역 필터 동시 적용 ✅
  - [x] 키워드 + 관광 타입 필터 동시 적용 ✅
  - [x] 모든 필터 동시 적용 가능하도록 구현 ✅

### 2.5 정렬 & 페이지네이션

- [x] 정렬 기능 ✅
  - [x] 정렬 옵션 UI 추가 (최신순, 이름순) ✅
  - [x] `modifiedtime` 기준 최신순 정렬 ✅
  - [x] 관광지명 기준 가나다순 정렬 ✅
- [x] 페이지네이션 ✅
  - [x] 페이지당 10-20개 항목 제한 ✅
  - [x] 페이지 번호 선택 또는 무한 스크롤 구현 ✅ (페이지 번호 선택 구현)
  - [x] API 파라미터 `numOfRows`, `pageNo` 연동 ✅
- [x] 로딩 상태 개선 ✅
  - [x] Skeleton UI로 교체 (카드 스켈레톤) ✅
  - [x] 스피너 대신 자연스러운 로딩 경험 ✅

---

## 📄 Phase 3: 상세페이지 (`/places/[contentId]`) 구현

### 3.1 페이지 기본 구조

- [x] `app/places/[contentId]/page.tsx` 파일 생성 ✅
  - [x] 동적 라우팅 파라미터 처리 (`contentId`) ✅
  - [x] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분) ✅
  - [x] 로딩 상태 처리 ✅
  - [x] 에러 처리 (404, API 에러) ✅
  - [x] 라우팅 테스트 (홈에서 카드 클릭 시 이동) ✅

### 3.2 기본 정보 섹션

- [x] `components/tour-detail/detail-info.tsx` 파일 생성 ✅
  - [x] `detailCommon2` API 연동 ✅ (페이지에서 API 호출 후 props로 전달)
  - [x] 관광지명 표시 (대제목) ✅
  - [x] 대표 이미지 표시 (크게) ✅
  - [x] 주소 표시 및 복사 기능 ✅
  - [x] 전화번호 표시 및 클릭 시 전화 연결 (`tel:` 링크) ✅
  - [x] 홈페이지 표시 (링크) ✅
  - [x] 개요 표시 (긴 설명문) ✅
  - [x] 관광 타입 및 카테고리 뱃지 표시 ✅
  - [x] 정보 없는 항목 숨김 처리 ✅
  - [x] 스타일링 (카드 또는 섹션 구분) ✅

### 3.3 공유 기능

- [x] `components/tour-detail/share-button.tsx` 파일 생성 ✅
  - [x] 공유 아이콘 버튼 (Share/Link 아이콘) ✅
  - [x] URL 복사 기능 (`navigator.clipboard.writeText()`) ✅
  - [x] 복사 완료 토스트 메시지 ✅
  - [x] HTTPS 환경 확인 ✅
  - [x] 에러 처리 (클립보드 접근 실패) ✅
- [x] Open Graph 메타태그 동적 생성 ✅
  - [x] `app/places/[contentId]/page.tsx`에서 `generateMetadata` 함수 구현 ✅
  - [x] `og:title` (관광지명) ✅
  - [x] `og:description` (관광지 설명, 100자 이내) ✅
  - [x] `og:image` (대표 이미지, 1200x630 권장) ✅
  - [x] `og:url` (상세페이지 URL) ✅
  - [x] `og:type` ("website") ✅

### 3.5 추가 정보 섹션 (향후 구현)

- [x] `components/tour-detail/detail-intro.tsx` 파일 생성 ✅
  - [x] `detailIntro2` API 연동 ✅
  - [x] 운영시간/개장시간 표시 ✅
  - [x] 휴무일 표시 ✅
  - [x] 이용요금 표시 ✅
  - [x] 주차 가능 여부 표시 ✅
  - [x] 수용인원 표시 ✅
  - [x] 체험 프로그램 표시 (있는 경우) ✅
  - [x] 유모차/반려동물 동반 가능 여부 표시 ✅
  - [x] 타입별 필드 차이 처리 (contentTypeId에 따라) ✅
- [x] `components/tour-detail/detail-gallery.tsx` 파일 생성 ✅
  - [x] `detailImage2` API 연동 ✅
  - [x] 대표 이미지 + 서브 이미지들 표시 ✅
  - [x] 이미지 클릭 시 전체화면 모달 ✅
  - [x] 이미지 슬라이드 기능 (이전/다음 버튼, 키보드 네비게이션) ✅
  - [x] 이미지 없으면 기본 이미지 표시 ✅
  - [x] 이미지 최적화 (lazy loading) ✅

---

## ⭐ Phase 4: 북마크 기능 구현

### 4.1 Supabase 설정 (기본 인프라는 완료, 북마크 테이블은 미구현)

- [x] `supabase/migrations/` 디렉토리 존재 ✅
- [x] 기본 `users` 테이블 생성 완료 ✅ (`setup_schema.sql`)
- [x] Supabase 클라이언트 설정 완료 ✅
- [x] RLS 비활성화 확인 (개발 환경) ✅
- [ ] `bookmarks` 테이블 마이그레이션 파일 생성 (`tour_schema.sql` 기반)
- [ ] 북마크 관련 타입 정의 (`lib/types/bookmark.ts`)
  - [ ] `Bookmark` 인터페이스
  - [ ] 북마크 생성/삭제 함수 타입

### 4.2 북마크 API 및 함수

- [ ] `lib/api/supabase-api.ts` 파일 생성 (또는 기존 파일 업데이트)
  - [ ] `getBookmarks(userId: string)` 함수 (북마크 목록 조회)
  - [ ] `addBookmark(userId: string, contentId: string)` 함수 (북마크 추가)
  - [ ] `removeBookmark(userId: string, contentId: string)` 함수 (북마크 삭제)
  - [ ] `checkBookmark(userId: string, contentId: string)` 함수 (북마크 여부 확인)
  - [ ] Clerk 인증 토큰 사용 (clerk-client.ts 또는 server.ts)
- [ ] Server Actions 사용 (우선순위)
  - [ ] `actions/bookmarks.ts` 파일 생성
    - [ ] `addBookmarkAction` Server Action
    - [ ] `removeBookmarkAction` Server Action
    - [ ] `getBookmarksAction` Server Action

### 4.3 북마크 버튼 컴포넌트

- [ ] `components/bookmarks/bookmark-button.tsx` 파일 생성
  - [ ] 별 아이콘 버튼 (채워짐/비어있음)
  - [ ] 클릭 시 북마크 추가/제거 토글
  - [ ] 인증된 사용자 확인 (Clerk `useAuth()` 또는 `useUser()`)
  - [ ] 로그인하지 않은 경우: 로그인 유도 또는 localStorage 임시 저장
  - [ ] 로딩 상태 표시 (토글 중)
  - [ ] 에러 처리 및 토스트 메시지
- [ ] 상세페이지에 북마크 버튼 추가
  - [ ] `components/tour-detail/detail-info.tsx` 또는 페이지에 통합
  - [ ] 현재 북마크 상태 표시 (초기 로드 시 확인)
  - [ ] 북마크 개수 표시 (선택 사항)

### 4.4 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` 파일 생성
  - [ ] 인증 확인 (로그인하지 않은 경우 리다이렉트)
  - [ ] 북마크 목록 조회 및 표시
  - [ ] 빈 상태 처리 (북마크 없음 안내)
  - [ ] 로딩 상태 표시
- [ ] `components/bookmarks/bookmark-list.tsx` 파일 생성
  - [ ] 북마크한 관광지 목록 표시 (`tour-card.tsx` 재사용)
  - [ ] 정렬 옵션 (최신순, 이름순, 지역별)
  - [ ] 각 항목에 북마크 삭제 버튼
  - [ ] 일괄 삭제 기능 (체크박스 + 일괄 삭제 버튼)
  - [ ] 삭제 확인 다이얼로그
- [ ] 북마크 목록에서 관광지 클릭 시 상세페이지 이동

---

## 🚀 Phase 5: 최적화 및 배포 준비

### 5.1 이미지 최적화

- [ ] `next.config.ts` 업데이트
  - [ ] 외부 이미지 도메인 설정 (`images.remotePatterns`)
    - [ ] 한국관광공사 API 이미지 도메인 추가
    - [ ] `www.visitkorea.or.kr` 등록
- [ ] 이미지 컴포넌트 최적화
  - [ ] `next/image` 사용 확인
  - [ ] `loading="lazy"` 속성 추가
  - [ ] 적절한 `width`/`height` 또는 `fill` 속성 사용

### 5.2 에러 처리 및 UX 개선

- [ ] 전역 에러 핸들링 개선
  - [ ] `app/error.tsx` 파일 생성 (에러 페이지)
  - [ ] `app/global-error.tsx` 파일 생성 (전역 에러)
  - [ ] API 에러 처리 통일
  - [ ] 에러 메시지 사용자 친화적으로 변경
- [ ] 404 페이지
  - [ ] `app/not-found.tsx` 파일 생성
  - [ ] 404 상황 안내 및 홈으로 이동 버튼

### 5.3 SEO 최적화

- [ ] `app/sitemap.ts` 파일 생성
  - [ ] 동적 사이트맵 생성 (관광지 상세페이지 URL 포함, 선택 사항)
- [ ] `app/robots.ts` 파일 생성
  - [ ] 검색엔진 크롤링 허용/차단 설정
- [ ] 메타데이터 개선
  - [ ] `app/layout.tsx`에 기본 메타데이터 추가
  - [ ] 상세페이지 메타데이터 (이미 구현 예정)
- [ ] `app/manifest.ts` 파일 생성 (PWA, 선택 사항)

### 5.4 성능 최적화

- [ ] 성능 측정 및 개선
  - [ ] Lighthouse 점수 측정 (목표 > 80)
  - [ ] 페이지 로딩 시간 측정 (목표 < 3초)
  - [ ] 이미지 최적화 확인
  - [ ] 코드 스플리팅 확인
  - [ ] 불필요한 리렌더링 최소화
- [ ] API 응답 캐싱 전략
  - [ ] Next.js 캐싱 (`cache` 또는 `revalidate` 옵션)
  - [ ] 서버 컴포넌트 활용

### 5.5 환경변수 및 보안

- [ ] 환경변수 보안 검증
  - [ ] 필수 환경변수 확인 (`.env.example` 업데이트)
  - [ ] 환경별 변수 분리 (개발/프로덕션)
  - [ ] `.env` 파일 `.gitignore` 확인
- [ ] API 키 노출 방지
  - [ ] 서버 사이드 전용 키는 `NEXT_PUBLIC_` 접두사 제거
  - [ ] 클라이언트 사이드 노출 최소화

### 5.6 배포 및 테스트

- [ ] Vercel 배포 준비
  - [ ] 환경변수 설정 (Vercel 대시보드)
  - [ ] 빌드 설정 확인 (`next.config.ts`)
  - [ ] 배포 후 테스트
- [ ] 프로덕션 테스트
  - [ ] 모든 기능 동작 확인
  - [ ] API 응답 확인
  - [ ] 이미지 로딩 확인
  - [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)
  - [ ] 브라우저 호환성 테스트

---

## 📝 참고 사항

- **RLS 정책**: 개발 중에는 비활성화되어 있으나, 프로덕션 배포 전 반드시 검토 및 적용 필요
- **API Rate Limit**: 한국관광공사 API 호출 제한 확인 필요
- **테스트 우선순위**:
  1. 홈페이지 기본 기능 (목록, 필터)
  2. 상세페이지 기본 기능
  3. 검색 기능
  4. 북마크 기능

---

## ✅ 완료 체크리스트

- [x] Phase 1: 프로젝트 설정 및 환경 구성 (부분 완료: 기본 인프라 구축 완료, Tour API 관련 미구현)
  - [x] 기본 프로젝트 셋업 (Next.js 15, React 19, TypeScript) ✅
  - [x] Clerk 인증 설정 ✅
  - [x] Supabase 설정 및 마이그레이션 ✅
  - [x] 기본 UI 컴포넌트 (shadcn/ui) ✅
  - [x] 기본 레이아웃 및 프로바이더 ✅
  - [ ] Tour API 클라이언트 및 타입 정의
- [ ] Phase 2: 홈페이지 (`/`) 구현
- [ ] Phase 3: 상세페이지 (`/places/[contentId]`) 구현
- [ ] Phase 4: 북마크 기능 구현
- [ ] Phase 5: 최적화 및 배포 준비

---

## 📊 진행 현황 요약

### ✅ 완료된 항목 (기본 보일러플레이트)

- Next.js 15 + React 19 프로젝트 설정
- Clerk 인증 연동 (한국어 로컬라이제이션)
- Supabase 데이터베이스 설정 (users 테이블)
- Supabase 클라이언트 설정 (4가지 환경별 클라이언트)
- 사용자 동기화 기능 (Clerk → Supabase)
- shadcn/ui 기본 컴포넌트 (button, input, dialog, form, label, accordion, textarea)
- 기본 레이아웃 및 Navbar
- 미들웨어 설정 (Clerk)
- public 리소스 (favicon, logo, og-image, icons)

### ⏳ 진행 중/예정 항목

- Tour API 클라이언트 및 타입 정의 (미구현)
- 관광지 관련 컴포넌트 (미구현)
- 북마크 테이블 마이그레이션 (tour_schema.sql 기반, 미구현)
- 페이지 구현 (홈, 상세, 북마크) (미구현)
