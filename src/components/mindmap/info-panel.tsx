"use client";

import { useEffect, useRef } from "react";
import { Lightbulb, AlertTriangle, Clock, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InfoPanelProps {
  title: string;
  subtitle: string;
  script: string;
  example: string;
  commonError: string;
  durationSec: number;
  branchColor: string;
  branchTitle?: string;
  // sincronización de transcripción
  boundaryChar: number;
  isNarrating: boolean;
  hasActiveNode: boolean;
}

export function InfoPanel({
  title,
  subtitle,
  script,
  example,
  commonError,
  durationSec,
  branchColor,
  branchTitle,
  boundaryChar,
  isNarrating,
  hasActiveNode,
}: InfoPanelProps) {
  const transcriptRef = useRef<HTMLParagraphElement>(null);

  // resaltar palabra activa durante la narración
  const before = script.slice(0, boundaryChar);
  const rest = script.slice(boundaryChar);

  // mantener el scroll del usuario pero auto-desplazar un poco cuando avanza la voz
  useEffect(() => {
    if (!isNarrating || !transcriptRef.current) return;
    const el = transcriptRef.current;
    const mark = el.querySelector('[data-boundary="active"]');
    if (mark) {
      const rect = (mark as HTMLElement).getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      if (rect.bottom > containerRect.bottom || rect.top < containerRect.top) {
        el.scrollBy({
          top: rect.top - containerRect.top - 40,
          behavior: "smooth",
        });
      }
    }
  }, [boundaryChar, isNarrating]);

  if (!hasActiveNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "#E2E8F0", color: "#1F3A5F" }}
          aria-hidden="true"
        >
          <Quote className="size-5" />
        </div>
        <p className="text-sm font-medium text-slate-700">
          Selecciona un nodo del mapa para escuchar su explicación
        </p>
        <p className="max-w-xs text-xs text-slate-500">
          Toca el nodo central, una rama o un nodo hoja. La voz se reproducirá en
          español y verás la transcripción aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      {/* Encabezado del nodo */}
      <div className="flex flex-col gap-1">
        {branchTitle && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: branchColor }}
          >
            {branchTitle}
          </span>
        )}
        <h3 className="text-lg font-bold leading-tight text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-[10px] font-normal text-slate-500"
          >
            <Clock className="mr-1 size-3" aria-hidden="true" />
            ~{durationSec}s
          </Badge>
          {isNarrating && (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[10px] font-normal text-emerald-700"
            >
              <span
                className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Narrando
            </Badge>
          )}
        </div>
      </div>

      {/* Transcripción / guion hablado */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <Quote className="size-3" aria-hidden="true" />
          Transcripción
        </div>
        <p
          ref={transcriptRef}
          className="max-h-40 overflow-y-auto text-sm leading-relaxed text-slate-700"
          aria-live="polite"
          aria-atomic="false"
        >
          <span className="text-slate-400">{before}</span>
          <span
            data-boundary="active"
            className="rounded bg-yellow-100 px-0.5 font-medium text-slate-900"
          >
            {rest.slice(0, 1)}
          </span>
          <span className="font-medium text-slate-900">{rest.slice(1)}</span>
        </p>
      </div>

      {/* Ejemplo práctico */}
      <div
        className="rounded-lg border-l-4 bg-slate-50 p-3"
        style={{ borderColor: branchColor }}
      >
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          <Lightbulb className="size-3" aria-hidden="true" />
          Ejemplo del proyecto Equilibra TESH
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{example}</p>
      </div>

      {/* Error común */}
      <div className="rounded-lg border-l-4 border-red-300 bg-red-50 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-700">
          <AlertTriangle className="size-3" aria-hidden="true" />
          Error común
        </div>
        <p className="text-sm leading-relaxed text-red-900">{commonError}</p>
      </div>
    </div>
  );
}
