import Clock from "@/components/Clock";
import HudPanel from "@/components/HudPanel";
import QuickCaptureSystem from "@/components/QuickCaptureSystem";
import { people } from "@/lib/mockData";
import {
  schedule,
  nudges,
  priorities,
  syncStatus,
  recentCaptures,
  warmIntro,
  followUpsDue,
} from "@/lib/hudData";

export default function TodayPage() {
  const hasUrgent = nudges.some((n) => n.urgent);

  return (
    <div className="relative h-full w-full">
      <Clock />

      <HudPanel title="Schedule" className="absolute top-[10%] left-[10%] w-64" delay={0.1}>
        <ul className="flex flex-col gap-2">
          {schedule.map((item) => (
            <li
              key={item.time}
              className="flex items-baseline gap-3 text-sm text-white/50"
            >
              <span className="font-mono text-white/70 text-xs">
                {item.time}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel
        title="Nudges"
        className="absolute top-[14%] right-[8%] w-64"
        delay={0.25}
        attention={hasUrgent}
      >
        <ul className="flex flex-col gap-2.5">
          {nudges.map((nudge) => (
            <li
              key={nudge.text}
              className={`text-sm leading-snug ${
                nudge.urgent ? "text-white/80" : "text-white/40"
              }`}
            >
              {nudge.text}
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel
        title="Connections"
        className="absolute bottom-[12%] left-[7%] w-64"
        delay={0.4}
      >
        <ul className="flex flex-col gap-2.5">
          {people.slice(0, 3).map((person) => (
            <li key={person.id} className="text-sm">
              <span className="text-white/70">{person.name}</span>
              <span className="text-white/30"> · {person.expertise[0]}</span>
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel
        title="Priorities"
        className="absolute bottom-[10%] right-[9%] w-64"
        delay={0.55}
      >
        <ul className="flex flex-col gap-2.5">
          {priorities.map((p) => (
            <li key={p} className="text-sm text-white/45">
              {p}
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel
        title="Sync Status"
        className="absolute top-[4%] left-[36%] w-56"
        delay={0.15}
      >
        <ul className="flex flex-col gap-2">
          {syncStatus.map((s) => (
            <li
              key={s.service}
              className="flex items-center gap-2 text-sm text-white/40"
            >
              <span className="w-1 h-1 rounded-full bg-white/25 animate-pulse" />
              <span className="text-white/60">{s.service}:</span>
              <span>{s.status}</span>
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel
        title="Warm Intro"
        className="absolute top-[45%] right-[3%] w-60"
        delay={0.45}
      >
        <p className="text-sm text-white/70">{warmIntro.name}</p>
        <p className="text-sm text-white/35 leading-snug mt-1">
          {warmIntro.reason}
        </p>
      </HudPanel>

      <HudPanel
        title="Follow-ups Due"
        className="absolute top-[calc(50%+64px)] left-[calc(50%-318px)] w-52"
        delay={0.6}
        attention={followUpsDue.overdue}
      >
        <p
          className={`text-sm mb-2 ${
            followUpsDue.overdue ? "text-white/80" : "text-white/45"
          }`}
        >
          {followUpsDue.count} due
        </p>
        <ul className="flex flex-col gap-1.5">
          {followUpsDue.names.map((name) => (
            <li key={name} className="text-sm text-white/40">
              {name}
            </li>
          ))}
        </ul>
      </HudPanel>

      <QuickCaptureSystem initialCaptures={recentCaptures} />
    </div>
  );
}
