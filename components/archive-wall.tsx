"use client";

import { motion } from "framer-motion";

export type ArchiveEntry = {
  id: string;
  residue: string;
  source: string;
};

type ArchiveWallProps = {
  entries: ArchiveEntry[];
  activeId: string | null;
  onClear: () => void;
};

export function ArchiveWall({ entries, activeId, onClear }: ArchiveWallProps) {
  const visibleEntries = entries.slice(0, 8);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      className="distortion-surface archive-panel relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      translate="no"
    >
      <div className="pointer-events-none absolute inset-x-5 top-3 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/50 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono-art text-[10px] uppercase tracking-[0.4em] text-[color:var(--muted)]">
            Residual archive
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)] transition hover:border-white/25 hover:text-[color:var(--foreground)]"
        >
          Clear
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {visibleEntries.map((entry, index) => {
          const isActive = entry.id === activeId;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.6, ease: "easeOut" }}
              className={`archive-slip ${isActive ? "archive-slip-active" : ""}`}
              style={{
                rotate: `${(index % 2 === 0 ? -1 : 1) * (index + 1) * 0.55}deg`,
                marginLeft: `${(index % 3) * 0.55}rem`,
              }}
            >
              <p className="archive-slip-text">{entry.residue}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-mono-art text-[10px] uppercase tracking-[0.28em] text-white/45">
                  Trace {String(entries.length - index).padStart(2, "0")}
                </p>
                <p className="max-w-[8rem] truncate text-right text-[11px] text-white/34">
                  {entry.source}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
}
