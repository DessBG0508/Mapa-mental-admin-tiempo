"use client";

import { branches } from "@/lib/mindmap-data";

interface BranchLegendProps {
  activeBranchId: string | null;
  onSelectBranch: (branchId: string) => void;
}

export function BranchLegend({ activeBranchId, onSelectBranch }: BranchLegendProps) {
  return (
    <nav aria-label="Ramas del mapa mental" className="flex flex-wrap gap-1.5">
      {branches.map((b) => {
        const active = activeBranchId === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectBranch(b.id)}
            className="group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            style={{
              borderColor: active ? b.color : "#E2E8F0",
              backgroundColor: active ? b.color : "#FFFFFF",
              color: active ? "#FFFFFF" : "#475569",
            }}
            aria-label={`Ir a la rama ${b.title}: ${b.subtitle}`}
            aria-pressed={active}
          >
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor: active ? "#FFFFFF" : b.color,
              }}
              aria-hidden="true"
            />
            {b.title}
          </button>
        );
      })}
    </nav>
  );
}
