/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 이 컴포넌트는 관광지의 기본 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 관광지명 표시 (대제목)
 * 2. 대표 이미지 표시 (크게)
 * 3. 주소 표시 및 복사 기능
 * 4. 전화번호 표시 및 클릭 시 전화 연결 (tel: 링크)
 * 5. 홈페이지 표시 (링크)
 * 6. 개요 표시 (긴 설명문)
 * 7. 관광 타입 및 카테고리 뱃지 표시
 * 8. 정보 없는 항목 숨김 처리
 *
 * 핵심 구현 로직:
 * - TourDetail 타입을 props로 받아 표시
 * - 클라이언트 컴포넌트 (클립보드 API 및 토스트 사용)
 * - 주소 복사 기능 (navigator.clipboard.writeText)
 * - 카드 기반 레이아웃으로 섹션 구분
 *
 * @dependencies
 * - lib/types/tour.ts: TourDetail 타입
 * - lib/constants/content-types.ts: getContentTypeName 함수
 * - components/ui/card.tsx: Card 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - next/image: Next.js Image 컴포넌트
 * - lucide-react: 아이콘
 * - sonner: 토스트 메시지
 *
 * @see {@link /docs/PRD.md#2-4-1-기본-정보-섹션} - 기능 명세
 * @see {@link /docs/Design.md#3-상세페이지--places-contentid---데스크톱} - 디자인 레이아웃
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Globe, Info, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/constants/content-types";
import { toast } from "sonner";

interface DetailInfoProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
}

/**
 * 관광지 기본 정보 섹션 컴포넌트
 */
export function DetailInfo({ detail }: DetailInfoProps) {
  const [copied, setCopied] = useState(false);

  // 관광 타입명 조회
  const contentTypeName = getContentTypeName(
    detail.contenttypeid as Parameters<typeof getContentTypeName>[0],
  );

  // 이미지 URL 선택 (firstimage 우선, 없으면 firstimage2)
  const imageUrl = detail.firstimage || detail.firstimage2 || null;

  // 주소 문자열 생성
  const fullAddress = [detail.addr1, detail.addr2]
    .filter(Boolean)
    .join(" ");

  /**
   * 주소 복사 기능
   */
  const handleCopyAddress = async () => {
    try {
      // 클립보드 API 사용
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullAddress);
        setCopied(true);
        toast.success("주소가 복사되었습니다.");

        // 2초 후 복사 상태 초기화
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } else {
        // 클립보드 API를 지원하지 않는 환경 (fallback)
        // 텍스트 영역을 생성하여 복사
        const textArea = document.createElement("textarea");
        textArea.value = fullAddress;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          setCopied(true);
          toast.success("주소가 복사되었습니다.");
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        } catch (err) {
          toast.error("주소 복사에 실패했습니다.");
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error("주소 복사 오류:", error);
      toast.error("주소 복사에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 대표 이미지 */}
      {imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={detail.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      )}

      {/* 관광지명 및 타입 뱃지 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{detail.title}</h1>
        {contentTypeName && (
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              {contentTypeName}
            </span>
            {/* 카테고리 정보 (있는 경우) */}
            {detail.cat1 && (
              <span className="text-sm text-muted-foreground">
                {detail.cat1}
                {detail.cat2 && ` > ${detail.cat2}`}
                {detail.cat3 && ` > ${detail.cat3}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>기본 정보</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 주소 */}
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">주소</p>
              <p className="text-base break-words">{fullAddress}</p>
              {detail.zipcode && (
                <p className="text-sm text-muted-foreground mt-1">
                  우편번호: {detail.zipcode}
                </p>
              )}
              {/* 주소 복사 버튼 */}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    주소 복사
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 전화번호 */}
          {detail.tel && (
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">전화번호</p>
                <a
                  href={`tel:${detail.tel.replace(/[^0-9]/g, "")}`}
                  className="text-base hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  {detail.tel}
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* 홈페이지 */}
          {detail.homepage && (
            <div className="flex items-start gap-2">
              <Globe className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">홈페이지</p>
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline break-all inline-flex items-center gap-2"
                >
                  {detail.homepage}
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 개요 섹션 */}
      {detail.overview && (
        <Card>
          <CardHeader>
            <CardTitle>
              <span>개요</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
              {detail.overview}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

