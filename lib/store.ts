import { create } from "zustand";

export type View = "spiral" | "list";

type State = {
  view: View;
  setView: (v: View) => void;
  hovered: string | null;
  setHovered: (slug: string | null) => void;
  /** index of the card at the front of the helix */
  active: number;
  setActive: (i: number) => void;
  /** slug the caption asked the helix to open (same transition as a card click) */
  openRequest: string | null;
  requestOpen: (slug: string | null) => void;
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  pathname: string;
  setPathname: (p: string) => void;
  /** slug the helix is animating towards before navigation */
  transitioning: string | null;
  setTransitioning: (slug: string | null) => void;
  /** set by the canvas, consumed by RouteSync which owns the router */
  pendingNavigation: string | null;
  requestNavigation: (href: string | null) => void;
  webgl: boolean;
  setWebgl: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
};

export const useStore = create<State>((set) => ({
  view: "spiral",
  setView: (view) => set({ view }),
  hovered: null,
  setHovered: (hovered) => set({ hovered }),
  active: 0,
  setActive: (active) => set({ active }),
  openRequest: null,
  requestOpen: (openRequest) => set({ openRequest }),
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  pathname: "/",
  setPathname: (pathname) => set({ pathname }),
  transitioning: null,
  setTransitioning: (transitioning) => set({ transitioning }),
  pendingNavigation: null,
  requestNavigation: (pendingNavigation) => set({ pendingNavigation }),
  webgl: true,
  setWebgl: (webgl) => set({ webgl }),
  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
