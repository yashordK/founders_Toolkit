export interface ScheduleItem {
  time: string;
  label: string;
}

export interface Nudge {
  text: string;
  urgent: boolean;
}

export const schedule: ScheduleItem[] = [
  { time: "09:30", label: "Standup w/ eng" },
  { time: "11:00", label: "Call — Aria Chen" },
  { time: "14:00", label: "Cognee schema review" },
  { time: "17:30", label: "Investor sync" },
];

export const nudges: Nudge[] = [
  { text: "No follow-up with Marcus in 3 weeks", urgent: true },
  { text: "Priya's design review is overdue", urgent: false },
  { text: "Noah Kessler's birthday is tomorrow", urgent: false },
];

export const priorities: string[] = [
  "Ship the memory graph demo",
  "Close enterprise pricing model",
  "Warm intros for seed round",
];

export interface SyncStatus {
  service: string;
  status: string;
}

export const syncStatus: SyncStatus[] = [
  { service: "OpenClaw", status: "Active" },
  { service: "Cognee", status: "Synced 2m ago" },
];

export interface Capture {
  text: string;
  time: string;
}

export const recentCaptures: Capture[] = [
  { text: "Added Aria Chen", time: "2h ago" },
  { text: "Meeting note: Q3 pivot", time: "5h ago" },
];

export interface WarmIntro {
  name: string;
  reason: string;
}

export const warmIntro: WarmIntro = {
  name: "Elena Vasquez",
  reason:
    "She led fundraising ops at a similar-stage startup through their Series A — could help with the raise you're working on.",
};

export interface FollowUp {
  count: number;
  overdue: boolean;
  names: string[];
}

export const followUpsDue: FollowUp = {
  count: 3,
  overdue: true,
  names: ["Marcus Lindqvist", "Sofia Patel", "Ravi Shah"],
};
