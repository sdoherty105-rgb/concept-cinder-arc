import {
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  PlaneGeometry,
  PointLight,
  type ColorRepresentation,
} from "three";
import { DEFAULT_SUN } from "./sun";
import { mulberry32 } from "./textures";
import { archWall, block, createMaterials, finScreen, gable, type Materials, type Quality } from "./kit";

export type Vec3 = [number, number, number];
export type Shot = {
  position: Vec3;
  target: Vec3;
  fov: number;
  /** Multiplier on the horizontal composition shift for portrait screens (default 1). */
  portraitShift?: number;
};

export type SceneSpec = {
  root: Group;
  background: Color;
  /** Optional screen-space sky gradient (zenith, horizon, bottom). */
  sky?: [string, string, string];
  fog: Fog | null;
  sun: DirectionalLight;
  shots: Record<string, Shot>;
  exposure: number;
  envWarmth: number;
  envIntensity: number;
};

export type VariantName = "pavilion" | "courtyard" | "cottage" | "interior";

function shadowSize(q: Quality) {
  return q === "high" ? 4096 : q === "standard" ? 2048 : 1024;
}

function makeSun(q: Quality, color: ColorRepresentation, intensity: number, pos: Vec3, target: Vec3, extent: number) {
  const sun = new DirectionalLight(color, intensity);
  sun.position.set(...pos);
  sun.target.position.set(...target);
  sun.castShadow = true;
  const s = shadowSize(q);
  sun.shadow.mapSize.set(s, s);
  const cam = sun.shadow.camera;
  cam.left = -extent;
  cam.right = extent;
  cam.top = extent;
  cam.bottom = -extent;
  cam.near = 1;
  cam.far = 120;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = q === "light" ? 1 : 4;
  return sun;
}

/** Sun position for a point in the day: 0 is 6 am in the east, 1 is 6 pm in the west. */
export function sunAt(t: number): Vec3 {
  const a = Math.PI * Math.min(1, Math.max(0, t));
  return [34 * Math.cos(a), 6 + 24 * Math.sin(a), 14];
}

function groundPlane(m: Materials, y: number) {
  const ground = new Mesh(new PlaneGeometry(400, 400), m.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = y;
  ground.receiveShadow = true;
  const uv = ground.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 120, uv.getY(i) * 120);
  return ground;
}

/** A raised basin of still water with a limestone kerb. */
function pool(m: Materials, min: Vec3, w: number, d: number, kerb = 0.3, h = 0.4) {
  const g = new Group();
  const [x, y, z] = min;
  g.add(block(m.limestone, [x, y, z], [w, h, kerb]));
  g.add(block(m.limestone, [x, y, z + d - kerb], [w, h, kerb]));
  g.add(block(m.limestone, [x, y, z + kerb], [kerb, h, d - kerb * 2]));
  g.add(block(m.limestone, [x + w - kerb, y, z + kerb], [kerb, h, d - kerb * 2]));
  g.add(block(m.water, [x + kerb, y, z + kerb], [w - kerb * 2, h - 0.08, d - kerb * 2], { cast: false }));
  return g;
}

/** A glazed box: mullion frame, transparent panes and an optional warm interior. */
function glazedVolume(m: Materials, min: Vec3, size: Vec3, opts: { glow?: boolean; mullionStep?: number } = {}) {
  const g = new Group();
  const [x, y, z] = min;
  const [w, h, d] = size;
  const step = opts.mullionStep ?? 2;
  const mt = 0.08;
  for (let s = 0; s <= w + 0.001; s += w / Math.max(1, Math.round(w / step))) {
    g.add(block(m.mullion, [x + Math.min(s, w - mt), y, z + d - mt], [mt, h, mt]));
  }
  for (let s = 0; s <= d + 0.001; s += d / Math.max(1, Math.round(d / step))) {
    g.add(block(m.mullion, [x + w - mt, y, z + Math.min(s, d - mt)], [mt, h, mt]));
    g.add(block(m.mullion, [x, y, z + Math.min(s, d - mt)], [mt, h, mt]));
  }
  const front = block(m.glass, [x, y, z + d - 0.04], [w, h, 0.02], { cast: false, receive: false });
  const side = block(m.glass, [x + w - 0.04, y, z], [0.02, h, d], { cast: false, receive: false });
  const side2 = block(m.glass, [x + 0.02, y, z], [0.02, h, d], { cast: false, receive: false });
  front.renderOrder = side.renderOrder = side2.renderOrder = 2;
  g.add(front, side, side2);
  // Floor plate and rear wall inside the glass.
  g.add(block(m.timber, [x, y, z], [w, 0.05, d]));
  g.add(block(opts.glow ? m.glowSoft : m.plaster, [x + 0.1, y, z + 0.05], [w - 0.2, h, 0.1]));
  if (opts.glow) {
    const lamp = new PointLight("#f6dcae", 3, 10, 1.6);
    lamp.position.set(x + w * 0.55, y + h * 0.7, z + d * 0.45);
    g.add(lamp);
  }
  return g;
}

