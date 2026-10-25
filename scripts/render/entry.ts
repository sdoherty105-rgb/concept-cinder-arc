import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { buildVariant, type Shot, type VariantName } from "../../src/three/scenes";
import { NEUTRAL_FRAMING, placeCamera } from "../../src/three/camera";
import { configureRenderer, mountSpec } from "../../src/three/setup";
import { createComposer } from "../../src/three/post";
import type { Quality } from "../../src/three/kit";

type Job = {
  variant: VariantName;
  shot: string;
  width: number;
  height: number;
  /** Use the live hero's per-aspect composition (posters) or a centred one (stills). */
  framed: boolean;
  /** Match the live tier a poster stands in for: "light" posters skip AO like mobile does. */
  quality: Quality;
  /** Ad-hoc camera for composing shots during development. */
  override?: Shot;
};

declare global {
  interface Window {
    renderStill: (job: Job) => Promise<string>;
  }
}

window.renderStill = async (job) => {
  const canvas = document.createElement("canvas");
  canvas.width = job.width;
  canvas.height = job.height;
  const renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(job.width, job.height, false);

  const spec = buildVariant(job.variant, job.quality);
  configureRenderer(renderer, spec, job.quality);
  const scene = new Scene();
  mountSpec(scene, spec, renderer);

  const camera = new PerspectiveCamera(30, job.width / job.height, 0.1, 400);
  const shot = job.override ?? spec.shots[job.shot];
  if (!shot) throw new Error(`Unknown shot ${job.variant}/${job.shot}`);
  const aspect = job.width / job.height;
  placeCamera(camera, shot, aspect, { yaw: 0, pitch: 0 }, job.framed ? undefined : NEUTRAL_FRAMING);

  if (job.quality === "light") {
    renderer.render(scene, camera);
    renderer.render(scene, camera);
  } else {
    const composer = createComposer(renderer, scene, camera, job.width, job.height);
    composer.render();
    composer.render();
    composer.dispose();
  }
  const url = canvas.toDataURL("image/png");
  renderer.dispose();
  renderer.forceContextLoss();
  return url;
};
