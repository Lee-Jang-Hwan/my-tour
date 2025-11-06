/**
 * @file sitemap.ts
 * @description 동적 사이트맵 생성
 *
 * Next.js 15 App Router의 sitemap.ts 파일을 사용하여 동적 사이트맵을 생성합니다.
 *
 * 주요 기능:
 * 1. 정적 페이지 URL 포함 (/, /bookmarks)
 * 2. 관광지 상세페이지 URL 동적 생성 (한국관광공사 API를 통한 샘플링)
 * 3. SEO 최적화를 위한 lastModified, changeFrequency, priority 설정
 *
 * @dependencies
 * - @/lib/api/tour-api: 한국관광공사 API 클라이언트
 *
 * @see {@link /docs/PRD.md#7.4-에러-처리} - SEO 최적화 요구사항 참조
 */

import type { MetadataRoute } from "next";
import { areaBasedList2 } from "@/lib/api/tour-api";

/**
 * 사이트 기본 URL 가져오기
 */
function getBaseUrl(): string {
  // 환경변수에서 사이트 URL 가져오기
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 프로덕션 환경에서는 실제 도메인 사용 (예: https://my-trip.example.com)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 개발 환경 기본값
  return "http://localhost:3000";
}

/**
 * 관광지 상세페이지 URL 목록 가져오기 (샘플링)
 * API 호출 실패 시 빈 배열 반환
 */
async function getPlaceUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    // 주요 관광지 타입별로 샘플링 (각 타입당 최대 10개)
    const contentTypeIds = ["12", "14", "15", "25", "28", "32", "38", "39"]; // 관광 타입 ID
    const baseUrl = getBaseUrl();
    const placeUrls: MetadataRoute.Sitemap = [];

    // 각 관광 타입별로 샘플링
    for (const contentTypeId of contentTypeIds) {
      try {
        const response = await areaBasedList2({
          contentTypeId,
          numOfRows: 10, // 각 타입당 최대 10개
          pageNo: 1,
        });

        const items = response.response?.body?.items?.item || [];
        
        for (const item of items) {
          if (item.contentid) {
            placeUrls.push({
              url: `${baseUrl}/places/${item.contentid}`,
              lastModified: item.modifiedtime 
                ? new Date(item.modifiedtime) 
                : new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.7,
            });
          }
        }
      } catch (error) {
        // 개별 타입 조회 실패 시 무시하고 계속 진행
        console.warn(
          `관광 타입 ${contentTypeId} 조회 실패:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }
    }

    return placeUrls;
  } catch (error) {
    // 전체 API 호출 실패 시 빈 배열 반환 (정적 페이지만 포함)
    console.warn(
      "관광지 상세페이지 URL 생성 실패:",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * 동적 사이트맵 생성
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // 관광지 상세페이지 URL (동적 생성)
  const placeUrls = await getPlaceUrls();

  // 정적 페이지와 동적 페이지 결합
  return [...staticPages, ...placeUrls];
}

