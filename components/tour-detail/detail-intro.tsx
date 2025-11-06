/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 이 컴포넌트는 관광지의 운영 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 운영시간/개장시간 표시
 * 2. 휴무일 표시
 * 3. 이용요금 표시
 * 4. 주차 가능 여부 표시
 * 5. 수용인원 표시
 * 6. 체험 프로그램 표시 (있는 경우)
 * 7. 유모차/반려동물 동반 가능 여부 표시
 * 8. 타입별 필드 차이 처리 (contentTypeId에 따라)
 *
 * 핵심 구현 로직:
 * - TourIntro 타입을 props로 받아 표시
 * - contentTypeId에 따라 다른 필드명 사용
 * - 정보 없는 항목 숨김 처리
 * - 카드 기반 레이아웃으로 섹션 구분
 *
 * @dependencies
 * - lib/types/tour.ts: TourIntro 타입
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: 아이콘
 *
 * @see {@link /docs/PRD.md#2-4-2-운영-정보-섹션} - 기능 명세
 * @see {@link /docs/Design.md#3-상세페이지--places-contentid---데스크톱} - 디자인 레이아웃
 */

import {
  Clock,
  X,
  DollarSign,
  Car,
  Users,
  Palette,
  Baby,
  Dog,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TourIntro } from "@/lib/types/tour";

interface DetailIntroProps {
  /** 관광지 운영 정보 */
  intro: TourIntro | null;
}

/**
 * 관광지 운영 정보 섹션 컴포넌트
 */
export function DetailIntro({ intro }: DetailIntroProps) {
  // intro가 없거나 데이터가 없으면 렌더링하지 않음
  if (!intro) {
    return null;
  }

  // 필드명 추출 (타입별로 다를 수 있음)
  const getField = (key: string): string | undefined => {
    return intro[key];
  };

  // 운영시간/개장시간
  const usetime =
    getField("usetime") || getField("opentime") || getField("usetimeculture");

  // 휴무일
  const restdate =
    getField("restdate") ||
    getField("restdateculture") ||
    getField("restdatefood");

  // 이용요금
  const usefee =
    getField("usefee") ||
    getField("usetimeleports") ||
    getField("usetimefestival");

  // 주차 가능 여부
  const parking = getField("parking");

  // 수용인원
  const accomcount =
    getField("accomcount") ||
    getField("accomcountculture") ||
    getField("accomcountlodging");

  // 체험 프로그램
  const expguide =
    getField("expguide") ||
    getField("expagerange") ||
    getField("expguideculture");

  // 문의처
  const infocenter = getField("infocenter");

  // 유모차 동반 가능 여부
  const chkbabycarriage =
    getField("chkbabycarriage") || getField("chkbabycarriageculture");

  // 반려동물 동반 가능 여부
  const chkpet = getField("chkpet") || getField("chkpetculture");

  // 표시할 정보가 하나도 없으면 렌더링하지 않음
  const hasAnyInfo =
    usetime ||
    restdate ||
    usefee ||
    parking ||
    accomcount ||
    expguide ||
    infocenter ||
    chkbabycarriage ||
    chkpet;

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span>운영 정보</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 운영시간/개장시간 */}
        {usetime && (
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">운영시간</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {usetime}
              </p>
            </div>
          </div>
        )}

        {/* 휴무일 */}
        {restdate && (
          <div className="flex items-start gap-2">
            <X className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">휴무일</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {restdate}
              </p>
            </div>
          </div>
        )}

        {/* 이용요금 */}
        {usefee && (
          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">이용요금</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {usefee}
              </p>
            </div>
          </div>
        )}

        {/* 주차 가능 여부 */}
        {parking && (
          <div className="flex items-start gap-2">
            <Car className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">주차</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {parking}
              </p>
            </div>
          </div>
        )}

        {/* 수용인원 */}
        {accomcount && (
          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">수용인원</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {accomcount}
              </p>
            </div>
          </div>
        )}

        {/* 체험 프로그램 */}
        {expguide && (
          <div className="flex items-start gap-2">
            <Palette className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">
                체험 프로그램
              </p>
              <p className="text-base break-words whitespace-pre-wrap">
                {expguide}
              </p>
            </div>
          </div>
        )}

        {/* 문의처 */}
        {infocenter && (
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">문의처</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {infocenter}
              </p>
            </div>
          </div>
        )}

        {/* 유모차 동반 가능 여부 */}
        {chkbabycarriage && (
          <div className="flex items-start gap-2">
            <Baby className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">유모차 동반</p>
              <p className="text-base break-words whitespace-pre-wrap">
                {chkbabycarriage}
              </p>
            </div>
          </div>
        )}

        {/* 반려동물 동반 가능 여부 */}
        {chkpet && (
          <div className="flex items-start gap-2">
            <Dog className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">
                반려동물 동반
              </p>
              <p className="text-base break-words whitespace-pre-wrap">
                {chkpet}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
