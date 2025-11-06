/**
 * @file web-vitals-reporter.tsx
 * @description Web Vitals 리포터 컴포넌트
 *
 * 클라이언트 사이드에서 Web Vitals 메트릭을 수집하고 리포팅합니다.
 *
 * @dependencies
 * - next/web-vitals: Next.js Web Vitals 패키지
 * - lib/utils/web-vitals.ts: Web Vitals 리포팅 설정
 */

"use client";

import { useEffect } from "react";
import { reportWebVitals, trackApiPerformance } from "@/lib/utils/web-vitals";

/**
 * Web Vitals 리포터 컴포넌트
 * 클라이언트 사이드에서만 실행됩니다.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Web Vitals 수집 시작
    reportWebVitals();

    // API 성능 추적 시작
    trackApiPerformance();
  }, []);

  return null;
}

