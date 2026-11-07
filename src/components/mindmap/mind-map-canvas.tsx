"use client";

import { useMemo } from "react";
import {
  branches,
  centralNode,
  type MindBranch,
  type MindNode,
} from "@/lib/mindmap-data";

interface PositionedNode {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  colorSoft: string;
  x: number;
  y: number;
  kind: "central" | "branch" | "leaf";
  branchId: string;
  parentId: string;
  durationSec: number;
}

interface MindMapCanvasProps {
  activeId: string | null;
  expandedBranches: Set<string>;
  onSelect: (node: { id: string; kind: "central" | "branch" | "leaf" }) => void;
  onToggleBranch: (branchId: string) => void;
}

// Geometría del mapa (en unidades SVG)
const CENTER_X = 500;
const CENTER_Y = 460;
const CENTRAL_R = 70; // radio del nodo central
const BRANCH_R = 205; // distancia del centro a las ramas
const LEAF_R = 370; // distancia del centro a las hojas
const BRANCH_NODE_W = 144;
const BRANCH_NODE_H = 52;
const LEAF_NODE_W = 104;
const LEAF_NODE_H = 42;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// curva cuadrática suave entre dos puntos con una desviación
function curvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bulge = 0.25,
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const nx = -dy * bulge;
  const ny = dx * bulge;
  const cx = mx + nx;
  const cy = my + ny;
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
}

// si el id activo es una hoja, devuelve su rama
function getBranchOf(id: string): string {
  for (const b of branches) {
    if (b.id === id) return b.id;
    if (b.children.some((c) => c.id === id)) return b.id;
  }
  return "";
}

