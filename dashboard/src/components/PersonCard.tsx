import Link from "next/link";
import HudPanel from "@/components/HudPanel";
import { Person } from "@/lib/mockData";

export default function PersonCard({
  person,
  delay = 0,
}: {
  person: Person;
  delay?: number;
}) {
  return (
    <Link href={`/connections/${person.id}`} className="block w-64">
      <HudPanel title={person.name} interactive delay={delay} className="h-full">
        <p className="text-sm text-white/50 leading-snug">{person.background}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {person.expertise.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
            >
              {skill}
            </span>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-3">
          Last interaction: {person.last_interaction_date}
        </p>
      </HudPanel>
    </Link>
  );
}
