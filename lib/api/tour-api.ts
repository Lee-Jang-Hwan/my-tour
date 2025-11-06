/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 이 모듈은 한국관광공사 KorService2 API를 호출하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광정보 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 공통 정보 조회 (detailCommon2)
 * 5. 소개 정보 조회 (detailIntro2)
 * 6. 이미지 목록 조회 (detailImage2)
 *
 * 핵심 구현 로직:
 * - 공통 파라미터 처리 (serviceKey, MobileOS, MobileApp, _type)
 * - 에러 처리 및 재시도 로직
 * - 타입 안전한 API 호출
 * - 사용자 친화적인 에러 메시지 제공
 *
 * 캐싱 전략:
 * - 서버 사이드: Next.js fetch 캐싱 사용 (revalidate: 3600초 = 1시간)
 *   - 서버 컴포넌트에서 호출 시 자동으로 캐시됨
 *   - 동일한 요청은 1시간 동안 캐시된 응답 반환
 *   - ISR (Incremental Static Regeneration) 방식으로 작동
 *   - 캐시 무효화: 1시간 후 자동으로 재검증
 * - 클라이언트 사이드: 브라우저 캐시 활용
 *   - fetch API의 기본 캐싱 동작 활용
 *   - 필요 시 추가적인 클라이언트 사이드 캐싱 구현 가능 (예: React Query, SWR)
 *
 * 성능 최적화:
 * - 서버 사이드 캐싱으로 API 호출 횟수 최소화
 * - 재시도 로직으로 일시적 네트워크 오류 처리
 * - 지수 백오프로 서버 부하 방지
 *
 * @dependencies
 * - 한국관광공사 공공 API (KorService2)
 * - @/lib/utils/error-handler: 공통 에러 처리 유틸리티
 *
 * @see {@link /docs/PRD.md#4-api-명세} - API 명세 참조
 * @see {@link /docs/TODO.md#5-4-성능-최적화} - 성능 최적화 체크리스트
 */

import { formatError, logError } from "@/lib/utils/error-handler";

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

// 공통 기본 파라미터
const DEFAULT_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

/**
 * API 키 가져오기 (클라이언트 또는 서버 사이드)
 */
function getApiKey(): string {
  // 클라이언트 사이드: NEXT_PUBLIC_TOUR_API_KEY
  if (typeof window !== "undefined") {
    const key = process.env.NEXT_PUBLIC_TOUR_API_KEY;
    if (!key) {
      throw new Error(
        "NEXT_PUBLIC_TOUR_API_KEY 환경변수가 설정되지 않았습니다."
      );
    }
    return key;
  }

  // 서버 사이드: TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY
  const serverKey = process.env.TOUR_API_KEY;
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;

  const apiKey = serverKey || publicKey;
  if (!apiKey) {
    throw new Error(
      "TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 환경변수가 설정되지 않았습니다."
    );
  }
  return apiKey;
}

/**
 * API 호출 공통 함수
 * @param endpoint API 엔드포인트
 * @param params 추가 파라미터
 * @param retries 재시도 횟수 (기본값: 3)
 */
async function fetchTourAPI<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  retries: number = 3
): Promise<T> {
  const apiKey = getApiKey();

  // 공통 파라미터 + 추가 파라미터 조합
  const queryParams = new URLSearchParams({
    ...DEFAULT_PARAMS,
    serviceKey: apiKey,
    ...Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ),
  } as Record<string, string>);

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // 캐시 설정 (서버 사이드에서만 동작)
        ...(typeof window === "undefined" && {
          next: { revalidate: 3600 }, // 1시간 캐시
        }),
      });

      if (!response.ok) {
        // HTTP 에러 상태 코드 처리
        if (response.status === 401 || response.status === 403) {
          const error = new Error("API 인증 실패: API 키를 확인해주세요.");
          logError(error, `fetchTourAPI - ${endpoint}`);
          throw error;
        }
        if (response.status === 429) {
          const error = new Error(
            `API 호출 제한 초과: 잠시 후 다시 시도해주세요.`
          );
          logError(error, `fetchTourAPI - ${endpoint}`);
          throw error;
        }
        if (response.status >= 500) {
          const error = new Error(
            `서버 에러: 잠시 후 다시 시도해주세요.`
          );
          logError(error, `fetchTourAPI - ${endpoint}`);
          throw error;
        }
        const error = new Error(`데이터를 불러오는 중 오류가 발생했습니다.`);
        logError(error, `fetchTourAPI - ${endpoint}`);
        throw error;
      }

      const data = await response.json();

      // 한국관광공사 API 응답 구조 확인
      if (data.response?.header) {
        const resultCode = data.response.header.resultCode;
        const resultMsg = data.response.header.resultMsg;

        if (resultCode !== "0000") {
          // API 에러 코드 처리
          let error: Error;
          if (resultCode === "SERVICE_KEY_NOT_REGISTERED") {
            error = new Error("API 인증에 실패했습니다. 관리자에게 문의해주세요.");
          } else if (resultCode === "SERVICE_KEY_IS_NOT_VALID") {
            error = new Error("API 인증에 실패했습니다. 관리자에게 문의해주세요.");
          } else if (resultCode === "NO_MANDATORY_REQUEST_PARAMETERS_ERROR") {
            error = new Error("입력한 정보를 확인해주세요. 필수 항목이 누락되었습니다.");
          } else {
            error = new Error(formatError(new Error(`API 에러 (${resultCode}): ${resultMsg}`)));
          }
          logError(error, `fetchTourAPI - ${endpoint} - ${resultCode}`);
          throw error;
        }
      }

      return data as T;
    } catch (error) {
      const caughtError = error instanceof Error ? error : new Error(String(error));
      lastError = caughtError;

      // 네트워크 에러는 재시도, 인증/검증 에러는 즉시 중단
      if (
        caughtError.message.includes("인증") ||
        caughtError.message.includes("API 키") ||
        caughtError.message.includes("필수") ||
        caughtError.message.includes("누락")
      ) {
        // 인증/검증 에러는 사용자 친화적인 메시지로 변환하여 즉시 throw
        throw caughtError;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 지수 백오프 (최대 5초)
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // 모든 재시도 실패 - 사용자 친화적인 메시지로 변환
  if (lastError) {
    const userFriendlyError = new Error(formatError(lastError));
    logError(userFriendlyError, `fetchTourAPI - ${endpoint} - 최종 실패`);
    throw userFriendlyError;
  }
  
  throw new Error("데이터를 불러오는 중 오류가 발생했습니다.");
}

/**
 * 지역코드 조회
 * @param areaCode 상위 지역코드 (선택 사항, 없으면 최상위 지역 목록)
 */
export async function areaCode2(areaCode?: string) {
  const params: Record<string, string | undefined> = {};
  if (areaCode) {
    params.areaCode = areaCode;
  }

  return fetchTourAPI<{
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: {
          item: Array<{
            code: string;
            name: string;
          }>;
        };
      };
    };
  }>("/areaCode2", params);
}

