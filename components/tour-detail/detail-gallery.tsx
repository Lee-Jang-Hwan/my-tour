/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 이 컴포넌트는 관광지의 이미지 갤러리를 표시합니다.
 *
 * 주요 기능:
 * 1. 대표 이미지 + 서브 이미지 갤러리 표시
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 슬라이드 기능 (이전/다음 버튼, 키보드 네비게이션)
 * 4. 모바일 반응형 캐러셀
 * 5. 이미지 최적화 (lazy loading)
 * 6. 이미지 없으면 기본 이미지 표시
 *
 * 핵심 구현 로직:
 * - TourImage[] 타입을 props로 받아 표시
 * - 클라이언트 컴포넌트 (이미지 클릭, 모달 상태 관리)
 * - Dialog 컴포넌트로 전체화면 모달 구현
 * - 키보드 네비게이션 (좌우 화살표, ESC)
 *
 * @dependencies
 * - lib/types/tour.ts: TourImage 타입
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - next/image: Next.js Image 컴포넌트
 * - lucide-react: 아이콘
 *
 * @see {@link /docs/PRD.md#2-4-3-이미지-갤러리} - 기능 명세
 * @see {@link /docs/Design.md#3-상세페이지--places-contentid---데스크톱} - 디자인 레이아웃
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TourImage } from "@/lib/types/tour";

interface DetailGalleryProps {
  /** 관광지 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (대체 텍스트용) */
  title?: string;
}

/**
 * 관광지 이미지 갤러리 컴포넌트
 */
export function DetailGallery({ images, title = "관광지 이미지" }: DetailGalleryProps) {
  // 현재 선택된 이미지 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  // 모달 열림/닫힘 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이미지가 없으면 null 반환
  if (!images || images.length === 0) {
    return null;
  }

  // 이미지 URL 추출 함수 (originimgurl 우선, 없으면 smallimageurl)
  const getImageUrl = (image: TourImage): string | null => {
    return image.originimgurl || image.smallimageurl || null;
  };

  // 대표 이미지 (첫 번째 이미지)
  const mainImage = images[0];
  const mainImageUrl = getImageUrl(mainImage);

  // 서브 이미지 (나머지 이미지들)
  const subImages = images.slice(1);

  // 이전 이미지로 이동
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // 다음 이미지로 이동
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 특정 이미지로 이동
  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  // 키보드 네비게이션 (모달이 열려있을 때만)
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, images.length]);

  // 현재 이미지 URL
  const currentImage = images[currentIndex];
  const currentImageUrl = getImageUrl(currentImage);

  return (
    <div className="space-y-4">
      {/* 대표 이미지 */}
      {mainImageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group">
          <Image
            src={mainImageUrl}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
            onClick={() => goToImage(0)}
          />
          {/* 이미지 개수 표시 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {images.length}장
            </div>
          )}
        </div>
      )}

      {/* 썸네일 그리드 (서브 이미지들) */}
      {subImages.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {subImages.map((image, index) => {
            const imageUrl = getImageUrl(image);
            const actualIndex = index + 1; // 첫 번째 이미지 제외하므로 +1

            if (!imageUrl) return null;

            return (
              <div
                key={image.serialnum || index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
                onClick={() => goToImage(actualIndex)}
              >
                <Image
                  src={imageUrl}
                  alt={`${title} ${actualIndex + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 25vw, 150px"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 전체화면 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">닫기</span>
            </Button>

            {/* 이전 버튼 */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 bg-black/50 hover:bg-black/70 text-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
                <span className="sr-only">이전 이미지</span>
              </Button>
            )}

            {/* 다음 버튼 */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
                <span className="sr-only">다음 이미지</span>
              </Button>
            )}

            {/* 이미지 표시 */}
            {currentImageUrl && (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={currentImageUrl}
                  alt={`${title} ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  priority={currentIndex === 0}
                />
              </div>
            )}

            {/* 이미지 인덱스 표시 */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
