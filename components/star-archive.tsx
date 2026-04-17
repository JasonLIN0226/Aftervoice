"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ArchiveEntry } from "@/components/archive-wall";

type StarArchiveProps = {
  entries: ArchiveEntry[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onClear: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function StarArchive({ entries, activeId, onSelect, onClear }: StarArchiveProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visibleEntries = useMemo(() => entries.slice(0, 12), [entries]);
  const focusedEntry =
    visibleEntries.find((entry) => entry.id === hoveredId) ??
    visibleEntries.find((entry) => entry.id === activeId) ??
    null;

  const cardPosition = focusedEntry
    ? {
        left: `${(focusedEntry.x ?? 50) > 50 ? (focusedEntry.x ?? 50) - 4 : (focusedEntry.x ?? 50) + 4}%`,
        top: `${(focusedEntry.y ?? 50) > 50 ? (focusedEntry.y ?? 50) - 3 : (focusedEntry.y ?? 50) + 3}%`,
        translateX: (focusedEntry.x ?? 50) > 50 ? "-100%" : "0%",
      }
    : null;

  return (
    <div className="star-archive-layer pointer-events-none absolute inset-0 z-20">
      <button
        type="button"
        onClick={onClear}
        className="star-archive-clear pointer-events-auto fixed right-2 top-2 z-40 rounded-full border border-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/45 transition hover:border-white/18 hover:text-white/72 sm:right-3 sm:top-3"
      >
        Clear
      </button>

      {visibleEntries.map((entry, index) => {
        const x = clamp(entry.x ?? 24 + (index * 11) % 52, 10, 88);
        const y = clamp(entry.y ?? 18 + (index * 13) % 58, 10, 82);
        const size = clamp(entry.size ?? 0.92 + (index % 4) * 0.16, 0.72, 1.48);
        const delay = entry.twinkleDelay ?? (index % 5) * 0.7;
        const isActive = entry.id === activeId || entry.id === hoveredId;

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(activeId === entry.id ? null : entry.id)}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId((current) => (current === entry.id ? null : current))}
            className="star-archive-node pointer-events-auto absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${size})`,
              ["--star-delay" as string]: `${delay}s`,
            }}
            aria-label={`Residual star: ${entry.residue}`}
          >
            <span className={`star-archive-star ${isActive ? "star-archive-star-active" : ""}`} />
          </button>
        );
      })}

      <AnimatePresence>
        {focusedEntry && cardPosition ? (
          <motion.div
            key={focusedEntry.id}
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="star-archive-card pointer-events-auto absolute z-30 w-[16rem] rounded-[1.2rem] border border-white/10 bg-[rgba(6,10,24,0.76)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur-md"
            style={{
              left: cardPosition.left,
              top: cardPosition.top,
              transform: `translate(${cardPosition.translateX}, -50%)`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono-art text-[10px] uppercase tracking-[0.34em] text-[color:var(--muted)]">
                  Residual Star
                </p>
                <p className="mt-2 text-lg leading-snug text-[color:var(--foreground)]">
                  {focusedEntry.residue}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHoveredId(null);
                  onSelect(null);
                }}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted)] transition hover:border-white/24 hover:text-[color:var(--foreground)]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-mono-art text-[10px] uppercase tracking-[0.26em] text-white/42">
                Trace {String(visibleEntries.findIndex((entry) => entry.id === focusedEntry.id) + 1).padStart(2, "0")}
              </p>
              <p className="max-w-[10rem] truncate text-right text-[11px] text-white/34">
                {focusedEntry.source}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