/* ------------------------------------------------------------------ */
/* Pavilion: the hero form. A cantilevered roof over a glass room, a    */
/* limestone mass with a slot of light, a bronze fin screen, a raised   */
/* pool and a free-standing arched wall that gives the studio its name. */
/* ------------------------------------------------------------------ */
export function buildPavilion(q: Quality): SceneSpec {
  const m = createMaterials(q);
  const root = new Group();

  root.add(groundPlane(m, -0.6));
  root.add(block(m.plinth, [-14, -0.6, -10], [28, 0.6, 22]));

  // Rear limestone mass with a vertical slot of warm light.
  root.add(block(m.limestone, [-10, 0, -8], [7, 4.8, 7]));
  root.add(block(m.glow, [-6.9, 0.35, -1.02], [0.38, 3.9, 0.06], { cast: false }));

  // Glass room under the roof, fin screen in front of its east half.
  root.add(glazedVolume(m, [-3, 0, -6], [12, 3.2, 5], { glow: true }));
  root.add(block(m.concrete, [-4.2, 3.2, -7.2], [16.8, 0.36, 9.4]));
  root.add(block(m.concrete, [10.6, 0, -6.2], [0.4, 3.2, 0.4]));
  root.add(finScreen(m.bronze, [3.2, 0, -0.6], 5.8, 3.2));

  // Arched wall, then the pool that runs in front of it.
  root.add(
    archWall(m.concrete, [-13, 0, 2.6], 9.5, 5.6, 0.75, {
      centre: 3.6,
      span: 2.9,
      spring: 2.75,
    }),
  );
  root.add(pool(m, [-11.5, 0, 5.4], 16.5, 4));

  // A single low bench in bronze on the terrace.
  root.add(block(m.bronzeDark, [4, 0, 1.6], [3.2, 0.42, 0.55]));

  // Afternoon sun high in the west; the sun-path control moves it across the day.
  const sun = makeSun(q, "#fff1d6", 3.6, sunAt(DEFAULT_SUN), [0, 0, 0], 24);
  root.add(sun, sun.target);
  root.add(new HemisphereLight("#b9d3ea", "#cdc8ae", 0.8));

  return {
    root,
    background: new Color("#e6eee9"),
    sky: ["#86b0d2", "#cde0ea", "#eef2e6"],
    fog: new Fog("#e6eee9", 60, 150),
    sun,
    exposure: 0.78,
    envWarmth: 1,
    envIntensity: 0.7,
    shots: {
      hero: { position: [19, 4.8, 27], target: [0.5, 2.0, -1], fov: 34 },
      arch: { position: [-18.6, 1.8, 17], target: [-6.9, 2.1, -1], fov: 30, portraitShift: -0.4 },
      plan: { position: [-16, 42, 36], target: [0, 0, 0.5], fov: 28, portraitShift: 0 },
      axo: { position: [-22, 54, 48], target: [-1, 0, 1], fov: 28 },
      fins: { position: [12, 1.6, 6.5], target: [4, 1.8, -1.5], fov: 36 },
    },
  };
}

