import { createFileRoute } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestButton } from "@/components/duo/RequestDialog";
import { EmptyState, PageHeader, ProfileCard } from "@/components/duo/ui";
import { computeMatch } from "@/lib/matching";
import { CATEGORIES } from "@/lib/seed";
import { useCurrentUser, useStore } from "@/lib/store";

type Search = { q?: string; category?: string };

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s["q"] === "string" ? { q: s["q"] } : {}),
    ...(typeof s["category"] === "string" ? { category: s["category"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Explore skills & people — DuoSkill" },
      { name: "description", content: "Search teachers and learners by skill, category, level and location." },
      { property: "og:title", content: "Explore skills — DuoSkill" },
      { property: "og:description", content: "Search teachers and learners by skill, category and location." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const search = Route.useSearch();
  const s = useStore();
  const me = useCurrentUser();
  const [q, setQ] = useState(search.q ?? "");
  const [category, setCategory] = useState(search.category ?? "all");
  const [level, setLevel] = useState("all");
  const [location, setLocation] = useState("all");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState(me ? "compat" : "rating");

  const countries = useMemo(() => [...new Set(s.users.map((u) => u.location.split(",").pop()!.trim()))].sort(), [s.users]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return s.users
      .filter((u) => u.id !== me?.id)
      .filter((u) => {
        const teach = u.teach.map((t) => t.skill.toLowerCase());
        const learn = u.learn.map((l) => l.skill.toLowerCase());
        const pool = mode === "teach" ? teach : mode === "learn" ? learn : [...teach, ...learn];
        if (term && !pool.some((p) => p.includes(term)) && !u.name.toLowerCase().includes(term)) return false;
        if (category !== "all") {
          const cats = mode === "learn" ? u.learn.map((l) => l.category) : mode === "teach" ? u.teach.map((t) => t.category) : [...u.teach, ...u.learn].map((x) => x.category);
          if (!cats.includes(category)) return false;
        }
        if (level !== "all" && u.level !== level) return false;
        if (location !== "all" && !u.location.endsWith(location)) return false;
        return true;
      })
      .map((u) => ({ u, score: me ? computeMatch(me, u).score : 0 }))
      .sort((a, b) => (sort === "compat" ? b.score - a.score : 0) || b.u.rating - a.u.rating);
  }, [s.users, me, q, category, level, location, mode, sort]);

  const sel = (value: string, set: (v: string) => void, placeholder: string, items: [string, string][]) => (
    <Select value={value} onValueChange={set}>
      <SelectTrigger className="w-full bg-card sm:w-40"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{items.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader title="Explore" subtitle={`${results.length} people ready to exchange`} />
      <div className="mb-8 space-y-3 rounded-2xl border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills or people… e.g. Python, Spanish, Maya" className="h-11 pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {sel(category, setCategory, "Category", [["all", "All categories"], ...CATEGORIES.map((c) => [c, c] as [string, string])])}
          {sel(level, setLevel, "Level", [["all", "Any level"], ["Beginner", "Beginner"], ["Intermediate", "Intermediate"], ["Expert", "Expert"]])}
          {sel(location, setLocation, "Location", [["all", "Anywhere"], ...countries.map((c) => [c, c] as [string, string])])}
          {sel(mode, setMode, "Mode", [["all", "Teaching & learning"], ["teach", "Teaching"], ["learn", "Learning"]])}
          {sel(sort, setSort, "Sort", [...(me ? [["compat", "Best compatibility"] as [string, string]] : []), ["rating", "Top rated"]])}
        </div>
      </div>
      {results.length === 0 ? (
        <EmptyState icon={<SearchX className="h-6 w-6" />} title="No one found" text="Try a different skill or loosen your filters." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ u, score }) => (
            <ProfileCard
              key={u.id}
              user={u}
              extra={me && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-primary">{score}% match</span>
                  <RequestButton target={u} size="sm" />
                </div>
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
