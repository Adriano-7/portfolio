"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useStore } from "@/lib/store";

export function Loader({ count }: { count: number }) {
  const { progress, active, loaded: items } = useProgress();
  const loaded = useStore((s) => s.loaded);
  const setLoaded = useStore((s) => s.setLoaded);
  const webgl = useStore((s) => s.webgl);
  const pathname = useStore((s) => s.pathname);
  const [gone, setGone] = useState(false);
  const [minTime, setMinTime] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTime(true), 700);
    const fallback = setTimeout(() => setLoaded(true), 9000);
    return () => {
      clearTimeout(t);
      clearTimeout(fallback);
    };
  }, [setLoaded]);

  useEffect(() => {
    if (loaded) return;
    const done = items >= count && !active;
    if ((done && minTime) || !webgl) setLoaded(true);
  }, [items, active, count, minTime, webgl, loaded, setLoaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [loaded]);

  if (gone || pathname !== "/") return null;
  const pct = Math.min(100, Math.round(webgl ? progress : 100));

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-50 grid place-items-center bg-bg transition-opacity duration-700 ${loaded ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="block h-10 w-10 rounded-full bg-[conic-gradient(from_180deg,#f5a524,#0a0a0a_45%,#f5a524_55%,#ffd27a,#0a0a0a)] [animation:spin_1.6s_linear_infinite]">
          <span className="block h-full w-full scale-[0.7] rounded-full bg-bg" />
        </span>
        <p className="mono text-muted">
          loading {count} projects <span className="text-fg">{pct}%</span>
        </p>
      </div>
    </div>
  );
}
