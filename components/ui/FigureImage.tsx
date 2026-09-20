"use client";

import { useStore } from "@/lib/store";

/** The clickable part of a case-study figure; opens the focus overlay. */
export function FigureImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const setLightbox = useStore((s) => s.setLightbox);

  return (
    <button
      type="button"
      onClick={(e) => {
        // Not every browser focuses a button on click; the overlay restores
        // focus here when it closes, so make sure it is the active element.
        e.currentTarget.focus();
        setLightbox({ src, alt, caption });
      }}
      aria-label="Open figure in focus view"
      className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-white/10 bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
      <span className="mono pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-fg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        enlarge
      </span>
    </button>
  );
}
