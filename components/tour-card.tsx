/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 이 컴포넌트는 관광지 정보를 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (기본 이미지 fallback)
 * 2. 관광지명 표시
 * 3. 주소 표시
 * 4. 관광 타입 뱃지 표시
 * 5. 클릭 시 상세페이지 이동
 * 6. 호버 효과 및 스타일링
 *
 * 핵심 구현 로직:
 * - TourItem 타입을 props로 받아 표시
 * - Next.js Image 컴포넌트로 이미지 최적화
 * - Link 컴포넌트로 클릭 가능한 카드 구현
 * - 반응형 디자인 (모바일/태블릿/데스크톱)
 *
 * @dependencies
 * - lib/types/tour.ts: TourItem 타입
 * - lib/constants/content-types.ts: getContentTypeName 함수
 * - components/ui/card.tsx: shadcn Card 컴포넌트
 * - next/image: Next.js Image 컴포넌트
 * - next/link: Next.js Link 컴포넌트
 * - lucide-react: MapPin 아이콘
 *
 * @see {@link /docs/PRD.md#2-1-관광지-목록--지역타입-필터} - 기능 명세
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/constants/content-types";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 관광지 카드 컴포넌트
 * @param tour 관광지 정보
 * @param className 추가 CSS 클래스
 */
export function TourCard({ tour, className }: TourCardProps) {
  const {
    contentid,
    title,
    addr1,
    addr2,
    firstimage,
    firstimage2,
    contenttypeid,
  } = tour;

  // 이미지 로딩 상태 관리
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 이미지 URL 선택 (firstimage 우선, 없으면 firstimage2, 둘 다 없으면 null)
  const imageUrl = firstimage || firstimage2 || null;

  // 관광 타입명 조회
  const contentTypeName = getContentTypeName(
    contenttypeid as Parameters<typeof getContentTypeName>[0],
  );

  // 기본 placeholder 이미지 (이미지가 없을 경우)
  const defaultImageUrl =
    "https://via.placeholder.com/400x225/CCCCCC/666666?text=No+Image";

  return (
    <Link
      href={`/places/${contentid}`}
      className={cn(
        "block transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        className,
      )}
    >
      <Card className="h-full overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/50">
        {/* 썸네일 이미지 */}
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          {imageUrl && !imageError ? (
            <>
              {/* 이미지 로딩 중 스켈레톤 표시 */}
              {imageLoading && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
              )}
              <Image
                src={imageUrl}
                alt={title}
                fill
                loading="lazy"
                className={cn(
                  "object-cover transition-opacity duration-300 hover:scale-110",
                  imageLoading ? "opacity-0" : "opacity-100",
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">이미지 없음</p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {/* 관광지명 */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground">
            {title}
          </h3>

          {/* 주소 */}
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="line-clamp-1">{addr1}</p>
              {addr2 && (
                <p className="line-clamp-1 text-xs text-muted-foreground/80">
                  {addr2}
                </p>
              )}
            </div>
          </div>

          {/* 관광 타입 뱃지 */}
          {contentTypeName && (
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {contentTypeName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
