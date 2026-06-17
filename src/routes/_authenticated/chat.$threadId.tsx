import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getThreadMessages } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  const get = useServerFn(getThreadMessages);
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    setInitial(null);
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    get({ data: { threadId } })
      .then((r) => {
        const res = r as { thread: { title: string }; messages: { id: string; role: "user" | "assistant" | "system"; content: string }[] };
        setTitle(res.thread.title);
        setInitial(
          res.messages.map((m) => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })) as UIMessage[],
        );
      })
      .catch(() => setInitial([]));
  }, [threadId, get]);

  if (!initial || !token) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  return <ChatInner key={threadId} threadId={threadId} initial={initial} title={title} token={token} />;
}

function ChatInner({
  threadId,
  initial,
  title,
  token,
}: {
  threadId: string;
  initial: UIMessage[];
  title: string;
  token: string;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: { Authorization: `Bearer ${token}` },
        body: { threadId },
      }),
    [threadId, token],
  );
  const { messages, sendMessage, status } = useChat({ id: threadId, messages: initial, transport });
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => { taRef.current?.focus(); }, [threadId, isLoading]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    try {
      await sendMessage({ text });
    } catch {
      // surfaced via onError in transport / user sees no response
    }
  }

  const suggestions = [
    "What's a 5-day Kyoto itinerary focused on food?",
    "Best time to visit Iceland for the northern lights?",
    "Suggest 3 underrated European cities for a foodie trip.",
  ];

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      <header className="border-b px-5 py-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">AI Travel Guide</p>
        <h2 className="truncate font-display text-lg">{title || "Conversation"}</h2>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 font-display text-xl">Where shall we wander today?</p>
            <p className="mt-1 text-sm text-muted-foreground">Ask me anything about a destination.</p>
            <div className="mt-5 space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="block w-full rounded-lg border bg-card p-3 text-left text-sm transition hover:border-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={isUser ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground" : "max-w-[90%]"}>
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm">{text}</p>
                ) : (
                  <article className="prose prose-stone max-w-none text-sm prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </article>
                )}
              </div>
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t bg-background/50 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about a destination, dish, or trip…"
            rows={2}
            className="min-h-[60px] flex-1 resize-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
