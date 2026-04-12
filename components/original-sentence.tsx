"use client";

import { motion } from "framer-motion";

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
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={
            faded
              ? { opacity: 0, filter: "blur(10px)" }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={{
            duration: faded ? 1.2 : 1,
            delay: faded ? index * 0.12 : index * 0.05,
            ease: "easeOut",
          }}
          className="inline-block pr-[0.35em]"
          style={{ willChange: "opacity, filter" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
