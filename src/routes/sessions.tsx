import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader, RequireAuth, SkillChip, UserAvatar } from "@/components/duo/ui";
import { actions, useStore } from "@/lib/store";
import type { Session, User } from "@/lib/types";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Learning sessions — DuoSkill" },
      { name: "description", content: "Schedule sessions, track milestones and leave reviews." },
      { property: "og:title", content: "Learning sessions — DuoSkill" },
      { property: "og:description", content: "Schedule sessions and track progress." },
    ],
  }),
  component: () => <RequireAuth>{(me) => <Sessions me={me} />}</RequireAuth>,
});

function Sessions({ me }: { me: User }) {
  const s = useStore();
  const [dlg, setDlg] = useState<{ kind: "schedule" | "notes" | "review"; sess: Session } | null>(null);
  const mine = s.sessions.filter((x) => x.participants.includes(me.id));
  const tab = (status: Session["status"]) => {
    const items = mine.filter((x) => x.status === status);
    if (!items.length) return <EmptyState icon={<CalendarDays className="h-6 w-6" />} title={`No ${status} sessions`} text="Accepted exchanges show up here as pending sessions." />;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((x) => {
          const other = s.users.find((u) => u.id === x.participants.find((p) => p !== me.id));
          const done = x.milestones.filter((m) => m.done).length;
          return (
            <div key={x.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3">
                {other && <UserAvatar user={other} size={44} />}
                <div className="flex-1"><div className="font-semibold">{x.skill} with {other?.name}</div><div className="text-sm text-muted-foreground">{x.date ? `${x.date} at ${x.time}` : "Not scheduled yet"}</div></div>
                <SkillChip variant="neutral">{x.status}</SkillChip>
              </div>
              {x.topic && <p className="mt-3 text-sm">Topic: {x.topic}</p>}
              {x.link && <a href={x.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">Join meeting</a>}
              {x.milestones.length > 0 && <div className="mt-3"><div className="mb-1 text-xs text-muted-foreground">Milestones {done}/{x.milestones.length}</div><Progress value={(done / x.milestones.length) * 100} /></div>}
              <div className="mt-4 flex flex-wrap gap-2">
                {x.status !== "completed" && <Button size="sm" onClick={() => setDlg({ kind: "schedule", sess: x })}>{x.status === "pending" ? "Schedule" : "Reschedule"}</Button>}
                <Button size="sm" variant="outline" onClick={() => setDlg({ kind: "notes", sess: x })}>Notes & milestones</Button>
                {x.status === "upcoming" && <Button size="sm" variant="outline" onClick={() => { actions.updateSession(x.id, { status: "completed" }); toast.success("Session marked complete"); }}>Mark complete</Button>}
                {x.status === "completed" && !x.reviewedBy.includes(me.id) && <Button size="sm" onClick={() => setDlg({ kind: "review", sess: x })}>Rate & review</Button>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title="Learning Sessions" />
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6"><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList>
        <TabsContent value="upcoming">{tab("upcoming")}</TabsContent>
        <TabsContent value="pending">{tab("pending")}</TabsContent>
        <TabsContent value="completed">{tab("completed")}</TabsContent>
      </Tabs>
      {dlg && <SessionDialog key={dlg.sess.id + dlg.kind} {...dlg} onClose={() => setDlg(null)} />}
    </div>
  );
}

function SessionDialog({ kind, sess, onClose }: { kind: "schedule" | "notes" | "review"; sess: Session; onClose: () => void }) {
  const [f, setF] = useState({ date: sess.date, time: sess.time || "18:00", topic: sess.topic, link: sess.link });
  const [notes, setNotes] = useState(sess.notes);
  const [ms, setMs] = useState(sess.milestones);
  const [newMs, setNewMs] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const save = () => {
    if (kind === "schedule") {
      if (!f.date || !f.time) { toast.error("Pick a date and time"); return; }
      actions.scheduleSession(sess.id, f);
      toast.success("Session scheduled");
    } else if (kind === "notes") {
      actions.updateSession(sess.id, { notes, milestones: ms });
      toast.success("Saved");
    } else {
      actions.reviewSession(sess.id, rating, text);
      toast.success("Thanks for your review!");
    }
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{kind === "schedule" ? "Schedule session" : kind === "notes" ? "Notes & milestones" : "Rate this session"}</DialogTitle></DialogHeader>
        {kind === "schedule" && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1"><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
              <div className="grid gap-1"><Label>Time</Label><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
            </div>
            <div className="grid gap-1"><Label>Topic</Label><Input value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} /></div>
            <div className="grid gap-1"><Label>Meeting link</Label><Input value={f.link} placeholder="https://meet.google.com/..." onChange={(e) => setF({ ...f, link: e.target.value })} /></div>
          </div>
        )}
        {kind === "notes" && (
          <div className="grid gap-3">
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Session notes…" />
            {ms.map((m, i) => (
              <label key={i} className="flex items-center gap-2 text-sm"><Checkbox checked={m.done} onCheckedChange={(c) => setMs(ms.map((x, j) => (j === i ? { ...x, done: !!c } : x)))} />{m.label}</label>
            ))}
            <div className="flex gap-2"><Input value={newMs} onChange={(e) => setNewMs(e.target.value)} placeholder="New milestone" /><Button variant="outline" onClick={() => { if (newMs) { setMs([...ms, { label: newMs, done: false }]); setNewMs(""); } }}>Add</Button></div>
          </div>
        )}
        {kind === "review" && (
          <div className="grid gap-3">
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={`text-3xl ${n <= rating ? "text-highlight" : "text-muted"}`}>★</button>)}</div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="How was it?" />
          </div>
        )}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
