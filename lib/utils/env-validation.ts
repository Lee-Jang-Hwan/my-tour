/**
 * @file env-validation.ts
 * @description 환경변수 보안 검증 유틸리티
 *
 * 이 모듈은 애플리케이션 시작 시 필수 환경변수가 올바르게 설정되었는지 검증합니다.
 *
 * 주요 기능:
 * 1. 필수 환경변수 존재 여부 확인
 * 2. 서버/클라이언트 환경 구분
 * 3. NEXT_PUBLIC_ 접두사 검증 (서버 전용 키는 접두사 없어야 함)
 * 4. 개발/프로덕션 환경별 검증 규칙
 * 5. 누락된 환경변수 목록 반환
 *
 * 보안 고려사항:
 * - 서버 전용 키는 절대 클라이언트에 노출되지 않도록 검증
 * - NEXT_PUBLIC_ 접두사가 있는 변수만 클라이언트에서 접근 가능
 * - 환경변수 값은 검증 로그에 출력하지 않음 (보안)
 *
 * @dependencies
 * - Node.js process.env
 *
 * @see {@link /docs/PRD.md#8-4-보안-및-환경변수} - 환경변수 명세
 * @see {@link /docs/TODO.md#5-5-환경변수-및-보안} - 보안 체크리스트
 */

/**
 * 환경변수 타입 정의
 */
export interface EnvVariable {
  /** 환경변수 이름 */
  name: string;
  /** 설명 */
  description: string;
  /** 클라이언트 노출 가능 여부 (NEXT_PUBLIC_ 접두사) */
  isPublic: boolean;
  /** 필수 여부 */
  required: boolean;
  /** 서버 사이드에서만 필요한지 여부 */
  serverOnly?: boolean;
}

/**
 * 필수 환경변수 목록 정의
 * PRD.md와 AGENTS.md 기반
 */
export const REQUIRED_ENV_VARIABLES: EnvVariable[] = [
  // Clerk Authentication
  {
    name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    description: "Clerk 인증 공개 키 (클라이언트 노출 가능)",
    isPublic: true,
    required: true,
  },
  {
    name: "CLERK_SECRET_KEY",
    description: "Clerk 인증 비밀 키 (서버 전용)",
    isPublic: false,
    required: true,
    serverOnly: true,
  },
  // Supabase
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Supabase 프로젝트 URL (클라이언트 노출 가능)",
    isPublic: true,
    required: true,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Supabase Anon 키 (클라이언트 노출 가능)",
    isPublic: true,
    required: true,
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Supabase Service Role 키 (서버 전용)",
    isPublic: false,
    required: true,
    serverOnly: true,
  },
  {
    name: "NEXT_PUBLIC_STORAGE_BUCKET",
    description: "Supabase Storage 버킷 이름 (클라이언트 노출 가능)",
    isPublic: true,
    required: true,
  },
  // 한국관광공사 API
  {
    name: "NEXT_PUBLIC_TOUR_API_KEY",
    description: "한국관광공사 API 키 (클라이언트 노출 가능, 기본 사용)",
    isPublic: true,
    required: false, // TOUR_API_KEY가 있으면 선택사항
  },
  {
    name: "TOUR_API_KEY",
    description:
      "한국관광공사 API 키 (서버 전용, NEXT_PUBLIC_TOUR_API_KEY 대체용)",
    isPublic: false,
    required: false, // NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나는 필수
    serverOnly: true,
  },
  // 네이버 지도 API
  {
    name: "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID",
    description: "네이버 지도 API 클라이언트 ID (클라이언트 노출 가능)",
    isPublic: true,
    required: true,
  },
];

/**
 * 환경변수 검증 결과
 */
export interface ValidationResult {
  /** 검증 성공 여부 */
  isValid: boolean;
  /** 누락된 필수 환경변수 목록 */
  missing: EnvVariable[];
  /** 잘못된 접두사 사용 (서버 전용 키에 NEXT_PUBLIC_ 접두사 사용) */
  invalidPrefix: EnvVariable[];
  /** 경고 메시지 (선택사항 환경변수 누락 등) */
  warnings: string[];
}

/**
 * 환경변수 검증 함수
 * @param isServer 서버 사이드에서 실행되는지 여부
 * @returns 검증 결과
 */
