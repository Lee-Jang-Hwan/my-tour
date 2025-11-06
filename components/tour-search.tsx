/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트 (키워드 검색)
 *
 * 이 컴포넌트는 사용자가 키워드로 관광지를 검색할 수 있는 검색창 UI를 제공합니다.
 *
 * 주요 기능:
 * 1. 검색창 UI (검색 아이콘 포함)
 * 2. 엔터 키 또는 검색 버튼 클릭으로 검색 실행
 * 3. 검색 중 로딩 스피너 표시
 * 4. 검색어 초기화 기능 (X 버튼)
 * 5. 반응형 디자인 (모바일 300px, 데스크톱 500px 최소 너비)
 *
 * 핵심 구현 로직:
 * - Controlled component 패턴 (value + onChange + onSearch)
 * - 키보드 이벤트 처리 (Enter 키)
 * - 로딩 상태 시 입력 및 버튼 비활성화
 * - 검색어가 있을 때만 초기화 버튼 표시
 *
 * @dependencies
 * - components/ui/input.tsx: Input 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: 아이콘 (Search, X, Loader2)
 * - @/lib/utils: cn 유틸리티
 *
 * @see {@link /docs/PRD.md#2-3-키워드-검색} - 기능 명세
 * @see {@link /docs/Design.md#6-디자인-시스템} - 디자인 가이드라인
 */

"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TourSearch 컴포넌트 Props
 */
export interface TourSearchProps {
  /** 현재 검색어 (controlled) */
  value?: string;
  /** 검색어 변경 시 호출되는 콜백 */
  onChange?: (value: string) => void;
  /** 검색 실행 시 호출되는 콜백 (엔터 키 또는 검색 버튼 클릭) */
  onSearch?: (keyword: string) => void;
  /** 검색 중 로딩 상태 */
  loading?: boolean;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 입력 필드 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 관광지 검색 컴포넌트
 * @param value 현재 검색어
 * @param onChange 검색어 변경 콜백
 * @param onSearch 검색 실행 콜백
 * @param loading 로딩 상태
 * @param placeholder 플레이스홀더 텍스트
 * @param className 추가 CSS 클래스
 * @param disabled 비활성화 여부
 */
export function TourSearch({
  value: controlledValue,
  onChange,
  onSearch,
  loading = false,
  placeholder = "관광지 검색...",
  className,
  disabled = false,
}: TourSearchProps) {
  // 내부 상태 (uncontrolled fallback)
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Controlled 또는 uncontrolled 모드
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // 검색어 변경 핸들러
  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    const keyword = value.trim();
    if (keyword && !loading && !disabled) {
      onSearch?.(keyword);
    }
  };

  // 검색어 초기화 핸들러
  const handleClear = () => {
    handleChange("");
    // 입력 필드에 포커스
    inputRef.current?.focus();
  };

  // 키보드 이벤트 핸들러 (Enter 키)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && !disabled) {
      e.preventDefault();
      handleSearch();
    }
  };

  const hasValue = value.length > 0;
  const isSearchDisabled = loading || disabled || !value.trim();

  return (
    <div
      className={cn(
        "relative flex w-full min-w-[300px] lg:min-w-[500px]",
        className
      )}
    >
      {/* 검색 아이콘 (왼쪽) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {loading ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* 검색 입력 필드 */}
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={cn(
          "pl-10 pr-20", // 왼쪽 패딩: 아이콘 공간, 오른쪽 패딩: 버튼 공간
          hasValue && "pr-28", // 초기화 버튼과 검색 버튼이 모두 있을 때 더 많은 오른쪽 패딩
          "w-full"
        )}
        aria-label="관광지 검색"
        aria-describedby="search-description"
      />

      {/* 검색어 초기화 버튼 (검색 버튼 왼쪽) */}
      {hasValue && !loading && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            "absolute right-16 top-1/2 -translate-y-1/2 h-6 w-6 p-0",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-transparent"
          )}
          aria-label="검색어 초기화"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* 검색 버튼 (오른쪽) */}
      <Button
        type="button"
        variant="default"
        size="default"
        onClick={handleSearch}
        disabled={isSearchDisabled}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-sm shrink-0"
        aria-label="검색 실행"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
            검색 중
          </>
        ) : (
          "검색"
        )}
      </Button>

      {/* 접근성 설명 */}
      <span id="search-description" className="sr-only">
        엔터 키를 누르거나 검색 버튼을 클릭하여 검색을 실행할 수 있습니다.
      </span>
    </div>
  );
}

