"use server";

/**
 * @file bookmarks.ts
 * @description 북마크 기능을 위한 Server Actions
 *
 * 이 모듈은 Next.js 15 Server Actions를 사용하여 북마크 기능을 제공합니다.
 * 클라이언트 컴포넌트에서 직접 호출할 수 있는 서버 사이드 함수들입니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 조회 (getBookmarksAction)
 * 2. 북마크 추가 (addBookmarkAction)
 * 3. 북마크 삭제 (removeBookmarkAction)
 *
 * 핵심 구현 로직:
 * - Clerk 인증을 통한 사용자 확인
 * - Clerk user ID를 Supabase user_id로 변환
 * - lib/api/supabase-api.ts의 함수들을 래핑
 * - 에러 처리 및 사용자 친화적 메시지 제공
 *
 * @dependencies
 * - @clerk/nextjs/server: 서버 사이드 Clerk 인증
 * - lib/supabase/server.ts: 서버 사이드 Supabase 클라이언트
 * - lib/api/supabase-api.ts: 북마크 API 함수들
 * - lib/types/bookmark.ts: 타입 정의
 *
 * @see {@link /docs/PRD.md#2.4.5-북마크} - 북마크 기능 요구사항
 * @see {@link /docs/TODO.md#4.2} - 구현 체크리스트
 */

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import {
  getSupabaseUserId,
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "@/lib/api/supabase-api";
import type { Bookmark } from "@/lib/types/bookmark";

/**
 * 사용자의 북마크 목록을 조회하는 Server Action
 *
 * @returns 북마크 목록 배열 (created_at 내림차순 정렬)
 * @throws 인증되지 않은 사용자 또는 에러 발생 시 에러를 던집니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { getBookmarksAction } from '@/actions/bookmarks';
 *
 * async function handleGetBookmarks() {
 *   try {
 *     const bookmarks = await getBookmarksAction();
 *     console.log('북마크 목록:', bookmarks);
 *   } catch (error) {
 *     console.error('에러:', error.message);
 *   }
 * }
 * ```
 */
export async function getBookmarksAction(): Promise<Bookmark[]> {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new Error("로그인이 필요합니다.");
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // Supabase user_id 조회
    const supabaseUserId = await getSupabaseUserId(supabase, clerkUserId);

    if (!supabaseUserId) {
      throw new Error(
        "사용자 정보를 찾을 수 없습니다. 먼저 로그인해주세요."
      );
    }

    // 북마크 목록 조회
    const bookmarks = await getBookmarks(supabase, supabaseUserId);

    return bookmarks;
  } catch (error) {
    console.error("getBookmarksAction error:", error);

    // 에러 메시지가 이미 사용자 친화적이면 그대로 사용
    if (error instanceof Error) {
      throw error;
    }

    // 알 수 없는 에러
    throw new Error("북마크 목록을 가져오는 중 오류가 발생했습니다.");
  }
}

/**
 * 북마크를 추가하는 Server Action
 *
 * @param contentId - 한국관광공사 API의 contentid (예: "125266")
 * @returns 생성된 북마크 객체
 * @throws 인증되지 않은 사용자, 중복 북마크, 또는 기타 에러 발생 시 에러를 던집니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { addBookmarkAction } from '@/actions/bookmarks';
 *
 * async function handleAddBookmark() {
 *   try {
 *     const bookmark = await addBookmarkAction("125266");
 *     console.log('북마크 추가됨:', bookmark);
 *   } catch (error) {
 *     console.error('에러:', error.message);
 *   }
 * }
 * ```
 */
export async function addBookmarkAction(
  contentId: string
): Promise<Bookmark> {
  try {
    // 파라미터 검증
    if (!contentId || typeof contentId !== "string" || contentId.trim() === "") {
      throw new Error("관광지 ID가 필요합니다.");
    }

    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new Error("로그인이 필요합니다.");
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // Supabase user_id 조회
    const supabaseUserId = await getSupabaseUserId(supabase, clerkUserId);

    if (!supabaseUserId) {
      throw new Error(
        "사용자 정보를 찾을 수 없습니다. 먼저 로그인해주세요."
      );
    }

    // 북마크 추가
    const bookmark = await addBookmark(supabase, supabaseUserId, contentId);

    return bookmark;
  } catch (error) {
    console.error("addBookmarkAction error:", error);

    // 에러 메시지가 이미 사용자 친화적이면 그대로 사용
    if (error instanceof Error) {
      throw error;
    }

    // 알 수 없는 에러
    throw new Error("북마크를 추가하는 중 오류가 발생했습니다.");
  }
}

/**
 * 북마크를 삭제하는 Server Action
 *
 * @param contentId - 한국관광공사 API의 contentid (예: "125266")
 * @returns 삭제 성공 여부
 * @throws 인증되지 않은 사용자 또는 에러 발생 시 에러를 던집니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { removeBookmarkAction } from '@/actions/bookmarks';
 *
 * async function handleRemoveBookmark() {
 *   try {
 *     const result = await removeBookmarkAction("125266");
 *     if (result.success) {
 *       console.log('북마크가 삭제되었습니다.');
 *     }
 *   } catch (error) {
 *     console.error('에러:', error.message);
 *   }
 * }
 * ```
 */
export async function removeBookmarkAction(
  contentId: string
): Promise<{ success: boolean }> {
  try {
    // 파라미터 검증
    if (!contentId || typeof contentId !== "string" || contentId.trim() === "") {
      throw new Error("관광지 ID가 필요합니다.");
    }

    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new Error("로그인이 필요합니다.");
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // Supabase user_id 조회
    const supabaseUserId = await getSupabaseUserId(supabase, clerkUserId);

    if (!supabaseUserId) {
      throw new Error(
        "사용자 정보를 찾을 수 없습니다. 먼저 로그인해주세요."
      );
    }

    // 북마크 삭제
    const result = await removeBookmark(supabase, supabaseUserId, contentId);

    return result;
  } catch (error) {
    console.error("removeBookmarkAction error:", error);

    // 에러 메시지가 이미 사용자 친화적이면 그대로 사용
    if (error instanceof Error) {
      throw error;
    }

    // 알 수 없는 에러
    throw new Error("북마크를 삭제하는 중 오류가 발생했습니다.");
  }
}

