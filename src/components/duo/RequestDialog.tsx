import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { actions, useCurrentUser, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export function RequestButton({ target, offer, want, size = "default", className }: { target: User; offer?: string; want?: string; size?: "default" | "sm"; className?: string }) {
  const me = useCurrentUser();
  const s = useStore();
  const [open, setOpen] = useState(false);
  const [o, setO] = useState(offer ?? "");
  const [w, setW] = useState(want ?? "");
  const [msg, setMsg] = useState("");
  if (!me || me.id === target.id) return null;
  const pending = s.requests.some((r) => r.status === "pending" && ((r.fromId === me.id && r.toId === target.id) || (r.toId === me.id && r.fromId === target.id)));

  const submit = () => {
    if (!o || !w) { toast.error("Choose the skills to exchange"); return; }
    actions.sendRequest({ toId: target.id, offer: o, want: w, message: msg || `Hi ${target.name.split(" ")[0]}, want to swap ${o} for ${w}?` });
    toast.success(`Request sent to ${target.name}`);
    setOpen(false);
  };

  return (
    <>
      <Button size={size} className={className} disabled={pending} onClick={() => { setO(offer ?? me.teach[0]?.skill ?? ""); setW(want ?? target.teach[0]?.skill ?? ""); setOpen(true); }}>
        {pending ? "Request pending" : "Send Exchange Request"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exchange with {target.name}</DialogTitle>
            <DialogDescription>Propose what you'll teach and what you'd like to learn.</DialogDescription>
          </DialogHeader>
          {me.teach.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add at least one skill you can teach in your profile first.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>I'll teach</Label>
                <Select value={o} onValueChange={setO}>
                  <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
                  <SelectContent>{me.teach.map((t) => <SelectItem key={t.skill} value={t.skill}>{t.skill}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>I want to learn</Label>
                <Select value={w} onValueChange={setW}>
                  <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
                  <SelectContent>{target.teach.map((t) => <SelectItem key={t.skill} value={t.skill}>{t.skill}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Introduce yourself and your goals…" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={me.teach.length === 0}>Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
