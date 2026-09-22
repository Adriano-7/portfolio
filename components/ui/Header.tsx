"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ViewToggle } from "./ViewToggle";
import { site } from "@/lib/site";

export function Header() {
  const pathname = useStore((s) => s.pathname);
  const menuOpen = useStore((s) => s.menuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const onHome = pathname === "/";

  return (
    <header
      data-ui
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 md:px-8"
    >
      <Link
        href="/"
        aria-label={`${site.name}, home`}
        className="pointer-events-auto group flex items-center gap-3"
      >
        <span className="relative block h-10 w-10 rounded-full bg-[conic-gradient(from_180deg,#f5a524,#0a0a0a_45%,#f5a524_55%,#ffd27a,#0a0a0a)] p-[2px] shadow-[0_0_24px_rgba(245,165,36,0.25)] transition-transform duration-500 group-hover:rotate-180">
          <Image
            src="/avatar.webp"
            alt=""
            width={40}
            height={40}
            priority
            className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:-rotate-180"
          />
        </span>
        <span className="hidden text-sm text-fg/90 md:block">{site.name}</span>
      </Link>

      {onHome && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center">
          <ViewToggle />
        </div>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        title={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        className={`pointer-events-auto inline-flex h-9 w-[3.75rem] items-center justify-center gap-2 rounded-full border text-sm font-medium transition-all duration-200 active:scale-95 ${
          menuOpen
            ? "border-accent/40 bg-accent/10 text-accent shadow-[0_0_16px_rgba(245,165,36,0.15)]"
            : "border-white/12 bg-white/[0.06] text-fg/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md hover:border-white/25 hover:bg-white/[0.12] hover:text-white"
        }`}
      >
        <svg
          aria-hidden="true"
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="shrink-0"
        >
          {menuOpen ? <path d="m2 2 12 10M14 2 2 12" /> : <path d="M1 2h14M1 7h14M1 12h14" />}
        </svg>
      </button>
    </header>
  );
}
