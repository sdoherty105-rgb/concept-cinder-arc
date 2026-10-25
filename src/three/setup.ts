import {
  ACESFilmicToneMapping,
  CanvasTexture,
  PCFShadowMap,
  SRGBColorSpace,
  type Scene,
  type WebGLRenderer,
} from "three";
import { createDuskEnvironment, type Quality } from "./kit";
import type { SceneSpec } from "./scenes";

export function configureRenderer(renderer: WebGLRenderer, spec: SceneSpec, quality: Quality) {
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = spec.exposure;
  renderer.shadowMap.enabled = true;
  // Softness comes from each light's shadow.radius; the light tier uses a smaller map and radius.
  renderer.shadowMap.type = PCFShadowMap;
  void quality;
}

/** Screen-space vertical gradient: dark zenith easing into a lifted horizon. */
function skyGradient(stops: [string, string, string]) {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, stops[0]);
  g.addColorStop(0.62, stops[1]);
  g.addColorStop(1, stops[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Moves a built variant into `scene` and gives it its sky, fog and reflections. */
export function mountSpec(scene: Scene, spec: SceneSpec, renderer: WebGLRenderer) {
  scene.background = spec.sky ? skyGradient(spec.sky) : spec.background;
  scene.fog = spec.fog;
  scene.environment = createDuskEnvironment(renderer, { warm: spec.envWarmth });
  scene.environmentIntensity = spec.envIntensity;
  scene.add(spec.root);
}
