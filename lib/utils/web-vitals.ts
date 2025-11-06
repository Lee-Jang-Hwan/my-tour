/**
 * @file web-vitals.ts
 * @description Web Vitals 리포팅 설정
 *
 * next/web-vitals를 사용하여 Web Vitals 메트릭을 수집하고 리포팅합니다.
 * 개발 환경에서는 콘솔에 출력하고, 프로덕션에서는 분석 도구로 전송할 수 있습니다.
 *
 * @dependencies
 * - next/web-vitals: Next.js Web Vitals 패키지
 * - lib/utils/performance.ts: 성능 메트릭 수집 유틸리티
 */

import { onCLS, onFID, onLCP, onTTFB, onINP, type Metric } from "next/web-vitals";
import { recordApiResponseTime } from "@/lib/utils/performance";

/**
 * Web Vitals 메트릭 핸들러
 */
function handleWebVital(metric: Metric) {
  // 개발 환경에서 콘솔 출력
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // 프로덕션에서는 여기에 분석 도구로 전송하는 코드를 추가할 수 있습니다
  // 예: Google Analytics, Vercel Analytics 등
  if (process.env.NODE_ENV === "production") {
    // 예시: Vercel Analytics
    // if (typeof window !== "undefined" && (window as any).va) {
    //   (window as any).va("track", metric.name, metric.value);
    // }
  }
}

/**
 * Web Vitals 수집 시작
 * 이 함수는 클라이언트 사이드에서만 실행됩니다.
 */
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // LCP (Largest Contentful Paint)
  onLCP(handleWebVital);

  // FID (First Input Delay) - deprecated, INP로 대체됨
  onFID(handleWebVital);

  // CLS (Cumulative Layout Shift)
  onCLS(handleWebVital);

  // TTFB (Time to First Byte)
  onTTFB(handleWebVital);

  // INP (Interaction to Next Paint) - FID의 대체
  onINP(handleWebVital);
}

/**
 * API 응답 시간 추적을 위한 fetch 래퍼
 * 개발 환경에서 API 호출 시간을 측정합니다.
 */
export function trackApiPerformance() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  // 원본 fetch 저장
  const originalFetch = window.fetch;

  // fetch 래핑
  window.fetch = async function (...args) {
    const startTime = performance.now();

    try {
      const response = await originalFetch.apply(this, args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // API 응답 시간 기록
      recordApiResponseTime(duration);

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      recordApiResponseTime(duration);
      throw error;
    }
  };
}

