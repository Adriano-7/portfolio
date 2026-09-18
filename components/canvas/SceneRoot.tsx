"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Helix } from "./Helix";
import { DESKTOP_HELIX, MOBILE_HELIX } from "@/lib/helix";
import { useStore } from "@/lib/store";
import { useMediaQuery, useWebGL } from "@/lib/useEnv";
import type { ProjectMeta } from "@/lib/projects";

export function SceneRoot({ projects }: { projects: ProjectMeta[] }) {
  const webgl = useWebGL();
  const mobile = useMediaQuery("(max-width: 767px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (webgl === null) return;
    const s = useStore.getState();
    s.setWebgl(webgl);
    s.setReducedMotion(reduced);
    if (!webgl) {
      s.setView("list");
      s.setLoaded(true);
    } else if (reduced) {
      s.setView("list");
    }
  }, [webgl, reduced]);

  if (!webgl) return null;

  return (
    <div className="fixed inset-0 z-0" style={{ touchAction: "none" }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8.4], fov: 35, near: 0.1, far: 50 }}
        onPointerMissed={() => useStore.getState().setHovered(null)}
      >
        <Suspense fallback={null}>
          <Helix projects={projects} params={mobile ? MOBILE_HELIX : DESKTOP_HELIX} mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
