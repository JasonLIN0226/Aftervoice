"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TransformationField } from "@/components/transformation-field";
import {
  MAX_SENTENCE_LENGTH,
  normalizeSentence,
  type Transformation,
} from "@/lib/transform";

type ExperienceState = "idle" | "loading" | "playing" | "complete" | "error";

const STEP_TIMINGS = [2600, 5600, 9200, 13200];

export function AfterDistortion() {
  const [sentence, setSentence] = useState("");
  const [submittedSentence, setSubmittedSentence] = useState("");
  const [transformation, setTransformation] = useState<Transformation | null>(null);
  const [status, setStatus] = useState<ExperienceState>("idle");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

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
    setStatus("loading");
    setStep(0);

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

      const payload = (await response.json()) as Transformation;
      setTransformation(payload);
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
    setStatus("idle");
    setStep(0);
    setError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col justify-between">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pt-6"
        >
          <p className="font-mono-art text-[11px] uppercase tracking-[0.45em] text-[color:var(--muted)]">
            Digital artwork
          </p>
          <h1 className="mt-3 text-5xl tracking-[0.04em] text-[color:var(--foreground)] sm:text-7xl">
            After Distortion
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--muted)] sm:text-lg">
            One sentence enters the medium. It does not return intact.
          </p>
        </motion.header>

        <section className="flex flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait">
            {status === "idle" || status === "error" ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -22 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mx-auto w-full max-w-3xl"
              >
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)] sm:p-8"
                >
                  <label htmlFor="sentence" className="sr-only">
                    One sentence
                  </label>
                  <input
                    id="sentence"
                    name="sentence"
                    type="text"
                    maxLength={MAX_SENTENCE_LENGTH}
                    value={sentence}
                    onChange={(event) => setSentence(event.target.value)}
                    placeholder="Type one sentence."
                    className="h-20 w-full border-0 bg-transparent text-2xl leading-relaxed text-[color:var(--foreground)] outline-none placeholder:text-white/28 sm:h-24 sm:text-3xl"
                  />

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                    <p className="font-mono-art text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
                      {trimmedSentence.length}/{MAX_SENTENCE_LENGTH}
                    </p>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="rounded-full border border-[color:var(--accent)]/50 px-5 py-2 text-sm tracking-[0.24em] text-[color:var(--foreground)] uppercase transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                    >
                      Release
                    </button>
                  </div>

                  {error ? (
                    <p className="mt-4 text-sm text-[color:var(--accent)]">{error}</p>
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
                  <div className="flex min-h-[58vh] w-full items-center justify-center rounded-[2rem] border border-white/8 bg-white/[0.02] px-6 py-16">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 1, 0.45] }}
                      transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="max-w-3xl text-center text-2xl leading-relaxed text-[color:var(--foreground)]/82 sm:text-4xl"
                    >
                      {submittedSentence}
                    </motion.p>
                  </div>
                ) : transformation ? (
                  <TransformationField transformation={transformation} step={step} />
                ) : null}

                {(status === "complete" || step >= 4) && transformation ? (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    onClick={handleReset}
                    className="rounded-full border border-white/12 px-5 py-2 text-sm tracking-[0.26em] text-[color:var(--muted)] uppercase transition hover:border-white/28 hover:text-[color:var(--foreground)]"
                  >
                    Begin again
                  </motion.button>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
