"use client";

import { useStore } from "@/lib/store";
import type { ProjectMeta } from "@/lib/projects";

/** Bottom-left caption for the card at the front of the helix (or the hovered one). */
export function Caption({ projects }: { projects: ProjectMeta[] }) {
  const front = useStore((s) => s.active);
  const hovered = useStore((s) => s.hovered);
  const view = useStore((s) => s.view);
  const loaded = useStore((s) => s.loaded);
  const transitioning = useStore((s) => s.transitioning);
  const requestOpen = useStore((s) => s.requestOpen);
  const hoveredIndex = hovered ? projects.findIndex((p) => p.slug === hovered) : -1;
  const active = hoveredIndex >= 0 ? hoveredIndex : front;
  const project = projects[active];
  const show = loaded && view === "spiral" && !transitioning && !!project;

  return (
    <div
      data-ui
      className={`absolute bottom-6 left-5 z-10 max-w-[min(22rem,calc(100vw-2.5rem))] transition-opacity duration-700 md:bottom-8 md:left-8 ${show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-live="polite"
    >
      {project && (
        <div key={project.slug} className="flex flex-col items-start gap-1.5">
          <span className="mono fade-up text-muted-2">
            {String(active + 1).padStart(2, "0")}
            <span className="mx-1.5 opacity-50">/</span>
            {String(projects.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => requestOpen(project.slug)}
            className="fade-up [animation-delay:60ms] text-left text-[clamp(1.15rem,1.9vw,1.5rem)] font-medium leading-[1.15] tracking-[-0.02em] text-fg transition-colors duration-300 hover:text-accent"
          >
            {project.title}
          </button>
          <span className="mono fade-up [animation-delay:120ms] text-muted">
            {project.tags[0]}
            <span className="mx-1.5 text-muted-2">·</span>
            {project.year}
            <span className="mx-1.5 text-muted-2">·</span>
            <span className="text-muted-2">{project.featured ? "case study →" : "github ↗"}</span>
          </span>
        </div>
      )}
    </div>
  );
}
