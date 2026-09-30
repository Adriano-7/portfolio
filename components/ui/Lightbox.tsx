"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useStore, type Figure } from "@/lib/store";
import { constrainView, fitImage, INITIAL_VIEW, zoomView, type ImageView, type Point, type Size } from "@/lib/lightbox-geometry";

const iconButtonClass = "flex h-11 w-11 items-center justify-center text-white/55 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

export function Lightbox() {
  const figure = useStore((s) => s.lightbox);
  if (!figure || typeof document === "undefined") return null;
  return createPortal(<ImageDialog figure={figure} />, document.body);
}

function ImageDialog({ figure }: { figure: Figure }) {
  const setLightbox = useStore((s) => s.setLightbox);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const gallery = figure.gallery;
  const index = gallery?.findIndex((item, i) => figure.index != null ? i === figure.index && item.src === figure.src : item.src === figure.src) ?? -1;
  const hasGallery = !!gallery && gallery.length > 1 && index >= 0;
  const navigate = useCallback((direction: number) => {
    if (!gallery || index < 0) return;
    const next = (index + direction + gallery.length) % gallery.length;
    setLightbox({ ...gallery[next], gallery, index: next });
  }, [gallery, index, setLightbox]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!hasGallery || !gallery) return;
    for (const offset of [-1, 1]) {
      const image = new Image();
      image.src = gallery[(index + offset + gallery.length) % gallery.length].src;
    }
  }, [gallery, hasGallery, index]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={figure.alt || "Image viewer"}
      aria-modal="true"
      data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); setLightbox(null); }}
      onKeyDown={(event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (hasGallery && ["ArrowLeft", "ArrowRight", "h", "l"].includes(event.key)) {
          event.preventDefault();
          navigate(event.key === "ArrowLeft" || event.key === "h" ? -1 : 1);
        }
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[#080808] p-0 text-fg backdrop:bg-black"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between px-3 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-6">
          <p className="mono pl-2 text-white/40" aria-live="polite">{hasGallery ? `${index + 1} / ${gallery.length}` : ""}</p>
          <button ref={closeRef} type="button" className={iconButtonClass} aria-label="Close dialog" onClick={() => setLightbox(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="relative flex min-h-0 flex-1">
          <ImageViewport key={figure.src} figure={figure} onClose={() => setLightbox(null)} />
          {hasGallery && <>
            <button type="button" className={`${iconButtonClass} absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/35 md:left-5`} aria-label="Previous image (Left arrow)" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
            </button>
            <button type="button" className={`${iconButtonClass} absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/35 md:right-5`} aria-label="Next image (Right arrow)" onClick={() => navigate(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
            </button>
          </>}
        </div>
        {figure.caption && <p className="mx-auto max-h-[28%] max-w-3xl shrink-0 overflow-y-auto px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm leading-relaxed text-white/50">{figure.caption}</p>}
      </div>
    </dialog>
  );
}

type Gesture = { points: Point[]; view: ImageView; moved: boolean; image: boolean; started: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

function ImageViewport({ figure, onClose }: { figure: Figure; onClose: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<Size | null>(null);
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<ImageView>(INITIAL_VIEW);
  const viewRef = useRef(view);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef<{ point: Point; time: number } | null>(null);
  const fitted = useMemo(() => natural ? fitImage(natural, viewport) : { width: 0, height: 0 }, [natural, viewport]);
  const ready = !!natural && viewport.width > 0 && viewport.height > 0 && !failed;

  // All inputs share the same bounded transform; React alone writes image styles.
  const commit = useCallback((next: ImageView) => {
    viewRef.current = next;
    setView(next);
  }, []);
  const zoom = useCallback((scale: number, anchor: Point = { x: 0, y: 0 }) => {
    if (!ready) return;
    commit(zoomView(viewRef.current, scale, anchor, anchor, fitted, viewport));
  }, [ready, fitted, viewport, commit]);

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setViewport({ width: element.clientWidth, height: element.clientHeight });
      commit(INITIAL_VIEW);
      pointers.current.clear();
      gesture.current = null;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [commit]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!ready) return;
      const rect = element.getBoundingClientRect();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.height : 1;
      if (event.ctrlKey || event.metaKey) {
        zoom(viewRef.current.scale * Math.exp(-event.deltaY * unit * 0.006), { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 });
      } else {
        commit(constrainView({ ...viewRef.current, x: viewRef.current.x - (event.shiftKey ? event.deltaY : event.deltaX) * unit, y: viewRef.current.y - (event.shiftKey ? 0 : event.deltaY) * unit }, fitted, viewport));
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    const keyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (["+", "=", "-", "_", "0"].includes(event.key)) {
        event.preventDefault();
        zoom(event.key === "0" ? 1 : viewRef.current.scale + (["+", "="].includes(event.key) ? 0.5 : -0.5));
      }
    };
    window.addEventListener("keydown", keyboard);
    return () => { element.removeEventListener("wheel", wheel); window.removeEventListener("keydown", keyboard); };
  }, [ready, zoom, commit, fitted, viewport]);

  const point = (event: PointerEvent): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
  };
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !ready) return;
    pointers.current.set(event.pointerId, point(event));
    event.currentTarget.setPointerCapture(event.pointerId);
    const points = [...pointers.current.values()];
    gesture.current = { points, view: viewRef.current, moved: points.length > 1, image: event.target === imageRef.current, started: Date.now() };
    if (points.length > 1) lastTap.current = null;
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || !pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, point(event));
    const points = [...pointers.current.values()];
    if (points.length >= 2 && current.points.length >= 2) {
      current.moved = true;
      const ratio = distance(points[0], points[1]) / Math.max(1, distance(current.points[0], current.points[1]));
      commit(zoomView(current.view, current.view.scale * ratio, midpoint(current.points[0], current.points[1]), midpoint(points[0], points[1]), fitted, viewport));
    } else if (points.length === 1) {
      if (distance(points[0], current.points[0]) > 5) current.moved = true;
      if (current.moved) commit(constrainView({ ...current.view, x: current.view.x + points[0].x - current.points[0].x, y: current.view.y + points[0].y - current.points[0].y }, fitted, viewport));
    }
  };
  const end = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    if (!pointers.current.has(event.pointerId)) return;
    const current = gesture.current;
    const anchor = point(event);
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointers.current.size) {
      gesture.current = { points: [...pointers.current.values()], view: viewRef.current, moved: true, image: true, started: Date.now() };
      return;
    }
    gesture.current = null;
    if (cancelled || !current || current.moved || distance(anchor, current.points[0]) > 5) { lastTap.current = null; return; }
    if (!current.image) { onClose(); return; }
    if (event.pointerType === "touch") {
      const previous = lastTap.current;
      const now = Date.now();
      if (now - current.started > 300) { lastTap.current = null; return; }
      if (!previous || now - previous.time > 350 || distance(anchor, previous.point) > 30) {
        lastTap.current = { point: anchor, time: now };
        return;
      }
      lastTap.current = null;
    }
    // A click toggles fit/detail. The second click of a double click is ignored.
    if (event.pointerType !== "touch") {
      const previous = lastTap.current;
      const now = Date.now();
      if (previous && now - previous.time < 350 && distance(anchor, previous.point) < 30) {
        lastTap.current = null;
        return;
      }
      lastTap.current = { point: anchor, time: now };
    }
    zoom(viewRef.current.scale > 1 ? 1 : 2, anchor);
  };

  return (
    <div ref={viewportRef} data-lenis-prevent className="relative min-h-0 flex-1 touch-none overflow-hidden overscroll-none select-none"
      onPointerDown={start} onPointerMove={move} onPointerUp={(event) => end(event)} onPointerCancel={(event) => end(event, true)} onLostPointerCapture={(event) => end(event, true)}
    >
      {!ready && <p role="status" className="mono absolute inset-0 flex items-center justify-center text-muted">{failed ? "This image could not be loaded." : "Loading image…"}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} src={figure.src} alt={figure.alt} draggable={false}
        onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
        onError={() => setFailed(true)}
        className={`absolute left-1/2 top-1/2 max-w-none rounded-lg ${figure.src.includes("/associations/") ? "bg-transparent" : "bg-white"}`}
        style={{ width: fitted.width, height: fitted.height, visibility: ready ? "visible" : "hidden", cursor: view.scale > 1 ? "grab" : "zoom-in", transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})`, touchAction: "none" }}
      />
    </div>
  );
}
