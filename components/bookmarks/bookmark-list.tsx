/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 이 컴포넌트는 북마크한 관광지 목록을 표시하고 관리하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시 (체크박스 + 카드 형태)
 * 2. 각 항목에 북마크 삭제 버튼
 * 3. 북마크 날짜 표시 (created_at)
 * 4. 정렬 옵션 (최신순, 이름순, 지역별)
 * 5. 일괄 삭제 기능 (체크박스 선택 + 일괄 삭제 버튼)
 * 6. 삭제 확인 다이얼로그 (개별/일괄)
 *
 * 핵심 구현 로직:
 * - 클라이언트 컴포넌트 (인터랙션 및 상태 관리)
 * - 북마크와 관광지 정보 매칭 (bookmark.content_id === tour.contentid)
 * - 정렬 로직 구현
 * - 체크박스 선택 상태 관리
 * - Server Actions를 통한 북마크 삭제
 * - 삭제 후 router.refresh()로 페이지 새로고침
 *
 * @dependencies
 * - actions/bookmarks.ts: removeBookmarkAction
 * - lib/types/bookmark.ts: Bookmark 타입
 * - lib/types/tour.ts: TourItem 타입
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - components/ui/select.tsx: Select 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - next/navigation: useRouter
 * - lucide-react: 아이콘
 *
 * @see {@link /docs/PRD.md#2-4-5-북마크} - 기능 명세
 * @see {@link /docs/Design.md#5-북마크-페이지--bookmarks---데스크톱--모바일} - 디자인 레이아웃
 * @see {@link /docs/TODO.md#4-4-북마크-목록-페이지} - 구현 체크리스트
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Trash2,
  MapPin,
  Calendar,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { removeBookmarkAction } from "@/actions/bookmarks";
import { toast } from "sonner";
import type { Bookmark } from "@/lib/types/bookmark";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/constants/content-types";
import { cn } from "@/lib/utils";

/**
 * 정렬 옵션 타입
 */
type SortOption = "latest" | "name" | "region";

/**
 * 북마크와 관광지 정보를 결합한 타입
 */
interface BookmarkItem {
  bookmark: Bookmark;
  tour: TourItem;
}

/**
 * 북마크 리스트 컴포넌트 Props
 */
interface BookmarkListProps {
  /** 북마크 목록 */
  bookmarks: Bookmark[];
  /** 관광지 정보 목록 */
  tours: TourItem[];
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 북마크 날짜 포맷팅 함수
 */
function formatBookmarkDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return "";
  }
}

/**
 * 북마크 리스트 컴포넌트
 */
export function BookmarkList({
  bookmarks,
  tours,
  className,
}: BookmarkListProps) {
  const router = useRouter();

  // 상태 관리
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "multiple";
    contentId?: string;
    contentIds?: string[];
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 북마크와 관광지 정보 매칭
  const bookmarkItems = useMemo(() => {
    const items: BookmarkItem[] = [];

    for (const bookmark of bookmarks) {
      const tour = tours.find((t) => t.contentid === bookmark.content_id);
      if (tour) {
        items.push({ bookmark, tour });
      }
    }

    return items;
  }, [bookmarks, tours]);

  // 정렬된 북마크 목록
  const sortedItems = useMemo(() => {
    const sorted = [...bookmarkItems];

    switch (sortOption) {
      case "latest":
        // 최신순: 북마크 created_at 내림차순
        sorted.sort((a, b) => {
          const dateA = new Date(a.bookmark.created_at).getTime();
          const dateB = new Date(b.bookmark.created_at).getTime();
          return dateB - dateA;
        });
        break;
      case "name":
        // 이름순: 관광지명 가나다순
        sorted.sort((a, b) => {
          return a.tour.title.localeCompare(b.tour.title, "ko");
        });
        break;
      case "region":
        // 지역별: 주소(addr1) 기준 정렬
        sorted.sort((a, b) => {
          return a.tour.addr1.localeCompare(b.tour.addr1, "ko");
        });
        break;
    }

    return sorted;
  }, [bookmarkItems, sortOption]);

  /**
   * 체크박스 토글 핸들러
   */
  const handleToggleCheck = (contentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  };

  /**
   * 전체 선택/해제 토글
   */
  const handleToggleAll = () => {
    if (selectedIds.size === sortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedItems.map((item) => item.tour.contentid)));
    }
  };

  /**
   * 개별 삭제 버튼 클릭 핸들러
   */
  const handleDeleteClick = (contentId: string) => {
    setDeleteTarget({ type: "single", contentId });
    setDeleteDialogOpen(true);
  };

  /**
   * 일괄 삭제 버튼 클릭 핸들러
   */
  const handleBatchDeleteClick = () => {
    if (selectedIds.size === 0) {
      toast.error("삭제할 항목을 선택해주세요.");
      return;
    }

    const contentIds = Array.from(selectedIds);
    setDeleteTarget({ type: "multiple", contentIds });
    setDeleteDialogOpen(true);
  };

  /**
   * 삭제 확인 및 실행
   */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      if (deleteTarget.type === "single" && deleteTarget.contentId) {
        // 개별 삭제
        await removeBookmarkAction(deleteTarget.contentId);
        toast.success("북마크가 삭제되었습니다.");
      } else if (deleteTarget.type === "multiple" && deleteTarget.contentIds) {
        // 일괄 삭제 (병렬 처리)
        const deletePromises = deleteTarget.contentIds.map((contentId) =>
          removeBookmarkAction(contentId).catch((error) => {
            console.error(`북마크 삭제 실패 (${contentId}):`, error);
            return null;
          }),
        );

        await Promise.all(deletePromises);
        toast.success(
          `${deleteTarget.contentIds.length}개의 북마크가 삭제되었습니다.`,
        );
      }

      // 삭제 후 상태 초기화 및 페이지 새로고침
      setSelectedIds(new Set());
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error("북마크 삭제 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "북마크 삭제에 실패했습니다.";
      toast.error("오류가 발생했습니다.", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 빈 상태 처리
  if (bookmarkItems.length === 0) {
    return null; // 빈 상태는 상위 컴포넌트에서 처리
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 정렬 및 일괄 삭제 컨트롤 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={sortOption}
            onValueChange={(v) => setSortOption(v as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="region">지역별</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              일괄 삭제 ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* 북마크 목록 */}
      <div className="space-y-4">
        {sortedItems.map(({ bookmark, tour }) => {
          const isSelected = selectedIds.has(tour.contentid);
          const imageUrl = tour.firstimage || tour.firstimage2 || null;
          const contentTypeName = getContentTypeName(
            tour.contenttypeid as Parameters<typeof getContentTypeName>[0],
          );

          return (
            <Card
              key={bookmark.id}
              className={cn(
                "transition-all duration-200",
                isSelected && "ring-2 ring-primary",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* 체크박스 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCheck(tour.contentid);
                    }}
                    className="mt-1 shrink-0"
                    aria-label={isSelected ? "선택 해제" : "선택"}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* 이미지 */}
                  <Link
                    href={`/places/${tour.contentid}`}
                    className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted shrink-0"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={tour.title}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 128px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <MapPin className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </Link>

                  {/* 정보 영역 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/places/${tour.contentid}`}
                          className="block hover:text-primary transition-colors"
                        >
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1">
                            {tour.title}
                          </h3>
                        </Link>

                        {/* 주소 */}
                        <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="line-clamp-1">{tour.addr1}</p>
                            {tour.addr2 && (
                              <p className="line-clamp-1 text-xs">
                                {tour.addr2}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 관광 타입 및 북마크 날짜 */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {contentTypeName && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              {contentTypeName}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            북마크 날짜:{" "}
                            {formatBookmarkDate(bookmark.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* 삭제 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(tour.contentid);
                        }}
                        aria-label="북마크 삭제"
                      >
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제 확인</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === "single"
                ? "이 북마크를 삭제하시겠습니까?"
                : `선택한 ${
                    deleteTarget?.contentIds?.length || 0
                  }개의 북마크를 삭제하시겠습니까?`}
              <br />이 작업은 취소할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
