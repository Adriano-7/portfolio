"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useStore } from "@/lib/store";

/** Lenis smooth scrolling on content pages (the home page has no document scroll). */
export function SmoothScroll() {
  const pathname = useStore((s) => s.pathname);
  const reduced = useStore((s) => s.reducedMotion);
  const lightbox = useStore((s) => s.lightbox);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (pathname === "/" || reduced) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname, reduced]);

  // The overlay has its own scroller; the page behind it should sit still.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (lightbox) lenis.stop();
    else lenis.start();
  }, [lightbox]);

  return null;
}
