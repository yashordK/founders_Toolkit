import Link from "next/link";
import { notFound } from "next/navigation";
import HudPanel from "@/components/HudPanel";
import FindHelperAction from "@/components/FindHelperAction";
import { people } from "@/lib/mockData";

function suggestionFor(personId: string) {
  return personId === "p8"
    ? { name: "Marcus Lindqvist", reason: "investor network overlap" }
    : { name: "Elena Vasquez", reason: "fundraising overlap" };
}

export default async function ConnectionProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = people.find((p) => p.id === id);

  if (!person) {
    notFound();
  }

  return (
    <div className="min-h-full pl-28 pr-10 py-16 md:pl-32">
      <div className="flex flex-col gap-6 max-w-3xl">
        <Link
          href="/connections"
          className="text-sm text-white/40 hover:text-white/70 transition-colors w-fit"
        >
          ← Back to Connections
        </Link>

        <HudPanel title={person.name} delay={0.05}>
          <p className="text-white/50 text-sm leading-relaxed">{person.background}</p>
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
        </HudPanel>

        <HudPanel title="How they help" delay={0.15}>
          <p className="text-sm text-white/60">{person.how_they_help}</p>
        </HudPanel>

        <div className="flex flex-wrap gap-4">
          <HudPanel title="Met at" delay={0.2} className="w-60">
            <p className="text-sm text-white/60">{person.met_at}</p>
            <p className="text-xs text-white/30 mt-1">{person.met_date}</p>
          </HudPanel>
          <HudPanel title="Last interaction" delay={0.25} className="w-60">
            <p className="text-sm text-white/60">{person.last_interaction_date}</p>
          </HudPanel>
          <HudPanel title="Birthday" delay={0.3} className="w-60">
            <p className="text-sm text-white/60">{person.birthday}</p>
          </HudPanel>
          <HudPanel title="Tags" delay={0.35} className="w-60">
            <div className="flex flex-wrap gap-2">
              {person.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </HudPanel>
        </div>

        <HudPanel title="Actions" delay={0.4}>
          <FindHelperAction
            personName={person.name}
            suggestion={suggestionFor(person.id)}
          />
        </HudPanel>
      </div>
    </div>
  );
}
