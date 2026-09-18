"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "works" },
  { href: "/about", label: "about" },
];

const iconClass =
  "grid h-9 w-9 place-items-center rounded-full bg-black text-white transition-transform hover:scale-105";

export function Menu() {
  const open = useStore((s) => s.menuOpen);
  const setOpen = useStore((s) => s.setMenuOpen);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div data-ui className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        id="site-menu"
        ref={panel}
        role="dialog"
        aria-label="Site menu"
        className={`absolute right-3 top-3 bottom-3 flex w-[min(92vw,420px)] flex-col justify-between rounded-2xl bg-panel p-7 text-panel-fg shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:right-5 md:top-5 md:bottom-5 ${open ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"}`}
      >
        <div className="flex items-center justify-between">
          <span className="mono text-black/50">{site.location}</span>
          <button type="button" onClick={() => setOpen(false)} className="mono text-black/60 hover:text-black">
            close ×
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="text-[clamp(2.4rem,7vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.02em] transition-colors hover:text-black/50"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {l.label}
            </Link>
          ))}
          {site.email ? (
            <a
              href={`mailto:${site.email}`}
              tabIndex={open ? 0 : -1}
              className="text-[clamp(2.4rem,7vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.02em] transition-colors hover:text-black/50"
            >
              contact
            </a>
          ) : (
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              className="text-[clamp(2.4rem,7vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.02em] transition-colors hover:text-black/50"
            >
              contact
            </a>
          )}
        </nav>

        <div className="flex items-center justify-between gap-3">
          {site.cv ? (
            <a
              href={site.cv}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-sm text-white transition-transform hover:scale-105"
            >
              cv
              <span aria-hidden>↗</span>
            </a>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {site.email && (
              <a href={`mailto:${site.email}`} aria-label={`Email ${site.email}`} title={site.email} tabIndex={open ? 0 : -1} className={iconClass}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
              </a>
            )}
            <a href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub" tabIndex={open ? 0 : -1} className={iconClass}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>
            </a>
            {site.linkedin && (
              <a href={site.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" tabIndex={open ? 0 : -1} className={iconClass}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm1.8 13.1H3.5V9h3.6v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0Z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
