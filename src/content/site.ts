export const site = {
  name: "Cinder Arc",
  slug: "cinder-arc",
  descriptor: "Architecture and interiors",
  location: "Fremantle, Western Australia",
  /** Reserved fictitious contact details: a .example domain and an ACMA drama number. */
  email: "studio@cinderarc.example",
  phone: "0491 570 156",
  phoneHref: "+61491570156",
  conceptLabel: "An OFF/SHIFT concept — fictional demonstration",
  conceptUrl: "https://offshiftstudio.com.au/concepts/cinder-arc",
  demoUrl: "https://cinder-arc.offshiftstudio.com.au",
  description:
    "Cinder Arc is a fictional architecture and interiors studio in Perth, Western Australia, designing calm, light-filled homes, renovations and interiors. An OFF/SHIFT concept website.",
};

export const nav = [
  { href: "/#approach", label: "Approach" },
  { href: "/projects", label: "Projects" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
] as const;

export const principles = [
  {
    id: "feeling",
    number: "01",
    title: "Begin with a feeling, not a floor plan.",
    body: "Before anything is drawn we spend time on how you live: where you want the morning light, which room should feel like a retreat, how the house should sound when it rains. That brief of feelings becomes the test every later decision has to pass.",
  },
  {
    id: "light",
    number: "02",
    title: "Shape the light.",
    body: "Openings are placed for the light they let in, not only the view. Deep reveals, slots and screens turn hard Western Australian sun into something you can live beside in every season.",
  },
  {
    id: "proportion",
    number: "03",
    title: "Hold the proportion.",
    body: "Calm is mostly proportion: rooms sized to how they are used, ceilings that lift where you gather and lower where you rest, and a plan you understand the moment you walk in.",
  },
] as const;

export const services = [
  {
    id: "architecture",
    title: "Architecture",
    summary: "New homes and substantial additions, from the first site visit to the day you move in.",
    includes: [
      "Site, planning and budget feasibility",
      "Concept design with models and rendered views",
      "Design development and development approval",
      "Documentation for building permit and tender",
      "Contract administration through construction",
    ],
    fee: "Concept design from $14,500",
  },
  {
    id: "interiors",
    title: "Interiors",
    summary: "Whole-home interiors, joinery, lighting and finishes, for new builds and homes you already love.",
    includes: [
      "Spatial planning and furniture layouts",
      "Joinery and kitchen design",
      "Lighting design and controls",
      "Material, finish and fixture schedules",
      "Furniture sourcing and final styling",
    ],
    fee: "Interior concept from $8,500",
  },
  {
    id: "renovation",
    title: "Renovation",
    summary: "Careful alterations and additions to existing and character homes, planned so you can keep living well.",
    includes: [
      "Measured survey of the existing home",
      "Heritage and planning advice",
      "Addition and alteration design",
      "Staging so you can live in during works",
      "Builder selection and tender review",
    ],
    fee: "Renovation feasibility from $4,800",
  },
] as const;

export const processSteps = [
  {
    number: "01",
    title: "Consultation",
    duration: "90 minutes",
    body: "We meet at your site or our studio, listen to how you want to live, walk the site and talk honestly about budget. The $450 fee is credited to your first stage.",
  },
  {
    number: "02",
    title: "Brief and feasibility",
    duration: "2 to 3 weeks",
    body: "A written brief of rooms and feelings, a site and planning analysis, and an early cost check so the ambition and the budget agree before design begins.",
  },
  {
    number: "03",
    title: "Concept design",
    duration: "4 to 6 weeks",
    body: "Sketches, physical models and rendered views. We test two or three directions with you, then refine one until it feels right.",
  },
  {
    number: "04",
    title: "Development and approvals",
    duration: "8 to 12 weeks",
    body: "Structure, services, materials and joinery resolved with consultants, and the design lodged for development approval where needed.",
  },
  {
    number: "05",
    title: "Documentation and build",
    duration: "Through construction",
    body: "Drawings for permit and tender, help choosing a builder, regular site visits, and the final styling the week before you move in.",
  },
] as const;
