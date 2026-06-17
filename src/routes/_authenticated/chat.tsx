import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MessageCirclePlus, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";

type Thread = { id: string; title: string; updated_at: string };

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Travel Guide · Smart Travel Explorer" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const ls = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/chat" || pathname === "/chat/";
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = (await ls()) as Thread[];
      if (cancelled) return;
      setThreads(r);
      setLoaded(true);
      if (isIndex) {
        if (r.length > 0) {
          navigate({ to: "/chat/$threadId", params: { threadId: r[0].id }, replace: true });
        } else {
          const t = (await create({ data: {} })) as Thread;
          setThreads([t]);
          navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndex]);

  async function newThread() {
    const t = (await create({ data: {} })) as Thread;
    setThreads((s) => [t, ...s]);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  }

  async function removeThread(id: string) {
    try {
      await del({ data: { id } });
      const remaining = threads.filter((t) => t.id !== id);
      setThreads(remaining);
      toast.success("Conversation deleted");
      if (activeId === id) {
        if (remaining[0]) navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
        else newThread();
      }
    } catch {
      toast.error("Couldn't delete");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <Button onClick={newThread} className="w-full">
            <MessageCirclePlus className="mr-2 h-4 w-4" /> New conversation
          </Button>
          <div className="rounded-xl border bg-card p-2">
            {!loaded && <p className="p-3 text-xs text-muted-foreground">Loading…</p>}
            {loaded && threads.length === 0 && (
              <p className="p-3 text-xs text-muted-foreground">No conversations yet.</p>
            )}
            <ul className="space-y-1">
              {threads.map((t) => (
                <li key={t.id} className="flex items-center gap-1">
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className={`flex-1 truncate rounded-md px-3 py-2 text-sm hover:bg-secondary ${
                      activeId === t.id ? "bg-secondary font-medium" : ""
                    }`}
                  >
                    {t.title}
                  </Link>
                  <button
                    aria-label="Delete"
                    onClick={() => removeThread(t.id)}
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 hover:bg-secondary hover:text-foreground group-hover:opacity-100 [li:hover_&]:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <main className="min-h-[70vh] rounded-2xl border bg-card">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
