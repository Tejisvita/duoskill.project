import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, RequireAuth, SkillChip, UserAvatar } from "@/components/duo/ui";
import { categoryOf, SKILL_CATALOG } from "@/lib/seed";
import { actions } from "@/lib/store";
import type { Level, User } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Edit profile — DuoSkill" },
      { name: "description", content: "Update your bio, availability and skills." },
      { property: "og:title", content: "Edit profile — DuoSkill" },
      { property: "og:description", content: "Update your bio and skills." },
    ],
  }),
  component: () => <RequireAuth>{(me) => <Edit key={me.id} me={me} />}</RequireAuth>,
});

function Edit({ me }: { me: User }) {
  const [f, setF] = useState(me);
  const [ts, setTs] = useState("");
  const [tp, setTp] = useState("3");
  const [ls, setLs] = useState("");
  const [lg, setLg] = useState("");
  const txt = (k: "name" | "headline" | "location" | "availability" | "avatar", label: string) => (
    <div className="grid gap-1"><Label>{label}</Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader title="Edit profile" action={<Button onClick={() => { actions.updateProfile(f); toast.success("Profile saved"); }}>Save changes</Button>} />
      <datalist id="skills">{SKILL_CATALOG.map((s) => <option key={s.skill} value={s.skill} />)}</datalist>
      <div className="space-y-6">
        <div className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center gap-4"><UserAvatar user={f} size={72} /><div className="flex-1">{txt("avatar", "Avatar URL")}</div></div>
          {txt("name", "Name")}{txt("headline", "Headline")}{txt("location", "Location")}{txt("availability", "Availability")}
          <div className="grid gap-1"><Label>Experience level</Label>
            <Select value={f.level} onValueChange={(v) => setF({ ...f, level: v as Level })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Beginner", "Intermediate", "Expert"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1 sm:col-span-2"><Label>Bio</Label><Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-3 text-xl font-semibold">Skills I can teach</h2>
          <div className="mb-3 flex flex-wrap gap-2">{f.teach.map((t) => <SkillChip key={t.skill}>{t.skill} · {t.proficiency}/5 <button aria-label="remove" onClick={() => setF({ ...f, teach: f.teach.filter((x) => x.skill !== t.skill) })}><X className="h-3 w-3" /></button></SkillChip>)}</div>
          <div className="flex flex-wrap gap-2">
            <Input list="skills" className="flex-1" placeholder="Skill" value={ts} onChange={(e) => setTs(e.target.value)} />
            <Select value={tp} onValueChange={setTp}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>Level {n}/5</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" onClick={() => { if (ts.trim() && !f.teach.some((x) => x.skill === ts)) { setF({ ...f, teach: [...f.teach, { skill: ts.trim(), category: categoryOf(ts), proficiency: Number(tp) }] }); setTs(""); } }}>Add</Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-3 text-xl font-semibold">Skills I want to learn</h2>
          <div className="mb-3 flex flex-wrap gap-2">{f.learn.map((l) => <SkillChip key={l.skill} variant="learn">{l.skill} — {l.goal} <button aria-label="remove" onClick={() => setF({ ...f, learn: f.learn.filter((x) => x.skill !== l.skill) })}><X className="h-3 w-3" /></button></SkillChip>)}</div>
          <div className="flex flex-wrap gap-2">
            <Input list="skills" className="flex-1" placeholder="Skill" value={ls} onChange={(e) => setLs(e.target.value)} />
            <Input className="flex-1" placeholder="Learning goal" value={lg} onChange={(e) => setLg(e.target.value)} />
            <Button variant="outline" onClick={() => { if (ls.trim() && !f.learn.some((x) => x.skill === ls)) { setF({ ...f, learn: [...f.learn, { skill: ls.trim(), category: categoryOf(ls), goal: lg || "Learn the basics" }] }); setLs(""); setLg(""); } }}>Add</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
