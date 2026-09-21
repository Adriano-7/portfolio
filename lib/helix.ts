/** Pure helix layout math. `t` is a card's parameter in card units, 0 = front. */
export type HelixParams = {
  radius: number;
  stepAngle: number; // radians between consecutive cards
  stepY: number; // vertical rise per card
  maxYaw: number; // 1 aligns every card to the cylinder's outward normal
  maxPitch: number; // how much cards tip away from the viewer around the orbit
  maxRoll: number; // how much cards lean into the spiral
  frontScale: number; // makes the active, front-facing card the visual anchor
  depthScale: number; // scale reduction at the back
  fadeWidth: number; // cards fade over this many units before wrapping
  tilt: [number, number, number]; // group rotation (x, y, z)
  cardW: number;
  cardH: number;
  bend: number;
  rise: 1 | -1; // +1: the next card sits higher than the front one, -1: lower
};

export const DESKTOP_HELIX: HelixParams = {
  radius: 2.72,
  stepAngle: 0.76,
  stepY: 0.6,
  maxYaw: 1,
  maxPitch: 0.18,
  maxRoll: 0.22,
  frontScale: 0.14,
  depthScale: 0.34,
  fadeWidth: 1.45,
  tilt: [-0.055, 0.02, -0.015],
  cardW: 1.7,
  cardH: 1.0,
  bend: 0.11,
  rise: 1,
};

// Neighbouring cards must not overlap on screen: the card entering the front and the one
// leaving it swap draw order as they pass, which pops visibly if they share any pixels.
export const MOBILE_HELIX: HelixParams = {
  ...DESKTOP_HELIX,
  radius: 1.82,
  stepY: 0.68,
  maxPitch: 0.12,
  maxRoll: 0.14,
  frontScale: 0.08,
  // next card below the front one, so a swipe up (or left) brings it in, as on any feed/carousel
  rise: -1,
  tilt: [-0.055, 0.02, 0],
  cardW: 1.35,
  cardH: 0.85,
  bend: 0.08,
};

export type Pose = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
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
    // Every card centre remains at `radius` from the y-axis: one true cylinder.
    x: s * p.radius,
    y: p.rise * t * p.stepY,
    z: c * p.radius,
    rotX: (1 - c) * p.maxPitch,
    // A plane starts facing +z. Rotating it by the orbital angle makes its normal
    // match the cylinder normal (sin(angle), 0, cos(angle)) at this position.
    rotY: angle * p.maxYaw,
    rotZ: -s * p.maxRoll,
    depth,
    scale: (1 + p.frontScale * (1 - depth) * (1 - depth)) * (1 - p.depthScale * depth),
    fade: smoothstep(0, p.fadeWidth, edge),
  };
}