/* Courtyard house: a single-storey limestone U around a pool and an old olive. */
export function buildCourtyard(q: Quality): SceneSpec {
  const m = createMaterials(q);
  const root = new Group();
  root.add(groundPlane(m, -0.3));
  root.add(block(m.plinth, [-14, -0.3, -12], [28, 0.3, 26]));

  // West, north and east wings.
  root.add(block(m.limestone, [-11, 0, -9], [5, 3.4, 16]));
  root.add(block(m.limestone, [-6, 0, -9], [12, 3.4, 5]));
  root.add(block(m.limestone, [6, 0, -9], [5, 3.4, 12]));
  // Thin roof planes that overhang into the courtyard.
  root.add(block(m.concrete, [-11.4, 3.4, -9.4], [5.8 + 0.6, 0.28, 16.8]));
  root.add(block(m.concrete, [-6, 3.4, -9.4], [12, 0.28, 6.6]));
  root.add(block(m.concrete, [5.4, 3.4, -9.4], [6, 0.28, 12.8]));
  // Courtyard-facing glazing.
  root.add(glazedVolume(m, [-4.5, 0, -4.4], [9, 3, 0.6], { glow: true, mullionStep: 1.5 }));
  root.add(block(m.glowSoft, [-6.05, 0.2, -3], [0.06, 2.6, 7], { cast: false }));
  root.add(block(m.glowSoft, [5.99, 0.2, -2], [0.06, 2.6, 4], { cast: false }));

  // Pool and bronze pergola on the open south edge.
  root.add(pool(m, [-3.2, 0, -1.2], 6.4, 4.2, 0.25, 0.3));
  for (let i = 0; i < 9; i++) {
    root.add(block(m.bronze, [-5.6 + i * 1.4, 3.0, 4.6], [0.12, 0.24, 4.2]));
  }
  root.add(block(m.bronzeDark, [-5.8, 0, 8.6], [0.18, 3.0, 0.18]));
  root.add(block(m.bronzeDark, [5.8, 0, 8.6], [0.18, 3.0, 0.18]));
  root.add(block(m.bronze, [-5.8, 3.0, 8.6], [11.8, 0.24, 0.18]));

  // Procedural olive: a leaning trunk and a loose cloud of canopy masses.
  const rand = mulberry32(7);
  const trunk = new Mesh(new CylinderGeometry(0.16, 0.3, 2.6, 10), m.bronzeDark);
  trunk.position.set(3.4, 1.3, 2.4);
  trunk.rotation.z = -0.18;
  trunk.castShadow = true;
  root.add(trunk);
  for (let i = 0; i < 9; i++) {
    const leaf = new Mesh(new IcosahedronGeometry(0.7 + rand() * 0.6, 1), m.foliage);
    leaf.position.set(3.7 + (rand() - 0.5) * 2.6, 2.9 + rand() * 1.1, 2.4 + (rand() - 0.5) * 2.4);
    leaf.scale.y = 0.7;
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    root.add(leaf);
  }

  const sun = makeSun(q, "#fff1d6", 3.4, [-18, 26, 14], [0, 0, 0], 20);
  root.add(sun, sun.target);
  root.add(new HemisphereLight("#b9d3ea", "#cdc8ae", 0.8));

  return {
    root,
    background: new Color("#e6eee9"),
    sky: ["#86b0d2", "#cde0ea", "#eef2e6"],
    fog: new Fog("#e6eee9", 60, 150),
    sun,
    exposure: 0.78,
    envWarmth: 1,
    envIntensity: 0.7,
    shots: {
      hero: { position: [21, 15, 25], target: [-0.5, 0.5, -1.5], fov: 30 },
      court: { position: [-0.6, 1.6, 13.5], target: [0.2, 1.7, -4], fov: 40 },
      pergola: { position: [-12, 2.2, 15], target: [0, 2, 3], fov: 34 },
    },
  };
}

/* Renovation: an existing gabled cottage with a new board-formed concrete wing. */
export function buildCottage(q: Quality): SceneSpec {
  const m = createMaterials(q);
  const root = new Group();
  root.add(groundPlane(m, -0.25));
  root.add(block(m.plinth, [-12, -0.25, -12], [26, 0.25, 26]));

  // Existing cottage, painted brick under a dark roof.
  root.add(gable(m.brick, [-9, 0, -10], 7, 3.4, 3.4, 9));
  const roof = gable(m.roofing, [-9.35, 3.32, -10.3], 7.7, 0.02, 2.75, 9.6);
  roof.scale.y = 1;
  root.add(roof);
  root.add(block(m.brick, [-3.2, 3.2, -6], [0.8, 3.2, 0.8]));

  // Glass link and the new wing.
  root.add(glazedVolume(m, [-2, 0, -4.5], [2.2, 2.8, 3.2], { mullionStep: 1.1 }));
  root.add(block(m.concrete, [-2.2, 2.8, -4.8], [2.6, 0.22, 3.8]));
  root.add(block(m.concrete, [0.2, 0, -9], [7.5, 0.35, 10.5]));
  root.add(glazedVolume(m, [0.4, 0.35, -8.6], [7, 3.0, 9.4], { glow: true, mullionStep: 2.3 }));
  root.add(block(m.concrete, [0, 3.35, -9.4], [8.6, 0.5, 11.4]));
  root.add(block(m.concrete, [0.2, 0.35, -9], [0.4, 3.0, 4]));
  root.add(finScreen(m.bronze, [0.6, 0.35, 1.05], 6.9, 3.0, { base: 0.26, swing: 0.2 }));

  // Garden terrace and a low wall.
  root.add(block(m.limestone, [-1, 0, 2], [10, 0.12, 5]));
  root.add(block(m.limestone, [-9, 0, 7.5], [18, 0.8, 0.4]));

  const sun = makeSun(q, "#fff1d6", 3.4, [20, 26, 16], [0, 0, 0], 18);
  root.add(sun, sun.target);
  root.add(new HemisphereLight("#b9d3ea", "#cdc8ae", 0.8));

  return {
    root,
    background: new Color("#e6eee9"),
    sky: ["#86b0d2", "#cde0ea", "#eef2e6"],
    fog: new Fog("#e6eee9", 60, 150),
    sun,
    exposure: 0.78,
    envWarmth: 1,
    envIntensity: 0.7,
    shots: {
      hero: { position: [-17, 7.5, 22], target: [-0.5, 2, -3], fov: 32 },
      fins: { position: [9.5, 1.5, 9], target: [3.4, 1.9, 0.5], fov: 34 },
      garden: { position: [16, 3.4, 15], target: [-1, 2, -3], fov: 34 },
    },
  };
}

