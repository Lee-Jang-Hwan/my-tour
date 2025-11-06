/**
 * @file bookmark.ts
 * @description 북마크 기능을 위한 타입 정의
 *
 * 이 모듈은 Supabase bookmarks 테이블과 연동되는 북마크 기능의
 * TypeScript 타입 정의를 제공합니다.
 *
 * 주요 타입:
 * 1. Bookmark - 북마크 데이터 구조 (Supabase bookmarks 테이블)
 * 2. 북마크 관련 함수 타입 (getBookmarks, addBookmark, removeBookmark, checkBookmark)
 *
 * @dependencies
 * - Supabase bookmarks 테이블
 * - Clerk 인증 (인증된 사용자만 사용 가능)
 *
 * @see {@link /docs/PRD.md#2.4.5-북마크} - 북마크 기능 요구사항
 * @see {@link /supabase/migrations/20251106144051_create_bookmarks_table.sql} - 데이터베이스 스키마
 * @see {@link /docs/TODO.md#4.1} - 구현 체크리스트
 */

/**
 * 북마크 데이터 구조
 * Supabase bookmarks 테이블의 데이터 구조와 일치
 */
export interface Bookmark {
  /** 북마크 고유 ID (UUID) */
  id: string;
  /** users 테이블의 사용자 ID (외래키, UUID) */
  user_id: string;
  /** 한국관광공사 API contentid (예: "125266") */
  content_id: string;
  /** 북마크 생성 시간 (ISO 8601 형식 문자열) */
  created_at: string;
}

/**
 * 북마크 목록 조회 함수 타입
 * @param userId - 사용자 ID (UUID 문자열)
 * @returns 북마크 목록 배열
 */
export type GetBookmarksFunction = (
  userId: string
) => Promise<Bookmark[]>;

/**
 * 북마크 추가 함수 타입
 * @param userId - 사용자 ID (UUID 문자열)
 * @param contentId - 한국관광공사 API contentid
 * @returns 생성된 북마크 객체
 */
export type AddBookmarkFunction = (
  userId: string,
  contentId: string
) => Promise<Bookmark>;

/**
 * 북마크 삭제 함수 타입
 * @param userId - 사용자 ID (UUID 문자열)
 * @param contentId - 한국관광공사 API contentid
 * @returns 삭제 성공 여부
 */
export type RemoveBookmarkFunction = (
  userId: string,
  contentId: string
) => Promise<{ success: boolean }>;

/**
 * 북마크 여부 확인 함수 타입
 * @param userId - 사용자 ID (UUID 문자열)
 * @param contentId - 한국관광공사 API contentid
 * @returns 북마크 여부 (true/false)
 */
export type CheckBookmarkFunction = (
  userId: string,
  contentId: string
) => Promise<boolean>;

