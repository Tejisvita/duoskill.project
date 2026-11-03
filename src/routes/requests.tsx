import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, RequireAuth, SkillChip, UserAvatar } from "@/components/duo/ui";
import { actions, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Exchange requests — DuoSkill" },
      { name: "description", content: "Manage incoming and outgoing skill exchange requests." },
      { property: "og:title", content: "Exchange requests — DuoSkill" },
      { property: "og:description", content: "Manage your skill exchange requests." },
    ],
  }),
  component: () => <RequireAuth>{(me) => <Requests me={me} />}</RequireAuth>,
});

function Requests({ me }: { me: User }) {
  const s = useStore();
  const incoming = s.requests.filter((r) => r.toId === me.id);
  const outgoing = s.requests.filter((r) => r.fromId === me.id);
  const list = (items: typeof incoming, kind: "in" | "out") =>
    items.length ? (
      <div className="space-y-3">
        {items.map((r) => {
          const other = s.users.find((u) => u.id === (kind === "in" ? r.fromId : r.toId));
          if (!other) return null;
          return (
            <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5">
              <UserAvatar user={other} size={48} />
              <div className="min-w-0 flex-1">
                <Link to="/u/$id" params={{ id: other.id }} className="font-semibold hover:text-primary">{other.name}</Link>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs"><SkillChip>offers {kind === "in" ? r.offer : r.want}</SkillChip><SkillChip variant="learn">wants {kind === "in" ? r.want : r.offer}</SkillChip></div>
                <p className="mt-2 text-sm text-muted-foreground">{r.message}</p>
              </div>
              {r.status === "pending" ? (
                kind === "in" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { actions.respondRequest(r.id, "accepted"); toast.success("Accepted! Sessions created."); }}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => { actions.respondRequest(r.id, "rejected"); toast("Request declined"); }}>Reject</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { actions.respondRequest(r.id, "cancelled"); toast("Request cancelled"); }}>Cancel</Button>
                )
              ) : <SkillChip variant="neutral">{r.status}</SkillChip>}
            </div>
          );
        })}
      </div>
    ) : <EmptyState icon={<Inbox className="h-6 w-6" />} title="No requests" text="Find a match and send your first exchange request." action={<Button asChild><Link to="/matches">Find matches</Link></Button>} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title="Exchange Requests" />
      <Tabs defaultValue="in">
        <TabsList className="mb-6"><TabsTrigger value="in">Incoming ({incoming.filter((r) => r.status === "pending").length})</TabsTrigger><TabsTrigger value="out">Outgoing ({outgoing.length})</TabsTrigger></TabsList>
        <TabsContent value="in">{list(incoming, "in")}</TabsContent>
        <TabsContent value="out">{list(outgoing, "out")}</TabsContent>
      </Tabs>
    </div>
  );
}