/* Interior: an apartment living room in plaster, oak and stone, lit by one window. */
export function buildInterior(q: Quality): SceneSpec {
  const m = createMaterials(q);
  const root = new Group();
  const W = 10;
  const H = 3.1;
  const D = 8;

  root.add(block(m.oak, [-W / 2, -0.1, -D / 2], [W, 0.1, D]));
  root.add(block(m.plaster, [-W / 2, H, -D / 2], [W, 0.15, D]));
  root.add(block(m.plaster, [-W / 2, 0, -D / 2 - 0.2], [W, H, 0.2]));
  root.add(block(m.plaster, [W / 2, 0, -D / 2], [0.2, H, D]));

  // West wall with one deep window opening.
  const wx = -W / 2 - 0.45;
  root.add(block(m.plaster, [wx, 0, -D / 2], [0.45, H, 2.2]));
  root.add(block(m.plaster, [wx, 0, 1.6], [0.45, H, D / 2 - 1.6]));
  root.add(block(m.plaster, [wx, 0, -1.8], [0.45, 0.45, 3.4]));
  root.add(block(m.plaster, [wx, 2.6, -1.8], [0.45, H - 2.6, 3.4]));
  root.add(block(m.daylight, [wx - 1.4, -2, -6], [0.1, 9, 12], { cast: false, receive: false }));
  root.add(block(m.stone, [-W / 2, 0, -1.8], [0.55, 0.45, 3.4]));

  // Oak batten wall along the back.
  root.add(finScreen(m.oak, [-3.6, 0, -D / 2 + 0.02], 7.4, H, { thickness: 0.05, depth: 0.08, base: 0.12, swing: 0 }));

  // Stone island and bronze pendant.
  root.add(block(m.stone, [0.2, 0, -1.7], [3.4, 0.92, 1.1]));
  const rod = new Mesh(new CylinderGeometry(0.01, 0.01, 1.2, 6), m.mullion);
  rod.position.set(1.9, H - 0.6, -1.15);
  root.add(rod);
  const shade = new Mesh(new CylinderGeometry(0.08, 0.32, 0.26, 32, 1, true), m.bronze);
  shade.position.set(1.9, H - 1.32, -1.15);
  shade.castShadow = true;
  root.add(shade);
  const bulb = new PointLight("#f6dcae", 0.8, 5, 2);
  bulb.position.set(1.9, H - 1.48, -1.15);
  root.add(bulb);

  // Low sofa and a limestone side table.
  root.add(block(m.limestone, [-2.8, 0, 1.4], [2.6, 0.4, 0.95]));
  root.add(block(m.limestone, [-2.8, 0.4, 2.15], [2.6, 0.38, 0.2]));
  root.add(block(m.concrete, [-0.6, 0, 1.6], [0.55, 0.48, 0.55]));

  const sun = makeSun(q, "#fff3de", 4.0, [-16, 9, 4], [-1, 0, 0], 9);
  sun.shadow.bias = -0.0005;
  root.add(sun, sun.target);
  root.add(new HemisphereLight("#dbe8ee", "#c9c2ad", 1.15));

  return {
    root,
    background: new Color("#e9eee0"),
    fog: null,
    sun,
    exposure: 1.35,
    envWarmth: 0.9,
    envIntensity: 1.1,
    shots: {
      hero: { position: [4.7, 1.55, 3.7], target: [-2.4, 1.1, -1.6], fov: 50 },
      island: { position: [3.8, 1.35, 1.2], target: [1.4, 0.9, -1.4], fov: 40 },
      window: { position: [1.5, 1.3, 3.6], target: [-4.6, 1.2, -0.4], fov: 44 },
    },
  };
}

export function buildVariant(name: VariantName, q: Quality): SceneSpec {
  switch (name) {
    case "pavilion":
      return buildPavilion(q);
    case "courtyard":
      return buildCourtyard(q);
    case "cottage":
      return buildCottage(q);
    case "interior":
      return buildInterior(q);
  }
}
