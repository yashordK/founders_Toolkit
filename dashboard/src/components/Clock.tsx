"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const date = now
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <motion.div
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="font-mono text-white/90 tracking-[0.08em] tabular-nums"
        style={{
          fontSize: "clamp(3.5rem, 10vw, 8rem)",
          fontWeight: 200,
          textShadow: "0 0 40px rgba(255,255,255,0.15)",
        }}
      >
        {time}
      </motion.div>
      <div className="mt-3 text-xs tracking-[0.4em] text-white/25">
        {date}
      </div>
    </div>
  );
}
