"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useStore } from "@/lib/store";
import type { ProjectMeta } from "@/lib/projects";

export function Tooltip({ projects }: { projects: ProjectMeta[] }) {
  const hovered = useStore((s) => s.hovered);
  const view = useStore((s) => s.view);
  const pathname = useStore((s) => s.pathname);
  const ref = useRef<HTMLDivElement>(null);
  const project = projects.find((p) => p.slug === hovered);
  const show = !!project && pathname === "/" && view === "spiral";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { opacity: show ? 1 : 0, scale: show ? 1 : 0.9, duration: 0.25, ease: "power2.out" });
  }, [show]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-20 opacity-0"
      style={{ transform: "translate(-9999px,-9999px)" }}
    >
      <div className="pill -translate-x-1/2 translate-y-5 whitespace-nowrap py-1.5 pl-1.5 pr-4 shadow-lg">
        {project && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverSm} alt="" className="h-7 w-11 rounded-full object-cover" />
            <span className="text-[13px]">{project.title}</span>
            <span className="mono text-[10px] text-muted-2">
              {project.featured ? "case study" : "github"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
