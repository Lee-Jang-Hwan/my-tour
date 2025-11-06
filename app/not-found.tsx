/**
 * @file not-found.tsx
 * @description 전역 404 페이지
 *
 * 존재하지 않는 페이지에 접근할 때 표시되는 전역 404 페이지입니다.
 * Next.js 15 App Router의 not-found.tsx 파일은 자동으로 404 페이지로 작동합니다.
 *
 * 주요 기능:
 * 1. 존재하지 않는 페이지 접근 시 안내
 * 2. 홈으로 이동 버튼 제공
 * 3. 사용자 친화적인 메시지 표시
 *
 * @dependencies
 * - @/components/ui/card: 404 메시지 표시용 카드 컴포넌트
 * - @/components/ui/button: 홈으로 가기 버튼
 * - lucide-react: FileQuestion 아이콘
 */

import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">404</h1>
              <h2 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h2>
              <p className="text-muted-foreground">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                <br />
                URL을 확인하시거나 홈으로 돌아가주세요.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">홈으로 가기</Link>
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="default"
                className="flex-1"
              >
                이전 페이지
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

