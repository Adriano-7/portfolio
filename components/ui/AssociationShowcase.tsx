"use client";

import { useRef } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";

export type AssociationPhoto = {
  src: string;
  alt: string;
  caption?: string;
};

export type Association = {
  org: string;
  role: string;
  when: string;
  text: string;
  href?: string;
  hrefLabel?: string;
  photos?: AssociationPhoto[];
};

export function AssociationCard({ association }: { association: Association }) {
  const setLightbox = useStore((s) => s.setLightbox);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const dragDistance = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = el.scrollLeft;
    dragDistance.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - startX.current;
    dragDistance.current = Math.max(dragDistance.current, Math.abs(dx));
    el.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  const hasPhotos = association.photos && association.photos.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="mono text-accent">{association.org}</p>
        <p className="mono text-muted-2">{association.when}</p>
      </div>

      <p className="mt-2 text-fg">{association.role}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{association.text}</p>

      {association.href && (
        <a
          href={association.href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-fg/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
        >
          {association.hrefLabel} ↗
        </a>
      )}

      {hasPhotos && (
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="no-scrollbar -mx-5 mt-5 flex cursor-grab select-none gap-3 overflow-x-auto px-5 active:cursor-grabbing md:-mx-6 md:px-6"
        >
          {association.photos!.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={(e) => {
                if (dragDistance.current > 5) return;
                e.currentTarget.focus();
                setLightbox({
                  src: photo.src,
                  alt: photo.alt,
                  caption: photo.caption,
                  gallery: association.photos,
                  index: i,
                });
              }}
              aria-label={`Enlarge photo: ${photo.alt}`}
              className="group relative h-36 w-52 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border border-white/10 bg-[#141414] transition-colors hover:border-white/25 sm:h-40 sm:w-60"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 208px, 240px"
                className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading={i < 2 ? "eager" : "lazy"}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white/90 shadow-sm backdrop-blur-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7.5" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AssociationShowcase({ associations }: { associations: Association[] }) {
  return (
    <div className="flex flex-col gap-5">
      {associations.map((a) => (
        <AssociationCard key={a.org} association={a} />
      ))}
    </div>
  );
}
