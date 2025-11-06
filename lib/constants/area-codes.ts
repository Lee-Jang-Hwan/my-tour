/**
 * @file area-codes.ts
 * @description 한국관광공사 API 지역 코드 상수 정의
 *
 * 이 모듈은 한국관광공사 KorService2 API에서 사용하는 지역 코드 상수를 제공합니다.
 *
 * 주의사항:
 * - 지역 코드는 areaCode2 API를 통해 동적으로 조회하는 것을 권장합니다.
 * - 이 파일은 기본적인 구조만 제공하며, 필요시 확장 가능합니다.
 *
 * 주요 기능:
 * - 주요 시/도 지역 코드 상수 정의
 * - 지역 코드와 지역명 매핑
 *
 * @dependencies
 * - lib/types/tour.ts의 AreaCode 타입
 *
 * @see {@link /docs/PRD.md#2-1-관광지-목록--지역타입-필터} - 지역 필터 명세
 * @see {@link lib/api/tour-api.ts#areaCode2} - 지역코드 조회 API
 */

import type { AreaCode } from "../types/tour";

/**
 * 지역 정보 인터페이스
 */
export interface AreaCodeInfo {
  /** 지역 코드 */
  code: AreaCode;
  /** 지역명 (시/도) */
  name: string;
}

/**
 * 주요 지역 코드 상수
 * 
 * 주의: 이는 하드코딩된 일부 지역 코드이며,
 * 전체 목록은 areaCode2 API를 통해 동적으로 조회하는 것을 권장합니다.
 */
export const AREA_CODES: Record<string, AreaCodeInfo> = {
  "1": {
    code: "1",
    name: "서울",
  },
  "2": {
    code: "2",
    name: "인천",
  },
  "3": {
    code: "3",
    name: "대전",
  },
  "4": {
    code: "4",
    name: "대구",
  },
  "5": {
    code: "5",
    name: "광주",
  },
  "6": {
    code: "6",
    name: "부산",
  },
  "7": {
    code: "7",
    name: "울산",
  },
  "8": {
    code: "8",
    name: "세종특별자치시",
  },
  "31": {
    code: "31",
    name: "경기도",
  },
  "32": {
    code: "32",
    name: "강원도",
  },
  "33": {
    code: "33",
    name: "충청북도",
  },
  "34": {
    code: "34",
    name: "충청남도",
  },
  "35": {
    code: "35",
    name: "경상북도",
  },
  "36": {
    code: "36",
    name: "경상남도",
  },
  "37": {
    code: "37",
    name: "전라북도",
  },
  "38": {
    code: "38",
    name: "전라남도",
  },
  "39": {
    code: "39",
    name: "제주도",
  },
} as const;

/**
 * 모든 지역 코드 배열
 */
export const AREA_CODE_LIST: AreaCodeInfo[] = Object.values(AREA_CODES);

/**
 * 지역 코드로 지역명 조회
 * @param areaCode 지역 코드
 * @returns 지역명 또는 undefined
 */
export function getAreaName(areaCode: AreaCode): string | undefined {
  return AREA_CODES[areaCode]?.name;
}

/**
 * 지역 코드로 정보 조회
 * @param areaCode 지역 코드
 * @returns AreaCodeInfo 또는 undefined
 */
export function getAreaInfo(areaCode: AreaCode): AreaCodeInfo | undefined {
  return AREA_CODES[areaCode];
}

