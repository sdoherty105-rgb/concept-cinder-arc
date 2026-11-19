import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { Shot, Vec3 } from "./scenes";

/** Shots of the pavilion used, in order, as the opening sections scroll by. */
export const HERO_SEQUENCE = ["hero", "arch", "plan"] as const;

/** Pointer tilt limits, in radians (about 8 degrees horizontally, 5 vertically). */
export const TILT_YAW = MathUtils.degToRad(8);
export const TILT_PITCH = MathUtils.degToRad(5);

export type Framing = {
  /** Multiplier on the camera-to-target distance. */
  distance: number;
  /** Fraction of the frame the subject is pushed right (+) or up (+). */
  shiftX: number;
  shiftY: number;
  fovScale: number;
  /** Extra orbit around the target so long forms recede on narrow screens. */
  yaw: number;
};

/**
 * Composition per aspect ratio. The render sits in its own pane beside (or
 * above) the copy rather than behind it, so the building stays centred in the
 * pane and only the camera distance and field of view adapt to its shape.
 */
export function framingFor(aspect: number): Framing {
  if (aspect >= 1.25) {
    return { distance: 1, shiftX: 0, shiftY: 0, fovScale: 1, yaw: 0 };
  }
  if (aspect >= 0.9) {
    return { distance: 1.12, shiftX: 0, shiftY: 0.02, fovScale: 1.06, yaw: 0 };
  }
  const t = MathUtils.clamp((0.9 - aspect) / 0.45, 0, 1);
  return {
    distance: MathUtils.lerp(1.08, 1.05, t),
    shiftX: 0,
    shiftY: MathUtils.lerp(0.03, 0.06, t),
    fovScale: MathUtils.lerp(1.12, 1.3, t),
    yaw: 0,
  };
}

export const NEUTRAL_FRAMING: Framing = { distance: 1, shiftX: 0, shiftY: 0, fovScale: 1, yaw: 0 };

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Interpolated pose for a continuous stop index `c` (0 = first shot). */
export function poseAt(shots: Shot[], c: number) {
  const max = shots.length - 1;
  const cc = MathUtils.clamp(c, 0, max);
  const i = Math.min(Math.floor(cc), max - 1);
  const f = smooth(cc - i);
  const a = shots[i];
  const b = shots[Math.min(i + 1, max)];
  const lerp3 = (p: Vec3, q: Vec3): Vec3 => [
    MathUtils.lerp(p[0], q[0], f),
    MathUtils.lerp(p[1], q[1], f),
    MathUtils.lerp(p[2], q[2], f),
  ];
  return {
    position: lerp3(a.position, b.position),
    target: lerp3(a.target, b.target),
    fov: MathUtils.lerp(a.fov, b.fov, f),
    portraitShift: MathUtils.lerp(a.portraitShift ?? 1, b.portraitShift ?? 1, f),
  } satisfies Shot;
}

const _offset = new Vector3();
const _right = new Vector3();
const _up = new Vector3(0, 1, 0);

/**
 * Places `camera` for a shot, framing and an orbit tilt around the target.
 * Shared by the live hero and the still renderer so the fallback image is
 * the exact first frame of the live scene.
 */
export function placeCamera(
  camera: PerspectiveCamera,
  shot: Shot,
  aspect: number,
  tilt: { yaw: number; pitch: number } = { yaw: 0, pitch: 0 },
  framing: Framing = framingFor(aspect),
) {
  const fr = aspect < 0.9 ? { ...framing, shiftX: framing.shiftX * (shot.portraitShift ?? 1) } : framing;
  const target = new Vector3(...shot.target);
  _offset.set(...shot.position).sub(target).multiplyScalar(fr.distance);
  _offset.applyAxisAngle(_up, tilt.yaw + fr.yaw);
  _right.crossVectors(_up, _offset).normalize();
  _offset.applyAxisAngle(_right, tilt.pitch);

  camera.position.copy(target).add(_offset);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  camera.fov = shot.fov * fr.fovScale;
  camera.aspect = aspect;

  const w = 1000 * aspect;
  const h = 1000;
  camera.setViewOffset(w, h, -fr.shiftX * w, fr.shiftY * h, w, h);
  camera.updateProjectionMatrix();
}
