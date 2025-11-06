/**
 * @file error-handler.ts
 * @description 공통 에러 처리 유틸리티
 *
 * 애플리케이션 전반에서 사용하는 공통 에러 처리 유틸리티입니다.
 * 에러 타입을 분류하고 사용자 친화적인 메시지로 변환합니다.
 *
 * 주요 기능:
 * 1. 에러 타입 분류 (네트워크, API, 인증, 데이터 없음 등)
 * 2. 사용자 친화적인 에러 메시지 변환
 * 3. 에러 로깅 및 모니터링 준비
 *
 * @dependencies
 * - 없음 (순수 유틸리티 함수)
 *
 * @see {@link /docs/PRD.md#7.4-에러-처리} - 에러 처리 요구사항 참조
 */

/**
 * 에러 타입 분류
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  API = "API",
  AUTH = "AUTH",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * 에러 정보 인터페이스
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  originalError?: Error;
}

/**
 * 에러 타입 판별 함수
 */
export function getErrorType(error: Error | unknown): ErrorType {
  if (!(error instanceof Error)) {
    return ErrorType.UNKNOWN;
  }

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // 네트워크 에러
  if (
    name === "networkerror" ||
    name === "typeerror" ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed")
  ) {
    return ErrorType.NETWORK;
  }

  // 인증 에러
  if (
    message.includes("인증") ||
    message.includes("api 키") ||
    message.includes("authentication") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return ErrorType.AUTH;
  }

  // API 에러
  if (
    message.includes("api 에러") ||
    message.includes("api 호출") ||
    message.includes("resultcode") ||
    message.includes("service_key")
  ) {
    return ErrorType.API;
  }

  // 검증 에러
  if (
    message.includes("필수 파라미터") ||
    message.includes("validation") ||
    message.includes("invalid")
  ) {
    return ErrorType.VALIDATION;
  }

  // 404 에러
  if (
    message.includes("not found") ||
    message.includes("찾을 수 없") ||
    message.includes("존재하지 않")
  ) {
    return ErrorType.NOT_FOUND;
  }

  // 서버 에러
  if (
    message.includes("서버 에러") ||
    message.includes("server error") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503")
  ) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * 사용자 친화적인 에러 메시지 변환
 */
export function getUserFriendlyMessage(
  error: Error | unknown,
  errorType?: ErrorType
): string {
  const type = errorType || getErrorType(error);
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  switch (type) {
    case ErrorType.NETWORK:
      return "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";

    case ErrorType.AUTH:
      if (errorMessage.includes("API 키")) {
        return "API 인증에 실패했습니다. 관리자에게 문의해주세요.";
      }
      return "인증에 실패했습니다. 다시 로그인해주세요.";

    case ErrorType.API:
      if (errorMessage.includes("호출 제한")) {
        return "API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요.";
      }
      if (errorMessage.includes("서버 에러")) {
        return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }
      return "데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    case ErrorType.VALIDATION:
      return "입력한 정보를 확인해주세요. 필수 항목이 누락되었거나 형식이 올바르지 않습니다.";

    case ErrorType.NOT_FOUND:
      return "요청하신 정보를 찾을 수 없습니다.";

    case ErrorType.SERVER:
      return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

    case ErrorType.UNKNOWN:
    default:
      return "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 에러 정보 생성 함수
 */
export function getErrorInfo(error: Error | unknown): ErrorInfo {
  const type = getErrorType(error);
  const originalError = error instanceof Error ? error : undefined;
  const userMessage = getUserFriendlyMessage(error, type);

  // 재시도 가능 여부 판단
  const canRetry =
    type === ErrorType.NETWORK ||
    type === ErrorType.API ||
    type === ErrorType.SERVER;

  return {
    type,
    message: originalError?.message || String(error),
    userMessage,
    canRetry,
    originalError,
  };
}

/**
 * 에러 로깅 함수 (개발 환경)
 */
export function logError(error: Error | unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    const errorInfo = getErrorInfo(error);
    console.group(`🚨 에러 발생${context ? ` - ${context}` : ""}`);
    console.error("에러 타입:", errorInfo.type);
    console.error("에러 메시지:", errorInfo.message);
    console.error("사용자 메시지:", errorInfo.userMessage);
    if (errorInfo.originalError) {
      console.error("원본 에러:", errorInfo.originalError);
    }
    console.groupEnd();
  }

  // 향후 에러 모니터링 서비스 연동을 위한 구조 준비
  // 예: Sentry.captureException(error, { contexts: { custom: { context } } });
}

/**
 * 에러를 사용자 친화적인 메시지로 변환하는 헬퍼 함수
 */
export function formatError(error: Error | unknown): string {
  return getUserFriendlyMessage(error);
}

/**
 * 재시도 가능한 에러인지 확인하는 헬퍼 함수
 */
export function isRetryableError(error: Error | unknown): boolean {
  return getErrorInfo(error).canRetry;
}

