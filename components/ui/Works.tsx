"use client";

import { useStore } from "@/lib/store";
import { ListView } from "./ListView";
import type { ProjectMeta } from "@/lib/projects";

export function Works({ projects }: { projects: ProjectMeta[] }) {
  const view = useStore((s) => s.view);
  const loaded = useStore((s) => s.loaded);
  return (
    <div className="pointer-events-none fixed inset-0">
      <h1 className="sr-only">Adriano Machado, machine learning projects</h1>
      {view === "list" && loaded && <ListView projects={projects} />}
      <p
        className={`mono absolute bottom-6 right-6 hidden text-muted-2 transition-opacity duration-1000 md:block ${loaded && view === "spiral" ? "opacity-100" : "opacity-0"}`}
      >
        scroll · drag · arrows
      </p>
    </div>
  );
}
