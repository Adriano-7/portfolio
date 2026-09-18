"use client";

import { useStore, type View } from "@/lib/store";

export function ViewToggle() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const webgl = useStore((s) => s.webgl);
  const loaded = useStore((s) => s.loaded);
  const setHovered = useStore((s) => s.setHovered);

  const choose = (v: View) => {
    setView(v);
    setHovered(null);
    const url = new URL(window.location.href);
    if (v === "list") url.searchParams.set("view", "list");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
  };

  if (!webgl) return <span />;

  return (
    <div
      role="tablist"
      aria-label="View"
      className={`pointer-events-auto flex items-center gap-3 text-sm transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
    >
      {(["spiral", "list"] as View[]).map((v, i) => (
        <span key={v} className="flex items-center gap-3">
          {i > 0 && <span className="block h-1 w-1 rounded-full bg-fg/70" aria-hidden />}
          <button
            role="tab"
            aria-selected={view === v}
            onClick={() => choose(v)}
            className={`transition-colors ${view === v ? "text-fg" : "text-muted hover:text-fg"}`}
          >
            {v}
          </button>
        </span>
      ))}
    </div>
  );
}
