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

      {onHome ? <ViewToggle /> : <span />}

      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        className="pill pointer-events-auto"
      >
        {menuOpen ? "close" : "menu"}
        <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
      </button>
    </header>
  );
}
