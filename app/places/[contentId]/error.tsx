/**
 * @file error.tsx
 * @description 상세페이지 에러 상태
 *
 * 상세페이지에서 발생한 에러를 처리하는 컴포넌트
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
    // 에러 로깅 (필요 시)
    console.error("상세페이지 에러:", error);
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
                  "관광지 정보를 불러오는 중 문제가 발생했습니다."}
              </p>
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

