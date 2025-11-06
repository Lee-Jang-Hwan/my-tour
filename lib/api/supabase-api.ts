/**
 * @file supabase-api.ts
 * @description Supabase 북마크 API 함수들
 *
 * 이 모듈은 Supabase bookmarks 테이블과 연동하는 북마크 CRUD 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 조회 (getBookmarks)
 * 2. 북마크 추가 (addBookmark)
 * 3. 북마크 삭제 (removeBookmark)
 * 4. 북마크 여부 확인 (checkBookmark)
 * 5. Clerk ID로 Supabase User ID 조회 (getSupabaseUserId)
 *
 * 핵심 구현 로직:
 * - Clerk 인증과 연동된 Supabase 클라이언트 사용
 * - 클라이언트/서버 양쪽에서 사용 가능한 함수 제공
 * - Supabase user_id (UUID)를 파라미터로 받음
 * - 에러 처리 및 로깅
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/types/bookmark.ts: 타입 정의
 * - lib/supabase/clerk-client.ts: 클라이언트 사이드 Supabase 클라이언트
 * - lib/supabase/server.ts: 서버 사이드 Supabase 클라이언트
 *
 * @see {@link /docs/PRD.md#2.4.5-북마크} - 북마크 기능 요구사항
 * @see {@link /supabase/migrations/my_tour_schema.sql} - 데이터베이스 스키마
 * @see {@link /docs/TODO.md#4.2} - 구현 체크리스트
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bookmark } from "@/lib/types/bookmark";

/**
 * Clerk ID로 Supabase User ID를 조회하는 헬퍼 함수
 *
 * @param supabase - Supabase 클라이언트 인스턴스
 * @param clerkId - Clerk 사용자 ID (예: "user_2abc...")
 * @returns Supabase users 테이블의 id (UUID) 또는 null
 *
 * @example
 * ```tsx
 * // 클라이언트 사이드
 * const supabase = useClerkSupabaseClient();
 * const userId = await getSupabaseUserId(supabase, clerkUser.id);
 *
 * // 서버 사이드
 * const supabase = createClerkSupabaseClient();
 * const userId = await getSupabaseUserId(supabase, clerkUser.id);
 * ```
 */
export async function getSupabaseUserId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      // PGRST116: No rows returned (사용자가 없는 경우)
      if (error.code === "PGRST116") {
        console.warn(`User not found for clerk_id: ${clerkId}`);
        return null;
      }
      console.error("Error fetching Supabase user ID:", error);
      throw new Error(`Failed to get Supabase user ID: ${error.message}`);
    }

    return data?.id ?? null;
  } catch (error) {
    console.error("getSupabaseUserId error:", error);
    throw error;
  }
}

/**
 * 사용자의 북마크 목록을 조회합니다.
 *
 * @param supabase - Supabase 클라이언트 인스턴스
 * @param userId - Supabase users 테이블의 id (UUID)
 * @returns 북마크 목록 배열 (created_at 내림차순 정렬)
 *
 * @example
 * ```tsx
 * const supabase = useClerkSupabaseClient();
 * const bookmarks = await getBookmarks(supabase, userId);
 * ```
 */
export async function getBookmarks(
  supabase: SupabaseClient,
  userId: string
): Promise<Bookmark[]> {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      throw new Error(`Failed to get bookmarks: ${error.message}`);
    }

    return (data ?? []) as Bookmark[];
  } catch (error) {
    console.error("getBookmarks error:", error);
    throw error;
  }
}

/**
 * 북마크를 추가합니다.
 *
 * @param supabase - Supabase 클라이언트 인스턴스
 * @param userId - Supabase users 테이블의 id (UUID)
 * @param contentId - 한국관광공사 API의 contentid (예: "125266")
 * @returns 생성된 북마크 객체
 * @throws 중복 북마크 시 에러를 던집니다 (23505: unique_violation)
 *
 * @example
 * ```tsx
 * const supabase = useClerkSupabaseClient();
 * const bookmark = await addBookmark(supabase, userId, "125266");
 * ```
 */
export async function addBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<Bookmark> {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // 23505: unique_violation (중복 북마크)
      if (error.code === "23505") {
        console.warn(
          `Bookmark already exists for user ${userId} and content ${contentId}`
        );
        throw new Error("이미 북마크한 관광지입니다.");
      }

      console.error("Error adding bookmark:", error);
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }

    if (!data) {
      throw new Error("북마크 추가 후 데이터를 가져올 수 없습니다.");
    }

    return data as Bookmark;
  } catch (error) {
    console.error("addBookmark error:", error);
    throw error;
  }
}

/**
 * 북마크를 삭제합니다.
 *
 * @param supabase - Supabase 클라이언트 인스턴스
 * @param userId - Supabase users 테이블의 id (UUID)
 * @param contentId - 한국관광공사 API의 contentid (예: "125266")
 * @returns 삭제 성공 여부
 *
 * @example
 * ```tsx
 * const supabase = useClerkSupabaseClient();
 * const result = await removeBookmark(supabase, userId, "125266");
 * if (result.success) {
 *   console.log("북마크가 삭제되었습니다.");
 * }
 * ```
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      console.error("Error removing bookmark:", error);
      throw new Error(`Failed to remove bookmark: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("removeBookmark error:", error);
    throw error;
  }
}

/**
 * 북마크 여부를 확인합니다.
 *
 * @param supabase - Supabase 클라이언트 인스턴스
 * @param userId - Supabase users 테이블의 id (UUID)
 * @param contentId - 한국관광공사 API의 contentid (예: "125266")
 * @returns 북마크 여부 (true/false)
 *
 * @example
 * ```tsx
 * const supabase = useClerkSupabaseClient();
 * const isBookmarked = await checkBookmark(supabase, userId, "125266");
 * if (isBookmarked) {
 *   console.log("이 관광지는 북마크되어 있습니다.");
 * }
 * ```
 */
export async function checkBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .single();

    if (error) {
      // PGRST116: No rows returned (북마크가 없는 경우)
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking bookmark:", error);
      throw new Error(`Failed to check bookmark: ${error.message}`);
    }

    return data !== null;
  } catch (error) {
    console.error("checkBookmark error:", error);
    throw error;
  }
}

