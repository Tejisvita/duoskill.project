import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/duo/ui";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — DuoSkill" },
      { name: "description", content: "Log in to DuoSkill or try a demo account." },
      { property: "og:title", content: "Log in — DuoSkill" },
      { property: "og:description", content: "Log in to DuoSkill or try a demo account." },
    ],
  }),
  component: Login,
});

function Login() {
  const s = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actions.login(email, pw)) {
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } else toast.error("Invalid email or password");
  };
  const demo = (id: string) => {
    actions.loginAs(id);
    toast.success(`Signed in as ${s.users.find((u) => u.id === id)?.name}`);
    nav({ to: "/dashboard" });
  };
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
      <form onSubmit={submit} className="rounded-3xl border bg-card p-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to continue your exchanges.</p>
        <div className="mt-6 space-y-4">
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <Button type="submit" className="w-full">Log in</Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">New here? <Link to="/register" className="font-semibold text-primary">Create an account</Link></p>
        <p className="mt-2 text-center text-xs text-muted-foreground">Demo emails: alex@duoskill.app · password demo123</p>
      </form>
      <div>
        <h2 className="text-xl font-semibold">Or jump in as a demo member</h2>
        <div className="mt-4 grid gap-2">
          {s.users.filter((u) => u.demo).slice(0, 8).map((u) => (
            <button key={u.id} onClick={() => demo(u.id)} className="flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:border-primary">
              <UserAvatar user={u} size={40} />
              <div className="min-w-0">
                <div className="font-semibold">{u.name}</div>
                <div className="truncate text-xs text-muted-foreground">Teaches {u.teach.map((t) => t.skill).join(", ")} · wants {u.learn.map((l) => l.skill).join(", ")}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
