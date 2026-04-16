"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";

type BurningTextProps = {
  text: string;
  tone: "loading" | "core" | "exact" | "recombined" | "variant" | "echo" | "residue";
  className?: string;
  baseDelay?: number;
  fadeOut?: boolean;
};

function toneClass(tone: BurningTextProps["tone"]) {
  switch (tone) {
    case "loading":
      return "text-burn-loading";
    case "core":
      return "text-burn-core";
    case "recombined":
      return "text-burn-recombined";
    case "variant":
      return "text-burn-variant";
    case "echo":
      return "text-burn-echo";
    case "residue":
      return "text-burn-residue";
    default:
      return "text-burn-exact";
  }
}

export function BurningText({
  text,
  tone,
  className = "",
  baseDelay = 0,
  fadeOut = false,
}: BurningTextProps) {
  const glyphs = Array.from(text);
  const visibleCount = glyphs.filter((glyph) => glyph.trim()).length || 1;
  const ashCount = Math.min(7, Math.max(2, Math.floor(visibleCount / 3)));
  const ashSpacing = Math.max(1, Math.floor(visibleCount / ashCount));
  let seenVisible = 0;

  return (
    <span className={`notranslate burning-line ${className}`} translate="no">
      {glyphs.map((glyph, index) => {
        const isSpace = glyph.trim().length === 0;

        if (isSpace) {
          return (
            <span key={`space-${index}`} className="inline-block whitespace-pre">
              {glyph}
            </span>
          );
        }

        const visibleIndex = seenVisible;
        seenVisible += 1;
        const shouldEmitAsh = visibleIndex % ashSpacing === 0 && visibleIndex / ashSpacing < ashCount;
        const ashLeft = `${((visibleIndex + 0.5) / visibleCount) * 100}%`;
        const ashDelay = baseDelay + visibleIndex * 0.045 + 0.18;

        return (
          <Fragment key={`${glyph}-${index}`}>
            <motion.span
              initial={{ opacity: 0, y: 8, rotate: -3, filter: "blur(8px)" }}
              animate={
                fadeOut
                  ? {
                      opacity: [1, 0.82, 0],
                      y: [0, -7, -20],
                      rotate: [0, 2, -6],
                      scale: [1, 1.04, 0.78],
                      filter: ["blur(0px)", "blur(1px)", "blur(7px)"],
                    }
                  : {
                      opacity: [0.55, 1, 0.88, 1],
                      y: [2, -1.5, 0.8, 0],
                      rotate: [0, 0.4, -0.6, 0],
                      scale: [0.98, 1.02, 0.995, 1],
                      filter: ["blur(0px)", "blur(0.2px)", "blur(0px)", "blur(0px)"],
                    }
              }
              transition={{
                duration: fadeOut ? 1.35 : 3.8,
                delay: baseDelay + visibleIndex * 0.03,
                ease: "easeInOut",
                ...(fadeOut
                  ? {}
                  : {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "mirror" as const,
                    }),
              }}
              className={`char-burn ${toneClass(tone)}`}
            >
              {glyph}
            </motion.span>

            {shouldEmitAsh ? (
              <motion.span
                aria-hidden="true"
                className="ash-particle"
                style={{ left: ashLeft }}
                initial={{ opacity: 0, y: -2, x: 0, scale: 0.3 }}
                animate={{
                  opacity: fadeOut ? [0.18, 0.68, 0] : [0, 0.5, 0.14, 0],
                  y: fadeOut ? [-4, 16, 40] : [-2, 12, 28, 42],
                  x: [0, 4, -3, 2],
                  scale: fadeOut ? [0.4, 1, 0.36] : [0.3, 0.9, 0.65, 0.24],
                }}
                transition={{
                  duration: fadeOut ? 1.8 : 3.2,
                  delay: ashDelay,
                  ease: "easeInOut",
                  ...(fadeOut
                    ? {}
                    : {
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 1.1,
                      }),
                }}
              />
            ) : null}
          </Fragment>
        );
      })}
    </span>
  );
}
