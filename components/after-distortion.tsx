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

type ExperienceState = "idle" | "loading" | "playing" | "complete" | "error";

const STEP_TIMINGS = [2600, 5600, 9200, 13200];
const ARCHIVE_STORAGE_KEY = "after-distortion-archive";

export function AfterDistortion() {
  const [sentence, setSentence] = useState("");
  const [submittedSentence, setSubmittedSentence] = useState("");
  const [transformation, setTransformation] = useState<Transformation | null>(null);
  const [transformSource, setTransformSource] = useState<TransformSource | null>(null);
  const [status, setStatus] = useState<ExperienceState>("idle");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  const [echoSeed, setEchoSeed] = useState(0);
  const archivedThisCycle = useRef(false);
  const archiveHydrated = useRef(false);

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
    if (status !== "playing") {
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
  }, [status]);

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
  const canSubmit =
    trimmedSentence.length > 0 &&
    trimmedSentence.length <= MAX_SENTENCE_LENGTH &&
    status !== "loading";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = normalizeSentence(sentence);

    if (!trimmed) {
      return;
    }

    setError("");
    setSubmittedSentence(trimmed);
    setTransformation(null);
    setTransformSource(null);
    setStatus("loading");
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
      setStatus("playing");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "The sentence did not hold.",
      );
      setStatus("error");
    }
  }

  function handleReset() {
    setSentence("");
    setSubmittedSentence("");
    setTransformation(null);
    setTransformSource(null);
    setStatus("idle");
    setStep(0);
    setError("");
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
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 pt-6 text-center"
        >
          <h1 className="text-5xl tracking-[0.08em] text-[color:var(--foreground)] sm:text-7xl">
            After Voice
          </h1>
        </motion.header>

        <section className="relative z-10 grid flex-1 grid-cols-1 items-center gap-6 py-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <AnimatePresence mode="wait">
              {status === "idle" || status === "error" ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="mx-auto w-full max-w-4xl"
                >
                  <form
                    onSubmit={handleSubmit}
                    className="burn-panel rounded-[2rem] border border-white/8 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:p-8"
                  >
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
                      placeholder="leave a sentence"
                      className="burning-input h-24 w-full border-0 bg-transparent text-center text-2xl leading-relaxed text-[color:var(--foreground)] outline-none placeholder:text-white/22 sm:h-28 sm:text-4xl"
                    />

                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                      <p className="font-mono-art text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
                        {trimmedSentence.length}/{MAX_SENTENCE_LENGTH}
                      </p>
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="rounded-full border border-[color:var(--flare)]/50 px-5 py-2 text-sm uppercase tracking-[0.24em] text-[color:var(--foreground)] transition hover:border-[color:var(--flare)] hover:bg-[color:var(--flare)]/12 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                      >
                        Release
                      </button>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8"
                >
                  {status === "loading" ? (
                    <div className="burn-panel relative flex min-h-[62vh] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/8 px-6 py-16">
                      <div className="field-scanlines pointer-events-none absolute inset-0" />
                      <div className="field-noise pointer-events-none absolute inset-0" />
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.2, 1, 0.45],
                          filter: ["blur(0px)", "blur(0px)", "blur(5px)"],
                          scale: [0.98, 1.02, 1],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        className="text-burn-loading max-w-3xl text-center text-2xl leading-relaxed sm:text-4xl"
                      >
                        {submittedSentence}
                      </motion.p>
                    </div>
                  ) : transformation ? (
                    <TransformationField transformation={transformation} step={step} echoSeed={echoSeed} />
                  ) : null}

                  {transformSource ? (
                    <p className="font-mono-art text-[11px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
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
                      className="rounded-full border border-white/12 px-5 py-2 text-sm uppercase tracking-[0.26em] text-[color:var(--muted)] transition hover:border-white/28 hover:text-[color:var(--foreground)]"
                    >
                      Begin again
                    </motion.button>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {archive.length > 0 ? (
            <ArchiveWall entries={archive} activeId={activeArchiveId} onClear={handleClearArchive} />
          ) : (
            <div className="hidden xl:block" />
          )}
        </section>
      </div>
    </main>
  );
}
