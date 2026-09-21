"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore, type Figure } from "@/lib/store";

/**
 * Focus view for case-study figures and photo galleries. Portalled to the body because
 * the article sits inside a GSAP-transformed wrapper, which would otherwise contain a fixed
 * overlay. Images never upscale past their natural size; the ones too wide to
 * fit can be zoomed to 1:1 and dragged.
 */
export function Lightbox() {
  const figure = useStore((s) => s.lightbox);
  const setLightbox = useStore((s) => s.setLightbox);

  if (!figure || typeof document === "undefined") return null;

  const gallery = figure.gallery;
  const index = figure.index ?? (gallery ? gallery.findIndex((f) => f.src === figure.src) : -1);
  const hasGallery = !!gallery && gallery.length > 1 && index >= 0;

  const onPrev = hasGallery
    ? () => {
        const prevIndex = (index - 1 + gallery.length) % gallery.length;
        const prevFig = gallery[prevIndex];
        setLightbox({ ...prevFig, gallery, index: prevIndex });
      }
    : undefined;

  const onNext = hasGallery
    ? () => {
        const nextIndex = (index + 1) % gallery.length;
        const nextFig = gallery[nextIndex];
        setLightbox({ ...nextFig, gallery, index: nextIndex });
      }
    : undefined;

  // Keep FocusView mounted across photo transitions to avoid modal flicker.
  return createPortal(
    <FocusView
      figure={figure}
      onClose={() => setLightbox(null)}
      onPrev={onPrev}
      onNext={onNext}
      currentIndex={hasGallery ? index : undefined}
      totalCount={hasGallery ? gallery.length : undefined}
    />,
    document.body,
  );
}

