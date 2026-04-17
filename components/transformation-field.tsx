"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FloatingPhrase } from "@/components/floating-phrase";
import { OriginalSentence } from "@/components/original-sentence";
import { createForeignEcho } from "@/lib/echo";
import type { Transformation } from "@/lib/transform";

type TransformationFieldProps = {
  transformation: Transformation | null;
  step: number;
  echoSeed: number;
};

const exactPositions = [
  {
    className: "left-[4%] top-[12%] sm:left-[8%] sm:top-[14%]",
    style: { rotate: "-7deg", maxWidth: "14rem" },
  },
  {
    className: "right-[6%] top-[28%] text-right sm:right-[14%] sm:top-[24%]",
    style: { rotate: "6deg", maxWidth: "15rem" },
  },
  {
    className: "left-[18%] bottom-[18%] sm:left-[24%] sm:bottom-[20%]",
    style: { rotate: "-3deg", maxWidth: "13rem" },
  },
];

const recombinedPositions = [
  {
    className: "left-1/2 top-[18%] -translate-x-1/2",
    style: { rotate: "-2deg", maxWidth: "18rem" },
  },
  {
    className: "left-[8%] top-[50%] sm:left-[14%] sm:top-[48%]",
    style: { rotate: "5deg", maxWidth: "18rem" },
  },
];

const variantPositions = [
  {
    className: "right-[10%] top-[10%] text-right sm:right-[18%] sm:top-[12%]",
    style: { rotate: "8deg", maxWidth: "15rem" },
  },
];

const stageMarks = ["I", "II", "III", "IV", "V"];
const emberDots = [
  { left: "14%", top: "20%", size: 7, delay: 0.2, duration: 4.6, color: "var(--flare)" },
  { left: "24%", top: "72%", size: 5, delay: 1.2, duration: 5.8, color: "var(--signal)" },
  { left: "46%", top: "18%", size: 6, delay: 0.9, duration: 5.2, color: "var(--aura)" },
  { left: "63%", top: "64%", size: 8, delay: 0.4, duration: 6.1, color: "var(--ember)" },
  { left: "82%", top: "28%", size: 5, delay: 1.6, duration: 4.9, color: "var(--flare)" },
  { left: "76%", top: "78%", size: 7, delay: 0.7, duration: 6.6, color: "var(--aura)" },
];
const crossStars = [
  { left: "18%", top: "16%", delay: 0.4, duration: 5.2, scale: 0.84, angle: -12 },
  { left: "74%", top: "22%", delay: 1.3, duration: 6.4, scale: 1, angle: 18 },
  { left: "58%", top: "74%", delay: 0.9, duration: 5.8, scale: 0.72, angle: 34 },
];
const fieldVeils = [
  {
    className: "left-[2%] top-[6%] h-[44%] w-[34%] sm:left-[6%] sm:top-[8%] sm:w-[28%]",
    background:
      "linear-gradient(145deg, rgba(158,201,255,0.1), rgba(158,201,255,0.01) 62%, transparent 100%)",
    rotate: "-14deg",
    duration: 16,
  },
  {
    className: "right-[5%] top-[12%] h-[56%] w-[26%] sm:right-[8%] sm:top-[10%] sm:w-[22%]",
    background:
      "linear-gradient(180deg, rgba(168,141,255,0.16), rgba(168,141,255,0.02) 72%, transparent 100%)",
    rotate: "11deg",
    duration: 18,
  },
  {
    className: "left-[28%] bottom-[-6%] h-[46%] w-[40%] sm:left-[32%] sm:w-[36%]",
    background:
      "linear-gradient(130deg, rgba(30,54,112,0.22), rgba(125,217,255,0.04) 54%, transparent 100%)",
    rotate: "-9deg",
    duration: 20,
  },
];
const ghostFrames = [
  {
    className: "left-[8%] top-[18%] h-[26%] w-[18%] sm:left-[10%]",
    rotate: "-6deg",
    delay: 0.4,
  },
  {
    className: "right-[14%] top-[20%] h-[22%] w-[22%]",
    rotate: "7deg",
    delay: 1.2,
  },
  {
    className: "left-[16%] bottom-[12%] h-[20%] w-[28%]",
    rotate: "3deg",
    delay: 1.8,
  },
];

