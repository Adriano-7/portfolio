import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uBend;
  uniform float uScrollSpeed;
  uniform float uDepth;
  uniform float uSide;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Rear cards catch more of the "wind" so the cylinder has a soft, flexible surface.
    float arch = sin(uv.x * 3.14159265);
    float rear = smoothstep(0.12, 0.95, uDepth);
    float side = smoothstep(0.12, 0.85, uSide);
    // Maintain a smooth, elegant curvature that gently softens at grazing angles
    float curl = uBend * (1.0 + rear * 0.6 - side * 0.45);
    float shape = rear * (1.0 - side * 0.4);
    p.z += arch * curl;
    p.y += arch * sin(uv.y * 3.14159265) * curl * 0.08;
    p.x += sin(uv.y * 3.14159265) * curl * rear * 0.05;
    // Cards skew gently as they reach the rear
    float lean = sin(uSeed * 1.73 + 0.9);
    p.x += (uv.y - 0.5) * shape * lean * 0.18;
    p.y += (uv.x - 0.5) * shape * lean * 0.12;
    // shear while the helix is moving
    p.y += (uv.x - 0.5) * uScrollSpeed;
    p.x += sin(uv.y * 3.14159265) * uScrollSpeed * 0.25;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2 uImageSizes;
  uniform vec2 uPlaneSizes;
  uniform float uReveal;
  uniform float uZoom;
  uniform float uDepth;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uRadius;
  uniform vec3 uFillColor;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float planeAspect = uPlaneSizes.x / uPlaneSizes.y;
    float imageAspect = uImageSizes.x / uImageSizes.y;
    vec2 ratio = vec2(min(planeAspect / imageAspect, 1.0), min(imageAspect / planeAspect, 1.0));
    vec2 uv = (vUv - 0.5) * ratio + 0.5;
    uv = (uv - 0.5) / (1.0 + 0.07 * uZoom) + 0.5;

    // Instead of simply lowering texture resolution, distant cards distort and smear
    // along a seeded flow field. The lead card (uDepth = 0) remains completely crisp.
    float rear = smoothstep(0.1, 0.95, uDepth);
    vec2 fromCenter = uv - 0.5;
    float ripple = sin(uv.y * 15.0 + uSeed * 1.7) * sin(uv.x * 11.0 - uSeed * 0.8);
    vec2 swirl = vec2(-fromCenter.y, fromCenter.x) * ripple * rear * 0.035;
    vec2 flow = normalize(vec2(cos(uSeed * 1.91), sin(uSeed * 1.37)));
    vec2 distortedUv = clamp(uv + swirl, 0.001, 0.999);

    // "denoise" reveal: coarse noisy blocks resolve into the image
    float r = clamp(uReveal, 0.0, 1.0);
    float blocks = mix(9.0, 720.0, r * r);
    vec2 grid = vec2(blocks, blocks / planeAspect);
    vec2 cell = floor(distortedUv * grid);
    vec2 puv = (cell + 0.5) / grid;
    vec2 suv = r > 0.999 ? distortedUv : puv;

    float blur = rear * 0.014;
    vec4 tex = texture2D(uMap, suv, rear * 4.0);
    vec4 ahead = texture2D(uMap, clamp(suv + flow * blur, 0.001, 0.999), rear * 4.0);
    vec4 behind = texture2D(uMap, clamp(suv - flow * blur, 0.001, 0.999), rear * 4.0);
    tex = mix(tex, (ahead + tex * 2.0 + behind) * 0.25, rear);

    float n = hash(cell + uSeed);
    float showNoise = step(r, n) * (1.0 - r);
    vec3 noiseCol = mix(uFillColor, vec3(n), 0.55) * (0.35 + 0.65 * n);
    vec3 col = mix(tex.rgb, noiseCol, showNoise);

    col *= 1.0 - 0.62 * uDepth;
    col += 0.04 * uZoom;

    vec2 p = (vUv - 0.5) * uPlaneSizes;
    float d = roundedBox(p, uPlaneSizes * 0.5, uRadius);
    float aa = fwidth(d);
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    if (alpha <= 0.0) discard;

    gl_FragColor = vec4(col, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

export type CardUniformName =
  | "uReveal"
  | "uZoom"
  | "uDepth"
  | "uSide"
  | "uOpacity"
  | "uScrollSpeed"
  | "uBend"
  | "uRadius";

export class CardMaterial extends THREE.ShaderMaterial {
  constructor(opts: {
    map: THREE.Texture;
    accent: string;
    seed: number;
    planeW: number;
    planeH: number;
    bend: number;
  }) {
    const img = opts.map.image as { width?: number; height?: number; videoWidth?: number; videoHeight?: number } | undefined;
    const imgW = img?.width || img?.videoWidth || 1280;
    const imgH = img?.height || img?.videoHeight || 800;
    super({
      uniforms: {
        uMap: { value: opts.map },
        uImageSizes: { value: new THREE.Vector2(imgW, imgH) },
        uPlaneSizes: { value: new THREE.Vector2(opts.planeW, opts.planeH) },
        uReveal: { value: 0 },
        uZoom: { value: 0 },
        uDepth: { value: 0 },
        uSide: { value: 0 },
        uOpacity: { value: 0 },
        uScrollSpeed: { value: 0 },
        uBend: { value: opts.bend },
        uSeed: { value: opts.seed },
        uRadius: { value: 0.045 },
        uFillColor: { value: new THREE.Color(opts.accent) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  setU(name: CardUniformName, value: number) {
    this.uniforms[name].value = value;
  }

  getU(name: CardUniformName): number {
    return this.uniforms[name].value as number;
  }
}
