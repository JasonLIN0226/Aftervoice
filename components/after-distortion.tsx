"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArchiveWall, type ArchiveEntry } from "@/components/archive-wall";
import { TransformationField } from "@/components/transformation-field";
import type { TransformSource } from "@/lib/deepseek";
import {
  MAX_SENTENCE_LENGTH,
  normalizeSentence,
  type Transformation,
} from "@/lib/transform";

type ExperienceState = "idle" | "playing" | "complete" | "error";

const STEP_TIMINGS = [2600, 5600, 9200, 13200];
const ARCHIVE_STORAGE_KEY = "after-distortion-archive";
const SHOOTING_STARS = [
  { path: "M 6 14 Q 14 8 25 20", delay: 2, duration: 30, x1: 6, y1: 14, x2: 25, y2: 20 },
  { path: "M 66 8 Q 75 2 84 19", delay: 12, duration: 30, x1: 66, y1: 8, x2: 84, y2: 19 },
  { path: "M 15 58 Q 28 49 42 66", delay: 22, duration: 30, x1: 15, y1: 58, x2: 42, y2: 66 },
];

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal?: boolean;
  length: number;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const recognition = (window as Window & {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }).SpeechRecognition ??
    (window as Window & {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    }).webkitSpeechRecognition;

  return recognition ?? null;
}

