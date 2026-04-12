"use client";

import { motion } from "framer-motion";

type FloatingPhraseProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
};

export function FloatingPhrase({
  text,
  className = "",
  delay = 0,
  duration = 8,
}: FloatingPhraseProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        y: [0, -8, 0],
        filter: "blur(0px)",
      }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{
        opacity: { duration: 1.6, delay, ease: "easeOut" },
        y: {
          duration,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        },
        filter: { duration: 1.6, delay, ease: "easeOut" },
      }}
      className={className}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {text}
    </motion.p>
  );
}
