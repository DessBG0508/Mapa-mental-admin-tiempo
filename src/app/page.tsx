"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Brain,
  Clock,
  Volume2,
  AlertCircle,
  Sparkles,
  Users,
  Calendar,
  Gauge,
  Target,
  BookOpen,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import {
  branches,
  centralNode,
  countExplanatoryNodes,
  totalNarrationSeconds,
} from "@/lib/mindmap-data";
import { useSpeech } from "@/hooks/use-speech";
import { MindMapCanvas } from "@/components/mindmap/mind-map-canvas";
import { VoiceControls } from "@/components/mindmap/voice-controls";
import { InfoPanel } from "@/components/mindmap/info-panel";
import { BranchLegend } from "@/components/mindmap/branch-legend";
import { Button } from "@/components/ui/button";

type Selection =
  | { id: string; kind: "central" | "branch" | "leaf" }
  | null;

// Buscar nodo por id (centro, rama u hoja) y devolver sus datos para el panel
function findNodeData(id: string): {
  title: string;
  subtitle: string;
  script: string;
  example: string;
  commonError: string;
  durationSec: number;
  branchColor: string;
  branchTitle?: string;
} | null {
  if (id === centralNode.id) {
    return {
      title: centralNode.title,
      subtitle: centralNode.subtitle,
      script: centralNode.script,
      example: centralNode.example,
      commonError: centralNode.commonError,
      durationSec: centralNode.durationSec,
      branchColor: "#1F3A5F",
    };
  }
  for (const b of branches) {
    if (id === b.id) {
      return {
        title: b.title,
        subtitle: b.subtitle,
        script: b.script,
        example:
          "Esta rama agrupa " +
          b.children.length +
          " nodos. Selecciona un nodo hoja para ver su ejemplo y error común.",
        commonError:
          "Cada nodo hoja de esta rama documenta un error común vivido por el equipo TESH.",
        durationSec: b.durationSec,
        branchColor: b.color,
        branchTitle: "Rama",
      };
    }
    const leaf = b.children.find((c) => c.id === id);
    if (leaf) {
      return {
        title: leaf.title,
        subtitle: leaf.subtitle,
        script: leaf.script,
        example: leaf.example,
        commonError: leaf.commonError,
        durationSec: leaf.durationSec,
        branchColor: b.color,
        branchTitle: b.title,
      };
    }
  }
  return null;
}

