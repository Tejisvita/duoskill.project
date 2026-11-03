import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, MapPin, Star } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { actions, useCurrentUser, useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
        <rect width="40" height="40" rx="12" className="fill-primary" />
        <circle cx="15" cy="20" r="8" className="fill-none stroke-primary-foreground" strokeWidth="3" />
        <circle cx="25" cy="20" r="8" className="fill-none stroke-highlight" strokeWidth="3" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">
        Duo<span className="text-highlight">Skill</span>
      </span>
    </Link>
  );
}

export function UserAvatar({ user, size = 48, className }: { user: Pick<User, "avatar" | "name">; size?: number; className?: string }) {
  return (
    <img
      src={user.avatar}
      alt={user.name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full border-2 border-card bg-accent object-cover", className)}
    />
  );
}

export function SkillChip({ children, variant = "teach" }: { children: ReactNode; variant?: "teach" | "learn" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "teach" && "bg-secondary text-secondary-foreground",
        variant === "learn" && "bg-accent text-accent-foreground",
        variant === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold">
      <Star className="h-4 w-4 fill-highlight text-highlight" />
      {value ? value.toFixed(1) : "New"}
    </span>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} className="fill-none stroke-muted" strokeWidth="5" />
        <circle
          cx="28" cy="28" r={r}
          className={cn("fill-none", score === 100 ? "stroke-highlight" : "stroke-primary")}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}%</span>
    </div>
  );
}

export function BookmarkButton({ userId }: { userId: string }) {
  const s = useStore();
  const me = useCurrentUser();
  if (!me || me.id === userId) return null;
  const on = (s.bookmarks[me.id] ?? []).includes(userId);
  return (
    <Button variant="ghost" size="icon" aria-label={on ? "Remove bookmark" : "Bookmark"} onClick={() => actions.toggleBookmark(userId)}>
      {on ? <BookmarkCheck className="h-5 w-5 text-highlight" /> : <Bookmark className="h-5 w-5" />}
    </Button>
  );
}

export function ProfileCard({ user, extra }: { user: User; extra?: ReactNode }) {
  return (
    <div className="group flex flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start gap-3">
        <UserAvatar user={user} size={56} />
        <div className="min-w-0 flex-1">
          <Link to="/u/$id" params={{ id: user.id }} className="font-display text-lg font-semibold hover:text-primary">
            {user.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">{user.headline}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{user.location}</span>
            <Stars value={user.rating} />
          </div>
        </div>
        <BookmarkButton userId={user.id} />
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-14 text-xs font-medium text-muted-foreground">Teaches</span>
          {user.teach.map((t) => <SkillChip key={t.skill}>{t.skill}</SkillChip>)}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-14 text-xs font-medium text-muted-foreground">Learns</span>
          {user.learn.map((l) => <SkillChip key={l.skill} variant="learn">{l.skill}</SkillChip>)}
        </div>
      </div>
      {extra && <div className="mt-4 flex-1">{extra}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function RequireAuth({ children }: { children: (me: User) => ReactNode }) {
  const me = useCurrentUser();
  if (!me)
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title="Sign in to continue"
          text="Log in or try a demo account to see your matches, requests and sessions."
          action={
            <div className="flex gap-2">
              <Button asChild><Link to="/login">Log in</Link></Button>
              <Button variant="outline" onClick={() => actions.loginAs("u1")}>Try demo as Alex</Button>
            </div>
          }
        />
      </div>
    );
  return <>{children(me)}</>;
}
