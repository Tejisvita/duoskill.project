import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader, SkillChip } from "@/components/duo/ui";
import { skillStats } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Skill insights & gap finder — DuoSkill" },
      { name: "description", content: "See which skills are in demand and where teachers are needed." },
      { property: "og:title", content: "Skill insights — DuoSkill" },
      { property: "og:description", content: "Skill demand, popularity and gaps." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const s = useStore();
  const stats = useMemo(() => skillStats(s.users), [s.users]);
  const gaps = [...stats].filter((x) => x.gap > 0).sort((a, b) => b.gap - a.gap);
  const popular = [...stats].sort((a, b) => b.teachers + b.learners - (a.teachers + a.learners)).slice(0, 10);
  const max = Math.max(1, ...popular.map((p) => p.teachers + p.learners));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title="Skill Insights" subtitle="Demand, supply and opportunities across the community." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Skill Gap Finder</h2>
          <p className="mb-4 text-sm text-muted-foreground">High demand, few teachers — teach these to get matched fast.</p>
          <div className="space-y-2">
            {gaps.map((g) => (
              <Link key={g.skill} to="/explore" search={{ q: g.skill }} className="flex items-center justify-between rounded-xl bg-muted p-3 hover:bg-accent">
                <span><span className="font-semibold">{g.skill}</span> <span className="text-xs text-muted-foreground">{g.category}</span></span>
                <SkillChip variant="learn">{g.learners} want · {g.teachers} teach</SkillChip>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Most popular skills</h2>
          <div className="space-y-3">
            {popular.map((p) => (
              <div key={p.skill}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{p.skill}</span><span className="text-muted-foreground">{p.teachers} teach · {p.learners} learn</span></div>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="bg-primary" style={{ width: `${(p.teachers / max) * 100}%` }} />
                  <div className="bg-highlight" style={{ width: `${(p.learners / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
