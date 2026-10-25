import type { Project } from "@/content/projects";

/** A simple architectural ground plan drawn from the project's plan data (metres). */
export function PlanDrawing({ plan, title }: { plan: Project["plan"]; title: string }) {
  const { width, height, originX, originY, shapes } = plan;
  const titleId = `plan-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <svg
      className="plan-drawing"
      viewBox={`${originX} ${originY} ${width} ${height}`}
      role="img"
      aria-labelledby={titleId}
      preserveAspectRatio="xMidYMid meet"
      style={{ fontSize: width / 34 }}
    >
      <title id={titleId}>{`Ground plan of ${title}`}</title>
      <defs>
        <pattern id={`${titleId}-hatch`} width="0.6" height="0.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.6" stroke="currentColor" strokeWidth="0.06" />
        </pattern>
      </defs>
      {shapes.map((s, i) => {
        switch (s.kind) {
          case "deck":
            return (
              <g key={i}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} className="plan-deck" />
                {s.label ? <PlanLabel x={s.x + s.w / 2} y={s.y + s.h / 2} text={s.label} /> : null}
              </g>
            );
          case "outline":
            return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} className="plan-outline" />;
          case "water":
            return (
              <g key={i}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} className="plan-water" />
                {s.label ? <PlanLabel x={s.x + s.w / 2} y={s.y + s.h / 2} text={s.label} /> : null}
              </g>
            );
          case "solid":
            return (
              <g key={i}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} className="plan-solid" fill={`url(#${titleId}-hatch)`} />
                {s.label ? <PlanLabel x={s.x + s.w / 2} y={s.y + s.h / 2} text={s.label} /> : null}
              </g>
            );
          case "room":
            return (
              <g key={i}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} className="plan-room" />
                {s.label ? <PlanLabel x={s.x + s.w / 2} y={s.y + s.h / 2} text={s.label} /> : null}
              </g>
            );
          case "opening":
            return <rect key={i} x={s.x} y={s.y - 0.05} width={s.w} height={s.h + 0.1} className="plan-opening" />;
          case "tree":
            return <circle key={i} cx={s.x} cy={s.y} r={s.r} className="plan-tree" />;
        }
      })}
      <g className="plan-north" transform={`translate(${originX + width - 1.6} ${originY + 1.8})`}>
        <circle r="0.9" />
        <path d="M0 -0.7 L0.35 0.5 L0 0.25 L-0.35 0.5 Z" />
      </g>
    </svg>
  );
}

function PlanLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} className="plan-label" textAnchor="middle" dominantBaseline="middle">
      {text}
    </text>
  );
}
