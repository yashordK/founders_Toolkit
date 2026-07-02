"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbit, Users } from "lucide-react";

const items = [
  { href: "/", icon: Orbit },
  { href: "/connections", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-16 z-20 flex flex-col items-center justify-center gap-8">
      {items.map(({ href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 ${
              active
                ? "text-white"
                : "text-white/25 hover:text-white/70"
            }`}
          >
            <Icon
              size={18}
              strokeWidth={1.25}
              className="transition-all duration-500"
            />
            {active && (
              <span className="absolute inset-0 rounded-full border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]" />
            )}
          </Link>
        );
      })}
      <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
    </div>
  );
}
