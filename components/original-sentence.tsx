"use client";

import { motion } from "framer-motion";
import { BurningText } from "@/components/burning-text";

type OriginalSentenceProps = {
  text: string;
  faded: boolean;
};

export function OriginalSentence({ text, faded }: OriginalSentenceProps) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl text-center text-2xl leading-relaxed text-[color:var(--foreground)] sm:text-4xl"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={
            faded
              ? { opacity: [1, 0.72, 0], filter: ["blur(0px)", "blur(1px)", "blur(8px)"] }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={{
            duration: faded ? 1.7 : 1.2,
            delay: faded ? index * 0.1 : index * 0.045,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block pr-[0.35em]"
        >
          <BurningText
            text={word}
            tone="core"
            baseDelay={index * 0.04}
            fadeOut={faded}
            className="text-burn-core"
          />
        </motion.span>
      ))}
    </motion.div>
  );
}
