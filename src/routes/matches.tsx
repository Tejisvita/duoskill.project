import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Triangle } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/duo/MatchCard";
import { RequestButton } from "@/components/duo/RequestDialog";
import { EmptyState, PageHeader, SkillChip, UserAvatar } from "@/components/duo/ui";
import { findCycles, rankMatches } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { RequireAuth } from "@/components/duo/ui";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Your matches — DuoSkill" },
      { name: "description", content: "Mutual matches, weighted compatibility and 3-person learning circles." },
      { property: "og:title", content: "Smart matches — DuoSkill" },
      { property: "og:description", content: "Mutual matches and 3-person learning circles." },
    ],
  }),
  component: () => <RequireAuth>{(me) => <Matches me={me} />}</RequireAuth>,
});

function Matches({ me }: { me: User }) {
  const s = useStore();
  const ranked = useMemo(() => rankMatches(me, s.users), [me, s.users]);
  const mutual = ranked.filter((m) => m.mutual);
  const cycles = useMemo(() => findCycles(me, s.users), [me, s.users]);
  const noSkills = me.teach.length === 0 || me.learn.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader title="Smart Matches" subtitle="Ranked by mutual interest, category fit and teacher proficiency." />
      {noSkills && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent p-4 text-accent-foreground">
          <span>Add skills you teach and want to learn to unlock better matches.</span>
          <Button asChild size="sm"><Link to="/profile">Complete profile</Link></Button>
        </div>
      )}
      <Tabs defaultValue="mutual">
        <TabsList className="mb-6">
          <TabsTrigger value="mutual">Mutual ({mutual.length})</TabsTrigger>
          <TabsTrigger value="all">All matches ({ranked.length})</TabsTrigger>
          <TabsTrigger value="circles">Circles ({cycles.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mutual">
          {mutual.length ? <Grid>{mutual.map((m) => <MatchCard key={m.user.id} m={m} />)}</Grid> : (
            <EmptyState icon={<HeartHandshake className="h-6 w-6" />} title="No perfect mutual matches yet" text="Check All matches or Circles — or add more skills to your profile." />
          )}
        </TabsContent>
        <TabsContent value="all">
          {ranked.length ? <Grid>{ranked.map((m) => <MatchCard key={m.user.id} m={m} />)}</Grid> : (
            <EmptyState icon={<HeartHandshake className="h-6 w-6" />} title="No matches yet" text="Add skills to your profile to get matched." />
          )}
        </TabsContent>
        <TabsContent value="circles">
          {cycles.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {cycles.map((c) => (
                <div key={c.members.map((m) => m.id).join()} className="rounded-2xl border bg-card p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary"><Triangle className="h-4 w-4" />3-person learning circle</div>
                  <div className="space-y-3">
                    {c.members.map((m, i) => {
                      const next = c.members[(i + 1) % 3]!;
                      return (
                        <div key={m.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <UserAvatar user={m} size={32} />
                          <span className="font-semibold">{m.id === me.id ? "You" : m.name}</span>
                          <span className="text-muted-foreground">teach</span>
                          <SkillChip>{c.links[i]}</SkillChip>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{next.id === me.id ? "You" : next.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <RequestButton target={c.members[1]} offer={c.links[0]} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Triangle className="h-6 w-6" />} title="No circles found" text="Circles appear when A teaches B, B teaches C and C teaches A. Try demo account David Kim to see one." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Grid = ({ children }: { children: React.ReactNode }) => <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
