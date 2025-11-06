/**
 * @file tour.ts
 * @description 한국관광공사 API 응답 타입 정의
 *
 * 이 모듈은 한국관광공사 KorService2 API의 응답 데이터를 타입 안전하게 처리하기 위한
 * TypeScript 타입 정의를 제공합니다.
 *
 * 주요 타입:
 * 1. TourItem - 관광지 목록 조회 응답 (areaBasedList2, searchKeyword2)
 * 2. TourDetail - 상세정보 조회 응답 (detailCommon2)
 * 3. TourIntro - 소개정보 조회 응답 (detailIntro2)
 * 4. TourImage - 이미지 목록 조회 응답 (detailImage2)
 * 5. ContentTypeId - 관광 타입 ID (union 타입)
 * 6. AreaCode - 지역 코드 타입
 *
 * @dependencies
 * - 한국관광공사 공공 API (KorService2)
 *
 * @see {@link /docs/PRD.md#4-api-명세} - API 명세 참조
 * @see {@link /docs/PRD.md#5-데이터-구조} - 데이터 구조 참조
 */

/**
 * 관광 타입 ID
 * 한국관광공사 API에서 사용하는 콘텐츠 타입 구분
 */
export type ContentTypeId =
  | "12" // 관광지
  | "14" // 문화시설
  | "15" // 축제/행사
  | "25" // 여행코스
  | "28" // 레포츠
  | "32" // 숙박
  | "38" // 쇼핑
  | "39"; // 음식점

/**
 * 지역 코드
 * 한국관광공사 API의 지역코드 (시/도 단위)
 */
export type AreaCode = string;

/**
 * 관광지 목록 정렬 옵션
 * - latest: modifiedtime 기준 최신순 (내림차순)
 * - name: title 기준 가나다순 (오름차순)
 */
export type SortOption = "latest" | "name";

/**
 * 관광지 목록 항목
 * areaBasedList2, searchKeyword2 API의 응답 데이터 구조
 */
export interface TourItem {
  /** 주소 (필수) */
  addr1: string;
  /** 상세주소 (선택) */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠 ID (관광지 고유 식별자) */
  contentid: string;
  /** 콘텐츠 타입 ID (ContentTypeId) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형 - 10000000으로 나누어 변환) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형 - 10000000으로 나누어 변환) */
  mapy: string;
  /** 대표이미지1 (URL, 선택) */
  firstimage?: string;
  /** 대표이미지2 (URL, 선택) */
  firstimage2?: string;
  /** 전화번호 (선택) */
  tel?: string;
  /** 대분류 카테고리 (선택) */
  cat1?: string;
  /** 중분류 카테고리 (선택) */
  cat2?: string;
  /** 소분류 카테고리 (선택) */
  cat3?: string;
  /** 수정일시 (YYYYMMDDHHmmss 형식) */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보
 * detailCommon2 API의 응답 데이터 구조
 */
export interface TourDetail {
  /** 콘텐츠 ID (관광지 고유 식별자) */
  contentid: string;
  /** 콘텐츠 타입 ID (ContentTypeId) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 (필수) */
  addr1: string;
  /** 상세주소 (선택) */
  addr2?: string;
  /** 우편번호 (선택) */
  zipcode?: string;
  /** 전화번호 (선택) */
  tel?: string;
  /** 홈페이지 URL (선택) */
  homepage?: string;
  /** 개요 (긴 설명문, 선택) */
  overview?: string;
  /** 대표이미지1 (URL, 선택) */
  firstimage?: string;
  /** 대표이미지2 (URL, 선택) */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계, 정수형 - 10000000으로 나누어 변환) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형 - 10000000으로 나누어 변환) */
  mapy: string;
  /** 대분류 카테고리 (선택) */
  cat1?: string;
  /** 중분류 카테고리 (선택) */
  cat2?: string;
  /** 소분류 카테고리 (선택) */
  cat3?: string;
  /** 저작권 구분 코드 (선택) */
  cpyrhtDivCd?: string;
  /** 수정일시 (YYYYMMDDHHmmss 형식) */
  modifiedtime: string;
}

/**
 * 관광지 소개 정보
 * detailIntro2 API의 응답 데이터 구조
 *
 * 주의: contentTypeId에 따라 반환되는 필드가 다릅니다.
 * 공통 필드: contentid, contenttypeid
 * 타입별 필드 예시:
 * - usetime: 이용시간
 * - restdate: 휴무일
 * - infocenter: 문의처
 * - parking: 주차 가능 여부
 * - chkpet: 반려동물 동반 가능 여부
 */
export interface TourIntro {
  /** 콘텐츠 ID (관광지 고유 식별자) */
  contentid: string;
  /** 콘텐츠 타입 ID (ContentTypeId) */
  contenttypeid: string;
  /** 기타 타입별 필드들 (동적으로 추가됨) */
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 정보
 * detailImage2 API의 응답 데이터 구조
 */
export interface TourImage {
  /** 콘텐츠 ID (관광지 고유 식별자) */
  contentid: string;
  /** 원본 이미지 URL (선택) */
  originimgurl?: string;
  /** 이미지 일련번호 */
  serialnum: string;
  /** 썸네일 이미지 URL (선택) */
  smallimageurl?: string;
  /** 이미지명 (선택) */
  imgname?: string;
}
