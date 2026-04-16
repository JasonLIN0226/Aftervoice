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
          x: [0, 12, -8, 4, 0],
          y: [0, -18, 10, -8, 0],
          rotate: [0, -1.9, 2.2, -0.9, 0],
          scale: [0.96, 1.06, 0.99, 1.02, 1],
        }
      : tone === "recombined"
        ? {
            x: [0, -8, 6, -3, 0],
            y: [0, -14, 5, -7, 0],
            rotate: [0, 1.4, -1.5, 0.6, 0],
            scale: [0.98, 1.04, 1, 1.01, 1],
          }
        : {
            x: [0, 5, -4, 0],
            y: [0, -10, 4, 0],
            rotate: [0, -0.9, 0.9, 0],
            scale: [0.99, 1.02, 1, 1],
          };

  const ghostClass =
    tone === "variant"
      ? "text-[rgba(255,180,133,0.46)]"
      : tone === "recombined"
        ? "text-[rgba(255,255,255,0.28)]"
        : "text-[rgba(184,165,138,0.34)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        x: drift.x,
        y: drift.y,
        rotate: drift.rotate,
        scale: drift.scale,
        filter: "blur(0px)",
      }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{
        opacity: { duration: 1.6, delay, ease: "easeOut" },
        x: {
          duration,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        y: {
          duration,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        rotate: {
          duration: duration * 1.1,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        scale: {
          duration: duration * 0.9,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        filter: { duration: 1.6, delay, ease: "easeOut" },
      }}
      className="notranslate relative"
      style={{ willChange: "transform, opacity, filter", ...style }}
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
          duration: duration * 0.8,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          background:
            tone === "variant"
              ? "radial-gradient(circle, rgba(255,118,62,0.34), rgba(255,118,62,0))"
              : tone === "recombined"
                ? "radial-gradient(circle, rgba(145,135,255,0.28), rgba(145,135,255,0))"
                : "radial-gradient(circle, rgba(255,204,118,0.24), rgba(255,204,118,0))",
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
