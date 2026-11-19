"use client";

import { useEffect, useRef, useState, type ComponentType, type RefObject } from "react";
import type { SceneProps, Quality } from "./Scene3D";
import { Scene3DErrorBoundary } from "./Scene3DErrorBoundary";
import { SunPath } from "./SunPath";

type Live = { Scene: ComponentType<SceneProps>; quality: Quality };

const TRIGGERS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function canRender3D() {
  try {
    const force = new URLSearchParams(window.location.search).get("webgl") === "force";
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: !force });
    const ok = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

function pickQuality(): Quality {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return coarse || narrow || lowEnd ? "light" : "standard";
}

/**
 * Live WebGL layer and scrim for the sticky stage. The static poster is a
 * sibling in the DOM so it is not tied to this client bundle for first paint.
 */
export function HeroStageOverlay() {
  const [live, setLive] = useState<Live | null>(null);
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    stageRef.current = document.querySelector<HTMLDivElement>(".opening .stage");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const stage = stageRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let timer: number | undefined;
    let idleId: number | undefined;

    const stop = () => {
      root.removeAttribute("data-stage");
      stage?.removeAttribute("data-ready");
      setLive(null);
      setReady(false);
    };
    const onMotionChange = () => {
      if (motion.matches) {
        disarm();
        stop();
      }
    };
    motion.addEventListener("change", onMotionChange);

    const disarm = () => {
      TRIGGERS.forEach((e) => window.removeEventListener(e, load));
      window.removeEventListener("load", scheduleIdle);
      if (timer !== undefined) window.clearTimeout(timer);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
    };

    const load = () => {
      disarm();
      const quality = pickQuality();
      import("./Scene3D")
        .then((mod) => {
          if (!cancelled && !reducedMotion()) setLive({ Scene: mod.default, quality });
        })
        .catch(() => {
          if (!cancelled) stop();
        });
    };

    const scheduleIdle = () => {
      timer = window.setTimeout(() => {
        if (window.requestIdleCallback) idleId = window.requestIdleCallback(load, { timeout: 2000 });
        else load();
      }, 1200);
    };

    if (!reducedMotion() && canRender3D()) {
      root.setAttribute("data-stage", "3d");
      TRIGGERS.forEach((e) => window.addEventListener(e, load, { passive: true, once: true }));
      const bigFinePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
      if (bigFinePointer) {
        if (document.readyState === "complete") scheduleIdle();
        else window.addEventListener("load", scheduleIdle, { once: true });
      }
    }

    return () => {
      cancelled = true;
      disarm();
      motion.removeEventListener("change", onMotionChange);
      root.removeAttribute("data-stage");
      stage?.removeAttribute("data-ready");
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (ready) stage.setAttribute("data-ready", "true");
    else stage.removeAttribute("data-ready");
  }, [ready]);

  const fail = () => {
    document.documentElement.removeAttribute("data-stage");
    stageRef.current?.removeAttribute("data-ready");
    setLive(null);
    setReady(false);
  };

  return (
    <>
      {live ? (
        <div className="stage-canvas" aria-hidden="true">
          <Scene3DErrorBoundary onFail={fail}>
            <live.Scene quality={live.quality} onReady={() => setReady(true)} onFail={fail} stageRef={stageRef as RefObject<HTMLDivElement | null>} />
          </Scene3DErrorBoundary>
        </div>
      ) : null}
      <div className="stage-light" aria-hidden="true" />
      <SunPath />
    </>
  );
}
