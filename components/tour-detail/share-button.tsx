/**
 * @file share-button.tsx
 * @description 관광지 상세페이지 공유 버튼 컴포넌트
 *
 * 이 컴포넌트는 현재 페이지의 URL을 클립보드에 복사하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. URL 복사 기능 (navigator.clipboard.writeText)
 * 2. 복사 완료 토스트 메시지
 * 3. HTTPS 환경 확인
 * 4. 에러 처리 (클립보드 접근 실패)
 *
 * 핵심 구현 로직:
 * - 클라이언트 컴포넌트 (클립보드 API 사용)
 * - navigator.clipboard.writeText() 사용 (HTTPS 필수)
 * - execCommand('copy') fallback (구형 브라우저 지원)
 * - sonner 토스트로 사용자 피드백 제공
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: Share 아이콘
 * - sonner: 토스트 메시지
 *
 * @see {@link /docs/PRD.md#2-4-5-공유하기} - 기능 명세
 * @see {@link /docs/Design.md#3-상세페이지--places-contentid---데스크톱} - 디자인 레이아웃
 */

"use client";

import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * 공유 버튼 컴포넌트 Props
 */
interface ShareButtonProps {
  /** 복사할 URL (선택적, 기본값: 현재 페이지 URL) */
  url?: string;
}

/**
 * 공유 버튼 컴포넌트
 * 
 * 현재 페이지의 URL을 클립보드에 복사합니다.
 */
export function ShareButton({ url }: ShareButtonProps) {
  const [isCopying, setIsCopying] = useState(false);

  /**
   * URL 복사 핸들러
   */
  const handleShare = async () => {
    // 복사할 URL 결정 (props로 받은 URL 또는 현재 페이지 URL)
    const urlToCopy = url || (typeof window !== "undefined" ? window.location.href : "");

    if (!urlToCopy) {
      toast.error("복사할 URL을 찾을 수 없습니다.");
      return;
    }

    setIsCopying(true);

    try {
      // 클립보드 API 사용 가능 여부 확인 (HTTPS 또는 localhost)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToCopy);
        toast.success("링크가 복사되었습니다.");
      } else {
        // Fallback: execCommand 사용 (구형 브라우저 지원)
        const textArea = document.createElement("textarea");
        textArea.value = urlToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            toast.success("링크가 복사되었습니다.");
          } else {
            throw new Error("execCommand failed");
          }
        } catch (err) {
          toast.error("링크 복사에 실패했습니다. 브라우저가 클립보드 접근을 허용하지 않습니다.");
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error("링크 복사 오류:", error);
      
      // 권한 거부 에러 처리
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          toast.error("클립보드 접근 권한이 거부되었습니다.");
        } else {
          toast.error("링크 복사에 실패했습니다.");
        }
      } else {
        toast.error("링크 복사에 실패했습니다.");
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      disabled={isCopying}
      aria-label="링크 공유"
      className="shrink-0"
    >
      <Share className="h-5 w-5" />
      <span className="sr-only">링크 공유</span>
    </Button>
  );
}

