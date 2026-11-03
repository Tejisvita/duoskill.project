import type { User } from "./types";

/**
 * DuoSkill matching engine (TypeScript mirror of /c-module/matching.c).
 *
 * Score model (0-100):
 *  - Perfect mutual match (A teaches something B wants AND B teaches something A wants): 100
 *  - Otherwise weighted:
 *      direction score (each way): exact skill = 35, same category only = 15
 *      proficiency bonus: avg proficiency of the offered skills / 5 * 20
 *    capped at 95 so only true mutual matches reach 100.
 */
export interface MatchResult {
  user: User;
  score: number;
  mutual: boolean;
  youTeach: string[]; // skills you can teach them (exact)
  theyTeach: string[]; // skills they can teach you (exact)
  categoryOverlap: string[];
  reasons: string[];
}

const norm = (s: string) => s.trim().toLowerCase();

export function exactGive(teacher: User, learner: User): string[] {
  const wants = new Set(learner.learn.map((l) => norm(l.skill)));
  return teacher.teach.filter((t) => wants.has(norm(t.skill))).map((t) => t.skill);
}

function categoryGive(teacher: User, learner: User): string[] {
  const cats = new Set(learner.learn.map((l) => l.category));
  return [...new Set(teacher.teach.filter((t) => cats.has(t.category)).map((t) => t.category))];
}

export function computeMatch(me: User, other: User): MatchResult {
  const youTeach = exactGive(me, other);
  const theyTeach = exactGive(other, me);
  const catA = categoryGive(me, other);
  const catB = categoryGive(other, me);
  const mutual = youTeach.length > 0 && theyTeach.length > 0;
  const reasons: string[] = [];

  let score: number;
  if (mutual) {
    score = 100;
    reasons.push(`You teach ${youTeach.join(", ")} — they want it`);
    reasons.push(`They teach ${theyTeach.join(", ")} — you want it`);
  } else {
    const dirA = youTeach.length ? 35 : catA.length ? 15 : 0;
    const dirB = theyTeach.length ? 35 : catB.length ? 15 : 0;
    const offered = other.teach.filter((t) =>
      theyTeach.length ? theyTeach.includes(t.skill) : catB.includes(t.category),
    );
    const prof = offered.length
      ? (offered.reduce((s, t) => s + t.proficiency, 0) / offered.length / 5) * 20
      : 0;
    score = Math.min(95, Math.round(dirA + dirB + prof));
    if (theyTeach.length) reasons.push(`They teach ${theyTeach.join(", ")} you want`);
    else if (catB.length) reasons.push(`They teach in ${catB.join(", ")} you're exploring`);
    if (youTeach.length) reasons.push(`You can teach them ${youTeach.join(", ")}`);
    else if (catA.length) reasons.push(`Your ${catA.join(", ")} skills fit their interests`);
  }
  if (offeredExpert(other, theyTeach)) reasons.push("Expert-level teacher");
  return {
    user: other,
    score,
    mutual,
    youTeach,
    theyTeach,
    categoryOverlap: [...new Set([...catA, ...catB])],
    reasons,
  };
}

function offeredExpert(u: User, skills: string[]) {
  return u.teach.some((t) => skills.includes(t.skill) && t.proficiency >= 5);
}

export function rankMatches(me: User, users: User[]): MatchResult[] {
  return users
    .filter((u) => u.id !== me.id)
    .map((u) => computeMatch(me, u))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || b.user.rating - a.user.rating);
}

export interface Cycle {
  members: [User, User, User];
  // links[i] = skill members[i] teaches members[(i+1)%3]
  links: [string, string, string];
}

/** 3-person exchange cycles containing `me`: me -> b -> c -> me (directed teaching graph). */
export function findCycles(me: User, users: User[]): Cycle[] {
  const others = users.filter((u) => u.id !== me.id);
  const out: Cycle[] = [];
  const seen = new Set<string>();
  for (const b of others) {
    const ab = exactGive(me, b)[0];
    if (!ab) continue;
    for (const c of others) {
      if (c.id === b.id) continue;
      const bc = exactGive(b, c)[0];
      const ca = exactGive(c, me)[0];
      if (!bc || !ca) continue;
      const key = [b.id, c.id].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ members: [me, b, c], links: [ab, bc, ca] });
    }
  }
  return out;
}

export interface SkillStat {
  skill: string;
  category: string;
  teachers: number;
  learners: number;
  gap: number;
}

export function skillStats(users: User[]): SkillStat[] {
  const map = new Map<string, SkillStat>();
  const get = (skill: string, category: string) => {
    const k = norm(skill);
    let s = map.get(k);
    if (!s) {
      s = { skill, category, teachers: 0, learners: 0, gap: 0 };
      map.set(k, s);
    }
    return s;
  };
  users.forEach((u) => {
    u.teach.forEach((t) => get(t.skill, t.category).teachers++);
    u.learn.forEach((l) => get(l.skill, l.category).learners++);
  });
  return [...map.values()].map((s) => ({ ...s, gap: s.learners - s.teachers }));
}

export function badgesFor(u: User, completedSessions: number): string[] {
  const b: string[] = [];
  if (u.rating >= 4.8 && u.reviewsCount >= 5) b.push("Top Mentor");
  if (u.teach.some((t) => t.proficiency >= 5)) b.push("Verified Expert");
  if (completedSessions >= 3 || u.reviewsCount >= 10) b.push("Community Pillar");
  if (u.reviewsCount < 5) b.push("Rising Star");
  return b;
}
