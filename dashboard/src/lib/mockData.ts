export interface Person {
  id: string;
  name: string;
  expertise: string[];
  background: string;
  how_they_help: string;
  met_at: string;
  met_date: string;
  birthday: string;
  last_interaction_date: string;
  tags: string[];
}

export const people: Person[] = [
  {
    id: "p1",
    name: "Aria Chen",
    expertise: ["Enterprise Sales", "GTM Strategy"],
    background:
      "VP of Sales at a Series C devtools company. Previously led mid-market sales at a unicorn SaaS startup.",
    how_they_help:
      "Can advise on enterprise pricing structure and intro us to VP Eng contacts at Fortune 500 accounts.",
    met_at: "SaaStr Annual 2026",
    met_date: "2026-05-12",
    birthday: "1990-03-22",
    last_interaction_date: "2026-06-18",
    tags: ["sales", "warm-intro", "enterprise"],
  },
  {
    id: "p2",
    name: "Devon Okafor",
    expertise: ["Infrastructure", "Distributed Systems", "Postgres"],
    background:
      "Staff engineer at a cloud data platform, contributor to several open-source Postgres extensions.",
    how_they_help:
      "Deep expertise in scaling Postgres for hybrid graph/vector workloads — relevant to our Cognee deployment.",
    met_at: "Cognee Hackathon Kickoff",
    met_date: "2026-06-29",
    birthday: "1988-11-04",
    last_interaction_date: "2026-06-29",
    tags: ["engineering", "postgres", "hackathon"],
  },
  {
    id: "p5",
    name: "Jonas Meyer",
    expertise: ["Growth Marketing", "Paid Acquisition"],
    background:
      "Head of Growth at a consumer fintech app, previously scaled paid acquisition at two YC startups.",
    how_they_help:
      "Could share what's working in early-stage paid acquisition and intro a couple of performance marketing contacts.",
    met_at: "Growth Marketing Summit",
    met_date: "2026-03-11",
    birthday: "1991-09-02",
    last_interaction_date: "2026-04-20",
    tags: ["growth", "marketing"],
  },
  {
    id: "p3",
    name: "Priya Ramanathan",
    expertise: ["Product Design", "Design Systems"],
    background:
      "Lead product designer, previously built the design system for a well-known productivity app.",
    how_they_help:
      "Could review our dashboard's dark/glass theme and give feedback on the connections directory UX.",
    met_at: "Design + AI Meetup SF",
    met_date: "2026-04-03",
    birthday: "1993-07-15",
    last_interaction_date: "2026-05-01",
    tags: ["design", "ux", "follow-up-due"],
  },
  {
    id: "p4",
    name: "Marcus Lindqvist",
    expertise: ["Fundraising", "Venture Capital"],
    background:
      "Angel investor and former founder, sold his last startup to a mid-size acquirer.",
    how_they_help:
      "Offered to make intros to seed-stage VCs once we have a working demo of the memory graph.",
    met_at: "Founder Dinner, Palo Alto",
    met_date: "2026-02-20",
    birthday: "1985-01-09",
    last_interaction_date: "2026-03-30",
    tags: ["fundraising", "investor", "stale"],
  },
  {
    id: "p6",
    name: "Sofia Patel",
    expertise: ["Startup Legal", "Contracts"],
    background:
      "Startup counsel at a boutique legal practice, previously in-house counsel at a Series B marketplace.",
    how_they_help:
      "Was reviewing our vendor and contributor agreements — still owes us a redline on the latest draft.",
    met_at: "Startup Legal Clinic",
    met_date: "2026-05-02",
    birthday: "1992-08-14",
    last_interaction_date: "2026-05-28",
    tags: ["legal", "follow-up-due"],
  },
  {
    id: "p7",
    name: "Ravi Shah",
    expertise: ["Recruiting", "Early-Stage Hiring"],
    background:
      "Independent technical recruiter who's placed early engineers at several seed-stage startups.",
    how_they_help:
      "Was putting together a shortlist of founding engineer candidates for us to review.",
    met_at: "Founder Meetup NYC",
    met_date: "2026-05-15",
    birthday: "1989-12-01",
    last_interaction_date: "2026-06-02",
    tags: ["recruiting", "follow-up-due"],
  },
  {
    id: "p8",
    name: "Elena Vasquez",
    expertise: ["Fundraising Operations", "Series A"],
    background:
      "Former Head of Operations at a similar-stage startup, ran their fundraising process end to end through a Series A.",
    how_they_help:
      "Led fundraising ops at a similar-stage startup through their Series A — could help with the raise we're working on.",
    met_at: "Series A Roundtable",
    met_date: "2026-01-18",
    birthday: "1987-05-30",
    last_interaction_date: "2026-02-10",
    tags: ["fundraising", "warm-intro"],
  },
  {
    id: "p9",
    name: "Noah Kessler",
    expertise: ["Community Building", "Early Advocacy"],
    background:
      "Early advisor and community builder, active in several indie-hacker and early-adopter circles.",
    how_they_help:
      "Has been an early advocate for the product and keeps offering to introduce us to potential early users.",
    met_at: "Indie Hackers Meetup",
    met_date: "2025-11-09",
    birthday: "1994-07-03",
    last_interaction_date: "2026-04-11",
    tags: ["community", "advisor"],
  },
];
