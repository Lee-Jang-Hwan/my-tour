/**
 * @file performance.ts
 * @description 성능 메트릭 수집 및 측정 유틸리티
 *
 * 이 모듈은 웹 성능 메트릭을 수집하고 측정하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. Web Vitals 메트릭 수집 (LCP, FID, CLS, TTFB, INP)
 * 2. 페이지 로딩 시간 측정
 * 3. Performance API 활용
 * 4. 개발 환경에서 콘솔 로그, 프로덕션에서 분석 도구 연동 준비
 *
 * @dependencies
 * - Performance API (브라우저 네이티브)
 * - next/web-vitals (Web Vitals 메트릭)
 *
 * @see {@link /docs/PRD.md#9-성공-지표-kpi} - 성능 목표
 * @see {@link /docs/TODO.md#5-4-성능-최적화} - 성능 최적화 체크리스트
 */

/**
 * Web Vitals 메트릭 타입 정의
 */
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
}

/**
 * 성능 메트릭 타입
 */
export interface PerformanceMetrics {
  // Web Vitals
  lcp?: number; // Largest Contentful Paint (목표: < 2.5초)
  fid?: number; // First Input Delay (목표: < 100ms)
  cls?: number; // Cumulative Layout Shift (목표: < 0.1)
  ttfb?: number; // Time to First Byte (목표: < 800ms)
  inp?: number; // Interaction to Next Paint (목표: < 200ms)
  
  // 페이지 로딩 시간
  pageLoadTime?: number; // 페이지 전체 로딩 시간 (목표: < 3초)
  domContentLoaded?: number; // DOMContentLoaded 이벤트 시간
  firstPaint?: number; // First Paint 시간
  
  // 리소스 로딩
  resourceLoadTime?: number; // 리소스 로딩 시간
  apiResponseTime?: number; // API 응답 시간
}

/**
 * 성능 메트릭 수집기
 */
class PerformanceCollector {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  /**
   * Web Vitals 메트릭 수집 시작
   */
  startCollecting() {
    if (typeof window === "undefined") return;

    // LCP (Largest Contentful Paint) 측정
    this.observeLCP();
    
    // CLS (Cumulative Layout Shift) 측정
    this.observeCLS();
    
    // FID (First Input Delay) 측정
    this.observeFID();
    
    // TTFB (Time to First Byte) 측정
    this.measureTTFB();
    
    // 페이지 로딩 시간 측정
    this.measurePageLoadTime();
  }

