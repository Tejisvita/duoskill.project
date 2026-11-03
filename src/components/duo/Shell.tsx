import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, RotateCcw, User as UserIcon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { actions, useCurrentUser, useStore } from "@/lib/store";
import { Logo, UserAvatar } from "./ui";

const publicLinks = [
  { to: "/explore", label: "Explore" },
  { to: "/insights", label: "Insights" },
] as const;
const appLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/matches", label: "Matches" },
  { to: "/explore", label: "Explore" },
  { to: "/requests", label: "Requests" },
  { to: "/sessions", label: "Sessions" },
  { to: "/insights", label: "Insights" },
] as const;

export function Navbar() {
  const me = useCurrentUser();
  const s = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const links = me ? appLinks : publicLinks;
  const unread = me ? s.notifications.filter((n) => n.userId === me.id && !n.read).length : 0;
  const switchTo = (id: string) => {
    actions.loginAs(id);
    toast.success(`Switched to ${s.users.find((u) => u.id === id)?.name}`);
    nav({ to: "/dashboard" });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Logo />
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-secondary !text-secondary-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {me ? (
            <>
              <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold text-highlight-foreground">{unread}</span>}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-ring focus-visible:ring-2"><UserAvatar user={me} size={36} /></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{me.name}<p className="text-xs font-normal text-muted-foreground">{me.email}</p></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => nav({ to: "/u/$id", params: { id: me.id } })}><UserIcon className="mr-2 h-4 w-4" />Public profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav({ to: "/profile" })}><UserIcon className="mr-2 h-4 w-4" />Edit profile</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger><Users className="mr-2 h-4 w-4" />Switch demo account</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-80 overflow-auto">
                      {s.users.filter((u) => u.demo).map((u) => (
                        <DropdownMenuItem key={u.id} onClick={() => switchTo(u.id)}>{u.name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => { actions.resetDemo(); toast.success("Demo data reset"); nav({ to: "/" }); }}><RotateCcw className="mr-2 h-4 w-4" />Reset demo data</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { actions.logout(); toast("Logged out"); nav({ to: "/" }); }}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/login">Log in</Link></Button>
              <Button asChild><Link to="/register">Get Started</Link></Button>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-2"><Logo /></SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-muted">{l.label}</Link>
                ))}
                {me ? (
                  <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Profile</Link>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Log in</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">Exchange skills, not money. A community where everyone is both a teacher and a learner.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-foreground">Explore skills</Link></li>
            <li><Link to="/matches" className="hover:text-foreground">Smart matching</Link></li>
            <li><Link to="/insights" className="hover:text-foreground">Skill insights</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/register" className="hover:text-foreground">Create account</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">© 2026 DuoSkill. Made for learners everywhere.</div>
    </footer>
  );
}
