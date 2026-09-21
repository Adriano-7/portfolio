"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";

/** Mirrors the router into the store (so the canvas can read it) and performs navigations the canvas requests. */
export function RouteSync() {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const pending = useStore((s) => s.pendingNavigation);

  useEffect(() => {
    const s = useStore.getState();
    s.setPathname(pathname);
    s.setHovered(null);
    s.setMenuOpen(false);
    // the helix clears it once the card has landed on the case study; coming home cancels it
    if (pathname === "/") s.setTransitioning(null);
    document.documentElement.dataset.home = pathname === "/" ? "true" : "false";
  }, [pathname]);

  useEffect(() => {
    const v = search.get("view");
    if (v === "list" || v === "spiral" || v === "3d") {
      const s = useStore.getState();
      const targetView = v === "list" ? "list" : "spiral";
      if (s.webgl && !s.reducedMotion) s.setView(targetView);
    }
  }, [search]);

  useEffect(() => {
    if (!pending) return;
    useStore.getState().requestNavigation(null);
    router.push(pending);
  }, [pending, router]);

  useEffect(() => {
    router.prefetch("/about");
  }, [router]);

  return null;
}
