export type PlanShape =
  | { kind: "room" | "solid" | "water" | "deck" | "outline"; x: number; y: number; w: number; h: number; label?: string }
  | { kind: "tree"; x: number; y: number; r: number }
  | { kind: "opening"; x: number; y: number; w: number; h: number };

export type ProjectImage = { name: string; alt: string };

export type Project = {
  slug: string;
  name: string;
  location: string;
  category: "New home" | "Renovation" | "Interiors";
  scope: string;
  size: string;
  feeling: string;
  /** When in the day the project is at its best, as a clock time and a point on the sun path (0 = 6 am, 1 = 6 pm). */
  bestLight: { time: string; t: number; note: string };
  summary: string;
  brief: string;
  response: string[];
  materials: { name: string; note: string; swatch: string }[];
  images: { hero: ProjectImage; detail: ProjectImage; wide: ProjectImage };
  plan: { width: number; height: number; originX: number; originY: number; shapes: PlanShape[]; caption: string };
};

export const projects: Project[] = [
  {
    slug: "wilyabrup-pavilion",
    name: "Wilyabrup Pavilion",
    location: "Wilyabrup, South West WA",
    category: "New home",
    scope: "Architecture, landscape and interiors",
    size: "142 m² internal on a 6 ha vineyard lot",
    feeling: "Arriving somewhere slower.",
    bestLight: { time: "4:30 pm", t: 0.875, note: "Late sun through the arch." },
    summary:
      "A guest pavilion for a family's vineyard retreat: one glass room under a long concrete roof, a limestone sleeping wing and a free-standing arched wall that frames the late sun.",
    brief:
      "The owners wanted a place for visiting family that felt separate from the main house, with no corridors and no television, and somewhere to sit outside on the long summer evenings without being blasted by the western sun.",
    response: [
      "We set a single long roof over a glass room and let it cantilever three metres to the east, so the terrace beneath is shaded from late morning onward. A bronze fin screen thickens in front of the glass where the afternoon sun is strongest and opens up where the view is best.",
      "The sleeping wing is a solid mass of local limestone with a single vertical slot of light. In front of it, a board-formed concrete wall carries one round-headed arch. It does nothing structural; it exists to frame the slot of light and the low sun across the pool.",
    ],
    materials: [
      { name: "Board-formed concrete", note: "Roof, arched wall and plinth edges", swatch: "#7c8188" },
      { name: "Tamala limestone", note: "Sleeping wing, pool kerb", swatch: "#cdc2b0" },
      { name: "Patinated bronze", note: "Fin screen, bench and hardware", swatch: "#927457" },
      { name: "Blackbutt", note: "Floors and joinery", swatch: "#8d6d4f" },
    ],
    images: {
      hero: {
        name: "pavilion-hero",
        alt: "Rendered view in afternoon sun of a low pavilion: a concrete wall with a round arch beside a long raised pool, a limestone block with a slot window, and a glass room under a cantilevered concrete roof behind bronze fins.",
      },
      detail: {
        name: "pavilion-arch",
        alt: "Rendered close view through the round-headed arch in the concrete wall, framing a narrow slot of light in the limestone wing beyond.",
      },
      wide: {
        name: "pavilion-fins",
        alt: "Rendered view under the cantilevered roof: a bronze bench in front of irregularly spaced bronze fins screening a glass room.",
      },
    },
    plan: {
      width: 30,
      height: 22,
      originX: -15,
      originY: -10.5,
      caption: "Ground plan. The arched wall and pool sit forward of the pavilion; the roof outline is dashed.",
      shapes: [
        { kind: "deck", x: -14, y: -10, w: 28, h: 22 },
        { kind: "outline", x: -4.2, y: -7.2, w: 16.8, h: 9.4 },
        { kind: "solid", x: -10, y: -8, w: 7, h: 7, label: "Sleep" },
        { kind: "room", x: -3, y: -6, w: 12, h: 5, label: "Living" },
        { kind: "solid", x: -13, y: 2.6, w: 9.5, h: 0.75 },
        { kind: "opening", x: -10.85, y: 2.6, w: 2.9, h: 0.75 },
        { kind: "water", x: -11.5, y: 5.4, w: 16.5, h: 4, label: "Pool" },
        { kind: "solid", x: 3.2, y: -0.6, w: 5.8, h: 0.42 },
      ],
    },
  },
  {
    slug: "limestone-court-house",
    name: "Limestone Court House",
    location: "Mosman Park, Perth",
    category: "New home",
    scope: "Architecture and interiors",
    size: "286 m² internal, single storey",
    feeling: "Private, but never closed in.",
    bestLight: { time: "11:15 am", t: 0.43, note: "Overhead light in the courtyard." },
    summary:
      "A single-storey family home that wraps three limestone wings around a courtyard pool and an existing olive tree, so every room looks inward to the same piece of sky.",
    brief:
      "A young family on a busy street wanted privacy without a fortress: a home where the children could be seen from the kitchen, where the street noise dropped away, and where the old olive tree on the site could stay.",
    response: [
      "Three wings of rendered limestone turn their backs to the street and open, fully glazed, to a central court. Thin roof planes overhang the glass by a metre, cutting summer sun while letting the low winter sun reach the back of every room.",
      "The olive stays exactly where it was. A bronze pergola on the open fourth side frames it, and its shadow moves across the pool and the living room floor through the day.",
    ],
    materials: [
      { name: "Rendered limestone", note: "External walls", swatch: "#cdc2b0" },
      { name: "Off-form concrete", note: "Roof planes and soffits", swatch: "#7c8188" },
      { name: "Bronze-anodised aluminium", note: "Pergola and window frames", swatch: "#927457" },
      { name: "Honed terrazzo", note: "Floors throughout", swatch: "#d9d2c6" },
    ],
    images: {
      hero: {
        name: "courtyard-hero",
        alt: "Rendered aerial view in daylight of a single-storey limestone house wrapped around a courtyard with a pool, an olive tree and a bronze pergola.",
      },
      detail: {
        name: "courtyard-court",
        alt: "Rendered eye-level view from under the bronze pergola across the courtyard to the glazed living wing.",
      },
      wide: {
        name: "courtyard-pergola",
        alt: "Rendered view along the side of the house to the bronze pergola framing the olive tree and the courtyard glazing.",
      },
    },
    plan: {
      width: 30,
      height: 28,
      originX: -15,
      originY: -12.5,
      caption: "Ground plan. Three wings face a single court; the pergola closes the open side.",
      shapes: [
        { kind: "deck", x: -14, y: -12, w: 28, h: 26 },
        { kind: "room", x: -11, y: -9, w: 5, h: 16, label: "Bedrooms" },
        { kind: "room", x: -6, y: -9, w: 12, h: 5, label: "Living and kitchen" },
        { kind: "room", x: 6, y: -9, w: 5, h: 12, label: "Studio" },
        { kind: "water", x: -3.2, y: -1.2, w: 6.4, h: 4.2, label: "Pool" },
        { kind: "outline", x: -5.8, y: 4.6, w: 11.8, h: 4.2 },
        { kind: "tree", x: 3.7, y: 2.4, r: 1.8 },
      ],
    },
  },
  {
    slug: "fin-house",
    name: "Fin House",
    location: "Mount Lawley, Perth",
    category: "Renovation",
    scope: "Renovation, addition and interiors",
    size: "Existing 96 m² cottage plus a 78 m² addition",
    feeling: "The old house, finally at ease.",
    bestLight: { time: "8:20 am", t: 0.19, note: "Low morning sun through the fins." },
    summary:
      "A 1920s brick cottage kept almost exactly as it was, joined by a glass link to a new board-formed concrete wing for cooking, eating and living, screened by bronze fins.",
    brief:
      "The owners loved their character cottage but lived in its dark back half. They wanted a kitchen and living space that opened to the garden, without an addition that shouted over the original house from the street.",
    response: [
      "We restored the front rooms as bedrooms and a study, then removed the lean-to at the back. A low glass link, barely taller than a door, separates old from new so the cottage roof stays whole.",
      "The new wing sits a step down into the garden under a thin concrete roof. Its north face is fully glazed behind a row of bronze fins, spaced closer where the afternoon sun hits and wider where the owners look out to the lemon tree.",
    ],
    materials: [
      { name: "Painted brick", note: "Restored original cottage", swatch: "#cdc3b5" },
      { name: "Board-formed concrete", note: "New wing, roof and hearth", swatch: "#7c8188" },
      { name: "Patinated bronze", note: "Fin screen", swatch: "#927457" },
      { name: "Recycled jarrah", note: "Floors, reclaimed from the lean-to", swatch: "#7a4f3a" },
    ],
    images: {
      hero: {
        name: "cottage-hero",
        alt: "Rendered view in daylight of a pitched-roof brick cottage joined by a small glass link to a flat-roofed concrete addition screened with bronze fins.",
      },
      detail: {
        name: "cottage-fins",
        alt: "Rendered close view of the bronze fin screen, with the interior visible between the fins.",
      },
      wide: {
        name: "cottage-garden",
        alt: "Rendered view from the garden of the new wing's glazed corner and fin screen, with the original cottage roof behind.",
      },
    },
    plan: {
      width: 26,
      height: 24,
      originX: -12,
      originY: -11,
      caption: "Ground plan. The original cottage (left) is joined to the new wing by a glazed link.",
      shapes: [
        { kind: "deck", x: -12, y: -11, w: 25, h: 21 },
        { kind: "room", x: -9, y: -10, w: 7, h: 9, label: "Cottage" },
        { kind: "room", x: -2, y: -4.5, w: 2.2, h: 3.2 },
        { kind: "room", x: 0.2, y: -9, w: 7.5, h: 10.5, label: "Kitchen and living" },
        { kind: "solid", x: 0.6, y: 1.05, w: 6.9, h: 0.42 },
        { kind: "deck", x: -1, y: 2, w: 10, h: 5, label: "Terrace" },
        { kind: "solid", x: -9, y: 7.5, w: 18, h: 0.4 },
      ],
    },
  },
  {
    slug: "quiet-apartment",
    name: "The Quiet Apartment",
    location: "East Perth",
    category: "Interiors",
    scope: "Interior architecture, joinery and styling",
    size: "118 m² apartment, level 9",
    feeling: "A deep breath, ten floors up.",
    bestLight: { time: "3:40 pm", t: 0.82, note: "Afternoon sun across the oak." },
    summary:
      "A full interior for a retired couple downsizing from a large family home: one room for living, cooking and reading, in oak, plaster and honed stone, lit by a single deep window.",
    brief:
      "Moving from a four-bedroom house, the owners wanted fewer things in better rooms. They asked for somewhere to read in the morning sun, a kitchen that did not look like a kitchen, and space for the furniture they were keeping.",
    response: [
      "We removed two internal walls to make one long room, then gave it structure with a full-height oak batten wall that hides storage, a door and the television. The kitchen became a single block of honed limestone with everything else built into the battens.",
      "The window, already deep, became a stone seat. On winter mornings the sun reaches across the floor almost to the island; in summer a linen blind softens it.",
    ],
    materials: [
      { name: "Lime plaster", note: "Walls and ceiling", swatch: "#e3dccf" },
      { name: "White oak", note: "Batten wall, floors and joinery", swatch: "#b8996f" },
      { name: "Honed limestone", note: "Island, window seat", swatch: "#cdc2b0" },
      { name: "Bronze", note: "Pendant and hardware", swatch: "#927457" },
    ],
    images: {
      hero: {
        name: "interior-hero",
        alt: "Rendered interior of a calm living room: pale oak floor, a stone kitchen island, a full-height oak batten wall and a bronze pendant, with sunlight falling across the floor from a deep window.",
      },
      detail: {
        name: "interior-island",
        alt: "Rendered close view of the honed stone island under a bronze pendant, with the oak batten wall behind.",
      },
      wide: {
        name: "interior-window",
        alt: "Rendered view toward the deep window with its stone seat, sunlight spilling across the oak floor beside a low limestone sofa.",
      },
    },
    plan: {
      width: 13,
      height: 10,
      originX: -6.5,
      originY: -5,
      caption: "Plan of the living room. The batten wall runs along the north side; the window seat faces west.",
      shapes: [
        { kind: "room", x: -5, y: -4, w: 10, h: 8 },
        { kind: "solid", x: -3.6, y: -4, w: 7.4, h: 0.12 },
        { kind: "opening", x: -5.45, y: -1.8, w: 0.45, h: 3.4 },
        { kind: "solid", x: -5, y: -1.8, w: 0.55, h: 3.4 },
        { kind: "solid", x: 0.2, y: -1.7, w: 3.4, h: 1.1, label: "Island" },
        { kind: "deck", x: -2.8, y: 1.4, w: 2.6, h: 0.95, label: "Sofa" },
      ],
    },
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
