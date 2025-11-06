/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 페이지
 *
 * 이 페이지는 한국의 관광지 정보를 검색, 필터링, 목록 표시하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 관광지 키워드 검색
 * 2. 지역 및 관광 타입 필터링
 * 3. 관광지 목록 표시 (그리드 레이아웃)
 *
 * 핵심 구현 로직:
 * - 반응형 레이아웃: 데스크톱 및 모바일에서 전체 너비 사용
 * - 검색 및 필터 상태 관리 및 API 연동
 * - searchKeyword2 API (검색) 및 areaBasedList2 API (필터)를 통한 관광지 데이터 조회
 * - 검색 + 필터 조합 지원
 *
 * @dependencies
 * - components/tour-search.tsx (완료)
 * - components/tour-filters.tsx (완료)
 * - components/tour-list.tsx (완료)
 * - lib/api/tour-api.ts: searchKeyword2, areaBasedList2 함수
 * - lib/types/tour.ts: TourItem 타입
 *
 * @see {@link /docs/PRD.md#2-mvp-핵심-기능} - 기능 명세
 * @see {@link /docs/Design.md#1-홈페이지--데스크톱} - 디자인 레이아웃
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { TourList } from "@/components/tour-list";
import { TourFilters, type TourFiltersValues } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { Pagination } from "@/components/pagination";
import { areaBasedList2, searchKeyword2 } from "@/lib/api/tour-api";
import type { TourItem, SortOption } from "@/lib/types/tour";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  // 필터 상태 관리
  const [filters, setFilters] = useState<TourFiltersValues>({});

  // 검색 키워드 상태 관리
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(
    undefined,
  );

  // 관광지 목록 상태 관리
  const [tours, setTours] = useState<TourItem[]>([]);

  // 검색 결과 개수 상태 관리
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // 로딩 상태 관리
  const [loading, setLoading] = useState(false);

  // 에러 상태 관리
  const [error, setError] = useState<string | null>(null);

  // 정렬 상태 관리
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20); // PRD 요구사항: 페이지당 10-20개 항목

  // 검색/필터 변경 시 API 호출
  useEffect(() => {
    async function fetchTours() {
      // 검색 키워드가 있으면 searchKeyword2 사용, 없으면 areaBasedList2 사용
      // 둘 다 없으면 빈 상태
      const hasSearch = searchKeyword && searchKeyword.trim().length > 0;
      const hasFilters = filters.areaCode || filters.contentTypeId;

      if (!hasSearch && !hasFilters) {
        setTours([]);
        setTotalCount(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 검색 키워드가 있으면 searchKeyword2 API 사용 (필터와 조합 가능)
        // 검색 키워드가 없고 필터만 있으면 areaBasedList2 API 사용
        let response;
        if (hasSearch) {
          response = await searchKeyword2({
            keyword: searchKeyword.trim(),
            areaCode: filters.areaCode,
            contentTypeId: filters.contentTypeId,
            numOfRows: itemsPerPage, // PRD 요구사항: 페이지당 10-20개 항목
            pageNo: currentPage,
          });
        } else {
          response = await areaBasedList2({
            areaCode: filters.areaCode,
            contentTypeId: filters.contentTypeId,
            numOfRows: itemsPerPage,
            pageNo: currentPage,
          });
        }

        // 검색 결과 개수 설정
        if (response.response?.body?.totalCount !== undefined) {
          setTotalCount(response.response.body.totalCount);
        }

        // API 응답 데이터 변환 (공통 로직)
        const transformItems = (items: any[] | any): TourItem[] => {
          if (Array.isArray(items)) {
            return items.map((item) => ({
              addr1: item.addr1,
              addr2: item.addr2,
              areacode: item.areacode,
              contentid: item.contentid,
              contenttypeid: item.contenttypeid,
              title: item.title,
              mapx: item.mapx,
              mapy: item.mapy,
              firstimage: item.firstimage,
              firstimage2: item.firstimage2,
              tel: item.tel,
              cat1: item.cat1,
              cat2: item.cat2,
              cat3: item.cat3,
              modifiedtime: item.modifiedtime,
            }));
          } else if (items) {
            // 단일 항목인 경우 배열로 변환
            return [
              {
                addr1: items.addr1,
                addr2: items.addr2,
                areacode: items.areacode,
                contentid: items.contentid,
                contenttypeid: items.contenttypeid,
                title: items.title,
                mapx: items.mapx,
                mapy: items.mapy,
                firstimage: items.firstimage,
                firstimage2: items.firstimage2,
                tel: items.tel,
                cat1: items.cat1,
                cat2: items.cat2,
                cat3: items.cat3,
                modifiedtime: items.modifiedtime,
              },
            ];
          }
          return [];
        };

        if (response.response?.body?.items?.item) {
          const tourItems = transformItems(response.response.body.items.item);
          setTours(tourItems);
        } else {
          // 결과가 없는 경우
          setTours([]);
        }
      } catch (err) {
        console.error("관광지 조회 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : hasSearch
            ? "검색 중 오류가 발생했습니다."
            : "관광지 목록을 불러오는 중 오류가 발생했습니다.",
        );
        setTours([]);
        setTotalCount(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, [
    searchKeyword,
    filters.areaCode,
    filters.contentTypeId,
    currentPage,
    itemsPerPage,
  ]);

  // 검색/필터 변경 시 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filters.areaCode, filters.contentTypeId]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: TourFiltersValues) => {
    setFilters(newFilters);
  };

  // 검색 실행 핸들러
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  // 검색어 변경 핸들러 (초기화용)
  const handleSearchChange = (value: string) => {
    if (value.trim().length === 0) {
      setSearchKeyword(undefined);
    }
  };

  // 정렬된 관광지 목록 계산 (useMemo 사용)
  const sortedTours = useMemo(() => {
    if (!tours || tours.length === 0) {
      return tours;
    }

    // 배열 복사본 생성 (원본 배열 변경 방지)
    const sorted = [...tours];

    if (sortOption === "latest") {
      // 최신순: modifiedtime 기준 내림차순 (YYYYMMDDHHmmss 형식)
      return sorted.sort((a, b) => {
        // modifiedtime을 숫자로 변환하여 비교 (더 큰 값이 최신)
        const timeA = parseInt(a.modifiedtime, 10) || 0;
        const timeB = parseInt(b.modifiedtime, 10) || 0;
        return timeB - timeA; // 내림차순
      });
    } else {
      // 이름순: title 기준 가나다순 정렬 (오름차순)
      return sorted.sort((a, b) => {
        // 한글 정렬을 위해 localeCompare 사용
        return a.title.localeCompare(b.title, "ko", {
          numeric: true, // 숫자도 정렬
          sensitivity: "base", // 대소문자 구분 안함
        });
      });
    }
  }, [tours, sortOption]);

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    if (!totalCount || totalCount === 0 || itemsPerPage === 0) {
      return 0;
    }
    return Math.ceil(totalCount / itemsPerPage);
  }, [totalCount, itemsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 목록 상단으로 스크롤 (UX 개선)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* HERO SECTION (Optional, 데스크톱만 표시) */}
      <section className="hidden lg:block w-full bg-gradient-to-br from-primary/5 via-background to-background border-b">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              한국의 아름다운 관광지를 탐험하세요
            </h1>
            <div className="max-w-2xl mx-auto">
              {/* 큰 검색창 */}
              <TourSearch
                value={searchKeyword}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                loading={loading}
                placeholder="관광지 검색..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 모바일 검색 바 */}
      <section className="lg:hidden w-full border-b bg-white dark:bg-gray-950 px-4 py-3">
        <div className="w-full">
          <TourSearch
            value={searchKeyword}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            loading={loading}
            placeholder="관광지 검색..."
          />
        </div>
      </section>

      {/* 필터 및 컨트롤 영역 */}
      <section className="w-full border-b bg-white dark:bg-gray-950 px-4 py-3 lg:px-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          {/* 데스크톱 필터 */}
          <div className="hidden lg:flex items-center gap-4">
            <TourFilters values={filters} onChange={handleFilterChange} />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-muted-foreground">📅</span>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32 text-sm">
                  <SelectValue placeholder="정렬 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 모바일 필터 */}
          <div className="lg:hidden space-y-2">
            <TourFilters values={filters} onChange={handleFilterChange} />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">정렬:</span>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32 text-sm">
                  <SelectValue placeholder="정렬 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mt-2 text-sm text-destructive">{error}</div>
          )}
        </div>
      </section>

      {/* 컨텐츠 영역: 목록 */}
      <section className="flex-1 w-full">
        <div className="max-w-7xl mx-auto h-full">
          {/* 관광지 목록 영역 */}
          <div className="overflow-y-auto bg-white dark:bg-gray-950">
            <div className="p-4 lg:p-6">
              {/* 검색 결과 개수 표시 */}
              {totalCount !== null && tours.length > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  {searchKeyword
                    ? `"${searchKeyword}" 검색 결과: ${totalCount.toLocaleString()}개`
                    : `검색 결과: ${totalCount.toLocaleString()}개`}
                </div>
              )}

              {/* TourList 컴포넌트 사용 - 검색/필터/정렬된 관광지 목록 표시 */}
              <TourList
                tours={sortedTours}
                loading={loading}
                emptyMessage={
                  searchKeyword
                    ? `"${searchKeyword}"에 대한 검색 결과가 없습니다.`
                    : filters.areaCode || filters.contentTypeId
                    ? "선택한 필터 조건에 맞는 관광지가 없습니다."
                    : undefined
                }
              />

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
