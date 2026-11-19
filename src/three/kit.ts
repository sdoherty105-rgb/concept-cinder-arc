import {
  BackSide,
  BoxGeometry,
  BufferGeometry,
  Color,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  Path,
  Scene,
  Shape,
  ShaderMaterial,
  SphereGeometry,
  type Material,
  type Texture,
  type WebGLRenderer,
} from "three";
import { createSurfaceTexture } from "./textures";

export type Quality = "high" | "standard" | "light";

/** Metres of surface covered by one repeat of a 256px surface texture. */
const TILE = 2.4;

/**
 * Rescales a BoxGeometry's per-face UVs to world metres so textures keep the
 * same texel density on long slabs and thin fins alike.
 */
function worldUV(geo: BoxGeometry, w: number, h: number, d: number) {
  const uv = geo.attributes.uv;
  // Face order for BoxGeometry: +x, -x, +y, -y, +z, -z (4 vertices each).
  const dims: Array<[number, number]> = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, (uv.getX(i) * dims[f][0]) / TILE, (uv.getY(i) * dims[f][1]) / TILE);
    }
  }
  uv.needsUpdate = true;
}

/** Axis-aligned block from its minimum corner and size, in metres. */
export function block(
  mat: Material,
  min: [number, number, number],
  size: [number, number, number],
  opts: { cast?: boolean; receive?: boolean } = {},
) {
  const [w, h, d] = size;
  const geo = new BoxGeometry(w, h, d);
  worldUV(geo, w, h, d);
  const mesh = new Mesh(geo, mat);
  mesh.position.set(min[0] + w / 2, min[1] + h / 2, min[2] + d / 2);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}

/**
 * A monolithic wall with a round-headed arch cut through it. The wall runs
 * along X and is extruded along Z from `min[2]`.
 */
