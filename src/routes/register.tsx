import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — DuoSkill" },
      { name: "description", content: "Join DuoSkill and start exchanging skills for free." },
      { property: "og:title", content: "Join DuoSkill" },
      { property: "og:description", content: "Start exchanging skills for free." },
    ],
  }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", location: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const err = actions.register(f);
    if (err) { toast.error(err); return; }
    toast.success("Account created! Now add your skills.");
    nav({ to: "/profile" });
  };
  const field = (k: keyof typeof f, label: string, type = "text") => (
    <div className="grid gap-2">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} required value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="rounded-3xl border bg-card p-8">
        <h1 className="text-3xl font-bold">Join DuoSkill</h1>
        <p className="mt-1 text-sm text-muted-foreground">Teach what you know. Learn what you love.</p>
        <div className="mt-6 space-y-4">
          {field("name", "Full name")}
          {field("email", "Email", "email")}
          {field("location", "City, Country")}
          {field("password", "Password", "password")}
          <Button type="submit" className="w-full">Create account</Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Already a member? <Link to="/login" className="font-semibold text-primary">Log in</Link></p>
      </form>
    </div>
  );
}
