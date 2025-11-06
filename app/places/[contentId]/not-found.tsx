/**
 * @file not-found.tsx
 * @description 상세페이지 404 상태
 *
 * 관광지를 찾을 수 없을 때 표시되는 페이지
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
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">관광지를 찾을 수 없습니다</h2>
              <p className="text-muted-foreground">
                요청하신 관광지 정보가 없거나 삭제되었을 수 있습니다.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/">홈으로 가기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

