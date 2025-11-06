/**
 * @file error.tsx
 * @description 전역 에러 바운더리 (세그먼트 레벨)
 *
 * 루트 레이아웃에서 발생하는 에러를 처리하는 전역 에러 바운더리입니다.
 * Next.js 15 App Router의 error.tsx 파일은 자동으로 에러 바운더리로 작동합니다.
 *
 * 주요 기능:
 * 1. 애플리케이션 전역에서 발생하는 예상치 못한 에러 처리
 * 2. 사용자 친화적인 에러 메시지 표시
 * 3. 재시도 및 홈으로 가기 기능 제공
 *
 * @dependencies
 * - @/components/ui/card: 에러 메시지 표시용 카드 컴포넌트
 * - @/components/ui/button: 재시도 및 홈으로 가기 버튼
 * - lucide-react: AlertCircle 아이콘
 */

"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      console.error("전역 에러 발생:", error);
      console.error("에러 상세:", {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }

    // 향후 에러 모니터링 서비스 연동을 위한 구조 준비
    // 예: Sentry, LogRocket 등
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">오류가 발생했습니다</h2>
              <p className="text-muted-foreground">
                {error.message ||
                  "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  오류 코드: {error.digest}
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <Button onClick={reset} variant="outline" className="flex-1">
                다시 시도
              </Button>
              <Button asChild variant="default" className="flex-1">
                <Link href="/">홈으로 가기</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

