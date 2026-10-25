"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { SceneProps, Quality } from "./Scene3D";

type Live = { Scene: ComponentType<SceneProps>; quality: Quality };

const TRIGGERS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * WebGL2 is required by React Three Fiber. Software renderers are refused via
 * failIfMajorPerformanceCaveat so slow devices keep the static image;
 * `?webgl=force` overrides that for testing on headless browsers.
 */
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
 * Sticky backdrop for the opening sections. Always renders the static
 * poster; when motion is allowed and WebGL works it lazy-loads the live
 * scene on first interaction (or, on large fine-pointer screens, once the
 * page is idle) and cross-fades it in over the identical poster frame.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Live | null>(null);
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let timer: number | undefined;
    let idleId: number | undefined;

    const stop = () => {
      root.removeAttribute("data-stage");
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
    };
  }, []);

  const fail = () => {
    document.documentElement.removeAttribute("data-stage");
    setLive(null);
    setReady(false);
  };

  return (
    <div className="stage" ref={stageRef} data-ready={ready ? "true" : undefined}>
      {children}
      {live ? (
        <div className="stage-canvas" aria-hidden="true">
          <live.Scene quality={live.quality} onReady={() => setReady(true)} onFail={fail} stageRef={stageRef} />
        </div>
      ) : null}
      <div className="stage-scrim" aria-hidden="true" />
    </div>
  );
}
