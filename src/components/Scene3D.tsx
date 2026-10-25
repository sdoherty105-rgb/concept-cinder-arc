"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { MathUtils, Texture, type PerspectiveCamera } from "three";
import { disposeObject } from "@/three/kit";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { buildPavilion } from "@/three/scenes";
import { HERO_SEQUENCE, TILT_PITCH, TILT_YAW, placeCamera, poseAt } from "@/three/camera";
import { configureRenderer, mountSpec } from "@/three/setup";
import { createComposer } from "@/three/post";

export type Quality = "standard" | "light";

export type SceneProps = {
  quality: Quality;
  onReady: () => void;
  onFail: () => void;
  stageRef: RefObject<HTMLDivElement | null>;
};

type Input = {
  /** Continuous camera stop index driven by scroll, 0..2. */
  stop: number;
  /** Pointer position, -1..1 on each axis (fine pointers only). */
  px: number;
  py: number;
  visible: boolean;
};

/**
 * Scroll offset at which each `[data-camera-stop]` element sits centred in
 * the viewport; the first stop is always the top of the page.
 */
export function cameraAnchors() {
  const vh = window.innerHeight;
  return Array.from(document.querySelectorAll<HTMLElement>("[data-camera-stop]"))
    .sort((a, b) => Number(a.dataset.cameraStop) - Number(b.dataset.cameraStop))
    .map((el, i) => {
      if (i === 0) return 0;
      const r = el.getBoundingClientRect();
      return Math.max(0, r.top + window.scrollY + r.height / 2 - vh / 2);
    });
}

/**
 * Maps scroll position to a continuous stop index using the opening
 * sections' own positions, so camera moves stay tied to the copy at every
 * breakpoint. Purely reads scroll; it never prevents or redirects it.
 */
function useScrollStops(input: RefObject<Input>, invalidate: () => void) {
  useEffect(() => {
    let anchors: number[] = [];
    const measure = () => {
      anchors = cameraAnchors();
      update();
    };
    const update = () => {
      const y = window.scrollY;
      let s = 0;
      for (let i = 1; i < anchors.length; i++) {
        const a = anchors[i - 1];
        const b = anchors[i];
        if (y >= b) s = i;
        else if (y > a) {
          s = i - 1 + (y - a) / Math.max(1, b - a);
          break;
        } else break;
      }
      if (Math.abs(s - input.current.stop) > 1e-4) {
        input.current.stop = s;
        if (input.current.visible) invalidate();
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [input, invalidate]);
}

function usePointerTilt(enabled: boolean, input: RefObject<Input>, invalidate: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      input.current.px = MathUtils.clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      input.current.py = MathUtils.clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
      if (input.current.visible) invalidate();
    };
    const onLeave = () => {
      input.current.px = 0;
      input.current.py = 0;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, input, invalidate]);
}

function Rig({ quality, onReady, onFail, stageRef }: SceneProps) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const input = useRef<Input>({ stop: 0, px: 0, py: 0, visible: true });
  const pageActive = useRef(true);
  const state = useRef({ stop: 0, yaw: 0, pitch: 0, frames: 0, mounted: false });
  const composer = useRef<EffectComposer | null>(null);
  const tiltEnabled = useMemo(
    () => quality === "standard" && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    [quality],
  );

  const spec = useMemo(() => buildPavilion(quality === "light" ? "light" : "standard"), [quality]);
  const shots = useMemo(() => HERO_SEQUENCE.map((k) => spec.shots[k]), [spec]);

  useEffect(() => {
    let cancelled = false;
    const st = state.current;
    try {
      configureRenderer(gl, spec, quality);
      mountSpec(scene, spec, gl);
      const cam = camera as PerspectiveCamera;
      placeCamera(cam, shots[0], size.width / size.height);
      if (quality === "standard") composer.current = createComposer(gl, scene, cam, size.width, size.height);
      // Compile shaders off the main thread where KHR_parallel_shader_compile is available.
      gl.compileAsync(scene, cam)
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return;
          st.mounted = true;
          invalidate();
        });
    } catch {
      onFail();
    }
    const onLost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    return () => {
      cancelled = true;
      st.mounted = false;
      gl.domElement.removeEventListener("webglcontextlost", onLost);
      scene.remove(spec.root);
      disposeObject(spec.root);
      const bg = scene.background;
      if (bg instanceof Texture) bg.dispose();
      scene.background = null;
      scene.fog = null;
      scene.environment?.dispose();
      scene.environment = null;
      composer.current?.dispose();
      composer.current = null;
    };
    // Mount once per built scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  useEffect(() => {
    composer.current?.setSize(size.width, size.height);
    invalidate();
  }, [size.width, size.height, invalidate]);

  // Only render while the opening is on screen.
  useEffect(() => {
    const el = stageRef.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      input.current.visible = entry.isIntersecting;
      if (entry.isIntersecting && pageActive.current) invalidate();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [stageRef, invalidate]);

  useEffect(() => {
    const onVisibility = () => {
      pageActive.current = !document.hidden;
      if (pageActive.current && input.current.visible) invalidate();
    };
    pageActive.current = !document.hidden;
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [invalidate]);

  useScrollStops(input, invalidate);
  usePointerTilt(tiltEnabled, input, invalidate);

  useFrame((_, delta) => {
    const s = state.current;
    const i = input.current;
    if (!s.mounted || !i.visible || !pageActive.current) return;
    const dt = Math.min(delta, 1 / 20);
    const kStop = 1 - Math.exp(-dt * 3.2);
    const kTilt = 1 - Math.exp(-dt * 2.4);

    // The first frame matches the poster exactly; easing starts after it.
    if (s.frames > 0) {
      s.stop += (i.stop - s.stop) * kStop;
      s.yaw += (-i.px * TILT_YAW - s.yaw) * kTilt;
      s.pitch += (i.py * TILT_PITCH - s.pitch) * kTilt;
    }

    placeCamera(camera as PerspectiveCamera, poseAt(shots, s.stop), size.width / size.height, {
      yaw: s.yaw,
      pitch: s.pitch,
    });

    if (composer.current) composer.current.render(dt);
    else gl.render(scene, camera);

    s.frames++;
    if (s.frames === 2) onReady();

    const settling =
      Math.abs(i.stop - s.stop) > 5e-4 ||
      Math.abs(-i.px * TILT_YAW - s.yaw) > 1e-4 ||
      Math.abs(i.py * TILT_PITCH - s.pitch) > 1e-4;
    if ((settling || s.frames < 3) && i.visible && pageActive.current) invalidate();
  }, 1);

  return null;
}

export default function Scene3D(props: SceneProps) {
  const dpr: [number, number] = props.quality === "light" ? [1, 1.25] : [1, 1.75];
  return (
    <Canvas
      dpr={dpr}
      frameloop="demand"
      flat={false}
      shadows="percentage"
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 32, near: 0.5, far: 400, position: [16, 3.6, 21] }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#121416", 1);
      }}
      onError={() => props.onFail()}
    >
      <Rig {...props} />
    </Canvas>
  );
}