function FocusView({
  figure,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: {
  figure: Figure;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}) {
  const reduced = useStore((s) => s.reducedMotion);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0); // 0 = Fit, 1 = 100%, 2 = 180%, 3 = 280%
  const [fits, setFits] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: number } | null>(null);

  const isZoomed = zoomLevel > 0;

  // Keep latest callbacks in refs so the keydown listener doesn't re-bind on slide change
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const onCloseRef = useRef(onClose);
  const zoomLevelRef = useRef(zoomLevel);
  const applyZoomRef = useRef<((level: number, cx?: number, cy?: number) => void) | null>(null);

  onPrevRef.current = onPrev;
  onNextRef.current = onNext;
  onCloseRef.current = onClose;
  zoomLevelRef.current = zoomLevel;

  // Helper for sizing based on zoom step
  const getTargetWidth = (level: number, naturalW: number) => {
    if (level === 0) return undefined;
    if (level === 1) return naturalW;
    if (level === 2) return Math.round(naturalW * 1.8);
    return Math.round(naturalW * 2.8);
  };

  const applyZoom = (nextLevel: number, clientX?: number, clientY?: number) => {
    const el = scrollRef.current;
    if (!natural || !el) return;

    if (nextLevel === 0) {
      setZoomLevel(0);
      el.scrollLeft = 0;
      el.scrollTop = 0;
      return;
    }

    const nextW = getTargetWidth(nextLevel, natural.w)!;
    const nextH = (nextW / natural.w) * natural.h;

    let fx = 0.5;
    let fy = 0.5;

    if (clientX != null && clientY != null && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        fx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        fy = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      }
    }

    setZoomLevel(nextLevel);

    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollLeft = nextW * fx - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollTop = nextH * fy - scrollRef.current.clientHeight / 2;
    });
  };

  applyZoomRef.current = applyZoom;

  // Reset zoom state and scroll offset whenever the active figure changes
  useEffect(() => {
    setZoomLevel(0);
    setNatural(null);
    setFits(true);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      scrollRef.current.scrollTop = 0;
    }
  }, [figure.src]);

  // Preload adjacent images in the gallery for instant, flicker-free switching
  useEffect(() => {
    if (!figure.gallery || figure.gallery.length <= 1 || currentIndex == null) return;
    const g = figure.gallery;
    const prev = g[(currentIndex - 1 + g.length) % g.length];
    const next = g[(currentIndex + 1) % g.length];
    if (prev?.src) {
      const img1 = new Image();
      img1.src = prev.src;
    }
    if (next?.src) {
      const img2 = new Image();
      img2.src = next.src;
    }
  }, [figure.gallery, currentIndex]);

  // Modal lifecycle: lock body scroll and restore active element only on open/close
  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      restore?.focus?.();
    };
  }, []);

  // Keyboard navigation, zoom shortcuts, and focus trap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if ((e.key === "ArrowLeft" || e.key.toLowerCase() === "h") && onPrevRef.current) {
        e.preventDefault();
        onPrevRef.current();
        return;
      }
      if ((e.key === "ArrowRight" || e.key.toLowerCase() === "l") && onNextRef.current) {
        e.preventDefault();
        onNextRef.current();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        applyZoomRef.current?.(Math.min(zoomLevelRef.current + 1, 3));
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        applyZoomRef.current?.(Math.max(zoomLevelRef.current - 1, 0));
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        applyZoomRef.current?.(0);
        return;
      }
      // Keep tabbing inside the overlay rather than behind it.
      if (e.key !== "Tab") return;
      const focusable = rootRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !rootRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !rootRef.current?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Zooming is only worth offering when the image had to be shrunk to fit.
  useEffect(() => {
    if (!natural) return;
    const measure = () => {
      const el = scrollRef.current;
      if (el) setFits(natural.w <= el.clientWidth && natural.h <= el.clientHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [natural]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!isZoomed || !el) return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: 0 };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scrollRef.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy));
    el.scrollLeft = d.left - dx;
    el.scrollTop = d.top - dy;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    scrollRef.current?.releasePointerCapture?.(e.pointerId);
    drag.current = null;
  };

  const onImgClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (drag.current && drag.current.moved > 4) return; // that was a pan, not a click
    const next = (zoomLevel + 1) % 4; // cycles 0 -> 1 -> 2 -> 3 -> 0
    applyZoom(next, e.clientX, e.clientY);
  };

  const onImgDoubleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (isZoomed) {
      applyZoom(0);
    } else {
      applyZoom(2, e.clientX, e.clientY);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    // Trackpad pinch or Ctrl + mouse wheel zooms in/out
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        applyZoom(Math.min(zoomLevel + 1, 3), e.clientX, e.clientY);
      } else if (e.deltaY > 0) {
        applyZoom(Math.max(zoomLevel - 1, 0), e.clientX, e.clientY);
      }
      return;
    }

    if (!isZoomed) return;

    const canScrollY = el.scrollHeight > el.clientHeight;
    const canScrollX = el.scrollWidth > el.clientWidth;
    // If the image only overflows horizontally (e.g. wide panoramic/landscape photo),
    // map standard vertical wheel delta to horizontal scroll so mouse wheel works seamlessly.
    if (!canScrollY && canScrollX && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={figure.alt}
      data-lenis-prevent
      className={`fixed inset-0 z-[60] flex flex-col bg-[#080808] ${reduced ? "" : "animate-[fadeIn_0.18s_ease-out]"}`}
    >
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 md:px-8">
        <p className="mono text-muted-2">
          {totalCount != null && currentIndex != null && (
            <>
              <span className="text-fg/90">{currentIndex + 1}</span> / {totalCount}
              <span className="mx-2 text-white/20">·</span>
            </>
          )}
          {zoomLevel === 0
            ? "click to zoom"
            : zoomLevel === 1
            ? "100% · drag to pan · click to zoom in"
            : zoomLevel === 2
            ? "180% · drag to pan · click to zoom in"
            : "280% · drag to pan · click to fit"}
        </p>
        <div className="flex items-center gap-2">
          {isZoomed && (
            <button
              type="button"
              onClick={() => applyZoom(0)}
              className="mono rounded-full border border-white/15 px-2.5 py-1 text-xs text-muted transition-colors hover:border-white/35 hover:text-fg"
            >
              reset
            </button>
          )}
          <button
            type="button"
            onClick={() => applyZoom(Math.max(zoomLevel - 1, 0))}
            disabled={zoomLevel === 0}
            aria-label="Zoom out (-)"
            className="mono flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-muted transition-colors hover:border-white/35 hover:text-fg disabled:opacity-30 disabled:pointer-events-none"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => applyZoom(Math.min(zoomLevel + 1, 3))}
            disabled={zoomLevel >= 3}
            aria-label="Zoom in (+)"
            className="mono flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-muted transition-colors hover:border-white/35 hover:text-fg disabled:opacity-30 disabled:pointer-events-none"
          >
            +
          </button>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="mono rounded-full border border-white/15 px-3 py-1.5 text-muted transition-colors hover:border-white/35 hover:text-fg"
          >
            close
          </button>
        </div>
      </div>

      {/* Main image viewport area */}
      <div className="relative min-h-0 flex-1 w-full overflow-hidden">
        {/* Previous Button - stationed outside scroll container */}
        {onPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image (Left arrow)"
            className="group/arrow absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white/75 backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/90 hover:text-fg hover:scale-105 active:scale-95 md:left-6 md:h-12 md:w-12"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Next Button - stationed outside scroll container */}
        {onNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next image (Right arrow)"
            className="group/arrow absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white/75 backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/90 hover:text-fg hover:scale-105 active:scale-95 md:right-6 md:h-12 md:w-12"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Scrollable / Zoom container: ONLY contains the image */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          onWheel={onWheel}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`h-full w-full flex items-center justify-center px-4 md:px-8 ${
            isZoomed ? "overflow-auto cursor-grab active:cursor-grabbing" : "overflow-hidden"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            key={figure.src}
            src={figure.src}
            alt={figure.alt}
            onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onClick={onImgClick}
            onDoubleClick={onImgDoubleClick}
            draggable={false}
            style={{
              cursor: isZoomed ? (zoomLevel === 3 ? "zoom-out" : "zoom-in") : "zoom-in",
              width: isZoomed && natural ? getTargetWidth(zoomLevel, natural.w) : undefined,
              maxWidth: isZoomed ? "none" : natural ? `min(100%, ${natural.w}px)` : "100%",
              maxHeight: isZoomed ? "none" : natural ? `min(100%, ${natural.h}px)` : "100%",
            }}
            className={`m-auto block h-auto rounded-lg select-none transition-all duration-150 ease-out ${
              figure.src.includes("/associations/") ? "bg-transparent" : "bg-white"
            } ${reduced ? "" : "animate-[fadeIn_0.15s_ease-out]"} ${
              isZoomed ? "" : "max-h-full max-w-full object-contain"
            }`}
          />
        </div>
      </div>

      {/* Caption bar */}
      {figure.caption && (
        <figcaption
          data-lenis-prevent
          className="mono mx-auto max-h-[28%] max-w-3xl shrink-0 overflow-y-auto px-5 py-5 normal-case tracking-normal text-muted md:px-8"
        >
          {figure.caption}
        </figcaption>
      )}
    </div>
  );
}
