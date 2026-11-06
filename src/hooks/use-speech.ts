"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechState {
  speaking: boolean;
  paused: boolean;
  muted: boolean;
  voicesReady: boolean;
  hasSpanishVoice: boolean;
  // id del nodo que se está narrando actualmente
  currentId: string | null;
  // índice del carácter hasta donde se ha narrado (para resaltar transcripción)
  boundaryChar: number;
  // texto que se está narrando
  transcript: string;
}

interface SpeakOptions {
  id: string;
  text: string;
  // si la voz está silenciada, solo marcamos el "reproduciendo" sin sonido
  muted?: boolean;
}

const SPANISH_LANGS = ["es-MX", "es-ES", "es-419", "es-US", "es-AR", "es-CO", "es"];

function pickSpanishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  for (const lang of SPANISH_LANGS) {
    const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
  }
  const any = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
  return any ?? null;
}

export function useSpeech() {
  // Soporte inicial determinado de forma perezosa (evita setState síncrono en effect)
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return typeof window.speechSynthesis !== "undefined";
  });

  const [state, setState] = useState<SpeechState>({
    speaking: false,
    paused: false,
    muted: false,
    voicesReady: false,
    hasSpanishVoice: false,
    currentId: null,
    boundaryChar: 0,
    transcript: "",
  });

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // guardamos id+texto del nodo activo para poder repetir/reanudar
  const activeNodeRef = useRef<{ id: string; text: string } | null>(null);
  // bandera para saber si la cancelación fue intencional (stop/mute)
  const cancelledRef = useRef(false);

  // Cargar voces (actualización reactiva desde un sistema externo)
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      voicesRef.current = voices;
      const spanish = pickSpanishVoice(voices);
      setState((s) => ({
        ...s,
        // consideramos "listas" cuando getVoices() responde (aunque sea vacío)
        voicesReady: true,
        hasSpanishVoice: spanish !== null,
      }));
    };

    loadVoices();
    synth.addEventListener?.("voiceschanged", loadVoices);
    const t = window.setTimeout(loadVoices, 1000);
    return () => {
      synth.removeEventListener?.("voiceschanged", loadVoices);
      window.clearTimeout(t);
      try {
        synth.cancel();
      } catch {
        /* noop */
      }
    };
  }, [supported]);

  const buildUtterance = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    const spanish = pickSpanishVoice(voicesRef.current);
    if (spanish) {
      utter.voice = spanish;
      utter.lang = spanish.lang;
    } else {
      utter.lang = "es-ES";
    }
    // tono docente, pausado y natural
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    void synth;
    return utter;
  }, []);

  // helper para enlazar eventos del utterance; declarado antes que los usarios
  const attachEvents = useCallback((utter: SpeechSynthesisUtterance) => {
    utter.onstart = () =>
      setState((s) => ({ ...s, speaking: true, paused: false }));
    utter.onpause = () => setState((s) => ({ ...s, paused: true }));
    utter.onresume = () => setState((s) => ({ ...s, paused: false }));
    utter.onend = () => {
      if (cancelledRef.current) return;
      setState((s) => ({
        ...s,
        speaking: false,
        paused: false,
        boundaryChar: s.transcript.length,
      }));
    };
    utter.onerror = (e) => {
      const err = e as SpeechSynthesisErrorEvent;
      if (err?.error === "interrupted" || err?.error === "canceled") return;
      setState((s) => ({ ...s, speaking: false, paused: false }));
    };
    utter.onboundary = (e) => {
      if (typeof e.charIndex === "number") {
        setState((s) => ({ ...s, boundaryChar: e.charIndex }));
      }
    };
  }, []);

  const speak = useCallback(
    ({ id, text, muted }: SpeakOptions) => {
      if (typeof window === "undefined") return;
      const synth = window.speechSynthesis;
      if (!synth) return;

      cancelledRef.current = false;
      try {
        synth.cancel();
      } catch {
        /* noop */
      }

      activeNodeRef.current = { id, text };

      setState((s) => ({
        ...s,
        currentId: id,
        transcript: text,
        boundaryChar: 0,
        speaking: !muted,
        paused: muted ? false : s.paused,
      }));

      if (muted) {
        return;
      }

      const utter = buildUtterance(text);
      currentUtteranceRef.current = utter;
      attachEvents(utter);

      window.setTimeout(() => {
        try {
          synth.speak(utter);
        } catch {
          /* noop */
        }
      }, 60);
    },
    [attachEvents, buildUtterance],
  );

  const pause = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis.pause();
    } catch {
      /* noop */
    }
    setState((s) => ({ ...s, paused: true, speaking: true }));
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (state.muted) return;
    try {
      if (synth.paused) {
        synth.resume();
      } else if (activeNodeRef.current && !currentUtteranceRef.current) {
        const utter = buildUtterance(activeNodeRef.current.text);
        currentUtteranceRef.current = utter;
        attachEvents(utter);
        synth.speak(utter);
      }
    } catch {
      /* noop */
    }
    setState((s) => ({ ...s, paused: false, speaking: true }));
  }, [attachEvents, buildUtterance, state.muted]);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    cancelledRef.current = true;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
    currentUtteranceRef.current = null;
    activeNodeRef.current = null;
    setState((s) => ({
      ...s,
      speaking: false,
      paused: false,
      currentId: null,
      transcript: "",
      boundaryChar: 0,
    }));
  }, []);

  const repeat = useCallback(() => {
    const active = activeNodeRef.current;
    if (!active) return;
    speak({ id: active.id, text: active.text, muted: state.muted });
  }, [speak, state.muted]);

  const toggleMute = useCallback(() => {
    setState((s) => {
      const nextMuted = !s.muted;
      if (nextMuted) {
        cancelledRef.current = true;
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* noop */
        }
        currentUtteranceRef.current = null;
        return { ...s, muted: true, speaking: false, paused: false };
      }
      cancelledRef.current = false;
      const active = activeNodeRef.current;
      if (active) {
        const utter = buildUtterance(active.text);
        currentUtteranceRef.current = utter;
        attachEvents(utter);
        try {
          window.speechSynthesis.speak(utter);
        } catch {
          /* noop */
        }
        return { ...s, muted: false, speaking: true, paused: false };
      }
      return { ...s, muted: false };
    });
  }, [attachEvents, buildUtterance]);

  return {
    state: { ...state, supported },
    speak,
    pause,
    resume,
    stop,
    repeat,
    toggleMute,
  };
}
