"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/** Fades page content up on mount. */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    window.scrollTo({ top: 0 });
    const tween = gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
    return () => {
      tween.kill();
    };
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
