"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FindHelperAction({
  personName,
  suggestion,
}: {
  personName: string;
  suggestion: { name: string; reason: string };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleClick() {
    if (status !== "idle") return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1000);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status !== "idle"}
        className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors ${
          status === "idle"
            ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90 cursor-pointer"
            : "bg-white/5 border-white/10 text-white/40 cursor-default"
        }`}
      >
        {status === "loading" && (
          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
        )}
        {status === "loading"
          ? "Searching…"
          : `Find who could help, starting from ${personName}`}
      </button>

      <AnimatePresence>
        {status === "done" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-white/50 mt-3"
          >
            Suggested: <span className="text-white/80">{suggestion.name}</span>{" "}
            — {suggestion.reason}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
