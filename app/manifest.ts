/**
 * @file manifest.ts
 * @description PWA 웹 앱 매니페스트 생성
 *
 * Next.js 15 App Router의 manifest.ts 파일을 사용하여 PWA(Progressive Web App) 매니페스트를 생성합니다.
 *
 * 주요 기능:
 * 1. 앱 이름, 설명, 아이콘 등 기본 정보 제공
 * 2. 테마 색상 및 디스플레이 모드 설정
 * 3. 홈 화면에 추가 가능한 PWA 기능 활성화
 *
 * @dependencies
 * - next: MetadataRoute 타입
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 참조
 * @see {@link /docs/Design.md} - 디자인 가이드라인 및 컬러 팔레트 참조
 * @see {@link /app/sitemap.ts} - Base URL 헬퍼 함수 패턴 참조
 * @see {@link /app/robots.ts} - Base URL 헬퍼 함수 패턴 참조
 */

import type { MetadataRoute } from "next";

/**
 * 사이트 기본 URL 가져오기
 * sitemap.ts, robots.ts와 동일한 로직 사용
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
 * PWA 웹 앱 매니페스트 생성
 *
 * 사용자가 앱을 홈 화면에 추가할 수 있도록 하는 매니페스트 파일을 생성합니다.
 * Next.js가 자동으로 `/manifest.json` 경로에서 제공합니다.
 *
 * @returns {MetadataRoute.Manifest} PWA 매니페스트 설정 객체
 */
export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = getBaseUrl();

  return {
    name: "My Trip - 한국 관광지 정보 서비스",
    short_name: "My Trip",
    description:
      "한국관광공사 공공 API를 활용하여 전국의 관광지 정보를 검색하고 상세 정보를 조회할 수 있는 웹 서비스",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#2B7DE9",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

