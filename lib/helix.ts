/** Pure helix layout math. `t` is a card's parameter in card units, 0 = front. */
export type HelixParams = {
  radius: number;
  stepAngle: number; // radians between consecutive cards
  stepY: number; // vertical rise per card
  maxYaw: number; // how much side cards turn to follow the curve
  depthScale: number; // scale reduction at the back
  fadeWidth: number; // cards fade over this many units before wrapping
  tilt: [number, number, number]; // group rotation (x, y, z)
  cardW: number;
  cardH: number;
  bend: number;
  rise: 1 | -1; // +1: the next card sits higher than the front one, -1: lower
};

export const DESKTOP_HELIX: HelixParams = {
  radius: 2.5,
  stepAngle: 0.85,
  stepY: 0.5,
  maxYaw: 0.85,
  depthScale: 0.28,
  fadeWidth: 1.8,
  tilt: [-0.1, 0, -0.01],
  cardW: 1.7,
  cardH: 1.0,
  bend: 0.07,
  rise: 1,
};

// Neighbouring cards must not overlap on screen: the card entering the front and the one
// leaving it swap draw order as they pass, which pops visibly if they share any pixels.
export const MOBILE_HELIX: HelixParams = {
  ...DESKTOP_HELIX,
  radius: 1.7,
  stepY: 0.62,
  // next card below the front one, so a swipe up (or left) brings it in, as on any feed/carousel
  rise: -1,
  tilt: [-0.1, 0, 0],
  cardW: 1.35,
  cardH: 0.85,
};

export type Pose = {
  x: number;
  y: number;
  z: number;
  rotY: number;
  depth: number; // 0 front → 1 back
  scale: number;
  fade: number; // 0 near the wrap seam → 1
};

export function wrapT(i: number, progress: number, n: number) {
  const d = (((i - progress) % n) + n) % n;
  return d >= n / 2 ? d - n : d;
}

function smoothstep(a: number, b: number, x: number) {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
}

export function cardPose(t: number, n: number, p: HelixParams): Pose {
  const angle = t * p.stepAngle;
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const depth = (1 - c) / 2;
  const edge = n / 2 - Math.abs(t);
  return {
    x: s * p.radius,
    y: p.rise * t * p.stepY,
    z: c * p.radius,
    rotY: s * p.maxYaw,
    depth,
    scale: 1 - p.depthScale * depth,
    fade: smoothstep(0, p.fadeWidth, edge),
  };
}
