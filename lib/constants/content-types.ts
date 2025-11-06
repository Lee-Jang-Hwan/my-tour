/**
 * @file content-types.ts
 * @description 한국관광공사 API 관광 타입 상수 정의
 *
 * 이 모듈은 한국관광공사 KorService2 API에서 사용하는 ContentTypeId 상수와
 * 관련 정보를 제공합니다.
 *
 * 주요 기능:
 * - 관광 타입 ID와 한글명 매핑
 * - 타입별 라벨 및 정보 제공
 * - 필터링 및 UI 표시에 활용
 *
 * @dependencies
 * - lib/types/tour.ts의 ContentTypeId 타입
 *
 * @see {@link /docs/PRD.md#4-4-content-type-id-관광-타입} - Content Type ID 명세
 */

import type { ContentTypeId } from "../types/tour";

/**
 * 관광 타입 정보 인터페이스
 */
export interface ContentTypeInfo {
  /** 타입 ID (ContentTypeId) */
  id: ContentTypeId;
  /** 한글명 */
  name: string;
  /** 영어명 (선택 사항) */
  label?: string;
}

/**
 * 관광 타입 상수 객체
 * ContentTypeId를 키로 하는 맵
 */
export const CONTENT_TYPES: Record<ContentTypeId, ContentTypeInfo> = {
  "12": {
    id: "12",
    name: "관광지",
    label: "Tourist Spot",
  },
  "14": {
    id: "14",
    name: "문화시설",
    label: "Cultural Facility",
  },
  "15": {
    id: "15",
    name: "축제/행사",
    label: "Festival/Event",
  },
  "25": {
    id: "25",
    name: "여행코스",
    label: "Tour Course",
  },
  "28": {
    id: "28",
    name: "레포츠",
    label: "Leports",
  },
  "32": {
    id: "32",
    name: "숙박",
    label: "Accommodation",
  },
  "38": {
    id: "38",
    name: "쇼핑",
    label: "Shopping",
  },
  "39": {
    id: "39",
    name: "음식점",
    label: "Restaurant",
  },
} as const;

/**
 * 모든 관광 타입 ID 배열
 */
export const CONTENT_TYPE_IDS: ContentTypeId[] = Object.keys(
  CONTENT_TYPES,
) as ContentTypeId[];

/**
 * 관광 타입 정보 배열
 */
export const CONTENT_TYPE_LIST: ContentTypeInfo[] =
  Object.values(CONTENT_TYPES);

/**
 * 관광 타입 ID로 한글명 조회
 * @param contentTypeId 관광 타입 ID
 * @returns 한글명 또는 undefined
 */
export function getContentTypeName(
  contentTypeId: ContentTypeId,
): string | undefined {
  return CONTENT_TYPES[contentTypeId]?.name;
}

/**
 * 관광 타입 ID로 정보 조회
 * @param contentTypeId 관광 타입 ID
 * @returns ContentTypeInfo 또는 undefined
 */
export function getContentTypeInfo(
  contentTypeId: ContentTypeId,
): ContentTypeInfo | undefined {
  return CONTENT_TYPES[contentTypeId];
}

/**
 * 관광 타입 ID 유효성 검증
 * @param id 검증할 ID
 * @returns 유효한 ContentTypeId인지 여부
 */
export function isValidContentTypeId(id: string): id is ContentTypeId {
  return id in CONTENT_TYPES;
}
