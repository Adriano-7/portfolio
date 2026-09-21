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
  const [scale, setScale] = useState<number>(1);
  const [currentSrc, setCurrentSrc] = useState(figure.src);

  // Sync state during render when slide changes
  if (currentSrc !== figure.src) {
    setCurrentSrc(figure.src);
    setScale(1);
    setNatural(null);
  }

  const [isWheeling, setIsWheeling] = useState(false);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1200, h: 800 });

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: number } | null>(null);
  const lastPointerTypeRef = useRef<string>("mouse");
  const touchStartRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  const isZoomed = scale > 1;

  // Keep latest callbacks in refs so the keydown listener doesn't re-bind on slide change
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const onCloseRef = useRef(onClose);
  const scaleRef = useRef(scale);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyScaleRef = useRef<((s: number, cx?: number, cy?: number) => void) | null>(null);

  // Measure container dimensions purely through effect to avoid ref reads during render
  useEffect(() => {
    const updateSize = () => {
      if (scrollRef.current) {
        setContainerSize({ w: scrollRef.current.clientWidth, h: scrollRef.current.clientHeight });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const getBaseWidth = (nat: { w: number; h: number } | null, cSize: { w: number; h: number }) => {
    if (!nat) return 800;
    const pad = cSize.w < 768 ? 32 : 64;
    const availW = Math.max(100, cSize.w - pad);
    const availH = Math.max(100, cSize.h - pad);
    const ratio = Math.min(availW / nat.w, availH / nat.h, 1);
    return Math.round(nat.w * ratio);
  };

  const baseWidth = getBaseWidth(natural, containerSize);

  const applyScale = (nextScale: number, clientX?: number, clientY?: number) => {
    const el = scrollRef.current;
    const img = imgRef.current;
    if (!natural || !el) return;

    const cW = el.clientWidth;
    const cH = el.clientHeight;
    const baseW = baseWidth;
    const baseH = Math.round((baseWidth / natural.w) * natural.h);
    const maxScale = Math.max(4, Math.round((natural.w / baseW) * 2.5));
    const targetScale = Math.min(maxScale, Math.max(1, nextScale));

    if (targetScale === 1) {
      scaleRef.current = 1;
      setScale(1);
      if (img) {
        img.style.width = "";
        img.style.height = "";
        img.style.transition = "";
      }
      el.scrollLeft = 0;
      el.scrollTop = 0;
      return;
    }

    let fx = 0.5;
    let fy = 0.5;
    if (clientX != null && clientY != null) {
      const cRect = el.getBoundingClientRect();
      const mouseX = clientX - cRect.left;
      const mouseY = clientY - cRect.top;
      const curW = Math.round(baseW * scaleRef.current);
      const curH = Math.round(baseH * scaleRef.current);
      const curOffX = curW + 48 >= cW ? 24 : Math.round((cW - curW) / 2);
      const curOffY = curH + 48 >= cH ? 24 : Math.round((cH - curH) / 2);
      fx = Math.max(0, Math.min(1, (el.scrollLeft + mouseX - curOffX) / curW));
      fy = Math.max(0, Math.min(1, (el.scrollTop + mouseY - curOffY) / curH));
    }

    scaleRef.current = targetScale;
    setScale(targetScale);

    const newW = Math.round(baseW * targetScale);
    const newH = Math.round(baseH * targetScale);
    if (img) {
      img.style.width = `${newW}px`;
      img.style.height = `${newH}px`;
    }

    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const newOffX = newW + 48 >= cW ? 24 : Math.round((cW - newW) / 2);
      const newOffY = newH + 48 >= cH ? 24 : Math.round((cH - newH) / 2);
      scrollRef.current.scrollLeft = Math.round(newOffX + newW * fx - scrollRef.current.clientWidth / 2);
      scrollRef.current.scrollTop = Math.round(newOffY + newH * fy - scrollRef.current.clientHeight / 2);
    });
  };

  // Safely update refs in effect to satisfy React 19 rules
  useEffect(() => {
    scaleRef.current = scale;
    onPrevRef.current = onPrev;
    onNextRef.current = onNext;
    onCloseRef.current = onClose;
    applyScaleRef.current = applyScale;
  });

  // Native non-passive wheel event listener for fluid trackpad pinch zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !natural) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const img = imgRef.current;
      if (!img) return;

      const cW = el.clientWidth;
      const cH = el.clientHeight;
      const baseW = baseWidth;
      const baseH = Math.round((baseWidth / natural.w) * natural.h);
      const maxScale = Math.max(4, Math.round((natural.w / baseW) * 2.5));

      const prevScale = scaleRef.current;
      // Gentle exponential factor to prevent overshoot
      const factor = Math.exp(-e.deltaY * 0.006);
      let nextScale = Math.min(maxScale, Math.max(1, prevScale * factor));
      if (nextScale <= 1.03) nextScale = 1;

      if (Math.abs(nextScale - prevScale) < 0.0005) return;

      setIsWheeling(true);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        setIsWheeling(false);
      }, 140);

      const cRect = el.getBoundingClientRect();
      const mouseX = e.clientX - cRect.left;
      const mouseY = e.clientY - cRect.top;

      // Current layout geometry based on prevScale
      const curW = Math.round(baseW * prevScale);
      const curH = Math.round(baseH * prevScale);
      const curOffX = curW + 48 >= cW ? 24 : Math.round((cW - curW) / 2);
      const curOffY = curH + 48 >= cH ? 24 : Math.round((cH - curH) / 2);

      // Fraction on image directly under the pointer
      const fx = Math.max(0, Math.min(1, (el.scrollLeft + mouseX - curOffX) / curW));
      const fy = Math.max(0, Math.min(1, (el.scrollTop + mouseY - curOffY) / curH));

      scaleRef.current = nextScale;
      setScale(nextScale);

      if (nextScale === 1) {
        img.style.width = "";
        img.style.height = "";
        el.scrollLeft = 0;
        el.scrollTop = 0;
        return;
      }

      // Next layout geometry based on nextScale
      const nextW = Math.round(baseW * nextScale);
      const nextH = Math.round(baseH * nextScale);
      const nextOffX = nextW + 48 >= cW ? 24 : Math.round((cW - nextW) / 2);
      const nextOffY = nextH + 48 >= cH ? 24 : Math.round((cH - nextH) / 2);

      // Synchronously update DOM style to prevent scrollLeft clamping before next frame
      img.style.width = `${nextW}px`;
      img.style.height = `${nextH}px`;
      img.style.transition = "none";

      // Set exact scroll offset so (fx, fy) remains pinned under (mouseX, mouseY)
      el.scrollLeft = Math.round(nextOffX + nextW * fx - mouseX);
      el.scrollTop = Math.round(nextOffY + nextH * fy - mouseY);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [natural, baseWidth]);

  // Reset scroll offset whenever the active figure changes
  useEffect(() => {
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
        applyScaleRef.current?.(scaleRef.current + 0.6);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        applyScaleRef.current?.(scaleRef.current <= 1.6 ? 1 : scaleRef.current - 0.6);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        applyScaleRef.current?.(1);
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

  const onPointerDown = (e: React.PointerEvent) => {
    lastPointerTypeRef.current = e.pointerType;
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!isZoomed || !el) return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: 0 };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
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
    lastPointerTypeRef.current = e.pointerType;
    if (e.pointerType === "mouse") {
      scrollRef.current?.releasePointerCapture?.(e.pointerId);
      drag.current = null;
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    lastPointerTypeRef.current = "touch";
    if (e.touches.length === 1) {
      touchStartRef.current = {
        time: Date.now(),
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else {
      touchStartRef.current = null;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || e.changedTouches.length === 0) return;

    const changed = e.changedTouches[0];
    const dx = Math.abs(changed.clientX - start.x);
    const dy = Math.abs(changed.clientY - start.y);
    const dt = Date.now() - start.time;

    // Only recognize as a tap if finger moved very little and tap was quick
    if (dx < 12 && dy < 12 && dt < 300) {
      const lastTap = lastTapRef.current;
      const now = Date.now();

      if (lastTap && now - lastTap.time < 350) {
        const tapDist = Math.abs(changed.clientX - lastTap.x) + Math.abs(changed.clientY - lastTap.y);
        if (tapDist < 40) {
          // Double tap detected!
          lastTapRef.current = null;
          if (isZoomed) {
            applyScale(1);
          } else {
            applyScale(2.2, changed.clientX, changed.clientY);
          }
          return;
        }
      }

      lastTapRef.current = { time: now, x: changed.clientX, y: changed.clientY };
    }
  };

  const onImgClick = (e: React.MouseEvent<HTMLImageElement>) => {
    // On mobile touch devices, single tap does not zoom; double tap is used instead
    if (lastPointerTypeRef.current === "touch") return;
    if (drag.current && drag.current.moved > 4) return; // that was a pan, not a click
    if (isZoomed) {
      applyScale(Math.min(scale + 0.8, 4), e.clientX, e.clientY);
    } else {
      applyScale(2.2, e.clientX, e.clientY);
    }
  };

  const onImgDoubleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (isZoomed) {
      applyScale(1);
    } else {
      applyScale(2.2, e.clientX, e.clientY);
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
        <div>
          {totalCount != null && currentIndex != null && (
            <p className="mono text-muted-2">
              <span className="text-fg/90">{currentIndex + 1}</span> / {totalCount}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isZoomed && (
            <button
              type="button"
              onClick={() => applyScale(1)}
              className="mono rounded-full border border-white/15 px-2.5 py-1 text-xs text-muted transition-colors hover:border-white/35 hover:text-fg"
            >
              reset
            </button>
          )}
          <button
            type="button"
            onClick={() => applyScale(scale <= 1.6 ? 1 : scale - 0.6)}
            disabled={scale <= 1}
            aria-label="Zoom out (-)"
            className="mono flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-muted transition-colors hover:border-white/35 hover:text-fg disabled:opacity-30 disabled:pointer-events-none"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => applyScale(scale + 0.6)}
            disabled={scale >= 4}
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
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`h-full w-full ${
            isZoomed
              ? "overflow-auto cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y"
              : "overflow-hidden flex items-center justify-center px-4 md:px-8"
          }`}
        >
          {isZoomed ? (
            <div
              style={{
                minWidth: "100%",
                minHeight: "100%",
                width: "max-content",
                height: "max-content",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
              }}
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
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                draggable={false}
                style={{
                  cursor: scale > 1 ? "zoom-out" : "zoom-in",
                  width: natural ? Math.round(baseWidth * scale) : undefined,
                }}
                className={`block h-auto rounded-lg select-none ${
                  isWheeling ? "transition-none" : "transition-all duration-150 ease-out"
                } ${
                  figure.src.includes("/associations/") ? "bg-transparent" : "bg-white"
                }`}
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              key={figure.src}
              src={figure.src}
              alt={figure.alt}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onClick={onImgClick}
              onDoubleClick={onImgDoubleClick}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              draggable={false}
              style={{
                cursor: "zoom-in",
                maxWidth: natural ? `min(100%, ${natural.w}px)` : "100%",
                maxHeight: natural ? `min(100%, ${natural.h}px)` : "100%",
              }}
              className={`m-auto block h-auto rounded-lg select-none transition-all duration-150 ease-out ${
                figure.src.includes("/associations/") ? "bg-transparent" : "bg-white"
              } ${reduced ? "" : "animate-[fadeIn_0.15s_ease-out]"} max-h-full max-w-full object-contain`}
            />
          )}
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
