/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 이 페이지는 사용자가 북마크한 관광지 목록을 표시합니다.
 *
 * 주요 기능:
 * 1. 인증 확인 (로그인하지 않은 경우 처리)
 * 2. 북마크 목록 조회 (getBookmarksAction)
 * 3. 각 북마크의 관광지 정보 조회 (detailCommon2)
 * 4. 관광지 목록 표시 (TourList 컴포넌트 재사용)
 * 5. 빈 상태 처리 (북마크 없음 안내)
 * 6. 로딩 상태 표시
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router Server Component
 * - Clerk 인증 확인 (auth())
 * - 북마크 목록 조회 후 각 관광지 정보 병렬 조회
 * - TourItem 형식으로 변환하여 TourList에 전달
 * - 에러 처리: 일부 관광지 정보 조회 실패 시에도 나머지 표시
 *
 * @dependencies
 * - @clerk/nextjs/server: auth, redirectToSignIn
 * - actions/bookmarks.ts: getBookmarksAction
 * - lib/api/tour-api.ts: detailCommon2
 * - components/tour-list.tsx: TourList 컴포넌트
 * - lib/types/bookmark.ts: Bookmark 타입
 * - lib/types/tour.ts: TourItem 타입
 *
 * @see {@link /docs/PRD.md#2-4-5-북마크} - 기능 명세
 * @see {@link /docs/Design.md#5-북마크-페이지--bookmarks---데스크톱--모바일} - 디자인 레이아웃
 * @see {@link /docs/TODO.md#4-4-북마크-목록-페이지} - 구현 체크리스트
 */

import { auth, redirectToSignIn } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBookmarksAction } from "@/actions/bookmarks";
import { detailCommon2 } from "@/lib/api/tour-api";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import type { TourItem } from "@/lib/types/tour";

/**
 * 북마크 목록 페이지 컴포넌트
 */
export default async function BookmarksPage() {
  // Clerk 인증 확인
  const { userId } = await auth();

  // 로그인하지 않은 경우 리다이렉트
  if (!userId) {
    redirectToSignIn();
  }

  let bookmarks: Awaited<ReturnType<typeof getBookmarksAction>> = [];
  let tours: TourItem[] = [];
  let error: Error | null = null;

  try {
    // 북마크 목록 조회
    bookmarks = await getBookmarksAction();

    // 북마크가 없으면 빈 배열로 처리
    if (bookmarks.length === 0) {
      tours = [];
    } else {
      // 각 북마크의 관광지 정보 조회 (병렬 처리)
      const tourPromises = bookmarks.map(async (bookmark) => {
        try {
          const response = await detailCommon2(bookmark.content_id);
          const items = response.response?.body?.items?.item;

          if (!items || items.length === 0) {
            return null;
          }

          const item = items[0];

          // TourItem 형식으로 변환
          const tourItem: TourItem = {
            contentid: item.contentid,
            contenttypeid: item.contenttypeid,
            title: item.title,
            addr1: item.addr1,
            addr2: item.addr2,
            areacode: "", // detailCommon2에는 없음, 빈 문자열로 처리
            mapx: item.mapx,
            mapy: item.mapy,
            firstimage: item.firstimage,
            firstimage2: item.firstimage2,
            tel: item.tel,
            cat1: item.cat1,
            cat2: item.cat2,
            cat3: item.cat3,
            modifiedtime: item.modifiedtime,
          };

          return tourItem;
        } catch (err) {
          // 개별 관광지 정보 조회 실패는 무시하고 계속 진행
          console.warn(
            `관광지 정보 조회 실패 (contentId: ${bookmark.content_id}):`,
            err,
          );
          return null;
        }
      });

      // 모든 관광지 정보 조회 완료 대기
      const tourResults = await Promise.all(tourPromises);

      // null이 아닌 결과만 필터링
      tours = tourResults.filter((tour): tour is TourItem => tour !== null);
    }
  } catch (err) {
    // 북마크 목록 조회 실패
    error =
      err instanceof Error
        ? err
        : new Error("북마크 목록을 불러오는 중 오류가 발생했습니다.");
  }

  // 에러 발생 시 에러 페이지 표시 (또는 빈 상태로 처리)
  if (error) {
    console.error("북마크 목록 페이지 에러:", error);
    // 에러 발생 시에도 빈 상태로 표시 (사용자 경험 개선)
    tours = [];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 메인 영역 */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 페이지 제목 및 컨트롤 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <span>내 북마크</span>
              {bookmarks.length > 0 && (
                <span className="text-lg font-normal text-muted-foreground">
                  ({bookmarks.length}개)
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* 북마크 목록 또는 빈 상태 */}
        {bookmarks.length > 0 && tours.length > 0 ? (
          <BookmarkList bookmarks={bookmarks} tours={tours} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-8">
                  <Star className="w-16 h-16 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  아직 북마크한 관광지가 없습니다
                </h3>
                <p className="text-sm text-muted-foreground">
                  관광지를 둘러보고 마음에 드는 곳을 북마크해보세요.
                </p>
              </div>
              <Link href="/">
                <Button className="mt-4">
                  관광지 둘러보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
