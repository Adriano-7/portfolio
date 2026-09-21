"use client";

import { useStore } from "@/lib/store";
import { ListView } from "./ListView";
import { Caption } from "./Caption";
import type { ProjectMeta } from "@/lib/projects";

export function Works({ projects }: { projects: ProjectMeta[] }) {
  const view = useStore((s) => s.view);
  const loaded = useStore((s) => s.loaded);
  return (
    <div className="pointer-events-none fixed inset-0">
      <h1 className="sr-only">Adriano Machado, machine learning projects</h1>
      {view === "list" && loaded && <ListView projects={projects} />}
      {/* soft floor so the caption stays legible over cards that wrap near the bottom */}
      <div
        className={`absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-bg via-bg/70 to-transparent transition-opacity duration-1000 ${loaded && view === "spiral" ? "opacity-100" : "opacity-0"}`}
      />
      <Caption projects={projects} />
      <p
        className={`mono absolute bottom-6 right-6 hidden text-muted-2 transition-opacity duration-1000 md:block ${loaded && view === "spiral" ? "opacity-100" : "opacity-0"}`}
      >
      </p>
    </div>
  );
}
