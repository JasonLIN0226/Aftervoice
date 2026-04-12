"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FloatingPhrase } from "@/components/floating-phrase";
import { OriginalSentence } from "@/components/original-sentence";
import type { Transformation } from "@/lib/transform";

type TransformationFieldProps = {
  transformation: Transformation;
  step: number;
};

const exactPositions = [
  "left-[8%] top-[16%] sm:left-[14%] sm:top-[18%]",
  "right-[12%] top-[34%] text-right sm:right-[18%] sm:top-[30%]",
  "left-[16%] bottom-[24%] sm:left-[22%]",
  "right-[8%] bottom-[18%] text-right sm:right-[16%]",
];

const recombinedPositions = [
  "left-1/2 top-[22%] -translate-x-1/2",
  "left-[12%] top-1/2 sm:left-[18%]",
  "right-[10%] bottom-[28%] text-right sm:right-[18%]",
];

const variantPositions = [
  "right-[14%] top-[14%] text-right sm:right-[22%]",
  "left-[10%] bottom-[16%] sm:left-[18%]",
];

export function TransformationField({
  transformation,
  step,
}: TransformationFieldProps) {
  const showOriginal = step <= 1;
  const showExact = step >= 1 && step <= 3;
  const showRecombined = step >= 2 && step <= 3;
  const showVariants = step === 3;
  const showResidue = step >= 4;

  return (
    <div className="relative flex min-h-[58vh] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.02] px-6 py-16 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(184,165,138,0.04), transparent 46%)",
            "radial-gradient(circle at 48% 52%, rgba(184,165,138,0.09), transparent 46%)",
            "radial-gradient(circle at 52% 48%, rgba(184,165,138,0.05), transparent 46%)",
          ],
        }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <AnimatePresence mode="wait">
        {showOriginal ? (
          <motion.div
            key={`original-${step}`}
            className="relative z-10 flex w-full items-center justify-center"
          >
            <OriginalSentence text={transformation.original} faded={step === 1} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showExact &&
          transformation.exact_fragments.map((fragment, index) => (
            <div
              key={`exact-${fragment}-${index}`}
              className={`pointer-events-none absolute z-20 max-w-[16rem] ${exactPositions[index] ?? exactPositions[0]}`}
            >
              <FloatingPhrase
                text={fragment}
                delay={index * 0.45}
                className="font-mono-art text-sm tracking-[0.16em] text-[color:var(--muted)] sm:text-base"
              />
            </div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {showRecombined &&
          transformation.recombined_fragments.map((fragment, index) => (
            <div
              key={`recombined-${fragment}-${index}`}
              className={`pointer-events-none absolute z-30 max-w-[18rem] ${recombinedPositions[index] ?? recombinedPositions[0]}`}
            >
              <FloatingPhrase
                text={fragment}
                delay={0.2 + index * 0.5}
                duration={10}
                className="text-lg leading-snug text-[color:var(--foreground)]/86 sm:text-2xl"
              />
            </div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {showVariants &&
          transformation.slight_variants.map((fragment, index) => (
            <div
              key={`variant-${fragment}-${index}`}
              className={`pointer-events-none absolute z-40 max-w-[18rem] ${variantPositions[index] ?? variantPositions[0]}`}
            >
              <FloatingPhrase
                text={fragment}
                delay={0.5 + index * 0.55}
                duration={12}
                className="text-base italic leading-snug text-[color:var(--accent)] sm:text-xl"
              />
            </div>
          ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showResidue ? (
          <motion.div
            key="residue"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="relative z-50 px-4 text-center"
            style={{ willChange: "opacity, transform, filter" }}
          >
            <p className="text-3xl text-[color:var(--foreground)] sm:text-5xl">
              {transformation.final_residue}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