export default function HomePage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(
    new Set(),
  );

  const {
    state: speech,
    speak,
    pause,
    resume,
    stop,
    repeat,
    toggleMute,
  } = useSpeech();

  // "mounted" proviene del hook (useSyncExternalStore) y solo es true en el
  // cliente tras la suscripción, evitando el mismatch de hidratación al
  // renderizar contenido que depende de APIs del navegador.
  const mounted = speech.mounted;

  const nodeData = useMemo(
    () => (activeId ? findNodeData(activeId) : null),
    [activeId],
  );

  const activeBranchId = useMemo<string | null>(() => {
    if (!activeId) return null;
    if (activeId === centralNode.id) return null;
    for (const b of branches) {
      if (b.id === activeId || b.children.some((c) => c.id === activeId)) {
        return b.id;
      }
    }
    return null;
  }, [activeId]);

  const totalSec = useMemo(() => totalNarrationSeconds(), []);
  const nodeCount = useMemo(() => countExplanatoryNodes(), []);

  const playNode = useCallback(
    (id: string) => {
      const data = findNodeData(id);
      if (!data) return;
      speak({ id, text: data.script, muted: speech.muted });
      setActiveId(id);
      // nota: el toggle de expandedBranches lo manejan los handlers
      // específicos (handleToggleBranch / handleSelectBranchFromLegend),
      // no este playNode, para evitar un doble-toggle que cancele la acción.
    },
    [speak, speech.muted],
  );

  const handleSelect = useCallback(
    (sel: { id: string; kind: "central" | "branch" | "leaf" }) => {
      if (sel.kind === "branch") {
        // clic directo en una rama del mapa: toggle + narrar
        setExpandedBranches((prev) => {
          const next = new Set(prev);
          if (next.has(sel.id)) next.delete(sel.id);
          else next.add(sel.id);
          return next;
        });
      }
      playNode(sel.id);
    },
    [playNode],
  );

  const handleToggleBranch = useCallback(
    (branchId: string) => {
      setExpandedBranches((prev) => {
        const next = new Set(prev);
        if (next.has(branchId)) next.delete(branchId);
        else next.add(branchId);
        return next;
      });
      playNode(branchId);
    },
    [playNode],
  );

  const handleSelectBranchFromLegend = useCallback(
    (branchId: string) => {
      setExpandedBranches((prev) => {
        const next = new Set(prev);
        if (next.has(branchId)) next.delete(branchId);
        else next.add(branchId);
        return next;
      });
      playNode(branchId);
    },
    [playNode],
  );

  const handlePlay = useCallback(() => {
    if (activeId) playNode(activeId);
    else playNode(centralNode.id);
  }, [activeId, playNode]);

  const handleResetMap = useCallback(() => {
    stop();
    setExpandedBranches(new Set());
    setActiveId(null);
  }, [stop]);

  const handleExpandAll = useCallback(() => {
    setExpandedBranches(new Set(branches.map((b) => b.id)));
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedBranches(new Set());
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
                style={{ backgroundColor: "#1F3A5F" }}
                aria-hidden="true"
              >
                <Brain className="size-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Mapa mental interactivo · Vence hoy 19:00
                </p>
                <h1 className="mt-0.5 text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl">
                  Administración del tiempo en Scrum
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Caso de estudio:{" "}
                  <span className="font-semibold text-slate-700">
                    Equilibra TESH
                  </span>{" "}
                  · TESH · Gestión de Proyectos de Software 2026
                </p>
              </div>
            </div>

            {/* Stats hero tipo chips */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap">
              <StatChip
                icon={<Sparkles className="size-3.5" />}
                value={`${branches.length} ramas`}
                label="Estructura"
                tint="#8B5CF6"
              />
              <StatChip
                icon={<BookOpen className="size-3.5" />}
                value={`${nodeCount} nodos`}
                label="Explicaciones"
                tint="#3B82F6"
              />
              <StatChip
                icon={<Clock className="size-3.5" />}
                value={`${Math.floor(totalSec / 60)}:${String(
                  totalSec % 60,
                ).padStart(2, "0")}`}
                label="Narración total"
                tint="#F59E0B"
              />
              <StatChip
                icon={<Volume2 className="size-3.5" />}
                value="es-MX"
                label="Voz"
                tint="#14B8A6"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Aviso de soporte de voz — solo tras montaje para evitar mismatch de hidratación */}
      {mounted && !speech.supported && (
        <div
          role="alert"
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 sm:px-6"
        >
          <AlertCircle
            className="mr-1 inline size-3 align-text-bottom"
            aria-hidden="true"
          />
          Tu navegador no soporta síntesis de voz. La transcripción seguirá
          visible pero no se reproducirá audio.
        </div>
      )}
      {mounted &&
        speech.supported &&
        speech.voicesReady &&
        !speech.hasSpanishVoice && (
          <div
            role="status"
            className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 sm:px-6"
          >
            <AlertCircle
              className="mr-1 inline size-3 align-text-bottom"
              aria-hidden="true"
            />
            No se encontró una voz en español instalada. La transcripción se
            mostrará como respaldo.
          </div>
        )}

      {/* Main: layout Pinterest en dos columnas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6">
        {/* Fila superior: mapa (grande) + panel info (lateral) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Tarjeta del mapa mental — destacada */}
          <section className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 sm:px-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Mapa mental
                  </h2>
                  <p className="text-xs text-slate-500">
                    Haz clic en un nodo para escuchar su explicación · Tab para
                    navegar, Enter para activar
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleExpandAll}
                    className="h-8 rounded-lg text-xs font-medium"
                    aria-label="Expandir todas las ramas"
                  >
                    Expandir todo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCollapseAll}
                    className="h-8 rounded-lg text-xs font-medium"
                    aria-label="Colapsar todas las ramas"
                  >
                    Colapsar todo
                  </Button>
                </div>
              </div>

              {/* Lienzo del mapa */}
              <div className="bg-slate-50/40 px-2 pt-2 sm:px-4 sm:pt-4">
                <MindMapCanvas
                  activeId={activeId}
                  expandedBranches={expandedBranches}
                  onSelect={handleSelect}
                  onToggleBranch={handleToggleBranch}
                />
              </div>

              {/* Leyenda — separada, no superpuesta */}
              <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Ramas del mapa
                </p>
                <BranchLegend
                  activeBranchId={activeBranchId}
                  onSelectBranch={handleSelectBranchFromLegend}
                />
              </div>
            </div>
          </section>

          {/* Panel de información + controles de voz — lateral, apilados */}
          <aside className="flex flex-col gap-4 lg:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 sm:px-5">
                <h2 className="text-sm font-semibold text-slate-800">
                  Explicación del nodo
                </h2>
                <p className="text-xs text-slate-500">
                  Transcripción, ejemplo y error común
                </p>
              </div>
              <div className="max-h-[560px] overflow-y-auto">
                <InfoPanel
                  title={nodeData?.title ?? ""}
                  subtitle={nodeData?.subtitle ?? ""}
                  script={nodeData?.script ?? ""}
                  example={nodeData?.example ?? ""}
                  commonError={nodeData?.commonError ?? ""}
                  durationSec={nodeData?.durationSec ?? 0}
                  branchColor={nodeData?.branchColor ?? "#1F3A5F"}
                  branchTitle={nodeData?.branchTitle}
                  boundaryChar={speech.boundaryChar}
                  isNarrating={speech.speaking && !speech.paused}
                  hasActiveNode={activeId !== null && nodeData !== null}
                />
              </div>
            </div>

            {/* Controles de voz — en la columna derecha, debajo del panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Volume2 className="size-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-slate-800">
                  Controles de voz
                </h2>
              </div>
              <VoiceControls
                supported={speech.supported}
                speaking={speech.speaking}
                paused={speech.paused}
                muted={speech.muted}
                hasActiveNode={activeId !== null}
                onPlay={handlePlay}
                onPause={pause}
                onResume={resume}
                onStop={stop}
                onRepeat={repeat}
                onToggleMute={toggleMute}
                onResetMap={handleResetMap}
              />
            </div>
          </aside>
        </div>

        {/* Sección de contexto — masonry tipo Pinterest */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Contexto del caso de estudio
            </h2>
            <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            <PinCard
              icon={<Target className="size-4" />}
              tint="#1F3A5F"
              title="Product Goal"
            >
              Al finalizar el semestre, todo estudiante del TESH podrá realizar
              un tamizaje emocional voluntario 24/7 desde su celular, y el
              psicólogo recibirá el expediente pre-procesado automáticamente,
              eliminando el cálculo manual.
            </PinCard>

            <PinCard
              icon={<Users className="size-4" />}
              tint="#EC4899"
              title="Equipo Scrum"
            >
              <ul className="space-y-1.5">
                <li>
                  <strong>Denisse Bautista González</strong> — Product Owner
                </li>
                <li>
                  <strong>Esmeralda Santizo Cruz</strong> — Backend / Scrum
                  Master en práctica
                </li>
                <li>
                  <strong>Sharon Abigail Parra González</strong> — IA y Frontend
                </li>
                <li>
                  <strong>Alexa M. Sisneros Valdez</strong> — QA y Documentación
                </li>
                <li>
                  <strong>Mario Gutiérrez Ayala</strong> — Scrum Master (asesor)
                </li>
              </ul>
            </PinCard>

            <PinCard
              icon={<Calendar className="size-4" />}
              tint="#3B82F6"
              title="Cronograma real"
            >
              <ul className="space-y-1.5">
                <li>
                  <strong>Sprint 0:</strong> 1 semana (preparación)
                </li>
                <li>
                  <strong>Sprint 1:</strong> 2 semanas (BD y autenticación)
                </li>
                <li>
                  <strong>Sprint 2:</strong> 2 semanas (UI/UX)
                </li>
                <li>
                  <strong>Sprint 3:</strong> 2 semanas (tamizaje con Eli)
                </li>
                <li>
                  <strong>Sprint 4:</strong> 2 semanas + fines de semana
                  (scoring y voz)
                </li>
                <li>
                  <strong>Sprint 5:</strong> 3 semanas (integración y piloto)
                </li>
              </ul>
            </PinCard>

            <PinCard
              icon={<Gauge className="size-4" />}
              tint="#F59E0B"
              title="Capacidad real"
            >
              4 personas × ~10 h/semana = ~40 h/semana (80 h en sprint de 2
              semanas). Carga máxima planeada: ~26 SP o ~70-73 h. Colchón: 6 a
              37 h según el sprint. Acuerdo A-10: fines de semana laborables
              desde S4 (~112 h).
            </PinCard>

            <PinCard
              icon={<RotateCcw className="size-4" />}
              tint="#8B5CF6"
              title="Retrospective 23/10/2026"
              subtitle="MIN-009"
            >
              <ul className="space-y-1.5">
                <li>
                  <strong>A1:</strong> QA desde el día 3, no el 7.
                </li>
                <li>
                  <strong>A3:</strong> 10% del sprint para refactor (~11 h).
                </li>
                <li>
                  <strong>A5:</strong> Transferencia Sharon ↔ Esmeralda (anti
                  bus-factor).
                </li>
                <li>
                  <strong>A8:</strong> Modo incógnito (traductor de Chrome
                  corrompía SQL).
                </li>
                <li>
                  <strong>A9:</strong> Estandarizar npm, no bun.
                </li>
              </ul>
            </PinCard>

            <PinCard
              icon={<Lightbulb className="size-4" />}
              tint="#EF4444"
              title="Lección estrella"
              highlight
            >
              &ldquo;La regla ítem 9 &gt; 0 → rojo no es decorativa: es la
              salvaguarda que separa un sistema de salud mental funcional de uno
              peligroso.&rdquo;
              <footer className="mt-2 text-xs text-slate-500">
                Guía Sprint Review+Retrospective, 23 oct 2026
              </footer>
            </PinCard>
          </div>
        </div>

        {/* Instrucciones de uso y pruebas */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Cómo usar y probar
            </h2>
            <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>
          <div className="columns-1 gap-4 sm:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <BookOpen className="size-4 text-slate-400" aria-hidden="true" />
                Cómo usar el mapa
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li>
                  Haz clic en el nodo central, una rama o un nodo hoja para
                  reproducir su explicación con voz en español.
                </li>
                <li>
                  Usa los controles para reproducir, pausar, detener, repetir o
                  silenciar la voz.
                </li>
                <li>
                  La transcripción se resalta en sincronía con la voz.
                </li>
                <li>
                  Navega con Tab entre nodos; Enter para activar; Escape para
                  colapsar una rama.
                </li>
                <li>
                  El botón &ldquo;Reiniciar mapa&rdquo; colapsa todo y detiene la
                  voz.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="size-4 text-slate-400" aria-hidden="true" />
                Pruebas recomendadas
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li>
                  <strong>Voz:</strong> clic en el nodo central y cada rama; la
                  voz inicia y la transcripción se sincroniza.
                </li>
                <li>
                  <strong>Controles:</strong> probar play, pause, stop, repeat y
                  mute en distintos momentos.
                </li>
                <li>
                  <strong>Teclado:</strong> Tab entre nodos; Enter para activar;
                  Escape para colapsar.
                </li>
                <li>
                  <strong>Responsive:</strong> en móvil el mapa se reorganiza sin
                  scroll horizontal.
                </li>
                <li>
                  <strong>Fallback:</strong> si no hay voz en español, la
                  transcripción sigue legible.
                </li>
                <li>
                  <strong>Duración total:</strong>{" "}
                  {Math.floor(totalSec / 60)} min {totalSec % 60} s (meta: 4-6
                  min).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer sticky al fondo */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-center text-xs text-slate-500 sm:px-6 sm:text-left">
          <p>
            Mapa mental · Administración del tiempo en Scrum · Equilibra TESH ·
            TESH · Gestión de Proyectos de Software 2026
          </p>
          <p className="text-slate-400">
            Contenido basado en la Scrum Guide 2020. Voz generada con la API
            SpeechSynthesis del navegador.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Chip de estadística del header
function StatChip({
  icon,
  value,
  label,
  tint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span
        className="flex size-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${tint}15`, color: tint }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-none text-slate-800">
          {value}
        </p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

// Tarjeta tipo Pinterest
function PinCard({
  icon,
  title,
  subtitle,
  tint,
  highlight,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tint: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        highlight ? "border-red-200" : "border-slate-200"
      }`}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${tint}15`, color: tint }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight text-slate-800">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}
