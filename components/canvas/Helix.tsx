"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { CardMaterial } from "./CardMaterial";
import { cardPose, wrapT, type HelixParams } from "@/lib/helix";
import { VirtualScroll } from "@/lib/virtualScroll";
import { useStore } from "@/lib/store";
import type { ProjectMeta } from "@/lib/projects";

type Runtime = {
  mesh: THREE.Mesh;
  mat: CardMaterial;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: number;
  alpha: number;
  zoom: number;
  reveal: number;
};

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _e = new THREE.Euler();
const _m = new THREE.Matrix4();
const _gq = new THREE.Quaternion();
const noRaycast = () => {};
const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
// the click transition must draw over everything else
const PREVIEW_RENDER_ORDER = 1000;
// the clicked card flies onto this world-space plane, where it lines up with the case study cover
const FLIGHT_Z = 2.5;
const FLIGHT_TIME = 1.5;
// matches rounded-2xl on the case study cover
const COVER_RADIUS_PX = 16;
const meshRaycast = THREE.Mesh.prototype.raycast;

type Flight = {
  index: number;
  t: number;
  start: number;
  /** pose (group-local) the card had when it was clicked */
  from: { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number };
  /** world-space centre on the flight plane; provisional until the cover is measured */
  target: THREE.Vector3;
  targetScale: number;
  /** corner radius in plane units that matches the cover's rounded corners */
  radius: number;
  found: boolean;
  navigated: boolean;
  /** the route has left "/" at least once (so returning home means "back") */
  left: boolean;
  landedAt: number;
};

function damp(cur: number, target: number, k: number, dt: number) {
  return cur + (target - cur) * (1 - Math.exp(-k * dt));
}