/**
 * 지역 기반 관광정보 조회
 * @param options 조회 옵션
 */
export async function areaBasedList2(options: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  sigunguCode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
}) {
  const {
    areaCode,
    contentTypeId,
    numOfRows = 20,
    pageNo = 1,
    sigunguCode,
    cat1,
    cat2,
    cat3,
  } = options;

  const params: Record<string, string | number | undefined> = {
    numOfRows,
    pageNo,
  };

  if (areaCode) params.areaCode = areaCode;
  if (contentTypeId) params.contentTypeId = contentTypeId;
  if (sigunguCode) params.sigunguCode = sigunguCode;
  if (cat1) params.cat1 = cat1;
  if (cat2) params.cat2 = cat2;
  if (cat3) params.cat3 = cat3;

  return fetchTourAPI<{
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: {
          item: Array<{
            addr1: string;
            addr2?: string;
            areacode: string;
            contentid: string;
            contenttypeid: string;
            title: string;
            mapx: string;
            mapy: string;
            firstimage?: string;
            firstimage2?: string;
            tel?: string;
            cat1?: string;
            cat2?: string;
            cat3?: string;
            modifiedtime: string;
          }>;
        };
        numOfRows: number;
        pageNo: number;
        totalCount: number;
      };
    };
  }>("/areaBasedList2", params);
}

