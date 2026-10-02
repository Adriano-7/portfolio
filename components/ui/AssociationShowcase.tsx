"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
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
  text: ReactNode;
  href?: string;
  hrefLabel?: string;
  photos?: AssociationPhoto[];
  galleryLayout?: "photos" | "mockups";
  beforePhotos?: AssociationPhoto[];
};

export function AssociationCard({ association }: { association: Association }) {
  const setLightbox = useStore((s) => s.setLightbox);
  const [keyboardFocus, setKeyboardFocus] = useState(true);
  const focusClass = keyboardFocus
    ? "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    : "outline-none";
  const hasPhotos = association.photos && association.photos.length > 0;
  const isMockupGallery = association.galleryLayout === "mockups";
  const galleryLabel = isMockupGallery ? "mockups" : "photos";

  return (
    <article
      className="border-t border-white/15 py-9 sm:py-12"
      onPointerDownCapture={() => setKeyboardFocus(false)}
      onKeyDownCapture={(event) => {
        if (event.key === "Tab") setKeyboardFocus(true);
      }}
      onKeyUpCapture={(event) => {
        if (event.key === "Tab") setKeyboardFocus(true);
      }}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{association.org}</h3>
        <p className="text-sm tabular-nums text-[#a3a3a3]">{association.when}</p>
      </header>

      <p className="mt-2 text-base text-fg/90">{association.role}</p>
      <div className="mt-4 max-w-[65ch] space-y-4 text-[0.95rem] leading-7 text-[#a3a3a3]">
        {typeof association.text === "string" ? association.text.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        )) : association.text}
      </div>

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

      {!!association.beforePhotos?.length && (
        <div className="mt-8">
          <p className="mb-3 text-sm text-muted">Before the redesign</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {association.beforePhotos.slice(0, 3).map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                aria-label={`Open gallery of ${association.beforePhotos!.length} screens: ${photo.alt}`}
                className={`relative aspect-[344/728] min-w-0 cursor-zoom-in overflow-hidden rounded-sm bg-[#171717] ${focusClass} ${i === 2 ? "hidden sm:block" : ""}`}
                onClick={(e) => {
                  setKeyboardFocus(e.detail === 0);
                  e.currentTarget.focus();
                  setLightbox({ ...photo, gallery: association.beforePhotos, index: i });
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 230px"
                  className="object-contain"
                />
                {((i === 1 && association.beforePhotos!.length > 2) || (i === 2 && association.beforePhotos!.length > 3)) && (
                  <span className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-right text-xs font-medium text-white sm:px-4 sm:pb-4 sm:text-sm ${i === 1 ? "sm:hidden" : "hidden sm:block"}`}>
                    View all {association.beforePhotos!.length}<span className="hidden sm:inline"> screens</span> ↗
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasPhotos && (
        <>
        {!!association.beforePhotos?.length && <p className="mt-6 text-sm text-muted">The redesign</p>}
        <div className={`mt-6 grid gap-2 sm:mt-7 sm:gap-3 ${isMockupGallery ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-[1.65fr_1fr]"}`}>
          {association.photos!.slice(0, 3).map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={(e) => {
                setKeyboardFocus(e.detail === 0);
                e.currentTarget.focus();
                setLightbox({
                  src: photo.src,
                  alt: photo.alt,
                  caption: photo.caption,
                  gallery: association.photos,
                  index: i,
                });
              }}
              aria-label={i === 2 && association.photos!.length > 3 ? `Open gallery of ${association.photos!.length} ${galleryLabel}: ${photo.alt}` : `Enlarge image: ${photo.alt}`}
              className={`group relative min-w-0 cursor-zoom-in overflow-hidden rounded-sm bg-[#171717] ${focusClass} ${isMockupGallery ? `aspect-[9/20] ${i === 2 ? "hidden sm:block" : "block"}` : i === 0 ? "block col-span-2 aspect-[3/2] sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:min-h-72" : "block aspect-[16/10]"}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={isMockupGallery ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 230px" : i === 0 ? "(max-width: 640px) calc(100vw - 40px), 430px" : "(max-width: 640px) 50vw, 265px"}
                className={isMockupGallery ? "pointer-events-none object-contain" : "pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"}
                loading={i < 2 ? "eager" : "lazy"}
              />
              {((i === 2 && association.photos!.length > 3) || (isMockupGallery && i === 1 && association.photos!.length > 2)) && (
                <span className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-right text-xs font-medium text-white sm:px-4 sm:pb-4 sm:text-sm ${isMockupGallery ? i === 1 ? "sm:hidden" : "hidden sm:block" : ""}`}>
                  View all {association.photos!.length}<span className={isMockupGallery ? "hidden sm:inline" : ""}> {galleryLabel}</span> ↗
                </span>
              )}
            </button>
          ))}
        </div>
        </>
      )}
    </article>
  );
}

export function AssociationShowcase({ associations }: { associations: Association[] }) {
  return (
    <div className="border-b border-white/15">
      {associations.map((a) => (
        <AssociationCard key={a.org} association={a} />
      ))}
    </div>
  );
}
