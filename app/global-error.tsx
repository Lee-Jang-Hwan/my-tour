/**
 * @file global-error.tsx
 * @description 루트 레벨 전역 에러 바운더리
 *
 * 루트 레이아웃 자체에서 발생하는 에러를 처리하는 최상위 에러 바운더리입니다.
 * 레이아웃이 깨진 경우를 대비하여 HTML 구조를 포함한 독립적인 에러 페이지입니다.
 *
 * 주요 기능:
 * 1. 루트 레이아웃에서 발생하는 치명적인 에러 처리
 * 2. 최소한의 UI로 에러 표시 (레이아웃 의존성 없음)
 * 3. 사용자에게 문제 상황 안내 및 해결 방법 제시
 *
 * @dependencies
 * - 독립적인 HTML 구조 (레이아웃 컴포넌트 사용 불가)
 */

"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 로깅 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      console.error("루트 레벨 에러 발생:", error);
      console.error("에러 상세:", {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }

    // 향후 에러 모니터링 서비스 연동을 위한 구조 준비
  }, [error]);

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>오류 발생 - My Trip</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #f8f9fa;
            color: #212529;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .error-container {
            max-width: 500px;
            width: 100%;
            background: white;
            border-radius: 0.75rem;
            padding: 2rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            text-align: center;
          }
          .error-icon {
            width: 3rem;
            height: 3rem;
            margin: 0 auto 1rem;
            color: #dc3545;
          }
          .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #212529;
          }
          .error-message {
            color: #6c757d;
            margin-bottom: 1rem;
            line-height: 1.5;
          }
          .error-code {
            font-size: 0.75rem;
            color: #6c757d;
            margin-top: 0.5rem;
          }
          .button-group {
            display: flex;
            gap: 0.5rem;
            margin-top: 1.5rem;
          }
          .button {
            flex: 1;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            text-decoration: none;
            display: inline-block;
          }
          .button-primary {
            background-color: #0d6efd;
            color: white;
          }
          .button-primary:hover {
            background-color: #0b5ed7;
          }
          .button-secondary {
            background-color: white;
            color: #212529;
            border: 1px solid #dee2e6;
          }
          .button-secondary:hover {
            background-color: #f8f9fa;
          }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          <svg
            className="error-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="error-title">심각한 오류가 발생했습니다</h1>
          <p className="error-message">
            {error.message ||
              "애플리케이션에서 예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."}
          </p>
          {error.digest && (
            <p className="error-code">오류 코드: {error.digest}</p>
          )}
          <div className="button-group">
            <button onClick={reset} className="button button-secondary">
              다시 시도
            </button>
            <a href="/" className="button button-primary">
              홈으로 가기
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

