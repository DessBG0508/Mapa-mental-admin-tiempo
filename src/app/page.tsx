"use client";

import { useCallback, useMemo, useState } from "react";
import { Brain, Clock, Volume2, AlertCircle, Sparkles } from "lucide-react";
import {
  branches,
  centralNode,
  countExplanatoryNodes,
  totalNarrationSeconds,
  type MindBranch,
  type MindNode,
} from "@/lib/mindmap-data";
import { useSpeech } from "@/hooks/use-speech";
import { MindMapCanvas } from "@/components/mindmap/mind-map-canvas";
import { VoiceControls } from "@/components/mindmap/voice-controls";
import { InfoPanel } from "@/components/mindmap/info-panel";
import { BranchLegend } from "@/components/mindmap/branch-legend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        // las ramas no tienen ejemplo ni error propio; usamos el de su primer hijo como referencia
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

  const nodeData = useMemo(
    () => (activeId ? findNodeData(activeId) : null),
    [activeId],
  );

  // rama activa (para resaltar leyenda y panel)
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

  // reproducir un nodo por id (rama, hoja o central)
  const playNode = useCallback(
    (id: string) => {
      const data = findNodeData(id);
      if (!data) return;
      speak({
        id,
        text: data.script,
        muted: speech.muted,
      });
      setActiveId(id);
      // si la rama no está expandida y es una rama, expándela
      if (branches.some((b) => b.id === id)) {
        setExpandedBranches((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [speak, speech.muted],
  );

  const handleSelect = useCallback(
    (sel: { id: string; kind: "central" | "branch" | "leaf" }) => {
      playNode(sel.id);
    },
    [playNode],
  );

  const handleToggleBranch = useCallback(
    (branchId: string) => {
      // alternar expansión
      setExpandedBranches((prev) => {
        const next = new Set(prev);
        if (next.has(branchId)) next.delete(branchId);
        else next.add(branchId);
        return next;
      });
      // también narrar la rama
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
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-5">
          <div className="flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#1F3A5F" }}
              aria-hidden="true"
            >
              <Brain className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
                Administración del tiempo en Scrum
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Mapa mental interactivo con explicación por voz · Caso de
                estudio: <span className="font-medium">Equilibra TESH</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 text-[11px] font-normal text-slate-600"
            >
              <Sparkles className="mr-1 size-3" aria-hidden="true" />
              {branches.length} ramas · {nodeCount} nodos
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 text-[11px] font-normal text-slate-600"
            >
              <Clock className="mr-1 size-3" aria-hidden="true" />
              Narración total: {Math.floor(totalSec / 60)} min {totalSec % 60} s
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 text-[11px] font-normal text-slate-600"
            >
              <Volume2 className="mr-1 size-3" aria-hidden="true" />
              Voz es-MX
            </Badge>
          </div>
        </div>
      </header>

      {/* Aviso de soporte de voz */}
        {!speech.supported && (
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
        {speech.supported &&
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
              mostrará como respaldo. Para activar voz, instala una voz
              &ldquo;es&rdquo; en tu sistema operativo.
            </div>
          )}

      {/* Main: mapa + panel */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Columna del mapa */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      Mapa mental
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Haz clic en cualquier nodo para escuchar su explicación.
                      Tab para navegar, Enter para activar, Escape para
                      colapsar.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleExpandAll}
                      className="h-8 rounded-md text-xs"
                      aria-label="Expandir todas las ramas"
                    >
                      Expandir todo
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCollapseAll}
                      className="h-8 rounded-md text-xs"
                      aria-label="Colapsar todas las ramas"
                    >
                      Colapsar todo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <MindMapCanvas
                  activeId={activeId}
                  expandedBranches={expandedBranches}
                  onSelect={handleSelect}
                  onToggleBranch={handleToggleBranch}
                />
                {/* Leyenda de ramas */}
                <div className="border-t border-slate-100 bg-white px-4 py-3">
                  <BranchLegend
                    activeBranchId={activeBranchId}
                    onSelectBranch={handleSelectBranchFromLegend}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Controles de voz (debajo del mapa en móvil, dentro del panel en desktop) */}
            <Card className="mt-4 rounded-lg border-slate-200 shadow-sm lg:hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Controles de voz
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
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
              </CardContent>
            </Card>
          </div>

          {/* Columna del panel de información */}
          <div className="lg:col-span-2">
            <Card className="flex h-full flex-col rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Explicación del nodo
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Transcripción sincronizada con la voz, ejemplo real del
                  proyecto y error común.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
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
              </CardContent>
            </Card>

            {/* Controles de voz (desktop) */}
            <Card className="mt-4 hidden rounded-lg border-slate-200 shadow-sm lg:block">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Controles de voz
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sección de contexto del proyecto */}
        <Card className="mt-5 rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Contexto del caso de estudio: Equilibra TESH
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Sistema universitario de tamizaje emocional voluntario · TESH ·
              Gestión de Proyectos de Software 2026
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <ContextBlock title="Product Goal">
              Al finalizar el semestre, todo estudiante del TESH podrá realizar
              un tamizaje emocional voluntario 24/7 desde su celular, y el
              psicólogo recibirá el expediente pre-procesado automáticamente,
              eliminando el cálculo manual.
            </ContextBlock>
            <ContextBlock title="Equipo Scrum">
              <ul className="space-y-1">
                <li>Denisse Bautista González — Product Owner</li>
                <li>Esmeralda Santizo Cruz — Backend / Scrum Master en práctica</li>
                <li>Sharon Abigail Parra González — IA y Frontend</li>
                <li>Alexa M. Sisneros Valdez — QA y Documentación</li>
                <li>Mario Gutiérrez Ayala — Scrum Master (asesor)</li>
              </ul>
            </ContextBlock>
            <ContextBlock title="Cronograma real">
              <ul className="space-y-1">
                <li>Sprint 0: 1 semana (preparación)</li>
                <li>Sprint 1: 2 semanas (BD y autenticación)</li>
                <li>Sprint 2: 2 semanas (UI/UX)</li>
                <li>Sprint 3: 2 semanas (tamizaje con Eli)</li>
                <li>Sprint 4: 2 semanas + fines de semana (scoring y voz)</li>
                <li>Sprint 5: 3 semanas (integración y piloto)</li>
              </ul>
            </ContextBlock>
            <ContextBlock title="Capacidad real del equipo">
              4 personas × ~10 h/semana = ~40 h/semana (80 h en sprint de 2
              semanas). Carga máxima planeada: ~26 SP o ~70-73 h. Colchón: 6 a
              37 h según el sprint. Acuerdo A-10: fines de semana laborables
              desde S4 (~112 h).
            </ContextBlock>
            <ContextBlock title="Retrospective 23/10/2026 (MIN-009)">
              <ul className="space-y-1">
                <li>A1: QA desde el día 3, no el 7.</li>
                <li>A3: 10% del sprint para refactor (~11 h).</li>
                <li>A5: Transferencia Sharon ↔ Esmeralda (anti bus-factor).</li>
                <li>A8: Modo incógnito (traductor de Chrome corrompía SQL).</li>
                <li>A9: Estandarizar npm, no bun.</li>
              </ul>
            </ContextBlock>
            <ContextBlock title="Lección estrella">
              &ldquo;La regla ítem 9 &gt; 0 → rojo no es decorativa: es la
              salvaguarda que separa un sistema de salud mental funcional de uno
              peligroso.&rdquo; — Guía Sprint Review+Retrospective, 23 oct
              2026.
            </ContextBlock>
          </CardContent>
        </Card>

        {/* Instrucciones de uso y pruebas */}
        <Card className="mt-5 rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Instrucciones de uso y pruebas recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cómo usar el mapa
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li>
                  • Haz clic en el nodo central, una rama o un nodo hoja para
                  reproducir su explicación con voz en español.
                </li>
                <li>
                  • Usa los controles para reproducir, pausar, detener, repetir
                  o silenciar la voz.
                </li>
                <li>
                  • La transcripción se resalta en sincronía con la voz.
                </li>
                <li>
                  • Navega con Tab entre nodos; Enter para activar; Escape para
                  colapsar una rama.
                </li>
                <li>
                  • El botón &ldquo;Reiniciar mapa&rdquo; colapsa todo y detiene
                  la voz.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pruebas recomendadas
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li>• Voz: clic en el nodo central y cada rama; la voz inicia y la transcripción se sincroniza.</li>
                <li>• Controles: probar play, pause, stop, repeat y mute en distintos momentos.</li>
                <li>• Teclado: Tab entre nodos; Enter para activar; Escape para colapsar.</li>
                <li>• Responsive: en móvil el mapa se reorganiza sin scroll horizontal.</li>
                <li>• Fallback: si no hay voz en español, la transcripción sigue legible.</li>
                <li>• Duración total: {Math.floor(totalSec / 60)} min {totalSec % 60} s (meta: 4-6 min).</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer sticky */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-center text-xs text-slate-500 sm:px-6 sm:text-left">
          <p>
            Mapa mental · Administración del tiempo en Scrum · Equilibra TESH ·
            TESH · Gestión de Proyectos de Software 2026
          </p>
          <p className="text-slate-400">
            Contenido basado en la Scrum Guide 2020. Las narraciones usan
            ejemplos reales del proyecto. Voz generada con la API
            SpeechSynthesis del navegador.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ContextBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}