export function Helix({
  projects,
  params,
  mobile,
}: {
  projects: ProjectMeta[];
  params: HelixParams;
  mobile: boolean;
}) {
  const textures = useTexture(projects.map((p) => (mobile ? p.coverSm : (p.cardCover ?? p.cover))));
  const group = useRef<THREE.Group>(null);
  const runtime = useRef<Runtime[]>([]);
  const camera = useThree((s) => s.camera);
  const n = projects.length;
  const scrollRef = useRef<VirtualScroll | null>(null);
  if (scrollRef.current == null) {
    const sc = new VirtualScroll();
    // start with the first project at the front (t = 0 when progress = 0)
    sc.target = sc.current = 0;
    scrollRef.current = sc;
  }

  // start of the reveal animation (clock seconds), set once textures are in
  const revealStart = useRef<number | null>(null);
  const transition = useRef<Flight | null>(null);
  const parallax = useRef({ x: 0, y: 0 });
  const shear = useRef(0);

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(params.cardW, params.cardH, 24, 24),
    [params.cardW, params.cardH],
  );

  const materials = useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.needsUpdate = true;
    });
    return projects.map(
      (p, i) =>
        new CardMaterial({
          map: textures[i],
          accent: p.accent,
          seed: i * 7.13,
          planeW: params.cardW,
          planeH: params.cardH,
          bend: params.bend,
        }),
    );
  }, [textures, projects, params]);

  useEffect(() => {
    const sc = scrollRef.current!;
    sc.attach(window);
    return () => sc.detach();
  }, []);

  useEffect(() => {
    return () => {
      materials.forEach((m) => m.dispose());
      geometry.dispose();
    };
  }, [materials, geometry]);

  // pointer handlers -----------------------------------------------------
  const interactive = () => {
    const s = useStore.getState();
    return (
      s.pathname === "/" &&
      s.view === "spiral" &&
      !s.menuOpen &&
      !s.transitioning &&
      s.loaded
    );
  };

  const onOver = (slug: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!interactive() || scrollRef.current!.isDragging) return;
    useStore.getState().setHovered(slug);
  };
  const onOut = () => () => {
    const s = useStore.getState();
    if (s.pathname === "/" && s.view === "spiral") s.setHovered(null);
  };
  const open = (index: number) => {
    const p = projects[index];
    const s = useStore.getState();
    s.setTransitioning(p.slug);
    s.setHovered(null);
    transition.current = {
      index,
      t: 0,
      start: -1,
      from: { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1 },
      target: new THREE.Vector3(0, mobile ? 0.5 : 0.3, FLIGHT_Z),
      targetScale: 1.6,
      radius: 0.045,
      found: false,
      navigated: false,
      left: false,
      landedAt: -1,
    };
  };
  const onClick = (index: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!interactive() || scrollRef.current!.isDragging) return;
    open(index);
  };

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const g = group.current;
    if (!g) return;
    const s = useStore.getState();
    const rt = runtime.current;
    if (rt.length !== n) return;

    const onHome = s.pathname === "/";
    const spiralVisible = onHome && s.view === "spiral" && !s.transitioning;
    const listMode = onHome && s.view === "list";
    const scroll = scrollRef.current!;
    scroll.enabled = spiralVisible && !s.menuOpen && s.loaded;

    if (s.loaded && revealStart.current === null) revealStart.current = state.clock.elapsedTime;
    const elapsed = revealStart.current === null ? -1 : state.clock.elapsedTime - revealStart.current;
    // idle drift waits for the intro, pauses while a card is hovered and is off for reduced motion
    scroll.driftAllowed = elapsed > 2 && !s.hovered && !s.reducedMotion;

    // scrolling down / arrow down moves forward through the list
    const progress = scroll.update(dt);
    // shear from scroll velocity, per second so it feels the same at 30 and 120 fps, then smoothed;
    // pointer events arrive unevenly, so dragging gets a heavier filter than wheel/keys
    const maxShear = mobile ? 0.22 : 0.35;
    const rawShear = THREE.MathUtils.clamp((-scroll.velocity / dt) * 0.1 * params.rise, -maxShear, maxShear);
    shear.current = damp(shear.current, rawShear, scroll.isDragging ? 5 : 9, dt);
    const speed = shear.current;

    // the card closest to t = 0 is the one at the front; the caption follows it
    const active = ((Math.round(progress) % n) + n) % n;
    if (active !== s.active) s.setActive(active);

    // caption click: run the same transition as clicking the card
    if (s.openRequest) {
      const idx = projects.findIndex((p) => p.slug === s.openRequest);
      s.requestOpen(null);
      if (idx >= 0 && interactive()) open(idx);
    }

    // group tilt + pointer parallax + intro scale
    const px = s.reducedMotion ? 0 : state.pointer.x;
    const py = s.reducedMotion ? 0 : state.pointer.y;
    parallax.current.x = damp(parallax.current.x, px, 3, dt);
    parallax.current.y = damp(parallax.current.y, py, 3, dt);
    g.rotation.set(
      params.tilt[0] + parallax.current.y * 0.06,
      params.tilt[1] + parallax.current.x * 0.1,
      params.tilt[2] - parallax.current.x * 0.03,
    );
    const intro = elapsed < 0 ? 0.86 : 0.86 + 0.14 * easeOut(Math.min(1, elapsed / 1.4));
    g.scale.setScalar(intro);
    g.updateMatrixWorld();

    // screen direction from the front card to the next one, for drag projection
    {
      const a = cardPose(0, n, params);
      const b = cardPose(1, n, params);
      _p0.set(a.x, a.y, a.z).applyMatrix4(g.matrixWorld).project(camera);
      _p1.set(b.x, b.y, b.z).applyMatrix4(g.matrixWorld).project(camera);
      const dx = (_p1.x - _p0.x) * state.size.width;
      const dy = -(_p1.y - _p0.y) * state.size.height;
      const len = Math.hypot(dx, dy) || 1;
      scroll.dragAxis.x = dx / len;
      scroll.dragAxis.y = dy / len;
    }

    // click transition: the card flies into the case study cover, which takes over once it lands
    let tr = transition.current;
    if (tr) {
      const now = state.clock.elapsedTime;
      const slug = projects[tr.index].slug;
      if (tr.start < 0) {
        tr.start = now;
        const c = rt[tr.index];
        tr.from.pos.copy(c.pos);
        tr.from.quat.copy(c.quat);
        tr.from.scale = c.scale;
      }
      tr.t = Math.min(1, (now - tr.start) / FLIGHT_TIME);
      // navigate almost at once so the page is mounted (and measurable) well before the card arrives
      if (!tr.navigated && now - tr.start > 0.08) {
        s.requestNavigation(`/work/${slug}`);
        tr.navigated = true;
      }
      if (!onHome) tr.left = true;

      const el = onHome ? null : document.querySelector<HTMLElement>(`[data-hero-cover="${slug}"]`);
      if (el) {
        // DOM rect -> world pose on the flight plane (camera looks down -z from the origin's axis)
        const r = el.getBoundingClientRect();
        const cam = camera as THREE.PerspectiveCamera;
        const visH = 2 * (cam.position.z - FLIGHT_Z) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
        const pxToWorld = visH / state.size.height;
        const wx = (r.left + r.width / 2 - state.size.width / 2) * pxToWorld;
        const wy = -(r.top + r.height / 2 - state.size.height / 2) * pxToWorld;
        const ws = (r.width * pxToWorld) / params.cardW;
        tr.found = true;
        // ease over from the provisional target instead of jumping to the first measurement
        const k = tr.t >= 1 ? 1 : 1 - Math.exp(-12 * dt);
        tr.target.x += (wx - tr.target.x) * k;
        tr.target.y += (wy - tr.target.y) * k;
        tr.targetScale += (ws - tr.targetScale) * k;
        tr.radius = (COVER_RADIUS_PX * pxToWorld) / ws;
      }

      if (tr.t >= 1 && tr.landedAt < 0 && (tr.found || now - tr.start > 3)) {
        tr.landedAt = now;
        // reveals the DOM cover underneath/over the card
        s.setTransitioning(null);
      }
      // hold the card until the cover has faded in over it, then drop it; also bail out on "back"
      if ((tr.landedAt >= 0 && now - tr.landedAt > 0.35) || (tr.left && onHome)) {
        const c = rt[tr.index];
        c.alpha = 0;
        c.mat.setU("uBend", params.bend);
        c.mat.setU("uRadius", 0.045);
        transition.current = null;
        tr = null;
      }
    }

    for (let i = 0; i < n; i++) {
      const c = rt[i];
      const pose = cardPose(wrapT(i, progress, n), n, params);

      // target pose in group-local space
      const tx = pose.x, ty = pose.y, tz = pose.z, tscale = pose.scale;
      let alphaTarget = pose.fade;
      let hold = false;
      _e.set(pose.rotX, pose.rotY, pose.rotZ);
      _q.setFromEuler(_e);

      if (!spiralVisible) alphaTarget = 0;
      if (listMode) {
        // fade out where the card is instead of drifting back to its spiral pose
        hold = true;
      }

      const flying = !!tr && tr.index === i;
      if (flying) {
        alphaTarget = 1;
      } else if (tr) {
        alphaTarget *= 1 - easeInOut(Math.min(1, tr.t * 2));
      }

      // smooth toward target; snap on wrap jumps
      const jump = Math.abs(ty - c.pos.y) > params.stepY * 3;
      if (flying) {
        // scripted path from where the card was clicked to the (live) cover position
        const k = easeInOut(tr!.t);
        worldToLocalPose(g, tr!.target.x, tr!.target.y, tr!.target.z, 0, 0);
        c.pos.lerpVectors(tr!.from.pos, _v, k);
        c.quat.slerpQuaternions(tr!.from.quat, _q2, k);
        c.scale = THREE.MathUtils.lerp(tr!.from.scale, tr!.targetScale / g.scale.x, k);
        c.mat.setU("uBend", params.bend * (1 - k));
        c.mat.setU("uRadius", THREE.MathUtils.lerp(0.045, tr!.radius, k));
      } else if (hold && c.alpha >= 0.01) {
        // keep the current pose; only the alpha changes
      } else if (jump || c.alpha < 0.01) {
        c.pos.set(tx, ty, tz);
        c.quat.copy(_q);
        c.scale = tscale;
      } else {
        const k = 1 - Math.exp(-14 * dt);
        c.pos.x += (tx - c.pos.x) * k;
        c.pos.y += (ty - c.pos.y) * k;
        c.pos.z += (tz - c.pos.z) * k;
        c.quat.slerp(_q, k);
        c.scale += (tscale - c.scale) * k;
      }

      // reveal & alpha
      const revealTarget = elapsed < 0 ? 0 : THREE.MathUtils.clamp((elapsed - i * 0.07) / 1.1, 0, 1);
      c.reveal = s.reducedMotion ? (elapsed < 0 ? 0 : 1) : easeOut(revealTarget);
      c.alpha = flying ? damp(c.alpha, 1, 14, dt) : damp(c.alpha, alphaTarget, hold ? 14 : 8, dt);
      const zoomTarget = s.hovered === projects[i].slug && spiralVisible ? 1 : 0;
      c.zoom = damp(c.zoom, zoomTarget, 10, dt);

      c.mesh.position.copy(c.pos);
      c.mesh.quaternion.copy(c.quat);
      c.mesh.scale.setScalar(c.scale);
      c.mesh.visible = c.alpha > 0.005;
      c.mesh.renderOrder = flying ? PREVIEW_RENDER_ORDER : 0;
      // only solid cards may be hovered/clicked
      c.mesh.raycast = c.alpha > 0.55 && pose.depth < 0.8 ? meshRaycast : noRaycast;

      c.mat.setU("uDepth", flying ? 0 : pose.depth);
      c.mat.setU("uOpacity", c.alpha * (elapsed < 0 ? 0 : 1));
      c.mat.setU("uReveal", c.reveal);
      c.mat.setU("uZoom", c.zoom);
      c.mat.setU("uScrollSpeed", flying ? 0 : speed);
    }
  });

  // keep the camera where the layout expects it
  useEffect(() => {
    camera.position.set(0, 0, mobile ? 8.2 : 8.4);
    camera.lookAt(0, 0, 0);
  }, [camera, mobile]);

  return (
    <group ref={group}>
      {projects.map((p, i) => (
        <mesh
          key={p.slug}
          geometry={geometry}
          material={materials[i]}
          visible={false}
          ref={(mesh) => {
            if (!mesh) return;
            runtime.current[i] = {
              mesh,
              mat: materials[i],
              pos: new THREE.Vector3(),
              quat: new THREE.Quaternion(),
              scale: 1,
              alpha: 0,
              zoom: 0,
              reveal: 0,
            };
          }}
          onPointerOver={onOver(p.slug)}
          onPointerOut={onOut()}
          onClick={onClick(i)}
        />
      ))}
    </group>
  );
}

/** writes a world-space pose into _v (position) and _q2 (rotation) in group-local space */
function worldToLocalPose(g: THREE.Group, x: number, y: number, z: number, rx: number, ry: number) {
  _v.set(x, y, z);
  g.worldToLocal(_v);
  _e.set(rx, ry, 0);
  _q2.setFromEuler(_e);
  _m.copy(g.matrixWorld).invert();
  _gq.setFromRotationMatrix(_m);
  _q2.premultiply(_gq);
}

function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
