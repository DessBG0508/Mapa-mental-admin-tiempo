"use client";

import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";

interface VoiceControlsProps {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  muted: boolean;
  hasActiveNode: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRepeat: () => void;
  onToggleMute: () => void;
  onResetMap: () => void;
}

export function VoiceControls({
  supported,
  speaking,
  paused,
  muted,
  hasActiveNode,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRepeat,
  onToggleMute,
  onResetMap,
}: VoiceControlsProps) {
  const isPlaying = speaking && !paused;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Reproducir / Pausar / Reanudar */}
      {!isPlaying ? (
        <Button
          type="button"
          size="sm"
          onClick={paused ? onResume : onPlay}
          disabled={!supported || (!hasActiveNode && !paused)}
          aria-label={paused ? "Reanudar narración" : "Reproducir narración"}
          className="h-9 rounded-md"
        >
          {paused ? (
            <>
              <Play className="mr-1.5 size-4" aria-hidden="true" />
              Reanudar
            </>
          ) : (
            <>
              <Play className="mr-1.5 size-4" aria-hidden="true" />
              Reproducir
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onPause}
          aria-label="Pausar narración"
          className="h-9 rounded-md"
        >
          <Pause className="mr-1.5 size-4" aria-hidden="true" />
          Pausar
        </Button>
      )}

      {/* Detener */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onStop}
        disabled={!hasActiveNode && !speaking}
        aria-label="Detener narración"
        className="h-9 rounded-md"
      >
        <Square className="mr-1.5 size-4" aria-hidden="true" />
        Detener
      </Button>

      {/* Repetir */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onRepeat}
        disabled={!supported || !hasActiveNode}
        aria-label="Repetir narración del nodo actual"
        className="h-9 rounded-md"
      >
        <Repeat className="mr-1.5 size-4" aria-hidden="true" />
        Repetir
      </Button>

      {/* Silenciar / Activar voz */}
      <Button
        type="button"
        size="sm"
        variant={muted ? "secondary" : "outline"}
        onClick={onToggleMute}
        aria-label={muted ? "Activar voz" : "Silenciar voz"}
        aria-pressed={muted}
        className="h-9 rounded-md"
      >
        {muted ? (
          <>
            <VolumeX className="mr-1.5 size-4" aria-hidden="true" />
            Activar voz
          </>
        ) : (
          <>
            <Volume2 className="mr-1.5 size-4" aria-hidden="true" />
            Silenciar
          </>
        )}
      </Button>

      {/* Reiniciar mapa */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onResetMap}
        aria-label="Reiniciar mapa: colapsar todo y detener la voz"
        className="h-9 rounded-md"
      >
        <RotateCcw className="mr-1.5 size-4" aria-hidden="true" />
        Reiniciar mapa
      </Button>
    </div>
  );
}