export function validateEnvVariables(
  isServer: boolean = true,
): ValidationResult {
  const missing: EnvVariable[] = [];
  const invalidPrefix: EnvVariable[] = [];
  const warnings: string[] = [];

  // 서버 전용 변수는 서버 사이드에서만 검증
  const variablesToCheck = isServer
    ? REQUIRED_ENV_VARIABLES
    : REQUIRED_ENV_VARIABLES.filter((v) => !v.serverOnly);

  for (const envVar of variablesToCheck) {
    const value = process.env[envVar.name];

    // 필수 변수 검증
    if (envVar.required && !value) {
      missing.push(envVar);
      continue;
    }

    // 서버 전용 변수에 NEXT_PUBLIC_ 접두사가 있는지 확인
    if (envVar.serverOnly && envVar.name.startsWith("NEXT_PUBLIC_")) {
      invalidPrefix.push(envVar);
    }

    // 값이 있지만 서버 전용인데 NEXT_PUBLIC_ 접두사가 있는지 확인
    if (value && envVar.serverOnly && envVar.name.startsWith("NEXT_PUBLIC_")) {
      invalidPrefix.push(envVar);
    }
  }

  // 한국관광공사 API 키: NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나는 필수
  const tourApiKeyPublic = process.env.NEXT_PUBLIC_TOUR_API_KEY;
  const tourApiKeyServer = process.env.TOUR_API_KEY;
  if (!tourApiKeyPublic && !tourApiKeyServer) {
    warnings.push(
      "한국관광공사 API 키가 누락되었습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나를 설정하세요.",
    );
  }

  // 서버 사이드에서만 검증: 서버 전용 키가 클라이언트에 노출되지 않았는지 확인
  if (isServer) {
    const serverOnlyVars = REQUIRED_ENV_VARIABLES.filter((v) => v.serverOnly);
    for (const envVar of serverOnlyVars) {
      // NEXT_PUBLIC_ 접두사가 있는 서버 전용 변수는 잘못된 설정
      if (envVar.name.startsWith("NEXT_PUBLIC_")) {
        invalidPrefix.push(envVar);
      }
    }
  }

  return {
    isValid: missing.length === 0 && invalidPrefix.length === 0,
    missing,
    invalidPrefix,
    warnings,
  };
}

/**
 * 환경변수 검증 및 에러 처리
 * 개발 환경에서는 상세 에러 메시지를 표시하고,
 * 프로덕션 환경에서는 로그만 기록합니다.
 *
 * @param isServer 서버 사이드에서 실행되는지 여부
 * @throws Error 개발 환경에서 필수 환경변수가 누락된 경우
 */
export function validateAndThrow(isServer: boolean = true): void {
  const result = validateEnvVariables(isServer);
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!result.isValid) {
    const errorMessages: string[] = [];

    if (result.missing.length > 0) {
      errorMessages.push("\n❌ 누락된 필수 환경변수:");
      result.missing.forEach((envVar) => {
        errorMessages.push(`  - ${envVar.name} (${envVar.description})`);
      });
    }

    if (result.invalidPrefix.length > 0) {
      errorMessages.push(
        "\n⚠️  보안 경고: 서버 전용 키에 NEXT_PUBLIC_ 접두사가 사용되었습니다:",
      );
      result.invalidPrefix.forEach((envVar) => {
        errorMessages.push(`  - ${envVar.name} (${envVar.description})`);
      });
      errorMessages.push("  → 서버 전용 키는 클라이언트에 노출되면 안 됩니다!");
    }

    if (result.warnings.length > 0) {
      errorMessages.push("\n⚠️  경고:");
      result.warnings.forEach((warning) => {
        errorMessages.push(`  - ${warning}`);
      });
    }

    const errorMessage = `환경변수 검증 실패:${errorMessages.join(
      "\n",
    )}\n\n.env.example 파일을 참고하여 필수 환경변수를 설정하세요.`;

    if (isDevelopment) {
      // 개발 환경: 상세 에러 메시지와 함께 에러 발생
      console.error("\n" + "=".repeat(80));
      console.error("환경변수 검증 실패");
      console.error("=".repeat(80));
      console.error(errorMessage);
      console.error("=".repeat(80) + "\n");
      throw new Error(errorMessage);
    } else {
      // 프로덕션 환경: 로그만 기록 (에러 발생하지 않음)
      console.error("[환경변수 검증] 일부 환경변수가 누락되었습니다.");
      console.error(
        "[환경변수 검증] 누락된 변수:",
        result.missing.map((v) => v.name).join(", "),
      );
      if (result.invalidPrefix.length > 0) {
        console.error(
          "[환경변수 검증] 보안 경고:",
          result.invalidPrefix.map((v) => v.name).join(", "),
        );
      }
    }
  } else {
    // 검증 성공
    if (isDevelopment) {
      console.log("✅ 환경변수 검증 완료");
    }
  }
}

/**
 * 특정 환경변수가 설정되어 있는지 확인
 * @param name 환경변수 이름
 * @returns 설정 여부
 */
export function hasEnvVariable(name: string): boolean {
  return !!process.env[name];
}

/**
 * 환경변수 값 가져오기 (타입 안전)
 * @param name 환경변수 이름
 * @param defaultValue 기본값 (선택사항)
 * @returns 환경변수 값 또는 기본값
 */
export function getEnvVariable(
  name: string,
  defaultValue?: string,
): string | undefined {
  return process.env[name] ?? defaultValue;
}

/**
 * 필수 환경변수 값 가져오기 (없으면 에러 발생)
 * @param name 환경변수 이름
 * @returns 환경변수 값
 * @throws Error 환경변수가 설정되지 않은 경우
 */
export function getRequiredEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`필수 환경변수 ${name}가 설정되지 않았습니다.`);
  }
  return value;
}
