"use client";

import { useStore } from "@/lib/store";
import { site } from "@/lib/site";
import type { ProjectMeta } from "@/lib/projects";

export function ThesisBadge({ project }: { project: ProjectMeta }) {
  const pathname = useStore((s) => s.pathname);
  const loaded = useStore((s) => s.loaded);
  if (pathname !== "/") return null;
  const text = `thesis • ${project.year} • read the pdf • `;
  return (
    <a
      data-ui
      href={site.thesisPdf}
      target="_blank"
      rel="noreferrer"
      aria-label="Read the MSc thesis PDF"
      className={`group fixed -bottom-6 -left-6 z-30 block h-[150px] w-[150px] transition-all duration-1000 md:-bottom-8 md:-left-8 md:h-[190px] md:w-[190px] ${loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
    >
      <span className="absolute inset-[26px] block -rotate-12 overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105 md:inset-[34px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.coverSm} alt="" className="h-full w-full object-cover" />
      </span>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full [animation:spin_24s_linear_infinite]">
        <defs>
          <path id="badge-circle" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
        </defs>
        <text className="fill-fg font-mono text-[8.6px] uppercase tracking-[0.18em]">
          <textPath href="#badge-circle">{text + text}</textPath>
        </text>
      </svg>
    </a>
  );
}
