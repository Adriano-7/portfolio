"use client";

import { useSyncExternalStore } from "react";

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

const subs = new Map<string, (cb: () => void) => () => void>();
function sub(query: string) {
  let s = subs.get(query);
  if (!s) {
    s = subscribeMedia(query);
    subs.set(query, s);
  }
  return s;
}

/** true when the media query matches; false during SSR */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    sub(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

let webglResult: boolean | null = null;
function detectWebGL() {
  if (webglResult === null) {
    try {
      const c = document.createElement("canvas");
      webglResult = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglResult = false;
    }
  }
  return webglResult;
}

/** null during SSR/hydration, then a stable boolean */
export function useWebGL(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => null,
  );
}
