/**
 * @file loading.tsx
 * @description 상세페이지 로딩 상태
 *
 * 상세페이지 로딩 중 표시되는 스켈레톤 UI
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <Skeleton className="h-6 flex-1 max-w-md" />
          </div>
        </div>
      </div>

      {/* 메인 영역 스켈레톤 */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 이미지 스켈레톤 */}
        <Skeleton className="w-full aspect-video rounded-lg mb-6" />

        {/* 제목 스켈레톤 */}
        <div className="mb-6">
          <Skeleton className="h-9 w-2/3 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* 기본 정보 카드 스켈레톤 */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-64" />
            </div>
          </CardContent>
        </Card>

        {/* 개요 카드 스켈레톤 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

