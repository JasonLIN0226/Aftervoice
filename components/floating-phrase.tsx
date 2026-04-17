"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { BurningText } from "@/components/burning-text";

type FloatingPhraseProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  tone?: "exact" | "recombined" | "variant";
  style?: CSSProperties;
  echoText?: string;
  echoLanguage?: string;
};

export function FloatingPhrase({
  text,
  className = "",
  delay = 0,
  duration = 8,
  tone = "exact",
  style,
  echoText,
  echoLanguage,
}: FloatingPhraseProps) {
  const textClass =
    tone === "variant"
      ? "text-burn-variant"
      : tone === "recombined"
        ? "text-burn-recombined"
        : "text-burn-exact";

  const drift =
    tone === "variant"
      ? {
          durationScale: 1.06,
        }
      : tone === "recombined"
        ? {
            durationScale: 0.94,
          }
        : {
            durationScale: 0.82,
          };

  const ghostClass =
    tone === "variant"
      ? "text-[rgba(193,177,255,0.48)]"
      : tone === "recombined"
        ? "text-[rgba(227,239,255,0.3)]"
        : "text-[rgba(171,191,255,0.34)]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, filter: "blur(8px)" }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(10px)" }}
      transition={{
        opacity: { duration: 2, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 2, delay, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 2, delay, ease: [0.22, 1, 0.36, 1] },
      }}
      className={`notranslate star-float star-float-${tone} relative`}
      style={{
        willChange: "transform, opacity, filter",
        ["--float-duration" as string]: `${duration * drift.durationScale}s`,
        ["--float-delay" as string]: `${delay}s`,
        ...style,
      }}
      translate="no"
    >
      {echoText ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, x: 18, y: -10, scale: 0.92, filter: "blur(8px)" }}
          animate={{
            opacity: [0, 0.96, 0.36, 0],
            x: [18, 6, -2, -8],
            y: [-10, -18, -28, -34],
            scale: [0.92, 1.02, 1, 0.96],
            filter: ["blur(8px)", "blur(0.5px)", "blur(2px)", "blur(8px)"],
          }}
          transition={{
            duration: 3.8,
            delay: delay + 0.1,
            ease: "easeInOut",
          }}
          className={`notranslate pointer-events-none absolute left-[0.35em] top-[-1.1em] z-30 whitespace-pre-wrap pr-[0.2em] ${className}`}
          lang={echoLanguage}
          translate="no"
        >
          <BurningText text={echoText} tone="echo" baseDelay={delay + 0.1} className="text-burn-echo" />
        </motion.div>
      ) : null}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-0.8rem] rounded-full blur-2xl"
        animate={{
          opacity: tone === "variant" ? [0.18, 0.4, 0.22] : [0.12, 0.28, 0.14],
          scale: [0.88, 1.08, 0.94],
        }}
        transition={{
          duration: Math.max(6, duration * 0.75),
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          background:
            tone === "variant"
              ? "radial-gradient(circle, rgba(168,141,255,0.32), rgba(168,141,255,0))"
              : tone === "recombined"
                ? "radial-gradient(circle, rgba(125,217,255,0.28), rgba(125,217,255,0))"
                : "radial-gradient(circle, rgba(244,240,198,0.24), rgba(244,240,198,0))",
        }}
      />
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute left-[0.08em] top-[0.1em] blur-[1.5px] ${ghostClass} ${textClass} ${className}`}
      >
        <BurningText text={text} tone={tone} baseDelay={delay} className={textClass} />
      </p>
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute -left-[0.05em] -top-[0.05em] opacity-35 blur-[2.5px] ${ghostClass} ${textClass} ${className}`}
      >
        <BurningText text={text} tone={tone} baseDelay={delay + 0.04} className={textClass} />
      </p>
      <p className={`relative z-10 ${textClass} ${className}`}>
        <BurningText text={text} tone={tone} baseDelay={delay} className={textClass} />
      </p>
    </motion.div>
  );
}
