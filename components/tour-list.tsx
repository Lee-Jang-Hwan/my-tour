/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 이 컴포넌트는 관광지 목록을 그리드 레이아웃으로 표시합니다.
 *
 * 주요 기능:
 * 1. 관광지 목록을 그리드로 표시
 * 2. 로딩 상태 (Skeleton UI)
 * 3. 빈 상태 처리 (결과 없음)
 * 4. 반응형 디자인 (모바일/태블릿/데스크톱)
 *
 * 핵심 구현 로직:
 * - TourItem 배열을 props로 받아 그리드 레이아웃으로 표시
 * - 로딩 상태일 때 Skeleton UI 표시
 * - 빈 배열일 때 Empty State 표시
 * - TourCard 컴포넌트를 재사용하여 각 항목 표시
 *
 * @dependencies
 * - components/tour-card.tsx: TourCard 컴포넌트
 * - components/ui/skeleton.tsx: Skeleton 컴포넌트
 * - lib/types/tour.ts: TourItem 타입
 * - lucide-react: 아이콘 (SearchX, MapPin)
 *
 * @see {@link /docs/PRD.md#2-1-관광지-목록--지역타입-필터} - 기능 명세
 */

"use client";

import { memo } from "react";
import { SearchX, MapPin } from "lucide-react";
import { TourCard } from "./tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourListProps {
  /** 관광지 목록 배열 */
  tours?: TourItem[];
  /** 로딩 상태 */
  loading?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 빈 상태 메시지 (선택) */
  emptyMessage?: string;
}

/**
 * TourCard 스켈레톤 컴포넌트 (로딩 상태용)
 * 자연스러운 로딩 경험을 위한 스켈레톤 UI
 */
function TourCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden animate-pulse">
      {/* 썸네일 이미지 스켈레톤 */}
      <div className="relative w-full aspect-video bg-muted">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      </div>

      {/* 컨텐츠 스켈레톤 */}
      <div className="p-4 space-y-3">
        {/* 관광지명 스켈레톤 (2줄) */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>

        {/* 주소 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* 뱃지 스켈레톤 */}
        <div className="pt-1">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

/**
 * 관광지 목록 컴포넌트
 * @param tours 관광지 목록 배열
 * @param loading 로딩 상태
 * @param className 추가 CSS 클래스
 * @param emptyMessage 빈 상태 커스텀 메시지
 */
export function TourList({
  tours,
  loading = false,
  className,
  emptyMessage,
}: TourListProps) {
  // 로딩 상태 - 스켈레톤 UI 표시
  if (loading) {
    // 반응형 레이아웃에 맞춰 적절한 개수의 스켈레톤 표시
    // 페이지당 20개 항목이므로 초기 로딩 시 화면에 보이는 만큼 표시
    const skeletonCount = 6; // 그리드에 보이는 개수 (1열: 6개, 2열: 6개, 3열: 6개)

    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <TourCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // 빈 상태 처리
  if (!tours || tours.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4",
          className,
        )}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-4">
              <SearchX className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {emptyMessage || "관광지가 없습니다"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              검색 조건을 변경하거나 다른 필터를 시도해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 관광지 목록 표시
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
});
