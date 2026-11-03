import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Gift, GraduationCap, Quote, Sparkles, Zap } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SkillChip, UserAvatar } from "@/components/duo/ui";
import { skillStats } from "@/lib/matching";
import { CATEGORIES } from "@/lib/seed";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DuoSkill — Your Skills Are Someone Else's Superpower" },
      { name: "description", content: "Swap skills with people worldwide. Teach C, learn design. Smart mutual matching and 3-person learning circles." },
      { property: "og:title", content: "DuoSkill — Exchange Skills, Not Money" },
      { property: "og:description", content: "Swap skills with people worldwide through smart mutual matching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Gift, title: "Give a skill", text: "List what you're great at — code, languages, design, cooking, anything." },
  { icon: GraduationCap, title: "Get a skill", text: "Tell us what you want to learn and set a goal for your journey." },
  { icon: Zap, title: "Smart matching", text: "Our engine finds mutual matches and even 3-person learning circles." },
];

const testimonials = [
  { id: "u2", text: "I learned C from Alex while redesigning his portfolio. No money, just pure exchange. It's magic." },
  { id: "u4", text: "A triangle circle with David and James got me speaking on stage in 6 weeks." },
  { id: "u7", text: "Lena taught me German before my Berlin move; I built her studio's website. Win-win." },
];

function Landing() {
  const s = useStore();
  const nav = useNavigate();
  const stats = useMemo(() => skillStats(s.users), [s.users]);
  const popular = [...stats].sort((a, b) => b.teachers + b.learners - (a.teachers + a.learners)).slice(0, 12);
  const tryDemo = () => {
    actions.loginAs("u1");
    nav({ to: "/dashboard" });
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Exchange skills, not money
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] md:text-7xl">
              Your skills are someone else's <span className="text-highlight">superpower.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              DuoSkill pairs people who can teach each other. You know C, they know design — we connect you, and you both level up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/register">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/explore">Explore Skills</Link></Button>
              <Button size="lg" variant="ghost" onClick={tryDemo}>Try Demo Account</Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <MiniMatch />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            [`${s.users.length * 1000 + 412}+`, "Members"],
            [`${stats.length}`, "Skills exchanged"],
            ["3,580", "Sessions completed"],
            ["4.8★", "Average rating"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border bg-card p-6 text-center">
              <div className="font-display text-3xl font-bold text-primary">{v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-4xl font-bold">How it works</h2>
        <p className="mt-2 text-center text-muted-foreground">Three steps to your first exchange.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((st, i) => (
            <div key={st.title} className="relative rounded-3xl border bg-card p-8">
              <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-muted">0{i + 1}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><st.icon className="h-6 w-6" /></div>
              <h3 className="mt-6 text-xl font-semibold">{st.title}</h3>
              <p className="mt-2 text-muted-foreground">{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold">Popular categories</h2>
            <p className="mt-2 text-muted-foreground">Find your next skill across {CATEGORIES.length} categories.</p>
          </div>
          <Button asChild variant="outline"><Link to="/explore">Browse all</Link></Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 10).map((c) => {
            const n = s.users.filter((u) => u.teach.some((t) => t.category === c)).length;
            return (
              <Link key={c} to="/explore" search={{ category: c }} className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-soft">
                <div className="font-semibold">{c}</div>
                <div className="text-sm text-muted-foreground">{n} teachers</div>
              </Link>
            );
          })}
        </div>
        <h3 className="mt-12 text-xl font-semibold">Featured skills</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {popular.map((p) => (
            <Link key={p.skill} to="/explore" search={{ q: p.skill }}>
              <SkillChip variant={p.gap > 0 ? "learn" : "teach"}>{p.skill} · {p.teachers + p.learners}</SkillChip>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-4xl font-bold">Loved by the community</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => {
            const u = s.users.find((x) => x.id === t.id);
            if (!u) return null;
            return (
              <figure key={t.id} className="rounded-3xl border bg-card p-7">
                <Quote className="h-6 w-6 text-highlight" />
                <blockquote className="mt-4 text-foreground">{t.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <UserAvatar user={u} size={40} />
                  <div><div className="font-semibold">{u.name}</div><div className="text-xs text-muted-foreground">{u.location}</div></div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold">Ready to trade what you know?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-80">Join in 30 seconds. Your first match is probably already here.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/register">Create free account</Link></Button>
            <Button size="lg" className="bg-highlight text-highlight-foreground hover:bg-highlight/90" onClick={tryDemo}>Try the demo</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniMatch() {
  const s = useStore();
  const a = s.users.find((u) => u.id === "u1");
  const b = s.users.find((u) => u.id === "u2");
  if (!a || !b) return null;
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">New match found</span>
        <span className="rounded-full bg-highlight px-2.5 py-1 text-xs font-bold text-highlight-foreground">100% mutual</span>
      </div>
      {[{ u: a, t: "C", l: "Graphic Design" }, { u: b, t: "Graphic Design", l: "C" }].map(({ u, t, l }) => (
        <div key={u.id} className="mt-5 flex items-center gap-3 rounded-2xl bg-muted p-4">
          <UserAvatar user={u} size={52} />
          <div>
            <div className="font-semibold">{u.name}</div>
            <div className="mt-1 flex gap-1.5"><SkillChip>teaches {t}</SkillChip><SkillChip variant="learn">wants {l}</SkillChip></div>
          </div>
        </div>
      ))}
      <div className="mt-5 text-center text-sm text-muted-foreground">They teach each other. Everybody wins.</div>
    </div>
  );
}
