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
    if (pathname !== "/") s.setTransitioning(null);
    document.documentElement.dataset.home = pathname === "/" ? "true" : "false";
  }, [pathname]);

  useEffect(() => {
    const v = search.get("view");
    if (v === "list" || v === "spiral") {
      const s = useStore.getState();
      if (s.webgl && !s.reducedMotion) s.setView(v);
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