export function TransformationField({
  transformation,
  step,
  echoSeed,
}: TransformationFieldProps) {
  const showOriginal = step <= 1;
  const showExact = step >= 1 && step <= 3;
  const showRecombined = step >= 2 && step <= 3;
  const showVariants = step === 3;
  const showResidue = step >= 4;
  const activeStageMark = stageMarks[Math.min(step, stageMarks.length - 1)];

  return (
    <div className="distortion-surface burn-panel relative flex min-h-[62vh] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/8 px-6 py-16 shadow-[0_0_80px_rgba(0,0,0,0.35)] xl:-rotate-[0.55deg]">
      <div className="field-scanlines pointer-events-none absolute inset-0" />
      <div className="field-noise pointer-events-none absolute inset-0" />
      <div className="field-burn-mask pointer-events-none absolute inset-0" />
      {fieldVeils.map((veil, index) => (
        <motion.div
          key={`veil-${index}`}
          className={`pointer-events-none absolute ${veil.className}`}
          style={{
            background: veil.background,
            rotate: veil.rotate,
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "0 0 48px rgba(0,0,0,0.18)",
          }}
          animate={{
            x: [0, index % 2 === 0 ? 20 : -16, 4, 0],
            y: [0, -12, 8, 0],
            opacity: [0.16, 0.32, 0.24, 0.18],
            scale: [1, 1.04, 0.98, 1],
          }}
          transition={{
            duration: veil.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
      {ghostFrames.map((frame, index) => (
        <motion.div
          key={`frame-${index}`}
          className={`field-ghost-frame pointer-events-none absolute ${frame.className}`}
          style={{ rotate: frame.rotate }}
          animate={{
            opacity: [0.08, 0.18, 0.1],
            x: [0, index % 2 === 0 ? 12 : -10, 0],
            y: [0, -7, 0],
          }}
          transition={{
            duration: 11 + index * 2,
            delay: frame.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
      <motion.div
        className="field-fracture pointer-events-none absolute left-[54%] top-[10%] h-[76%] w-px"
        animate={{ opacity: [0.05, 0.16, 0.08], scaleY: [0.94, 1.02, 0.98] }}
        transition={{ duration: 9.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 44% 48%, rgba(132,168,255,0.14), transparent 40%), radial-gradient(circle at 62% 38%, rgba(168,141,255,0.12), transparent 34%)",
            "radial-gradient(circle at 50% 54%, rgba(244,240,198,0.16), transparent 42%), radial-gradient(circle at 38% 32%, rgba(125,217,255,0.14), transparent 36%)",
            "radial-gradient(circle at 58% 46%, rgba(108,137,255,0.14), transparent 44%), radial-gradient(circle at 44% 60%, rgba(163,117,255,0.12), transparent 34%)",
          ],
        }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
        animate={{
          background: [
            "linear-gradient(110deg, transparent 34%, rgba(244,240,198,0.1) 44%, transparent 58%)",
            "linear-gradient(110deg, transparent 28%, rgba(125,217,255,0.16) 48%, transparent 64%)",
            "linear-gradient(110deg, transparent 32%, rgba(137,126,255,0.14) 46%, transparent 62%)",
          ],
        }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      {emberDots.map((dot, index) => (
        <motion.span
          key={`${dot.left}-${dot.top}-${index}`}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            boxShadow: `0 0 16px ${dot.color}`,
          }}
          animate={{
            opacity: [0, 1, 0.32, 0],
            y: [0, -4, 2, -1],
            x: [0, 2, -2, 1],
            scale: [0.45, 1.2, 0.74, 0.22],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
      {crossStars.map((star, index) => (
        <motion.span
          key={`cross-${star.left}-${star.top}-${index}`}
          className="star-cross"
          style={{
            left: star.left,
            top: star.top,
            scale: star.scale,
            rotate: `${star.angle}deg`,
          }}
          animate={{
            opacity: [0.18, 0.95, 0.3, 0.82, 0.22],
            scale: [star.scale * 0.88, star.scale * 1.14, star.scale * 0.92, star.scale],
            rotate: [`${star.angle}deg`, `${star.angle + 8}deg`, `${star.angle}deg`, `${star.angle - 6}deg`, `${star.angle}deg`],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="pointer-events-none absolute left-5 top-5 z-40 rounded-full border border-white/10 bg-black/18 px-4 py-2 backdrop-blur-md">
        <p className="font-mono-art text-[10px] uppercase tracking-[0.4em] text-[color:var(--muted)]">
          {activeStageMark}
        </p>
      </div>

      <AnimatePresence mode="sync">
        {transformation && showOriginal ? (
          <motion.div
            key={`original-${step}`}
            className="relative z-10 flex w-full items-center justify-center"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <OriginalSentence text={transformation.original} faded={step === 1} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {transformation &&
          showExact &&
          transformation.exact_fragments.map((fragment, index) => {
            const position = exactPositions[index] ?? exactPositions[0];

            return (
              <div
                key={`exact-${fragment}-${index}`}
                className={`pointer-events-none absolute z-20 ${position.className}`}
              >
                <FloatingPhrase
                  text={fragment}
                  delay={index * 0.45}
                  tone="exact"
                  style={position.style}
                  className="font-mono-art text-sm tracking-[0.16em] text-[color:var(--muted)] sm:text-base"
                />
              </div>
            );
          })}
      </AnimatePresence>

      <AnimatePresence>
        {transformation &&
          showRecombined &&
          transformation.recombined_fragments.map((fragment, index) => {
            const position = recombinedPositions[index] ?? recombinedPositions[0];
            const echo = createForeignEcho(fragment, echoSeed + index + step);

            return (
              <div
                key={`recombined-${fragment}-${index}`}
                className={`pointer-events-none absolute z-30 ${position.className}`}
              >
                <FloatingPhrase
                  text={fragment}
                  delay={0.2 + index * 0.5}
                  duration={10}
                  tone="recombined"
                  style={position.style}
                  echoText={echo?.text}
                  echoLanguage={echo?.language}
                  className="text-lg leading-snug text-[color:var(--foreground)]/86 sm:text-2xl"
                />
              </div>
            );
          })}
      </AnimatePresence>

      <AnimatePresence>
        {transformation &&
          showVariants &&
          transformation.slight_variants.map((fragment, index) => {
            const position = variantPositions[index] ?? variantPositions[0];
            const echo = createForeignEcho(fragment, echoSeed + index + step + 3);

            return (
              <div
                key={`variant-${fragment}-${index}`}
                className={`pointer-events-none absolute z-40 ${position.className}`}
              >
                <FloatingPhrase
                  text={fragment}
                  delay={0.5 + index * 0.55}
                  duration={12}
                  tone="variant"
                  style={position.style}
                  echoText={echo?.text}
                  echoLanguage={echo?.language}
                  className="text-base italic leading-snug text-[color:var(--accent)] sm:text-xl"
                />
              </div>
            );
          })}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {transformation && showResidue ? (
          <motion.div
            key="residue"
            initial={{ opacity: 0, scale: 0.97, y: 10, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.03, y: -10, filter: "blur(12px)" }}
            transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-50 px-4 text-center"
            style={{ willChange: "opacity, transform, filter" }}
          >
            <p className="text-burn-residue residue-burn text-3xl sm:text-5xl">
              {transformation.final_residue}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