/**
 * 키워드 검색
 * @param options 검색 옵션
 */
export async function searchKeyword2(options: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  listYN?: "Y" | "N";
  arrange?: "A" | "B" | "C" | "D" | "E" | "O";
  cat1?: string;
  cat2?: string;
  cat3?: string;
}) {
  const {
    keyword,
    areaCode,
    contentTypeId,
    numOfRows = 20,
    pageNo = 1,
    listYN = "Y",
    arrange,
    cat1,
    cat2,
    cat3,
  } = options;

  if (!keyword || keyword.trim().length === 0) {
    const error = new Error("검색어를 입력해주세요.");
    logError(error, "searchKeyword2");
    throw error;
  }

  const params: Record<string, string | number | undefined> = {
    keyword: keyword.trim(),
    numOfRows,
    pageNo,
    listYN,
  };

  if (areaCode) params.areaCode = areaCode;
  if (contentTypeId) params.contentTypeId = contentTypeId;
  if (arrange) params.arrange = arrange;
  if (cat1) params.cat1 = cat1;
  if (cat2) params.cat2 = cat2;
  if (cat3) params.cat3 = cat3;

  return fetchTourAPI<{
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: {
          item: Array<{
            addr1: string;
            addr2?: string;
            areacode: string;
            contentid: string;
            contenttypeid: string;
            title: string;
            mapx: string;
            mapy: string;
            firstimage?: string;
            firstimage2?: string;
            tel?: string;
            cat1?: string;
            cat2?: string;
            cat3?: string;
            modifiedtime: string;
          }>;
        };
        numOfRows: number;
        pageNo: number;
        totalCount: number;
      };
    };
  }>("/searchKeyword2", params);
}

/**
 * 공통 정보 조회 (상세페이지 기본 정보)
 * @param contentId 콘텐츠 ID
 */
export async function detailCommon2(contentId: string) {
  if (!contentId || contentId.trim().length === 0) {
    const error = new Error("관광지 정보를 찾을 수 없습니다.");
    logError(error, "detailCommon2");
    throw error;
  }

  return fetchTourAPI<{
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: {
          item: Array<{
            contentid: string;
            contenttypeid: string;
            title: string;
            addr1: string;
            addr2?: string;
            zipcode?: string;
            tel?: string;
            homepage?: string;
            overview?: string;
            firstimage?: string;
            firstimage2?: string;
            mapx: string;
            mapy: string;
            cat1?: string;
            cat2?: string;
            cat3?: string;
            cpyrhtDivCd?: string;
            modifiedtime: string;
          }>;
        };
      };
    };
  }>("/detailCommon2", { contentId: contentId.trim() });
}

/**
 * 소개 정보 조회 (상세페이지 운영 정보)
 * @param contentId 콘텐츠 ID
 * @param contentTypeId 콘텐츠 타입 ID
 */
export async function detailIntro2(
  contentId: string,
  contentTypeId: string
) {
  if (!contentId || contentId.trim().length === 0) {
    const error = new Error("관광지 정보를 찾을 수 없습니다.");
    logError(error, "detailCommon2");
    throw error;
  }
  if (!contentTypeId || contentTypeId.trim().length === 0) {
    const error = new Error("관광지 정보를 찾을 수 없습니다.");
    logError(error, "detailIntro2");
    throw error;
  }

  return fetchTourAPI<{
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: {
          item: Array<Record<string, string | undefined>>;
        };
      };
    };
  }>("/detailIntro2", {
    contentId: contentId.trim(),
    contentTypeId: contentTypeId.trim(),
  });
}

/**
 * 이미지 목록 조회
 * @param contentId 콘텐츠 ID
 */
export async function detailImage2(contentId: string) {
  if (!contentId || contentId.trim().length === 0) {
    const error = new Error("관광지 정보를 찾을 수 없습니다.");
    logError(error, "detailImage2");
    throw error;
  }

  return fetchTourAPI<{
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: {
          item: Array<{
            contentid: string;
            originimgurl?: string;
            serialnum: string;
            smallimageurl?: string;
            imgname?: string;
          }>;
        };
      };
    };
  }>("/detailImage2", { contentId: contentId.trim() });
}

