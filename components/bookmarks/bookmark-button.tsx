/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 이 컴포넌트는 관광지를 북마크하거나 북마크를 제거하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 별 아이콘 버튼 (채워짐/비어있음)
 * 2. 클릭 시 북마크 추가/제거 토글
 * 3. 인증된 사용자 확인 (Clerk useAuth)
 * 4. 로그인하지 않은 경우: 로그인 유도
 * 5. 로딩 상태 표시 (토글 중)
 * 6. 에러 처리 및 토스트 메시지
 *
 * 핵심 구현 로직:
 * - 클라이언트 컴포넌트 (인터랙션 및 상태 관리)
 * - Clerk 인증 상태 확인
 * - Server Actions를 통한 북마크 CRUD
 * - 초기 로드 시 북마크 상태 확인
 * - 토스트 메시지로 사용자 피드백 제공
 *
 * @dependencies
 * - @clerk/nextjs: useAuth hook
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: Star 아이콘
 * - sonner: 토스트 메시지
 * - actions/bookmarks.ts: Server Actions
 *
 * @see {@link /docs/PRD.md#2.4.5-북마크} - 기능 명세
 * @see {@link /docs/Design.md#3-상세페이지--places-contentid---데스크톱} - 디자인 레이아웃
 * @see {@link /docs/TODO.md#4.3} - 구현 체크리스트
 */

"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getBookmarksAction,
  addBookmarkAction,
  removeBookmarkAction,
} from "@/actions/bookmarks";

/**
 * 북마크 버튼 컴포넌트 Props
 */
interface BookmarkButtonProps {
  /** 한국관광공사 API의 contentid (예: "125266") */
  contentId: string;
  /** 버튼 크기 (선택적, 기본값: "icon") */
  size?: "icon" | "default" | "sm" | "lg";
  /** 버튼 variant (선택적, 기본값: "ghost") */
  variant?: "ghost" | "default" | "outline";
}

/**
 * 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크하거나 북마크를 제거하는 토글 버튼입니다.
 * 인증된 사용자만 북마크 기능을 사용할 수 있으며,
 * 로그인하지 않은 경우 로그인을 유도합니다.
 */
export function BookmarkButton({
  contentId,
  size = "icon",
  variant = "ghost",
}: BookmarkButtonProps) {
  const { userId, isLoaded } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  /**
   * 초기 북마크 상태 확인
   * 컴포넌트 마운트 시 인증된 사용자의 북마크 목록을 조회하여
   * 현재 contentId가 북마크되어 있는지 확인합니다.
   */
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      // 인증이 로드되지 않았거나 사용자가 로그인하지 않은 경우
      if (!isLoaded || !userId) {
        setIsChecking(false);
        setIsBookmarked(false);
        return;
      }

      try {
        setIsChecking(true);
        const bookmarks = await getBookmarksAction();
        const isCurrentBookmarked = bookmarks.some(
          (bookmark) => bookmark.content_id === contentId
        );
        setIsBookmarked(isCurrentBookmarked);
      } catch (error) {
        console.error("북마크 상태 확인 오류:", error);
        // 에러 발생 시 북마크되지 않은 것으로 간주
        setIsBookmarked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBookmarkStatus();
  }, [contentId, userId, isLoaded]);

  /**
   * 북마크 토글 핸들러
   * 북마크 상태에 따라 추가 또는 제거 작업을 수행합니다.
   */
  const handleToggle = async () => {
    // 인증되지 않은 사용자 처리
    if (!userId) {
      toast.error("로그인이 필요합니다.", {
        description: "북마크 기능을 사용하려면 로그인해주세요.",
      });
      return;
    }

    // 이미 로딩 중이면 무시
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // 북마크 제거
        await removeBookmarkAction(contentId);
        setIsBookmarked(false);
        toast.success("북마크가 제거되었습니다.");
      } else {
        // 북마크 추가
        await addBookmarkAction(contentId);
        setIsBookmarked(true);
        toast.success("북마크에 추가되었습니다.");
      }
    } catch (error) {
      console.error("북마크 토글 오류:", error);

      // 에러 메시지 추출
      const errorMessage =
        error instanceof Error ? error.message : "북마크 작업에 실패했습니다.";

      // 중복 북마크 에러 처리
      if (errorMessage.includes("이미 북마크한") || errorMessage.includes("already")) {
        setIsBookmarked(true);
        toast.info("이미 북마크한 관광지입니다.");
      } else {
        toast.error("오류가 발생했습니다.", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 로딩 중이거나 북마크 상태 확인 중일 때
  const isDisabled = !isLoaded || isChecking || isLoading;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isDisabled}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      className="shrink-0"
    >
      {isChecking ? (
        // 초기 확인 중: 스피너 표시 (선택적) 또는 비활성화 상태
        <Star className="h-5 w-5 opacity-50" />
      ) : (
        // 북마크 상태에 따라 아이콘 표시
        <Star
          className={`h-5 w-5 transition-all ${
            isBookmarked
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-600 dark:text-gray-400"
          }`}
        />
      )}
      <span className="sr-only">
        {isBookmarked ? "북마크 제거" : "북마크 추가"}
      </span>
    </Button>
  );
}