  /**
   * LCP 측정
   */
  private observeLCP() {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformancePaintTiming;
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          this.logMetric("LCP", this.metrics.lcp, 2500);
        }
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.push(observer);
    } catch (error) {
      console.warn("LCP 측정 실패:", error);
    }
  }

  /**
   * CLS 측정
   */
  private observeCLS() {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
        this.logMetric("CLS", clsValue, 0.1);
      });

      observer.observe({ entryTypes: ["layout-shift"] });
      this.observers.push(observer);
    } catch (error) {
      console.warn("CLS 측정 실패:", error);
    }
  }

  /**
   * FID 측정
   */
  private observeFID() {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          this.metrics.fid = fid;
          this.logMetric("FID", fid, 100);
        }
      });

      observer.observe({ entryTypes: ["first-input"] });
      this.observers.push(observer);
    } catch (error) {
      console.warn("FID 측정 실패:", error);
    }
  }

  /**
   * TTFB 측정
   */
  private measureTTFB() {
    if (typeof window === "undefined" || !performance.timing) return;

    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.ttfb = ttfb;
        this.logMetric("TTFB", ttfb, 800);
      }
    } catch (error) {
      console.warn("TTFB 측정 실패:", error);
    }
  }

  /**
   * 페이지 로딩 시간 측정
   */
  private measurePageLoadTime() {
    if (typeof window === "undefined") return;

    // DOMContentLoaded 이벤트
    if (document.readyState === "complete") {
      this.measureLoadMetrics();
    } else {
      window.addEventListener("load", () => {
        this.measureLoadMetrics();
      });
    }
  }

  /**
   * 로딩 메트릭 측정
   */
  private measureLoadMetrics() {
    if (typeof window === "undefined" || !performance.timing) return;

    try {
      const timing = performance.timing;
      
      // 페이지 전체 로딩 시간
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      this.metrics.pageLoadTime = pageLoadTime;
      this.logMetric("Page Load Time", pageLoadTime, 3000);

      // DOMContentLoaded 시간
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.domContentLoaded = domContentLoaded;

      // First Paint 시간 (PerformancePaintTiming)
      const paintEntries = performance.getEntriesByType("paint");
      const firstPaint = paintEntries.find((entry) => entry.name === "first-paint");
      if (firstPaint) {
        this.metrics.firstPaint = firstPaint.startTime;
      }
    } catch (error) {
      console.warn("페이지 로딩 시간 측정 실패:", error);
    }
  }

  /**
   * 메트릭 로깅 (개발 환경)
   */
  private logMetric(name: string, value: number, threshold: number) {
    if (process.env.NODE_ENV !== "development") return;

    const rating = this.getRating(value, threshold);
    const emoji = rating === "good" ? "✅" : rating === "needs-improvement" ? "⚠️" : "❌";
    
    console.log(
      `${emoji} [Performance] ${name}: ${value.toFixed(2)}ms (목표: < ${threshold}ms) - ${rating}`
    );
  }

  /**
   * 메트릭 등급 판정
   */
  private getRating(value: number, threshold: number): "good" | "needs-improvement" | "poor" {
    if (value <= threshold) return "good";
    if (value <= threshold * 1.5) return "needs-improvement";
    return "poor";
  }

  /**
   * 수집된 메트릭 가져오기
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * API 응답 시간 기록
   */
  recordApiResponseTime(time: number) {
    this.metrics.apiResponseTime = time;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] API Response Time: ${time.toFixed(2)}ms`);
    }
  }

  /**
   * 정리 (Observer 해제)
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// 싱글톤 인스턴스
let collectorInstance: PerformanceCollector | null = null;

/**
 * 성능 메트릭 수집기 가져오기
 */
export function getPerformanceCollector(): PerformanceCollector {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 더미 객체 반환
    return {
      startCollecting: () => {},
      getMetrics: () => ({}),
      recordApiResponseTime: () => {},
      cleanup: () => {},
    } as PerformanceCollector;
  }

  if (!collectorInstance) {
    collectorInstance = new PerformanceCollector();
  }
  return collectorInstance;
}

/**
 * 성능 메트릭 수집 시작
 */
export function startPerformanceCollection() {
  if (typeof window === "undefined") return;
  
  const collector = getPerformanceCollector();
  collector.startCollecting();
}

/**
 * 성능 메트릭 가져오기
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const collector = getPerformanceCollector();
  return collector.getMetrics();
}

/**
 * API 응답 시간 기록
 */
export function recordApiResponseTime(time: number) {
  const collector = getPerformanceCollector();
  collector.recordApiResponseTime(time);
}

/**
 * Lighthouse 점수 시뮬레이션 (Web Vitals 기반)
 */
export function calculateLighthouseScore(metrics: PerformanceMetrics): number {
  let score = 100;
  
  // LCP 점수 (25% 가중치)
  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
    else if (metrics.lcp > 2000) score -= 5;
  }
  
  // FID 점수 (25% 가중치)
  if (metrics.fid) {
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 15;
    else if (metrics.fid > 50) score -= 5;
  }
  
  // CLS 점수 (25% 가중치)
  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
    else if (metrics.cls > 0.05) score -= 5;
  }
  
  // TTFB 점수 (25% 가중치)
  if (metrics.ttfb) {
    if (metrics.ttfb > 2000) score -= 25;
    else if (metrics.ttfb > 800) score -= 15;
    else if (metrics.ttfb > 600) score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

