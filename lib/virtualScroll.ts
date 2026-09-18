/**
 * Accumulates wheel, touch, drag and keyboard input into a single scalar
 * (in "card units") and smooths it every frame. Infinite: never clamped.
 */
export type VirtualScrollOptions = {
  wheel: number; // card units per wheel pixel
  touch: number; // card units per touch pixel
  drag: number; // card units per mouse-drag pixel
  ease: number; // lerp factor per frame at 60fps
  snap: boolean;
  snapDelay: number; // ms of idle before snapping to the nearest card
  commit: number; // drag distance (in cards) after which a release always advances one card
  flick: number; // extra cards per px/ms of release velocity
  maxFlick: number; // cap on cards added by a flick
  drift: number; // cards per second the helix creeps forward while idle (0 disables)
  driftDelay: number; // ms without input before drifting starts
};

const DEFAULTS: VirtualScrollOptions = {
  wheel: 1 / 520,
  touch: 1 / 130,
  drag: 1 / 140,
  ease: 0.09,
  snap: true,
  snapDelay: 420,
  commit: 0.08,
  flick: 1.1,
  maxFlick: 2,
  drift: 0.045,
  driftDelay: 2500,
};

function clamp(x: number, a: number, b: number) {
  return Math.min(b, Math.max(a, x));
}

export class VirtualScroll {
  target = 0;
  current = 0;
  velocity = 0;
  enabled = true;
  /** set to false (e.g. while a card is hovered) to hold the idle drift */
  driftAllowed = true;
  opts: VirtualScrollOptions;

  private el: Window | null = null;
  private dragging = false;
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private moved = 0;
  private dragStart = 0; // target when the drag began
  private lastMoveTime = 0;
  private pxVelocity = 0; // smoothed px/ms along the drag axis
  private snapTimer: ReturnType<typeof setTimeout> | null = null;
  private lastInput = 0;

  constructor(opts: Partial<VirtualScrollOptions> = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  attach(el: Window) {
    this.el = el;
    el.addEventListener("wheel", this.onWheel, { passive: false });
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointercancel", this.onPointerUp);
    el.addEventListener("keydown", this.onKey);
  }

  detach() {
    const el = this.el;
    if (!el) return;
    el.removeEventListener("wheel", this.onWheel);
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerup", this.onPointerUp);
    el.removeEventListener("pointercancel", this.onPointerUp);
    el.removeEventListener("keydown", this.onKey);
    this.el = null;
  }

  /** true while the pointer has travelled far enough to count as a drag */
  get isDragging() {
    return this.dragging && this.moved > 6;
  }

  /** advance the smoothing; call once per frame */
  update(dt = 1 / 60) {
    const prev = this.current;
    if (
      this.enabled &&
      this.driftAllowed &&
      this.opts.drift &&
      !this.dragging &&
      performance.now() - this.lastInput > this.opts.driftDelay
    ) {
      this.target += this.opts.drift * dt;
    }
    // frame-rate independent lerp
    const k = 1 - Math.pow(1 - this.opts.ease, dt * 60);
    this.current += (this.target - this.current) * k;
    if (Math.abs(this.target - this.current) < 1e-4) this.current = this.target;
    this.velocity = this.current - prev;
    return this.current;
  }

  private scheduleSnap() {
    this.lastInput = performance.now();
    if (this.snapTimer) clearTimeout(this.snapTimer);
    if (!this.opts.snap) return;
    this.snapTimer = setTimeout(() => {
      this.target = Math.round(this.target);
    }, this.opts.snapDelay);
  }

  private isUiTarget(e: Event) {
    const t = e.target as HTMLElement | null;
    return !!t && !!t.closest && !!t.closest("[data-ui]");
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.enabled || this.isUiTarget(e)) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    this.target += d * this.opts.wheel;
    this.scheduleSnap();
  };

  private onPointerDown = (e: PointerEvent) => {
    if (!this.enabled || this.isUiTarget(e)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.dragging = true;
    this.pointerId = e.pointerId;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.moved = 0;
    this.dragStart = Math.round(this.target);
    this.lastInput = performance.now();
    this.lastMoveTime = e.timeStamp;
    this.pxVelocity = 0;
    if (this.snapTimer) clearTimeout(this.snapTimer);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.moved += Math.abs(dx) + Math.abs(dy);
    const k = e.pointerType === "mouse" ? this.opts.drag : this.opts.touch;
    // both axes count fully: pulling a card down or to the right moves the helix "backwards"
    const d = dy + dx;
    this.target -= d * k;
    const dtMs = Math.max(1, e.timeStamp - this.lastMoveTime);
    this.lastMoveTime = e.timeStamp;
    this.lastInput = performance.now();
    this.pxVelocity = this.pxVelocity * 0.6 + (-d / dtMs) * 0.4;
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;
    if (this.snapTimer) clearTimeout(this.snapTimer);
    // a stale velocity from a pause before release should not count as a flick
    const stale = e.timeStamp - this.lastMoveTime > 80;
    const flick = stale ? 0 : clamp(this.pxVelocity * this.opts.flick, -this.opts.maxFlick, this.opts.maxFlick);
    const delta = this.target - this.dragStart;
    let end = Math.round(this.target + flick);
    // a deliberate but short drag still commits to the next card in that direction
    if (end === this.dragStart && Math.abs(delta) >= this.opts.commit) end = this.dragStart + Math.sign(delta);
    this.target = end;
    this.lastInput = performance.now();
  };

  private onKey = (e: KeyboardEvent) => {
    if (!this.enabled) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    let d = 0;
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") d = 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") d = -1;
    if (!d) return;
    e.preventDefault();
    this.target = Math.round(this.target) + d;
    this.lastInput = performance.now();
  };
}
