import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, RequireAuth } from "@/components/duo/ui";
import { actions, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DuoSkill" },
      { name: "description", content: "Your DuoSkill notification centre." },
      { property: "og:title", content: "Notifications — DuoSkill" },
      { property: "og:description", content: "Your DuoSkill notification centre." },
    ],
  }),
  component: () => <RequireAuth>{(me) => <Notes me={me} />}</RequireAuth>,
});

function Notes({ me }: { me: User }) {
  const s = useStore();
  const list = s.notifications.filter((n) => n.userId === me.id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader title="Notifications" action={<Button variant="outline" onClick={() => actions.markAllRead()}>Mark all read</Button>} />
      {list.length ? (
        <div className="space-y-2">
          {list.map((n) => (
            <div key={n.id} className={`flex items-center gap-3 rounded-2xl border p-4 ${n.read ? "bg-card" : "bg-accent"}`}>
              <Bell className="h-4 w-4 text-primary" />
              <span className="flex-1 text-sm">{n.text}</span>
              {n.link && <Link to={n.link} className="text-sm font-semibold text-primary">Open</Link>}
            </div>
          ))}
        </div>
      ) : <EmptyState icon={<Bell className="h-6 w-6" />} title="All caught up" text="New requests and session updates will appear here." />}
    </div>
  );
}
