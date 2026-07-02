"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function HudPanel({
  title,
  children,
  className = "",
  delay = 0,
  attention = false,
  interactive = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  attention?: boolean;
  interactive?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay, ease: "easeOut" }}
      className={`rounded-xl border p-4 backdrop-blur-xl transition-all duration-700 ${
        attention
          ? "border-white/25 bg-black/55 shadow-[0_0_24px_rgba(255,255,255,0.08)]"
          : "border-white/[0.07] bg-black/50"
      } ${interactive ? "cursor-pointer hover:border-white/20 hover:bg-black/40" : ""} ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className={`text-[10px] tracking-[0.2em] uppercase ${
            attention ? "text-white/70" : "text-white/30"
          }`}
        >
          {title}
        </h2>
        {attention && (
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
        )}
      </div>
      {children}
    </motion.div>
  );
}