export function MindMapCanvas({
  activeId,
  expandedBranches,
  onSelect,
  onToggleBranch,
}: MindMapCanvasProps) {
  const { nodes, links } = useMemo(() => {
    const nodes: PositionedNode[] = [];
    const links: { id: string; d: string; color: string; active: boolean }[] =
      [];

    // Nodo central
    nodes.push({
      id: centralNode.id,
      title: centralNode.title,
      subtitle: centralNode.subtitle,
      color: "#1F3A5F",
      colorSoft: "#E2E8F0",
      x: CENTER_X,
      y: CENTER_Y,
      kind: "central",
      branchId: "",
      parentId: "",
      durationSec: centralNode.durationSec,
    });

    const branchCount = branches.length;
    const angleStep = 360 / branchCount;

    for (const [bi, branch] of branches.entries()) {
      const branchAngle = bi * angleStep;
      const branchPos = polarToCartesian(
        CENTER_X,
        CENTER_Y,
        BRANCH_R,
        branchAngle,
      );

      nodes.push({
        id: branch.id,
        title: branch.title,
        subtitle: branch.subtitle,
        color: branch.color,
        colorSoft: branch.colorSoft,
        x: branchPos.x,
        y: branchPos.y,
        kind: "branch",
        branchId: branch.id,
        parentId: centralNode.id,
        durationSec: branch.durationSec,
      });

      const centralEdgeActive =
        activeId === branch.id ||
        activeId === centralNode.id ||
        (activeId !== null && branch.children.some((c) => c.id === activeId));
      links.push({
        id: `link-${centralNode.id}-${branch.id}`,
        d: curvedPath(CENTER_X, CENTER_Y, branchPos.x, branchPos.y, 0.08),
        color: branch.color,
        active: centralEdgeActive,
      });

      // hojas: solo se renderizan si la rama está expandida.
      // Se disponen en fila perpendicular a la dirección de la rama (no en
      // arco) para evitar solapamientos entre hojas de la misma rama.
      const isBranchExpanded = expandedBranches.has(branch.id);
      if (!isBranchExpanded) continue;

      const leafCount = branch.children.length;
      const leafGap = 6; // separación entre hojas
      const leafRowW = leafCount * LEAF_NODE_W + (leafCount - 1) * leafGap;
      // dirección radial (del centro hacia la rama)
      const rad = (branchAngle - 90) * (Math.PI / 180);
      // dirección perpendicular (tangente) para distribuir las hojas en fila
      const perpX = -Math.sin(rad);
      const perpY = Math.cos(rad);
      // centro de la fila de hojas (a distancia LEAF_R del centro)
      const rowCx = CENTER_X + LEAF_R * Math.cos(rad);
      const rowCy = CENTER_Y + LEAF_R * Math.sin(rad);

      branch.children.forEach((leaf: MindNode, li: number) => {
        // offset a lo largo de la perpendicular, centrando la fila
        const offset =
          leafCount === 1 ? 0 : (li - (leafCount - 1) / 2) * (LEAF_NODE_W + leafGap);
        const leafPos = {
          x: rowCx + perpX * offset,
          y: rowCy + perpY * offset,
        };

        nodes.push({
          id: leaf.id,
          title: leaf.title,
          subtitle: leaf.subtitle,
          color: branch.color,
          colorSoft: branch.colorSoft,
          x: leafPos.x,
          y: leafPos.y,
          kind: "leaf",
          branchId: branch.id,
          parentId: branch.id,
          durationSec: leaf.durationSec,
        });

        const leafEdgeActive = activeId === leaf.id || activeId === branch.id;
        links.push({
          id: `link-${branch.id}-${leaf.id}`,
          d: curvedPath(branchPos.x, branchPos.y, leafPos.x, leafPos.y, 0.1),
          color: branch.color,
          active: leafEdgeActive,
        });
      });
    }

    return { nodes, links };
  }, [activeId, expandedBranches]);

  const viewBoxW = 1000;
  // viewBox dinámico: más compacto cuando no hay ramas expandidas (evita
  // espacio vacío), y completo cuando hay hojas visibles.
  const hasExpanded = expandedBranches.size > 0;
  const viewBoxH = hasExpanded ? 900 : 620;
  // cuando está colapsado, centramos el contenido en el viewBox compacto
  const viewBoxY = hasExpanded ? 0 : (900 - 620) / 2;

  return (
    <div
      className="relative w-full overflow-hidden"
      role="region"
      aria-label="Mapa mental interactivo sobre administración del tiempo en Scrum"
    >
      <svg
        viewBox={`${0} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
        className="h-auto w-full transition-all duration-300 ease-out"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="bg-soft" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </radialGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={viewBoxW}
          height={viewBoxH}
          fill="url(#bg-soft)"
        />

        {/* Conectores */}
        <g fill="none" strokeLinecap="round">
          {links.map((l) => (
            <path
              key={l.id}
              d={l.d}
              stroke={l.color}
              strokeOpacity={l.active ? 0.95 : 0.35}
              strokeWidth={l.active ? 3.2 : 2}
            />
          ))}
        </g>

        {/* Nodos */}
        {nodes.map((n) => {
          const isActive = activeId === n.id;
          const activeBranch = activeId ? getBranchOf(activeId) : "";
          const isDimmed =
            activeId !== null &&
            activeId !== n.id &&
            n.kind !== "central" &&
            !(n.kind === "branch" && n.branchId === activeBranch) &&
            !(n.kind === "leaf" && n.branchId === activeId);

          if (n.kind === "central") {
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                opacity={isDimmed ? 0.45 : 1}
                style={{ transition: "opacity 0.3s" }}
              >
                <circle
                  r={CENTRAL_R}
                  fill="#1F3A5F"
                  stroke={isActive ? "#FACC15" : "#0F2742"}
                  strokeWidth={isActive ? 4 : 2}
                />
                <circle
                  r={isActive ? CENTRAL_R - 6 : CENTRAL_R - 5}
                  fill="none"
                  stroke="#FACC15"
                  strokeOpacity={isActive ? 0.7 : 0}
                  strokeWidth={2}
                  style={{ transition: "all 0.3s" }}
                />
                <foreignObject
                  x={-CENTRAL_R}
                  y={-CENTRAL_R}
                  width={CENTRAL_R * 2}
                  height={CENTRAL_R * 2}
                >
                  <button
                    type="button"
                    onClick={() => onSelect({ id: n.id, kind: "central" })}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center focus:outline-none"
                    aria-label={`${n.title}. ${n.subtitle}. Activa para escuchar la explicación con voz.`}
                    aria-pressed={isActive}
                  >
                    <span className="px-2 text-[13px] font-bold leading-tight text-white">
                      {n.title}
                    </span>
                    <span className="mt-1 px-3 text-[10px] leading-tight text-blue-100">
                      {n.subtitle}
                    </span>
                  </button>
                </foreignObject>
              </g>
            );
          }

          // rama u hoja: rectángulo redondeado
          const w = n.kind === "branch" ? BRANCH_NODE_W : LEAF_NODE_W;
          const h = n.kind === "branch" ? BRANCH_NODE_H : LEAF_NODE_H;
          const isBranch = n.kind === "branch";
          const expanded = expandedBranches.has(n.branchId);

          return (
            <g
              key={n.id}
              transform={`translate(${n.x - w / 2}, ${n.y - h / 2})`}
              opacity={isDimmed ? 0.4 : 1}
              style={{ transition: "opacity 0.3s" }}
            >
              <rect
                x={0}
                y={0}
                width={w}
                height={h}
                rx={12}
                ry={12}
                fill={isActive ? n.color : "#FFFFFF"}
                stroke={n.color}
                strokeWidth={isActive ? 3 : 1.5}
              />
              {isActive && (
                <rect
                  x={-3}
                  y={-3}
                  width={w + 6}
                  height={h + 6}
                  rx={14}
                  ry={14}
                  fill="none"
                  stroke={n.color}
                  strokeOpacity={0.3}
                  strokeWidth={3}
                />
              )}
              <foreignObject x={0} y={0} width={w} height={h}>
                <button
                  type="button"
                  onClick={() =>
                    isBranch
                      ? onSelect({ id: n.id, kind: "branch" })
                      : onSelect({ id: n.id, kind: "leaf" })
                  }
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center px-1.5 text-center focus:outline-none"
                  aria-label={
                    isBranch
                      ? `Rama ${n.title}. ${n.subtitle}. Activa para escuchar la explicación.`
                      : `Nodo ${n.title}. ${n.subtitle}. Activa para escuchar la explicación con voz.`
                  }
                  aria-pressed={isActive}
                  aria-expanded={isBranch ? expanded : undefined}
                >
                  <span
                    className={`${
                      isBranch ? "text-[12px]" : "text-[10.5px]"
                    } font-semibold leading-tight ${
                      isActive ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {n.title}
                  </span>
                  <span
                    className={`mt-0.5 ${
                      isBranch ? "text-[8.5px]" : "text-[8px]"
                    } leading-tight ${
                      isActive ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {n.subtitle}
                  </span>
                </button>
              </foreignObject>

              {/* Indicador expandir/colapsar en ramas */}
              {isBranch && (
                <g transform={`translate(${w - 12}, ${h - 12})`}>
                  <circle r={6} fill={isActive ? "#FFFFFF" : n.color} />
                  <text
                    x={0}
                    y={2}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={700}
                    fill={isActive ? n.color : "#FFFFFF"}
                  >
                    {expanded ? "–" : "+"}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