export function AfterDistortion() {
  const [sentence, setSentence] = useState("");
  const [transformation, setTransformation] = useState<Transformation | null>(null);
  const [transformSource, setTransformSource] = useState<TransformSource | null>(null);
  const [status, setStatus] = useState<ExperienceState>("idle");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  const [echoSeed, setEchoSeed] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningEnded, setListeningEnded] = useState(false);
  const [interimSentence, setInterimSentence] = useState("");
  const archivedThisCycle = useRef(false);
  const archiveHydrated = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as ArchiveEntry[];

      if (Array.isArray(parsed)) {
        setArchive(
          parsed.filter(
            (entry): entry is ArchiveEntry =>
              Boolean(entry) &&
              typeof entry.id === "string" &&
              typeof entry.residue === "string" &&
              typeof entry.source === "string",
          ),
        );
      }
    } catch {
      window.localStorage.removeItem(ARCHIVE_STORAGE_KEY);
    } finally {
      archiveHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!archiveHydrated.current) {
      return;
    }

    window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
  }, [archive]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setSpeechSupported(Boolean(Recognition));

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (status !== "playing" || !transformation) {
      return;
    }

    setStep(0);

    const timers = STEP_TIMINGS.map((timing, index) =>
      window.setTimeout(() => {
        setStep(index + 1);
      }, timing),
    );

    const completionTimer = window.setTimeout(() => {
      setStatus("complete");
    }, STEP_TIMINGS.at(-1)! + 2600);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, [status, transformation]);

  useEffect(() => {
    if (!transformation || step < 4 || archivedThisCycle.current) {
      return;
    }

    archivedThisCycle.current = true;

    const entry: ArchiveEntry = {
      id: `${Date.now()}-${transformation.final_residue}`,
      residue: transformation.final_residue,
      source: transformation.original,
    };

    setArchive((current) => [entry, ...current].slice(0, 12));
    setActiveArchiveId(entry.id);
  }, [step, transformation]);

  const trimmedSentence = sentence.trim();
  const showLanding = status === "idle" || status === "error" || isResolving;
  const canSubmit =
    trimmedSentence.length > 0 &&
    trimmedSentence.length <= MAX_SENTENCE_LENGTH &&
    !isResolving &&
    !isListening;

  function handleStartListening() {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setSpeechSupported(false);
      setError("This browser cannot listen yet. Type the sentence instead.");
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setError("");
      setIsListening(true);
      setListeningEnded(false);
      setInterimSentence("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let liveTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const chunk = event.results[index][0]?.transcript ?? "";

        if (event.results[index]?.isFinal) {
          finalTranscript += `${chunk} `;
        } else {
          liveTranscript += `${chunk} `;
        }
      }

      const combined = normalizeSentence(`${finalTranscript} ${liveTranscript}`);
      const normalizedFinal = normalizeSentence(finalTranscript);

      setInterimSentence(combined);
      setSentence(combined);

      if (normalizedFinal) {
        setSentence(normalizedFinal);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setListeningEnded(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access was blocked. Allow it, or type the sentence below.");
        return;
      }

      if (event.error === "no-speech") {
        setError("No voice was caught. Try speaking once more.");
        return;
      }

      if (event.error === "language-not-supported") {
        setError("English recognition is not supported in this browser. Type the sentence instead.");
        return;
      }

      setError("The voice did not arrive cleanly. Try again, or type the sentence instead.");
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningEnded(true);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function handleStopListening() {
    recognitionRef.current?.stop();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = normalizeSentence(sentence);

    if (!trimmed) {
      return;
    }

    setError("");
    setTransformation(null);
    setTransformSource(null);
    setIsResolving(true);
    setStep(0);
    setActiveArchiveId(null);
    setEchoSeed(Math.floor(Math.random() * 1_000_000));
    archivedThisCycle.current = false;

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sentence: trimmed }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "The sentence did not hold.");
      }

      const payload = (await response.json()) as {
        source: TransformSource;
        transformation: Transformation;
      };
      setTransformation(payload.transformation);
      setTransformSource(payload.source);
      setIsResolving(false);
      setStatus("playing");
    } catch (submissionError) {
      setIsResolving(false);
      setError(
        submissionError instanceof Error ? submissionError.message : "The sentence did not hold.",
      );
      setStatus("error");
    }
  }

  function handleReset() {
    recognitionRef.current?.stop();
    setSentence("");
    setTransformation(null);
    setTransformSource(null);
    setStatus("idle");
    setStep(0);
    setError("");
    setIsResolving(false);
    setIsListening(false);
    setListeningEnded(false);
    setInterimSentence("");
  }

  function handleClearArchive() {
    setArchive([]);
    setActiveArchiveId(null);
    window.localStorage.removeItem(ARCHIVE_STORAGE_KEY);
  }

  return (
    <main
      className="after-main relative min-h-screen overflow-hidden px-6 py-8 sm:px-10 sm:py-10"
      translate="no"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[8%] h-72 w-72 rounded-full bg-[color:var(--flare)]/16 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-[color:var(--aura)]/18 blur-3xl" />
        <div className="absolute bottom-[8%] left-[12%] h-64 w-96 rounded-full bg-[color:var(--signal)]/14 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[12%] h-80 w-80 rounded-full bg-[color:var(--ember)]/14 blur-3xl" />
        <svg
          className="shooting-sky absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {SHOOTING_STARS.map((star, index) => (
              <linearGradient
                key={`shooting-gradient-${index}`}
                id={`shooting-gradient-${index}`}
                gradientUnits="userSpaceOnUse"
                x1={star.x1}
                y1={star.y1}
                x2={star.x2}
                y2={star.y2}
              >
                <stop offset="0%" stopColor="rgba(255,251,224,0)" />
                <stop offset="35%" stopColor="rgba(156,206,255,0.18)" />
                <stop offset="72%" stopColor="rgba(186,225,255,0.78)" />
                <stop offset="100%" stopColor="rgba(255,252,232,0.98)" />
              </linearGradient>
            ))}
            {SHOOTING_STARS.map((star, index) => (
              <linearGradient
                key={`shooting-glow-gradient-${index}`}
                id={`shooting-glow-gradient-${index}`}
                gradientUnits="userSpaceOnUse"
                x1={star.x1}
                y1={star.y1}
                x2={star.x2}
                y2={star.y2}
              >
                <stop offset="0%" stopColor="rgba(120,176,255,0)" />
                <stop offset="48%" stopColor="rgba(120,176,255,0.12)" />
                <stop offset="100%" stopColor="rgba(201,228,255,0.44)" />
              </linearGradient>
            ))}
          </defs>
          {SHOOTING_STARS.map((star, index) => (
            <g key={`shooting-star-${index}`}>
              <path
                d={star.path}
                pathLength={100}
                className="shooting-star-glow"
                stroke={`url(#shooting-glow-gradient-${index})`}
                style={{
                  ["--shoot-duration" as string]: `${star.duration}s`,
                  ["--shoot-delay" as string]: `${star.delay}s`,
                }}
              />
              <path
                d={star.path}
                pathLength={100}
                className="shooting-star-path"
                stroke={`url(#shooting-gradient-${index})`}
                style={{
                  ["--shoot-duration" as string]: `${star.duration}s`,
                  ["--shoot-delay" as string]: `${star.delay}s`,
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 pt-6 text-center"
        >
          <h1 className="title-halo text-5xl tracking-[0.08em] text-[color:var(--foreground)] sm:text-7xl">
            After Voice
          </h1>
        </motion.header>

        <section className="relative z-10 flex-1 py-10">
          <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-8 xl:min-h-[72vh] xl:justify-center">
            <div className="xl:pr-[21rem]">
            <AnimatePresence mode="sync">
              {showLanding ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, scale: 0.988, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.995, filter: "blur(10px)" }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto w-full max-w-4xl xl:ml-0"
                >
                  <form
                    onSubmit={handleSubmit}
                    aria-busy={isResolving}
                    className="burn-panel rounded-[2rem] border border-white/8 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:p-8 xl:translate-x-6"
                  >
                    <div className="voice-capture-shell relative min-h-[27rem] overflow-hidden rounded-[1.65rem] border border-white/8 px-5 py-6 sm:min-h-[28rem] sm:px-7 sm:py-7">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="voice-capture-vein absolute left-[8%] top-[18%] h-px w-[28%]" />
                        <div className="voice-capture-vein absolute right-[10%] top-[28%] h-px w-[18%]" />
                        <div className="voice-capture-vein absolute bottom-[22%] left-[18%] h-px w-[22%]" />
                      </div>

                        <div className="relative flex flex-col items-center gap-5 text-center">
                          <div className="voice-capture-orbit">
                          <motion.button
                            type="button"
                            onClick={isListening ? handleStopListening : handleStartListening}
                            whileTap={{ scale: 0.98 }}
                            animate={
                              isListening
                                ? { scale: [1, 1.06, 0.98, 1], boxShadow: [
                                    "0 0 0 rgba(201,119,89,0.12)",
                                    "0 0 36px rgba(201,119,89,0.4)",
                                    "0 0 18px rgba(127,154,146,0.3)",
                                    "0 0 0 rgba(201,119,89,0.12)",
                                  ] }
                                : { scale: 1, boxShadow: "0 0 0 rgba(201,119,89,0.12)" }
                            }
                            transition={{
                              duration: 2.8,
                              repeat: isListening ? Number.POSITIVE_INFINITY : 0,
                              ease: "easeInOut",
                            }}
                            className={`voice-capture-button ${isListening ? "voice-capture-button-live" : ""}`}
                          >
                            <span className="font-mono-art text-[11px] uppercase tracking-[0.34em]">
                              {isListening ? "Receiving" : "Speak"}
                            </span>
                          </motion.button>
                        </div>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <motion.span
                              key={`voice-bar-${index}`}
                              className="voice-meter-bar"
                              animate={
                                isListening
                                  ? {
                                      height: [10, 28 + index * 3, 14, 24 - index, 10],
                                      opacity: [0.4, 0.95, 0.55, 0.82, 0.4],
                                    }
                                  : {
                                      height: [10, 14, 10],
                                      opacity: [0.18, 0.3, 0.18],
                                    }
                              }
                              transition={{
                                duration: 1.4 + index * 0.12,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: index * 0.08,
                              }}
                            />
                          ))}
                        </div>

                        <p className="font-mono-art text-[10px] uppercase tracking-[0.34em] text-[color:var(--muted)]/88">
                          {isListening
                            ? "I'm listening. Say one sentence."
                            : listeningEnded
                              ? "Recorded successfully. Release it or try again."
                              : "Tap the circle and speak one sentence."}
                        </p>

                        <div className="voice-transcript-window h-[6.25rem] w-full max-w-2xl overflow-hidden px-4 py-4 sm:h-[7rem]">
                          <p className="transcript-preview text-center text-lg leading-relaxed text-[color:var(--foreground)]/92 sm:text-2xl">
                            {interimSentence || trimmedSentence || "Your spoken sentence will settle here."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <label htmlFor="sentence" className="sr-only">
                      One sentence
                    </label>
                    <input
                      id="sentence"
                      name="sentence"
                      type="text"
                      maxLength={MAX_SENTENCE_LENGTH}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={sentence}
                      onChange={(event) => setSentence(event.target.value)}
                      placeholder="or leave a sentence by hand"
                      className="burning-input mt-6 h-24 w-full border-0 bg-transparent text-center text-2xl leading-relaxed text-[color:var(--foreground)] outline-none placeholder:text-white/22 sm:h-28 sm:text-4xl"
                    />

                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                      <p className="font-mono-art text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
                        {trimmedSentence.length}/{MAX_SENTENCE_LENGTH}
                      </p>
                      <div className="flex items-center gap-3">
                        {speechSupported ? (
                          <button
                            type="button"
                            onClick={isListening ? handleStopListening : handleStartListening}
                            className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--muted)] transition hover:border-white/24 hover:text-[color:var(--foreground)]"
                          >
                            {isListening ? "Stop voice" : "Voice again"}
                          </button>
                        ) : null}
                        <button
                          type="submit"
                          disabled={!canSubmit}
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--flare)]/50 px-5 py-2 text-sm uppercase tracking-[0.24em] text-[color:var(--foreground)] transition hover:border-[color:var(--flare)] hover:bg-[color:var(--flare)]/12 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                        >
                          Release
                          {isResolving ? (
                            <span
                              aria-hidden="true"
                              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent"
                            />
                          ) : null}
                        </button>
                      </div>
                    </div>

                    {error ? (
                      <p className="mt-4 text-sm text-[color:var(--accent)]">{error}</p>
                    ) : null}

                    {transformSource ? (
                      <p className="mt-3 font-mono-art text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                        Source: {transformSource === "llm" ? "LLM" : "Local fallback"}
                      </p>
                    ) : null}
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="field"
                  initial={{ opacity: 0, scale: 0.995, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.005, filter: "blur(10px)" }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 xl:items-start"
                >
                  <TransformationField
                    transformation={transformation}
                    step={step}
                    echoSeed={echoSeed}
                  />

                  {transformSource ? (
                    <p className="font-mono-art text-[10px] uppercase tracking-[0.34em] text-[color:var(--muted)]/88 xl:pl-8">
                      Source: {transformSource === "llm" ? "LLM" : "Local fallback"}
                    </p>
                  ) : null}

                  {(status === "complete" || step >= 4) && transformation ? (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      onClick={handleReset}
                      className="rounded-full border border-white/12 px-5 py-2 text-sm uppercase tracking-[0.26em] text-[color:var(--muted)] transition hover:border-white/28 hover:text-[color:var(--foreground)] xl:ml-8"
                    >
                      Begin again
                    </motion.button>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {archive.length > 0 ? (
              <div className="w-full xl:pointer-events-auto xl:absolute xl:right-0 xl:top-[4rem] xl:w-[20rem] xl:-rotate-[1.8deg]">
                <ArchiveWall entries={archive} activeId={activeArchiveId} onClear={handleClearArchive} />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
