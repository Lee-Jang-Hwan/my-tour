/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 이 페이지는 선택한 관광지의 상세 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 동적 라우팅 파라미터 처리 (contentId)
 * 2. detailCommon2 API를 통한 관광지 기본 정보 조회
 * 3. detailIntro2 API를 통한 관광지 운영 정보 조회
 * 4. detailImage2 API를 통한 관광지 이미지 목록 조회
 * 5. 이미지 갤러리 표시 (대표 이미지 + 서브 이미지)
 * 6. 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 개요)
 * 7. 운영 정보 표시 (운영시간, 휴무일, 이용요금, 주차 등)
 * 8. 뒤로가기 버튼
 * 9. 로딩/에러 상태 처리
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router Server Component
 * - async params 처리 (await props.params)
 * - detailCommon2 API 호출로 기본 정보 조회
 * - notFound() 사용하여 404 처리
 * - generateMetadata로 동적 메타데이터 생성
 *
 * @dependencies
 * - lib/api/tour-api.ts: detailCommon2, detailIntro2, detailImage2 함수
 * - lib/types/tour.ts: TourDetail, TourIntro, TourImage 타입
 * - lib/constants/content-types.ts: getContentTypeName 함수
 * - components/tour-detail/detail-gallery.tsx: 이미지 갤러리 컴포넌트
 * - components/tour-detail/detail-info.tsx: 기본 정보 컴포넌트
 * - components/tour-detail/detail-intro.tsx: 운영 정보 컴포넌트
 * - components/ui/card.tsx: Card 컴포넌트
 * - components/ui/skeleton.tsx: Skeleton 컴포넌트
 * - next/image: Next.js Image 컴포넌트
 * - next/link: Next.js Link 컴포넌트
 * - next/navigation: useRouter, notFound
 *
 * @see {@link /docs/PRD.md#2-4-상세페이지} - 기능 명세
 * @see {@link /docs/Design.md#3-상세페이지--places-contentid---데스크톱} - 디자인 레이아웃
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detailCommon2, detailIntro2, detailImage2 } from "@/lib/api/tour-api";
import type { TourDetail, TourIntro, TourImage } from "@/lib/types/tour";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { ShareButton } from "@/components/tour-detail/share-button";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { contentId } = await params;

    // API 호출하여 관광지 정보 가져오기
    const response = await detailCommon2(contentId);
    const item = response.response?.body?.items?.item?.[0];

    if (!item) {
      return {
        title: "관광지 정보 없음",
        description: "요청한 관광지 정보를 찾을 수 없습니다.",
      };
    }

    // 개요 텍스트 정리 (100자 이내)
    const description =
      item.overview && item.overview.length > 0
        ? item.overview.length > 100
          ? `${item.overview.slice(0, 100)}...`
          : item.overview
        : `${item.title} 관광지 정보`;

    return {
      title: `${item.title} - My Trip`,
      description,
      openGraph: {
        title: item.title,
        description,
        images: item.firstimage
          ? [
              {
                url: item.firstimage,
                width: 1200,
                height: 630,
                alt: item.title,
              },
            ]
          : [],
        type: "website",
        url: `/places/${contentId}`,
      },
      twitter: {
        card: "summary_large_image",
        title: item.title,
        description,
        images: item.firstimage ? [item.firstimage] : [],
      },
    };
  } catch (error) {
    return {
      title: "관광지 상세 정보",
      description: "관광지 정보를 불러오는 중입니다.",
    };
  }
}

/**
 * 관광지 상세페이지 컴포넌트
 */
export default async function PlaceDetailPage({ params }: PageProps) {
  // Next.js 15 async params 처리
  const { contentId } = await params;

  // contentId 유효성 검증
  if (!contentId || contentId.trim().length === 0) {
    notFound();
  }

  let detail: TourDetail | null = null;
  let intro: TourIntro | null = null;
  let images: TourImage[] | null = null;
  let error: Error | null = null;

  try {
    // detailCommon2 API 호출
    const response = await detailCommon2(contentId);

    // 응답 데이터 확인
    const items = response.response?.body?.items?.item;

    if (!items || items.length === 0) {
      notFound();
    }

    // 첫 번째 항목을 TourDetail 타입으로 변환
    const item = items[0];
    detail = {
      contentid: item.contentid,
      contenttypeid: item.contenttypeid,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      homepage: item.homepage,
      overview: item.overview,
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      mapx: item.mapx,
      mapy: item.mapy,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      cpyrhtDivCd: item.cpyrhtDivCd,
      modifiedtime: item.modifiedtime,
    };

    // detailIntro2 API 호출 (운영 정보)
    try {
      const introResponse = await detailIntro2(
        item.contentid,
        item.contenttypeid,
      );
      const introItems = introResponse.response?.body?.items?.item;

      if (introItems && introItems.length > 0) {
        // 첫 번째 항목을 TourIntro 타입으로 변환
        const introItem = introItems[0];
        intro = {
          contentid: introItem.contentid || item.contentid,
          contenttypeid: introItem.contenttypeid || item.contenttypeid,
          ...introItem,
        };
      }
    } catch (introErr) {
      // detailIntro2 에러는 치명적이지 않으므로 무시 (운영 정보만 표시 안 됨)
      console.warn("운영 정보 조회 실패:", introErr);
    }

    // detailImage2 API 호출 (이미지 목록)
    try {
      const imageResponse = await detailImage2(item.contentid);
      const imageItems = imageResponse.response?.body?.items?.item;

      if (imageItems && imageItems.length > 0) {
        // TourImage 타입으로 변환
        images = imageItems.map((img) => ({
          contentid: img.contentid || item.contentid,
          originimgurl: img.originimgurl,
          serialnum: img.serialnum,
          smallimageurl: img.smallimageurl,
          imgname: img.imgname,
        }));
      }
    } catch (imageErr) {
      // detailImage2 에러는 치명적이지 않으므로 무시 (이미지 갤러리만 표시 안 됨)
      console.warn("이미지 목록 조회 실패:", imageErr);
    }
  } catch (err) {
    // API 에러 처리
    error =
      err instanceof Error
        ? err
        : new Error("관광지 정보를 불러오는 중 오류가 발생했습니다.");
  }

  // 에러가 발생한 경우
  if (error) {
    throw error;
  }

  // detail이 없는 경우 (이미 notFound() 호출됨)
  if (!detail) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">뒤로가기</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold truncate flex-1">
              {detail.title}
            </h1>
            <ShareButton />
          </div>
        </div>
      </div>

      {/* 메인 영역 */}
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* 이미지 갤러리 (HERO IMAGE SECTION) */}
        {images && images.length > 0 && (
          <DetailGallery images={images} title={detail.title} />
        )}
        <DetailInfo detail={detail} />
        <DetailIntro intro={intro} />
      </main>
    </div>
  );
}
