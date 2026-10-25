import type { Camera, Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Ground-truth ambient occlusion: the one post effect used, and only on the
 * high and standard tiers. It grounds the forms where they meet the plinth
 * and in the reveals of the arch, which is what stops plain boxes reading as CG.
 */
export function createComposer(renderer: WebGLRenderer, scene: Scene, camera: Camera, width: number, height: number) {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, width, height);
  ao.updateGtaoMaterial({ radius: 1.4, distanceExponent: 1.4, thickness: 2, scale: 1.2, samples: 16 });
  ao.updatePdMaterial({ radius: 6, samples: 16 });
  ao.blendIntensity = 0.9;
  composer.addPass(ao);
  composer.addPass(new OutputPass());
  return composer;
}
