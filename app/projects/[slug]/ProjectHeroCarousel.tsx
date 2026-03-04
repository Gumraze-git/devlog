"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ProjectHeroImage } from "../../lib/projects";

type ProjectHeroCarouselProps = {
  images: ProjectHeroImage[];
  projectTitle: string;
};

export default function ProjectHeroCarousel({ images, projectTitle }: ProjectHeroCarouselProps) {
  const normalizedImages = useMemo(
    () => images.filter((image) => typeof image.src === "string" && image.src.trim().length > 0),
    [images]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  if (normalizedImages.length === 0) return null;

  const totalImages = normalizedImages.length;
  const activeIndex = currentIndex >= totalImages ? 0 : currentIndex;
  const activeImage = normalizedImages[activeIndex];
  const showControls = totalImages > 1;
  const hasCaption = Boolean(activeImage.caption);
  const metaText = hasCaption ? activeImage.caption : `${activeIndex + 1} / ${totalImages}`;
  const showMetaRow = hasCaption || showControls;

  const moveToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const moveToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  return (
    <section className="w-full !mt-8" aria-label="프로젝트 상단 이미지 캐러셀">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)] shadow-xl shadow-black/5">
        <Image
          src={activeImage.src}
          alt={activeImage.alt || activeImage.caption || projectTitle}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
          priority
        />

        {showControls && (
          <>
            <button
              type="button"
              onClick={moveToPrevious}
              aria-label={`이전 이미지 (${activeIndex + 1}/${totalImages})`}
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-transparent text-white transition-colors hover:border-white/80 hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:left-4 md:h-10 md:w-10"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={moveToNext}
              aria-label={`다음 이미지 (${activeIndex + 1}/${totalImages})`}
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-transparent text-white transition-colors hover:border-white/80 hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:right-4 md:h-10 md:w-10"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </>
        )}

        {showMetaRow && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 py-3 md:px-5 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <p
                className={`min-w-0 truncate text-white ${hasCaption ? "text-sm font-medium md:text-base" : "text-xs font-semibold tracking-wider md:text-sm"
                  }`}
              >
                {metaText}
              </p>

              {showControls && (
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
                  {normalizedImages.map((image, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={`${image.src}-${index}`}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`${index + 1}번째 이미지`}
                        aria-current={isActive ? "true" : undefined}
                        className={`h-2.5 w-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${isActive
                          ? "w-6 bg-white"
                          : "bg-white/50 hover:bg-white/70"
                          }`}
                      >
                        <span className="sr-only">{image.caption || `${index + 1}번째 이미지`}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
