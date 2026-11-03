import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RequestButton } from "@/components/duo/RequestDialog";
import { BookmarkButton, EmptyState, ScoreRing, SkillChip, Stars, UserAvatar } from "@/components/duo/ui";
import { badgesFor, computeMatch } from "@/lib/matching";
import { useCurrentUser, useStore } from "@/lib/store";

export const Route = createFileRoute("/u/$id")({
  head: () => ({
    meta: [
      { title: "Member profile — DuoSkill" },
      { name: "description", content: "See what this DuoSkill member teaches and wants to learn." },
      { property: "og:title", content: "Member profile — DuoSkill" },
      { property: "og:description", content: "See what this member teaches and wants to learn." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { id } = Route.useParams();
  const s = useStore();
  const me = useCurrentUser();
  const u = s.users.find((x) => x.id === id);
  if (!u) return <div className="mx-auto max-w-lg px-4 py-20"><EmptyState icon="?" title="Member not found" text="This profile doesn't exist." action={<Button asChild><Link to="/explore">Explore</Link></Button>} /></div>;
  const reviews = s.reviews.filter((r) => r.toId === u.id);
  const completed = s.sessions.filter((x) => x.participants.includes(u.id) && x.status === "completed").length;
  const match = me && me.id !== u.id ? computeMatch(me, u) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="h-32 bg-hero" />
        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-wrap items-end gap-4">
            <UserAvatar user={u} size={112} className="border-4" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{u.name}</h1>
              <p className="text-muted-foreground">{u.headline}</p>
            </div>
            <div className="flex items-center gap-2">
              {match && <ScoreRing score={match.score} />}
              <BookmarkButton userId={u.id} />
              {me?.id === u.id ? <Button asChild><Link to="/profile">Edit profile</Link></Button> : me ? <RequestButton target={u} /> : <Button asChild><Link to="/login">Log in to connect</Link></Button>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{u.location}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{u.availability}</span>
            <Stars value={u.rating} /><span>{u.reviewsCount} reviews</span><span>{u.level}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">{badgesFor(u, completed).map((b) => <SkillChip key={b} variant="learn">🏅 {b}</SkillChip>)}</div>
          {u.bio && <p className="mt-4 max-w-2xl">{u.bio}</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Can teach</h2>
          <div className="space-y-4">
            {u.teach.map((t) => (
              <div key={t.skill}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{t.skill} <span className="font-normal text-muted-foreground">· {t.category}</span></span><span>{t.proficiency}/5</span></div>
                <Progress value={t.proficiency * 20} />
              </div>
            ))}
            {!u.teach.length && <p className="text-sm text-muted-foreground">No skills listed yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Wants to learn</h2>
          <div className="space-y-3">
            {u.learn.map((l) => (
              <div key={l.skill} className="rounded-xl bg-muted p-3">
                <SkillChip variant="learn">{l.skill}</SkillChip>
                <p className="mt-1 text-sm text-muted-foreground">Goal: {l.goal}</p>
              </div>
            ))}
            {!u.learn.length && <p className="text-sm text-muted-foreground">Nothing listed yet.</p>}
          </div>
        </div>
      </div>

      {match && match.reasons.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-secondary p-6 text-secondary-foreground">
          <h2 className="mb-2 font-semibold">Why you match ({match.score}%)</h2>
          <ul className="list-inside list-disc text-sm">{match.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}

      <div className="mt-6 rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
        {reviews.length ? (
          <div className="space-y-4">
            {reviews.map((r) => {
              const from = s.users.find((x) => x.id === r.fromId);
              return (
                <div key={r.id} className="flex gap-3 border-b pb-4 last:border-0">
                  {from && <UserAvatar user={from} size={40} />}
                  <div>
                    <div className="flex items-center gap-2 text-sm"><span className="font-semibold">{from?.name}</span><span className="text-highlight">{"★".repeat(r.rating)}</span><SkillChip variant="neutral">{r.skill}</SkillChip></div>
                    <p className="mt-1 text-sm">{r.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
      </div>
    </div>
  );
}
