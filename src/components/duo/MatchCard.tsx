import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/lib/matching";
import { RequestButton } from "./RequestDialog";
import { BookmarkButton, ScoreRing, SkillChip, Stars, UserAvatar } from "./ui";

export function MatchCard({ m }: { m: MatchResult }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5 transition hover:shadow-soft">
      <div className="flex items-start gap-3">
        <UserAvatar user={m.user} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{m.user.name}</h3>
            {m.mutual && <span className="rounded-full bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase text-highlight-foreground">Mutual</span>}
          </div>
          <p className="truncate text-sm text-muted-foreground">{m.user.headline}</p>
          <Stars value={m.user.rating} />
        </div>
        <ScoreRing score={m.score} />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-muted p-3 text-center text-xs">
        <div>
          <p className="mb-1 text-muted-foreground">You teach</p>
          <div className="flex flex-wrap justify-center gap-1">{(m.youTeach.length ? m.youTeach : ["—"]).map((s) => <SkillChip key={s}>{s}</SkillChip>)}</div>
        </div>
        <ArrowLeftRight className="h-4 w-4 text-primary" />
        <div>
          <p className="mb-1 text-muted-foreground">They teach</p>
          <div className="flex flex-wrap justify-center gap-1">{(m.theyTeach.length ? m.theyTeach : ["—"]).map((s) => <SkillChip key={s} variant="learn">{s}</SkillChip>)}</div>
        </div>
      </div>
      <ul className="mt-3 flex-1 space-y-1 text-sm">
        {m.reasons.map((r) => (
          <li key={r} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{r}</li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2">
        <RequestButton target={m.user} {...(m.youTeach[0] ? { offer: m.youTeach[0] } : {})} {...(m.theyTeach[0] ? { want: m.theyTeach[0] } : {})} size="sm" className="flex-1" />
        <Button asChild variant="outline" size="sm"><Link to="/u/$id" params={{ id: m.user.id }}>View Profile</Link></Button>
        <BookmarkButton userId={m.user.id} />
      </div>
    </div>
  );
}
