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
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="mx-auto max-w-3xl text-center text-2xl leading-relaxed text-[color:var(--foreground)] sm:text-4xl"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={faded ? { opacity: [1, 0.72, 0], y: [0, -8, -20] } : { opacity: 1, y: 0 }}
          transition={{
            duration: faded ? 1.45 : 1,
            delay: faded ? index * 0.12 : index * 0.05,
            ease: "easeOut",
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
