import PersonCard from "@/components/PersonCard";
import { people } from "@/lib/mockData";

export default function ConnectionsPage() {
  return (
    <div className="min-h-full pl-28 pr-10 py-16 md:pl-32">
      <div className="flex flex-wrap gap-6 max-w-5xl">
        {people.map((person, i) => (
          <PersonCard key={person.id} person={person} delay={i * 0.06} />
        ))}
      </div>
    </div>
  );
}
