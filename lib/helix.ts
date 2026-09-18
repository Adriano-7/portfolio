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
};

export const DESKTOP_HELIX: HelixParams = {
  radius: 2.5,
  stepAngle: (Math.PI * 2) / 8,
  stepY: 0.36,
  maxYaw: 0.75,
  depthScale: 0.28,
  fadeWidth: 1.5,
  tilt: [-0.1, 0, -0.28],
  cardW: 1.5,
  cardH: 0.94,
  bend: 0.07,
};

export const MOBILE_HELIX: HelixParams = {
  ...DESKTOP_HELIX,
  radius: 1.55,
  stepY: 0.62,
  tilt: [-0.1, 0, -0.18],
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
  const t = (((i + progress) % n) + n) % n;
  return t - n / 2;
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
    y: t * p.stepY,
    z: c * p.radius,
    rotY: s * p.maxYaw,
    depth,
    scale: 1 - p.depthScale * depth,
    fade: smoothstep(0, p.fadeWidth, edge),
  };
}
