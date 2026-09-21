"use client";

import { useStore, type View } from "@/lib/store";

const OPTIONS: { id: View; label: string }[] = [
  { id: "spiral", label: "3d" },
  { id: "list", label: "list" },
];

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      choose("spiral");
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      choose("list");
    }
  };

  if (!webgl) return <span />;

  return (
    <div
      role="tablist"
      aria-label="View mode"
      onKeyDown={handleKeyDown}
      className={`pointer-events-auto relative flex items-center rounded-full border border-white/12 bg-white/[0.06] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Sliding active pill indicator */}
      <div
        aria-hidden
        className={`absolute bottom-1 top-1 left-1 w-[calc(50%-4px)] rounded-full border border-white/20 bg-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          view === "list" ? "translate-x-full" : "translate-x-0"
        }`}
      />

      {OPTIONS.map((opt) => {
        const active = view === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => choose(opt.id)}
            className={`relative z-10 flex w-14 items-center justify-center py-1 text-xs font-medium tracking-wide transition-colors duration-200 focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
              active ? "text-white" : "text-muted hover:text-fg"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
