"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useStore } from "@/lib/store";

/** Lenis smooth scrolling on content pages (the home page has no document scroll). */
export function SmoothScroll() {
  const pathname = useStore((s) => s.pathname);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    if (pathname === "/" || reduced) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [pathname, reduced]);

  return null;
}
