/**
 * @file performance-report.tsx
 * @description 성능 리포트 컴포넌트 (개발 환경 전용)
 *
 * 이 컴포넌트는 개발 환경에서만 표시되는 성능 대시보드를 제공합니다.
 *
 * 주요 기능:
 * 1. Web Vitals 메트릭 표시 (LCP, FID, CLS, TTFB)
 * 2. 페이지 로딩 시간 표시
 * 3. Lighthouse 점수 시뮬레이션
 * 4. API 응답 시간 모니터링
 * 5. 실시간 메트릭 업데이트
 *
 * 핵심 구현 로직:
 * - 개발 환경에서만 렌더링
 * - 실시간 메트릭 수집 및 표시
 * - 색상 코딩으로 성능 상태 표시 (좋음/개선 필요/나쁨)
 *
 * @dependencies
 * - lib/utils/performance.ts: 성능 메트릭 수집 유틸리티
 * - components/ui/card.tsx: Card 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 *
 * @see {@link /docs/TODO.md#5-4-성능-최적화} - 성능 최적화 체크리스트
 */

"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getPerformanceMetrics,
  calculateLighthouseScore,
  startPerformanceCollection,
} from "@/lib/utils/performance";
import type { PerformanceMetrics } from "@/lib/utils/performance";

/**
 * 성능 리포트 컴포넌트
 * 개발 환경에서만 표시됩니다.
 */
export function PerformanceReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [lighthouseScore, setLighthouseScore] = useState<number | null>(null);

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // 성능 메트릭 수집 시작
  useEffect(() => {
    startPerformanceCollection();

    // 주기적으로 메트릭 업데이트
    const interval = setInterval(() => {
      const currentMetrics = getPerformanceMetrics();
      setMetrics(currentMetrics);
      
      if (Object.keys(currentMetrics).length > 0) {
        const score = calculateLighthouseScore(currentMetrics);
        setLighthouseScore(score);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 메트릭이 없으면 표시하지 않음
  if (!isOpen || Object.keys(metrics).length === 0) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        aria-label="성능 리포트 열기"
      >
        📊 성능
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            📊 성능 리포트
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                const newMetrics = getPerformanceMetrics();
                setMetrics(newMetrics);
                if (Object.keys(newMetrics).length > 0) {
                  setLighthouseScore(calculateLighthouseScore(newMetrics));
                }
              }}
              aria-label="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lighthouse 점수 */}
        {lighthouseScore !== null && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Lighthouse 점수</span>
              <span
                className={`text-2xl font-bold ${
                  lighthouseScore >= 90
                    ? "text-green-600"
                    : lighthouseScore >= 80
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {lighthouseScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  lighthouseScore >= 90
                    ? "bg-green-500"
                    : lighthouseScore >= 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${lighthouseScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              목표: 80점 이상
            </p>
          </div>
        )}

        {/* Web Vitals 메트릭 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold mb-2">Web Vitals</h3>

          {/* LCP */}
          {metrics.lcp !== undefined && (
            <MetricItem
              name="LCP"
              value={metrics.lcp}
              unit="ms"
              threshold={2500}
              description="Largest Contentful Paint"
            />
          )}

          {/* FID */}
          {metrics.fid !== undefined && (
            <MetricItem
              name="FID"
              value={metrics.fid}
              unit="ms"
              threshold={100}
              description="First Input Delay"
            />
          )}

          {/* CLS */}
          {metrics.cls !== undefined && (
            <MetricItem
              name="CLS"
              value={metrics.cls}
              unit=""
              threshold={0.1}
              description="Cumulative Layout Shift"
              isDecimal
            />
          )}

          {/* TTFB */}
          {metrics.ttfb !== undefined && (
            <MetricItem
              name="TTFB"
              value={metrics.ttfb}
              unit="ms"
              threshold={800}
              description="Time to First Byte"
            />
          )}
        </div>

        {/* 페이지 로딩 시간 */}
        {(metrics.pageLoadTime !== undefined ||
          metrics.domContentLoaded !== undefined ||
          metrics.firstPaint !== undefined) && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2">페이지 로딩</h3>

            {metrics.pageLoadTime !== undefined && (
              <MetricItem
                name="페이지 로딩 시간"
                value={metrics.pageLoadTime}
                unit="ms"
                threshold={3000}
                description="전체 페이지 로딩 시간"
              />
            )}

            {metrics.domContentLoaded !== undefined && (
              <MetricItem
                name="DOMContentLoaded"
                value={metrics.domContentLoaded}
                unit="ms"
                threshold={2000}
                description="DOM 콘텐츠 로딩 완료"
              />
            )}

            {metrics.firstPaint !== undefined && (
              <MetricItem
                name="First Paint"
                value={metrics.firstPaint}
                unit="ms"
                threshold={1000}
                description="첫 화면 렌더링"
              />
            )}
          </div>
        )}

        {/* API 응답 시간 */}
        {metrics.apiResponseTime !== undefined && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2">API 성능</h3>
            <MetricItem
              name="API 응답 시간"
              value={metrics.apiResponseTime}
              unit="ms"
              threshold={500}
              description="마지막 API 호출 응답 시간"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 메트릭 항목 컴포넌트
 */
interface MetricItemProps {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  description?: string;
  isDecimal?: boolean;
}

function MetricItem({
  name,
  value,
  unit,
  threshold,
  description,
  isDecimal = false,
}: MetricItemProps) {
  const rating = getRating(value, threshold);
  const displayValue = isDecimal ? value.toFixed(3) : Math.round(value).toLocaleString();

  return (
    <div className="p-2 bg-muted/50 rounded border">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{name}</span>
          {getRatingIcon(rating)}
        </div>
        <span
          className={`text-sm font-bold ${
            rating === "good"
              ? "text-green-600"
              : rating === "needs-improvement"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {displayValue}
          {unit && <span className="text-xs ml-1">{unit}</span>}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              rating === "good"
                ? "bg-green-500"
                : rating === "needs-improvement"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(100, (value / threshold) * 100)}%`,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          목표: &lt; {threshold.toLocaleString()}
          {unit}
        </span>
      </div>
    </div>
  );
}

/**
 * 메트릭 등급 판정
 */
function getRating(
  value: number,
  threshold: number,
): "good" | "needs-improvement" | "poor" {
  if (value <= threshold) return "good";
  if (value <= threshold * 1.5) return "needs-improvement";
  return "poor";
}

/**
 * 등급 아이콘 반환
 */
function getRatingIcon(rating: "good" | "needs-improvement" | "poor") {
  switch (rating) {
    case "good":
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    case "needs-improvement":
      return <Minus className="h-3 w-3 text-yellow-600" />;
    case "poor":
      return <TrendingDown className="h-3 w-3 text-red-600" />;
  }
}

