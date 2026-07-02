"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import HudPanel from "@/components/HudPanel";
import { Capture } from "@/lib/hudData";

export default function QuickCaptureSystem({
  initialCaptures,
}: {
  initialCaptures: Capture[];
}) {
  const [captures, setCaptures] = useState<Capture[]>(initialCaptures);
  const [value, setValue] = useState("");
  const [justCaptured, setJustCaptured] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;

    setCaptures((prev) => [{ text: `Added: ${text}`, time: "just now" }, ...prev]);
    setValue("");
    setJustCaptured(true);
    setTimeout(() => setJustCaptured(false), 1500);
  }

  return (
    <>
      <HudPanel
        title="Recent Captures"
        className="absolute top-[37%] left-[3%] w-60"
        delay={0.3}
      >
        <ul className="flex flex-col gap-2.5">
          {captures.map((c, i) => (
            <li key={`${c.text}-${i}`} className="text-sm text-white/40 leading-snug">
              {c.text}
              <span className="text-white/25"> · {c.time}</span>
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel
        title="Quick Capture"
        className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-72"
        delay={0.7}
        attention={justCaptured}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Anything to remember?"
            className="w-full bg-transparent border-b border-white/10 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/30 pb-1 transition-colors"
          />
        </form>
        <AnimatePresence>
          {justCaptured && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 mt-2 text-xs text-white/70"
            >
              <Check size={12} strokeWidth={2} />
              Captured
            </motion.div>
          )}
        </AnimatePresence>
      </HudPanel>
    </>
  );
}
