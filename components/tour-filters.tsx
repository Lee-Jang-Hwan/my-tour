/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트 (지역 및 관광 타입)
 *
 * 이 컴포넌트는 관광지 목록을 지역(시/도)과 관광 타입으로 필터링하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택) - areaCode2 API 연동
 * 2. 관광 타입 필터 (ContentTypeId 선택)
 * 3. 필터 초기화 기능
 * 4. 반응형 디자인 (데스크톱: 가로 배치, 모바일: 스크롤 가능한 버튼)
 *
 * 핵심 구현 로직:
 * - Controlled component 패턴 (values + onChange)
 * - 지역 목록은 컴포넌트 마운트 시 한 번만 로드
 * - 필터 변경 시 부모 컴포넌트에 onChange 콜백 호출
 * - 로딩 및 에러 상태 처리
 *
 * @dependencies
 * - lib/api/tour-api.ts: areaCode2 함수
 * - lib/constants/content-types.ts: CONTENT_TYPE_LIST
 * - lib/types/tour.ts: ContentTypeId, AreaCode 타입
 * - components/ui/select.tsx: Select 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: 아이콘 (MapPin, Tag, RotateCcw)
 *
 * @see {@link /docs/PRD.md#2-1-관광지-목록--지역타입-필터} - 기능 명세
 * @see {@link /docs/Design.md#6-디자인-시스템} - 디자인 가이드라인
 */

"use client";

import { useState, useEffect } from "react";
import { MapPin, Tag, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { areaCode2 } from "@/lib/api/tour-api";
import { CONTENT_TYPE_LIST } from "@/lib/constants/content-types";
import type { ContentTypeId } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 지역 정보 인터페이스
 */
interface Region {
  code: string;
  name: string;
}

/**
 * 필터 값 인터페이스
 */
export interface TourFiltersValues {
  areaCode?: string;
  contentTypeId?: ContentTypeId;
}

/**
 * TourFilters 컴포넌트 Props
 */
export interface TourFiltersProps {
  /** 현재 필터 값 */
  values?: TourFiltersValues;
  /** 필터 변경 시 호출되는 콜백 */
  onChange: (filters: TourFiltersValues) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 관광지 필터 컴포넌트
 * @param values 현재 필터 값
 * @param onChange 필터 변경 콜백
 * @param className 추가 CSS 클래스
 */
export function TourFilters({
  values = {},
  onChange,
  className,
}: TourFiltersProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [regionError, setRegionError] = useState<string | null>(null);

  // 지역 목록 로드
  useEffect(() => {
    async function loadRegions() {
      try {
        setLoadingRegions(true);
        setRegionError(null);
        const response = await areaCode2();
        
        if (
          response.response?.body?.items?.item &&
          Array.isArray(response.response.body.items.item)
        ) {
          const regionList = response.response.body.items.item.map((item) => ({
            code: item.code,
            name: item.name,
          }));
          setRegions(regionList);
        } else {
          setRegionError("지역 목록을 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("지역 목록 로드 실패:", error);
        setRegionError(
          error instanceof Error
            ? error.message
            : "지역 목록을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoadingRegions(false);
      }
    }

    loadRegions();
  }, []);

  // 필터 변경 핸들러
  const handleAreaCodeChange = (value: string) => {
    onChange({
      ...values,
      areaCode: value === "all" ? undefined : value,
    });
  };

  const handleContentTypeChange = (value: string) => {
    onChange({
      ...values,
      contentTypeId: value === "all" ? undefined : (value as ContentTypeId),
    });
  };

  // 필터 초기화
  const handleReset = () => {
    onChange({});
  };

  // 필터가 활성화되어 있는지 확인
  const hasActiveFilters =
    values.areaCode !== undefined || values.contentTypeId !== undefined;

  return (
    <div
      className={cn(
        "flex items-center gap-2 lg:gap-4",
        "lg:flex-row lg:flex-wrap",
        "overflow-x-auto pb-2 lg:pb-0",
        className
      )}
    >
      {/* 지역 필터 */}
      <div className="flex items-center gap-2 shrink-0">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        {loadingRegions ? (
          <Skeleton className="h-9 w-32" />
        ) : regionError ? (
          <Select
            value={values.areaCode || "all"}
            onValueChange={handleAreaCodeChange}
            disabled
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
          </Select>
        ) : (
          <Select
            value={values.areaCode || "all"}
            onValueChange={handleAreaCodeChange}
          >
            <SelectTrigger className="w-32 lg:w-40">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {regionError && (
          <span className="text-xs text-destructive hidden lg:inline">
            {regionError}
          </span>
        )}
      </div>

      {/* 관광 타입 필터 */}
      <div className="flex items-center gap-2 shrink-0">
        <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select
          value={values.contentTypeId || "all"}
          onValueChange={handleContentTypeChange}
        >
          <SelectTrigger className="w-32 lg:w-40">
            <SelectValue placeholder="관광 타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {CONTENT_TYPE_LIST.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 초기화 버튼 */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">초기화</span>
        </Button>
      )}

      {/* 모바일에서만 표시되는 에러 메시지 */}
      {regionError && (
        <span className="text-xs text-destructive lg:hidden w-full">
          {regionError}
        </span>
      )}
    </div>
  );
}

