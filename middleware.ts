import { clerkMiddleware } from "@clerk/nextjs/server";
import { validateAndThrow } from "@/lib/utils/env-validation";

/**
 * 환경변수 검증 (서버 사이드에서만 실행)
 * 개발 환경에서는 필수 환경변수가 누락되면 에러를 발생시키고,
 * 프로덕션 환경에서는 로그만 기록합니다.
 */
try {
  validateAndThrow(true); // 서버 사이드 검증
} catch (error) {
  // 개발 환경에서만 에러를 다시 throw
  // 프로덕션에서는 로그만 기록하고 계속 진행
  if (process.env.NODE_ENV === "development") {
    throw error;
  }
}

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
