"use client";

import Image from "next/image";
import type { ReactNode } from "react";
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
};

export function AssociationCard({ association }: { association: Association }) {
  const setLightbox = useStore((s) => s.setLightbox);
  const hasPhotos = association.photos && association.photos.length > 0;

  return (
    <article className="border-t border-white/15 py-9 sm:py-12">
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

      {hasPhotos && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-7 sm:grid-cols-[1.65fr_1fr] sm:gap-3">
          {association.photos!.slice(0, 3).map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={(e) => {
                e.currentTarget.focus();
                setLightbox({
                  src: photo.src,
                  alt: photo.alt,
                  caption: photo.caption,
                  gallery: association.photos,
                  index: i,
                });
              }}
              aria-label={i === 2 && association.photos!.length > 3 ? `Open gallery of ${association.photos!.length} photos: ${photo.alt}` : `Enlarge photo: ${photo.alt}`}
              className={`group relative block min-w-0 cursor-zoom-in overflow-hidden rounded-sm bg-[#171717] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${i === 0 ? "col-span-2 aspect-[3/2] sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:min-h-72" : "aspect-[16/10]"}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={i === 0 ? "(max-width: 640px) calc(100vw - 40px), 430px" : "(max-width: 640px) 50vw, 265px"}
                className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading={i < 2 ? "eager" : "lazy"}
              />
              {i === 2 && association.photos!.length > 3 && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-right text-xs font-medium text-white sm:px-4 sm:pb-4 sm:text-sm">
                  View all {association.photos!.length} photos ↗
                </span>
              )}
            </button>
          ))}
        </div>
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
