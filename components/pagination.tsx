/**
 * @file pagination.tsx
 * @description 페이지네이션 컴포넌트
 *
 * 이 컴포넌트는 페이지 번호 선택을 위한 UI를 제공합니다.
 *
 * 주요 기능:
 * 1. 이전/다음 페이지 버튼
 * 2. 현재 페이지 주변 페이지 번호 표시
 * 3. 첫 페이지/마지막 페이지로 이동
 * 4. 현재 페이지 강조 표시
 * 5. 반응형 디자인 (모바일에서는 간소화)
 *
 * 핵심 구현 로직:
 * - 현재 페이지 주변의 페이지 번호만 표시 (최대 5개)
 * - 첫 페이지와 마지막 페이지는 항상 표시
 * - 이전/다음 버튼으로 페이지 이동
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: 아이콘 (ChevronLeft, ChevronRight)
 *
 * @see {@link /docs/PRD.md#2-1-관광지-목록--지역타입-필터} - 기능 명세
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 페이지네이션 컴포넌트
 * @param currentPage 현재 페이지 번호
 * @param totalPages 총 페이지 수
 * @param onPageChange 페이지 변경 콜백
 * @param className 추가 CSS 클래스
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // 총 페이지가 1 이하면 페이지네이션 숨김
  if (totalPages <= 1) {
    return null;
  }

  // 표시할 페이지 번호 계산 (최대 5개)
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 번호 수

    if (totalPages <= maxVisible) {
      // 총 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 첫 페이지는 항상 표시
      pages.push(1);

      // 현재 페이지 주변 계산
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // 현재 페이지가 앞쪽에 있으면 뒤쪽 페이지 더 표시
      if (currentPage <= 3) {
        start = 2;
        end = Math.min(5, totalPages - 1);
      }

      // 현재 페이지가 뒤쪽에 있으면 앞쪽 페이지 더 표시
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 4);
        end = totalPages - 1;
      }

      // 중간 페이지 번호 추가 (이전 번호와 연속되지 않으면 ... 표시 필요)
      if (start > 2) {
        // ... 표시를 위한 처리 (클라이언트에서 간단히 구현)
        // 여기서는 start 바로 전까지는 생략하고 start부터 추가
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // 마지막 페이지는 항상 표시
      if (totalPages > 1) {
        pages.push(totalPages);
      }

      // 중복 제거 및 정렬
      const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);

      // ... 표시가 필요한 경우 처리
      const result: number[] = [];
      for (let i = 0; i < uniquePages.length; i++) {
        result.push(uniquePages[i]);
        // 다음 번호와 연속되지 않으면 null 추가 (나중에 ...로 표시)
        if (
          i < uniquePages.length - 1 &&
          uniquePages[i + 1] - uniquePages[i] > 1
        ) {
          result.push(-1); // -1은 ... 표시를 의미
        }
      }

      return result;
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 페이지 번호 버튼 */}
      {pageNumbers.map((page, index) => {
        if (page === -1) {
          // ... 표시
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-muted-foreground"
            >
              ...
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageClick(page)}
            className={cn(
              "h-9 min-w-9 px-3",
              currentPage === page && "font-semibold",
            )}
            aria-label={`페이지 ${page}로 이동`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        );
      })}

      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0"
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
