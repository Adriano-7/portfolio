"use client";

import { useStore } from "@/lib/store";

/**
 * Case-study cover. While the helix card is still flying into this spot the image stays hidden,
 * then fades in under the card as it lands so the two read as one element.
 */
export function HeroCover({ slug, src }: { slug: string; src: string }) {
  const landing = useStore((s) => s.transitioning === slug);
  return (
    <div
      data-hero-cover={slug}
      className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl transition-opacity duration-300"
      style={{ opacity: landing ? 0 : 1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={1280} height={800} className="block w-full" />
    </div>
  );
}
