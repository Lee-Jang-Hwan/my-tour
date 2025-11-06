/**
 * @file robots.ts
 * @description 검색엔진 크롤링 설정
 *
 * Next.js 15 App Router의 robots.ts 파일을 사용하여 동적 robots.txt를 생성합니다.
 *
 * 주요 기능:
 * 1. 검색엔진 크롤링 허용/차단 규칙 설정
 * 2. Sitemap URL 참조
 * 3. 환경별 설정 지원
 *
 * @dependencies
 * - next: MetadataRoute 타입
 *
 * @see {@link /docs/PRD.md#5.3-SEO-최적화} - SEO 최적화 요구사항 참조
 * @see {@link /app/sitemap.ts} - Sitemap 생성 로직 참조
 */

import type { MetadataRoute } from "next";

/**
 * 사이트 기본 URL 가져오기
 * sitemap.ts와 동일한 로직 사용
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
 * 검색엔진 크롤링 규칙 생성
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/", // API 라우트 차단
        "/auth-test/", // 인증 테스트 페이지 차단
        "/storage-test/", // 스토리지 테스트 페이지 차단
        "/_next/", // Next.js 내부 파일 차단
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

