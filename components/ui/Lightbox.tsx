"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore, type Figure } from "@/lib/store";

/**
 * Focus view for case-study figures. Portalled to the body because the article
 * sits inside a GSAP-transformed wrapper, which would otherwise contain a fixed
 * overlay. Images never upscale past their natural size; the ones too wide to
 * fit can be zoomed to 1:1 and dragged.
 */
export function Lightbox() {
  const figure = useStore((s) => s.lightbox);
  const setLightbox = useStore((s) => s.setLightbox);

  if (!figure || typeof document === "undefined") return null;

  // Keyed so each figure gets its own zoom state without a reset effect.
  return createPortal(
    <FocusView key={figure.src} figure={figure} onClose={() => setLightbox(null)} />,
    document.body,
  );
}

function FocusView({ figure, onClose }: { figure: Figure; onClose: () => void }) {
  const reduced = useStore((s) => s.reducedMotion);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [fits, setFits] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: number } | null>(null);

  // Escape to close, focus the close button, and hold the page still behind.
  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
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

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      restore?.focus?.();
    };
  }, [onClose]);

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
    if (!zoomed || !el) return;
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

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    if (fits) return;
    if (drag.current && drag.current.moved > 4) return; // that was a pan, not a click
    const el = scrollRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const next = !zoomed;
    setZoomed(next);
    if (next && el && natural) {
      // Keep the spot under the cursor roughly under the cursor.
      requestAnimationFrame(() => {
        el.scrollLeft = natural.w * fx - el.clientWidth / 2;
        el.scrollTop = natural.h * fy - el.clientHeight / 2;
      });
    }
  };

  const canZoom = !fits;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={figure.alt}
      className={`fixed inset-0 z-[60] flex flex-col bg-[#080808] ${reduced ? "" : "animate-[fadeIn_0.18s_ease-out]"}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 md:px-8">
        <p className="mono text-muted-2">
          {canZoom ? (zoomed ? "drag to pan · click to fit" : "click image to zoom") : "figure"}
        </p>
        <button
          ref={closeRef}
          onClick={onClose}
          className="mono rounded-full border border-white/15 px-3 py-1.5 text-muted transition-colors hover:border-white/35 hover:text-fg"
        >
          close esc
        </button>
      </div>

      <div
        ref={scrollRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`flex min-h-0 flex-1 items-center justify-center px-4 md:px-8 ${zoomed ? "overflow-auto" : "overflow-hidden"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={figure.src}
          alt={figure.alt}
          onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          onClick={toggleZoom}
          draggable={false}
          style={{
            cursor: canZoom ? (zoomed ? "grab" : "zoom-in") : "default",
            width: zoomed && natural ? natural.w : undefined,
            // min() so the image fits the viewport but never upscales past 1:1
            maxWidth: zoomed ? "none" : natural ? `min(100%, ${natural.w}px)` : "100%",
            maxHeight: zoomed ? "none" : natural ? `min(100%, ${natural.h}px)` : "100%",
          }}
          className={`m-auto block h-auto rounded-lg bg-white ${zoomed ? "" : "max-h-full max-w-full object-contain"}`}
        />
      </div>

      {figure.caption && (
        <figcaption className="mono mx-auto max-h-[28%] max-w-3xl shrink-0 overflow-y-auto px-5 py-5 normal-case tracking-normal text-muted md:px-8">
          {figure.caption}
        </figcaption>
      )}
    </div>
  );
}
