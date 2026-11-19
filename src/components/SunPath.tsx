"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_SUN } from "@/three/sun";

/** 0 is 6 am and 1 is 6 pm. */
export function clockLabel(t: number) {
  const mins = Math.round((6 * 60 + t * 720) / 5) * 5;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}

const W = 400;
const H = 150;
const BASE = 128;

/** Quadratic arc from the east horizon to the west horizon, peaking at noon. */
function pointAt(t: number) {
  const x = 24 + t * (W - 48);
  const y = BASE - 4 * t * (1 - t) * 104;
  return { x, y };
}

/**
 * The sun path: a drawn arc with the sun on it, a sundial post and its
 * shadow, and a slider to move the day along. It lights the live 3D scene
 * (through a window event) and, without WebGL, moves a wash of light and
 * shade across the still render.
 */
export function SunPath() {
  const root = useRef<HTMLDivElement | null>(null);
  const [t, setT] = useState(DEFAULT_SUN);

  useEffect(() => {
    const onSet = (e: Event) => {
      const v = (e as CustomEvent<{ t: number }>).detail?.t;
      if (typeof v === "number") setT(Math.min(1, Math.max(0, v)));
    };
    window.addEventListener("cinder:set-time", onSet);
    return () => window.removeEventListener("cinder:set-time", onSet);
  }, []);

  useEffect(() => {
    const stage = root.current?.closest<HTMLElement>(".stage");
    if (stage) {
      stage.style.setProperty("--sun-x", `${(18 + t * 64).toFixed(1)}%`);
      stage.style.setProperty("--sun-y", `${(52 - 4 * t * (1 - t) * 44).toFixed(1)}%`);
      stage.style.setProperty("--sun-shade", `${((0.5 - t) * 70).toFixed(1)}%`);
    }
    window.dispatchEvent(new CustomEvent("cinder:sun", { detail: { t } }));
  }, [t]);

  const sun = pointAt(t);
  const post = { x: W / 2, h: 26 };
  const shadowLen = Math.max(8, Math.min(120, ((sun.x - post.x) / (W / 2)) * -90));
  const label = clockLabel(t);

  return (
    <div className="sunpath" ref={root}>
      <svg className="sunpath-art" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sun path across the sky. The sun is shown at ${label}.`}>
        <path d={`M ${pointAt(0).x} ${BASE} Q ${W / 2} ${BASE - 208} ${pointAt(1).x} ${BASE}`} className="sunpath-arc" />
        <line x1="8" y1={BASE} x2={W - 8} y2={BASE} className="sunpath-ground" />
        <line x1={post.x} y1={BASE} x2={post.x} y2={BASE - post.h} className="sunpath-post" />
        <line x1={post.x} y1={BASE} x2={post.x + shadowLen} y2={BASE} className="sunpath-shadow" />
        <line x1={post.x} y1={BASE - post.h} x2={sun.x} y2={sun.y} className="sunpath-ray" />
        <circle cx={sun.x} cy={sun.y} r="11" className="sunpath-sun" />
      </svg>
      <div className="sunpath-control">
        <label htmlFor="sun-time" className="sunpath-label">
          Where is the sun?
        </label>
        <output htmlFor="sun-time" className="sunpath-time" aria-live="off">
          {label}
        </output>
        <input
          id="sun-time"
          className="sunpath-range"
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={t}
          aria-valuetext={label}
          onChange={(e) => setT(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
