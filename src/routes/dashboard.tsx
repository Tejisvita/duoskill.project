import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Bookmark, CalendarDays, Compass, HeartHandshake, Inbox, Star, UserPen } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/duo/MatchCard";
import { EmptyState, RequireAuth, SkillChip, UserAvatar } from "@/components/duo/ui";
import { badgesFor, rankMatches } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DuoSkill" },
      { name: "description", content: "Your exchanges, sessions and top matches at a glance." },
      { property: "og:title", content: "Dashboard — DuoSkill" },
      { property: "og:description", content: "Your exchanges, sessions and top matches." },
    ],
  }),
  component: () => <RequireAuth>{(me) => <Dashboard me={me} />}</RequireAuth>,
});

function Dashboard({ me }: { me: User }) {
  const s = useStore();
  const matches = useMemo(() => rankMatches(me, s.users), [me, s.users]);
  const mySessions = s.sessions.filter((x) => x.participants.includes(me.id));
  const upcoming = mySessions.filter((x) => x.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const completed = mySessions.filter((x) => x.status === "completed").length;
  const incoming = s.requests.filter((r) => r.toId === me.id && r.status === "pending").length;
  const activity = s.notifications.filter((n) => n.userId === me.id).slice(0, 5);
  const bookmarks = (s.bookmarks[me.id] ?? []).map((id) => s.users.find((u) => u.id === id)).filter((u): u is User => !!u);
  const badges = badgesFor(me, completed);
  const nameOf = (id: string) => s.users.find((u) => u.id === id);

  const stats = [
    { label: "Matches", value: matches.length, icon: HeartHandshake, to: "/matches" as const },
    { label: "Pending requests", value: incoming, icon: Inbox, to: "/requests" as const },
    { label: "Sessions done", value: completed, icon: CalendarDays, to: "/sessions" as const },
    { label: "Rating", value: me.rating ? me.rating.toFixed(1) : "—", icon: Star, to: "/profile" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-3xl bg-hero border p-6">
        <UserAvatar user={me} size={72} />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Hey {me.name.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground">{me.headline}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{badges.map((b) => <SkillChip key={b} variant="learn">🏅 {b}</SkillChip>)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/matches"><HeartHandshake className="mr-1 h-4 w-4" />Find matches</Link></Button>
          <Button asChild variant="outline"><Link to="/explore"><Compass className="mr-1 h-4 w-4" />Explore</Link></Button>
          <Button asChild variant="outline"><Link to="/profile"><UserPen className="mr-1 h-4 w-4" />Edit profile</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((st) => (
          <Link key={st.label} to={st.to} className="rounded-2xl border bg-card p-5 transition hover:shadow-soft">
            <st.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-3xl font-bold">{st.value}</div>
            <div className="text-sm text-muted-foreground">{st.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top matches</h2>
            <Link to="/matches" className="text-sm font-semibold text-primary">See all</Link>
          </div>
          {matches.length ? (
            <div className="grid gap-5 md:grid-cols-2">{matches.slice(0, 4).map((m) => <MatchCard key={m.user.id} m={m} />)}</div>
          ) : (
            <EmptyState icon={<HeartHandshake className="h-6 w-6" />} title="No matches yet" text="Add skills to your profile and we'll find people for you." action={<Button asChild><Link to="/profile">Add skills</Link></Button>} />
          )}
        </div>
        <div className="space-y-6">
          <Panel title="Upcoming sessions" icon={<CalendarDays className="h-4 w-4" />} link="/sessions">
            {upcoming.length ? upcoming.slice(0, 3).map((x) => {
              const other = nameOf(x.participants.find((p) => p !== me.id)!);
              return (
                <div key={x.id} className="flex items-center gap-3 py-2">
                  {other && <UserAvatar user={other} size={36} />}
                  <div className="min-w-0 text-sm"><div className="font-semibold">{x.skill} · {other?.name}</div><div className="text-muted-foreground">{x.date} at {x.time}</div></div>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
          </Panel>
          <Panel title="Recent activity" icon={<Bell className="h-4 w-4" />} link="/notifications">
            {activity.length ? activity.map((n) => <p key={n.id} className="border-b py-2 text-sm last:border-0">{n.text}</p>) : <p className="text-sm text-muted-foreground">No activity yet.</p>}
          </Panel>
          <Panel title="Bookmarks" icon={<Bookmark className="h-4 w-4" />}>
            {bookmarks.length ? bookmarks.map((u) => (
              <Link key={u.id} to="/u/$id" params={{ id: u.id }} className="flex items-center gap-3 py-2 hover:text-primary">
                <UserAvatar user={u} size={32} /><span className="text-sm font-medium">{u.name}</span>
              </Link>
            )) : <p className="text-sm text-muted-foreground">Bookmark people to find them here.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon, link, children }: { title: string; icon: React.ReactNode; link?: "/sessions" | "/notifications"; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">{icon}{title}</h3>
        {link && <Link to={link} className="text-xs font-semibold text-primary">View</Link>}
      </div>
      {children}
    </div>
  );
}
