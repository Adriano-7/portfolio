"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useStore } from "@/lib/store";
import type { ProjectMeta } from "@/lib/projects";

const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function ListView({ projects }: { projects: ProjectMeta[] }) {
  const setHovered = useStore((s) => s.setHovered);
  const hovered = useStore((s) => s.hovered);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll("li");
    if (!items) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.045, ease: "power3.out", clearProps: "transform" },
    );
    return () => setHovered(null);
  }, [setHovered]);

  return (
    <div
      data-ui
      className="pointer-events-auto absolute inset-0 overflow-y-auto overscroll-contain px-4 pb-32 pt-24 md:pb-24"
      onMouseLeave={() => setHovered(null)}
    >
      <ol ref={listRef} className="mx-auto flex max-w-5xl flex-col items-center gap-5 md:gap-1.5">
        {projects.map((p, i) => {
          const dim = hovered && hovered !== p.slug;
          const cls = `group relative block text-center text-[clamp(1.5rem,3.4vw,2.9rem)] font-medium leading-[1.12] tracking-[-0.02em] transition-colors duration-300 ${dim ? "text-muted-2" : "text-fg"}`;
          const inner = (
            <>
              <span className="mono absolute -left-14 top-1/2 hidden -translate-y-1/2 text-muted-2 md:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              {p.title}
            </>
          );
          return (
            <li
              key={p.slug}
              // touch taps go straight to the page, so only a real mouse or keyboard focus highlights the item
              onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p.slug)}
              onFocus={() => canHover() && setHovered(p.slug)}
            >
              <Link href={`/work/${p.slug}`} className={cls}>
                {inner}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
