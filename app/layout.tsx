import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { Toaster } from "@/components/ui/sonner";
import { PerformanceReport } from "@/components/performance/performance-report";
import { WebVitalsReporter } from "@/components/performance/web-vitals-reporter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  title: {
    default: "My Trip - 한국 관광지 정보 서비스",
    template: "%s | My Trip",
  },
  description:
    "한국관광공사 공공 API를 활용하여 전국의 관광지 정보를 검색하고 상세 정보를 조회할 수 있는 웹 서비스",
  keywords: [
    "한국 관광지",
    "여행",
    "관광 정보",
    "한국관광공사",
    "여행 계획",
    "관광지 검색",
    "국내 여행",
  ],
  authors: [{ name: "My Trip" }],
  creator: "My Trip",
  publisher: "My Trip",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: baseUrl,
    siteName: "My Trip",
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "한국관광공사 공공 API를 활용하여 전국의 관광지 정보를 검색하고 상세 정보를 조회할 수 있는 웹 서비스",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "My Trip - 한국 관광지 정보 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "한국관광공사 공공 API를 활용하여 전국의 관광지 정보를 검색하고 상세 정보를 조회할 수 있는 웹 서비스",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(baseUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
            <Toaster />
            <WebVitalsReporter />
            <PerformanceReport />
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