export function archWall(
  mat: Material,
  min: [number, number, number],
  width: number,
  height: number,
  thickness: number,
  arch: { centre: number; span: number; spring: number },
) {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width, height);
  shape.lineTo(0, height);
  shape.closePath();

  const r = arch.span / 2;
  const cx = arch.centre;
  const hole = new Path();
  hole.moveTo(cx - r, 0.001);
  hole.lineTo(cx - r, arch.spring);
  hole.absarc(cx, arch.spring, r, Math.PI, 0, true);
  hole.lineTo(cx + r, 0.001);
  hole.closePath();
  shape.holes.push(hole);

  const geo = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 48 });
  scaleUV(geo, 1 / TILE);
  const mesh = new Mesh(geo, mat);
  mesh.position.set(min[0], min[1], min[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A gabled prism (pitched roof or cottage body) extruded along Z. */
export function gable(
  mat: Material,
  min: [number, number, number],
  width: number,
  eave: number,
  ridge: number,
  depth: number,
) {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width, eave);
  shape.lineTo(width / 2, ridge);
  shape.lineTo(0, eave);
  shape.closePath();
  const geo = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  scaleUV(geo, 1 / TILE);
  const mesh = new Mesh(geo, mat);
  mesh.position.set(min[0], min[1], min[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function scaleUV(geo: BufferGeometry, s: number) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * s, uv.getY(i) * s);
  uv.needsUpdate = true;
}

/**
 * A row of fins whose spacing breathes along its length, the way a hand-set
 * screen would rather than a mechanical grid.
 */
export function finScreen(
  mat: Material,
  start: [number, number, number],
  length: number,
  height: number,
  opts: { thickness?: number; depth?: number; base?: number; swing?: number; axis?: "x" | "z" } = {},
) {
  const group = new Group();
  const t = opts.thickness ?? 0.07;
  const depth = opts.depth ?? 0.42;
  const base = opts.base ?? 0.3;
  const swing = opts.swing ?? 0.22;
  const axis = opts.axis ?? "x";
  let s = 0;
  let i = 0;
  while (s < length) {
    const fin =
      axis === "x"
        ? block(mat, [start[0] + s, start[1], start[2]], [t, height, depth])
        : block(mat, [start[0], start[1], start[2] + s], [depth, height, t]);
    group.add(fin);
    s += base + swing * Math.pow(Math.sin(i * 0.42), 2);
    i++;
  }
  return group;
}

export type Materials = ReturnType<typeof createMaterials>;

export function createMaterials(quality: Quality) {
  const size = quality === "light" ? 128 : 256;
  const tex = (o: Parameters<typeof createSurfaceTexture>[0]) =>
    createSurfaceTexture({ ...o, size: o.size ?? size });

  const concreteMap = tex({ base: "#b3b6b1", seed: 11, grain: 0.9, mottle: 1, boardSpacing: size / 8 });
  const limestoneMap = tex({ base: "#e4dcc4", seed: 23, grain: 0.7, mottle: 0.8, jointSpacing: size / 2 });
  const plinthMap = tex({ base: "#c9c5b0", seed: 31, grain: 0.6, mottle: 0.6, jointSpacing: size / 3 });
  const groundMap = tex({ base: "#b9b79a", seed: 41, grain: 0.8, mottle: 0.4 });
  const timberMap = tex({ base: "#8d6d4f", seed: 53, grain: 0.5, mottle: 0.5, streaks: 1 });
  const oakMap = tex({ base: "#b8996f", seed: 57, grain: 0.4, mottle: 0.4, streaks: 0.8 });
  const plasterMap = tex({ base: "#f3f0e3", seed: 61, grain: 0.35, mottle: 0.6 });
  const brickMap = tex({ base: "#e6d6c0", seed: 71, grain: 0.8, mottle: 0.7, boardSpacing: size / 24 });

  const std = (map: Texture | null, roughness: number, extra: Partial<MeshStandardMaterial> = {}) =>
    Object.assign(new MeshStandardMaterial({ map, roughness, metalness: 0 }), extra);

  return {
    concrete: std(concreteMap, 0.92),
    limestone: std(limestoneMap, 0.86),
    plinth: std(plinthMap, 0.9),
    ground: std(groundMap, 1),
    timber: std(timberMap, 0.7),
    oak: std(oakMap, 0.65),
    plaster: std(plasterMap, 0.95),
    brick: std(brickMap, 0.95),
    roofing: std(null, 0.7, { color: new Color("#8a9094"), metalness: 0.2 }),
    bronze: std(null, 0.38, { color: new Color("#927457"), metalness: 0.85 }),
    bronzeDark: std(null, 0.5, { color: new Color("#6b5440"), metalness: 0.8 }),
    glass: std(null, 0.04, {
      color: new Color("#a9c4d0"),
      metalness: 0.2,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
    mullion: std(null, 0.5, { color: new Color("#4a504e"), metalness: 0.5 }),
    water: std(null, 0.03, { color: new Color("#5f93ab"), metalness: 0.35 }),
    glow: std(null, 1, { color: new Color("#000000"), emissive: new Color("#f2d9a6"), emissiveIntensity: 0.55 }),
    glowSoft: std(null, 1, { color: new Color("#000000"), emissive: new Color("#e8cf9f"), emissiveIntensity: 0.35 }),
    daylight: std(null, 1, { color: new Color("#000000"), emissive: new Color("#f6efe2"), emissiveIntensity: 1.6 }),
    foliage: std(null, 0.95, { color: new Color("#6f8c56") }),
    stone: std(limestoneMap, 0.55),
  };
}

/**
 * A procedural daytime sky baked into a PMREM environment: clear blue overhead,
 * a pale haze at the horizon and sunlit lime-wash ground. It only exists to
 * give glass, water and bronze something believable to reflect.
 */
export function createDayEnvironment(renderer: WebGLRenderer, opts: { warm?: number } = {}) {
  const warm = opts.warm ?? 1;
  const scene = new Scene();
  const mat = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: { warm: { value: warm } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float warm;
      varying vec3 vDir;
      void main() {
        float y = vDir.y;
        vec3 sky = vec3(0.34, 0.52, 0.80);
        vec3 horizon = vec3(0.92, 0.94, 0.88) * warm;
        vec3 ground = vec3(0.62, 0.62, 0.55);
        float band = exp(-abs(y) * 9.0);
        vec3 col = mix(sky, ground, step(y, 0.0));
        col += horizon * band * 0.8;
        float sun = pow(max(dot(vDir, normalize(vec3(-0.45, 0.8, 0.4))), 0.0), 40.0);
        col += vec3(1.0, 0.96, 0.85) * sun * 3.0 * warm;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  scene.add(new Mesh(new SphereGeometry(10, 48, 24), mat));
  const pmrem = new PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  mat.dispose();
  return rt.texture;
}

export function disposeObject(root: Group | Scene) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      for (const value of Object.values(mat)) {
        if (value && typeof value === "object" && "isTexture" in value && (value as Texture).isTexture) {
          (value as Texture).dispose();
        }
      }
      mat.dispose();
    }
  });
}
