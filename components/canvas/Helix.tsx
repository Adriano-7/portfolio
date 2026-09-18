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
const meshRaycast = THREE.Mesh.prototype.raycast;

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
  const textures = useTexture(projects.map((p) => (mobile ? p.coverSm : p.cover)));
  const group = useRef<THREE.Group>(null);
  const runtime = useRef<Runtime[]>([]);
  const scrollRef = useRef<VirtualScroll | null>(null);
  if (scrollRef.current == null) {
    scrollRef.current = new VirtualScroll();
  }
  const camera = useThree((s) => s.camera);
  const n = projects.length;

  // start of the reveal animation (clock seconds), set once textures are in
  const revealStart = useRef<number | null>(null);
  const transition = useRef<{ index: number; t: number; start: number } | null>(null);
  const parallax = useRef({ x: 0, y: 0 });

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
  const onClick = (index: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!interactive() || scrollRef.current!.isDragging) return;
    const p = projects[index];
    const s = useStore.getState();
    if (p.featured) {
      s.setTransitioning(p.slug);
      s.setHovered(null);
      transition.current = { index, t: 0, start: -1 };
    } else {
      window.open(p.repo, "_blank", "noopener,noreferrer");
    }
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

    const progress = scroll.update(dt);
    const speed = THREE.MathUtils.clamp(scroll.velocity * 6, -0.35, 0.35);

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

    // transition timeline
    const tr = transition.current;
    if (tr) {
      if (tr.start < 0) tr.start = state.clock.elapsedTime;
      tr.t = Math.min(1, (state.clock.elapsedTime - tr.start) / 0.75);
      if (tr.t >= 1) {
        s.requestNavigation(`/work/${projects[tr.index].slug}`);
        transition.current = null;
      }
    }

    for (let i = 0; i < n; i++) {
      const c = rt[i];
      const pose = cardPose(wrapT(i, progress, n), n, params);

      // target pose in group-local space
      let tx = pose.x, ty = pose.y, tz = pose.z, tscale = pose.scale;
      let alphaTarget = pose.fade;
      let snap = false;
      _e.set(0, pose.rotY, 0);
      _q.setFromEuler(_e);

      const hoveredInList = listMode && s.hovered === projects[i].slug;
      if (!spiralVisible && !hoveredInList) alphaTarget = 0;

      if (hoveredInList) {
        // float the hovered card to the right of the list, in world space
        worldToLocalPose(g, mobile ? 0 : 2.3, mobile ? -1.2 : 0.15, 3.2, 0, -0.14);
        tx = _v.x; ty = _v.y; tz = _v.z; tscale = mobile ? 0.9 : 1.15; alphaTarget = 1;
        _q.copy(_q2);
        if (c.alpha < 0.02) snap = true;
      }

      if (tr && tr.index === i) {
        const k = easeInOut(tr.t);
        worldToLocalPose(g, 0, mobile ? 0.9 : 0.55, 3.6, 0, 0);
        tx = THREE.MathUtils.lerp(tx, _v.x, k);
        ty = THREE.MathUtils.lerp(ty, _v.y, k);
        tz = THREE.MathUtils.lerp(tz, _v.z, k);
        tscale = THREE.MathUtils.lerp(tscale, 1.55, k);
        _q.slerp(_q2, k);
        alphaTarget = 1;
      } else if (tr) {
        alphaTarget *= 1 - easeInOut(tr.t);
      }

      // smooth toward target; snap on wrap jumps
      const jump = Math.abs(ty - c.pos.y) > params.stepY * 3 || snap;
      if (jump || c.alpha < 0.01) {
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
      c.alpha = damp(c.alpha, alphaTarget, 8, dt);
      const zoomTarget = s.hovered === projects[i].slug && (spiralVisible || hoveredInList) ? 1 : 0;
      c.zoom = damp(c.zoom, zoomTarget, 10, dt);

      c.mesh.position.copy(c.pos);
      c.mesh.quaternion.copy(c.quat);
      c.mesh.scale.setScalar(c.scale);
      c.mesh.visible = c.alpha > 0.005;
      // only solid cards may be hovered/clicked
      c.mesh.raycast = c.alpha > 0.55 && pose.depth < 0.8 ? meshRaycast : noRaycast;

      c.mat.setU("uDepth", hoveredInList || (tr && tr.index === i) ? 0 : pose.depth);
      c.mat.setU("uOpacity", c.alpha * (elapsed < 0 ? 0 : 1));
      c.mat.setU("uReveal", c.reveal);
      c.mat.setU("uZoom", c.zoom);
      c.mat.setU("uScrollSpeed", hoveredInList ? 0 : speed);
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
