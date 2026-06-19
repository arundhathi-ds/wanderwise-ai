import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateItinerary, listItineraries, deleteItinerary, saveItinerary } from "@/lib/itineraries.functions";

const INTERESTS = ["Adventure", "Nature", "Culture", "Food", "Shopping", "Family"] as const;
const search = z.object({ destination: z.string().optional() });

type Itinerary = {
  id: string;
  destination: string;
  duration: number;
  interests: string[];
  itinerary_content: string;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/itinerary")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Itinerary generator · Smart Travel Explorer" }] }),
  component: ItineraryPage,
});

function ItineraryPage() {
  const init = Route.useSearch();
  const [destination, setDestination] = useState(init.destination ?? "");
  const [duration, setDuration] = useState(5);
  const [picked, setPicked] = useState<string[]>(["Culture", "Food"]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [list, setList] = useState<Itinerary[]>([]);

  const gen = useServerFn(generateItinerary);
  const save = useServerFn(saveItinerary);
  const ls = useServerFn(listItineraries);
  const del = useServerFn(deleteItinerary);

  useEffect(() => {
    ls().then((r) => setList(r as Itinerary[])).catch(() => {});
  }, [ls]);

  function toggle(i: string) {
    setPicked((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  }

  async function onGenerate(doSave: boolean) {
    if (!destination.trim()) return toast.error("Add a destination first");
    setLoading(true);
    setContent("");
    try {
      const dest = destination.trim();
      const ints = picked;
      const r = await gen({ data: { destination: dest, duration, interests: ints, save: false } });
      setContent(r.content);

      if (doSave) {
        try {
          await save({ data: { destination: dest, duration, interests: ints, itinerary_content: r.content } });
          toast.success("Itinerary saved");
          ls().then((rr) => setList(rr as Itinerary[]));
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Save failed");
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function openSaved(it: Itinerary) {
    setContent(it.itinerary_content);
  }

  async function onDelete(id: string) {
    await del({ data: { id } });
    setList((s) => s.filter((x) => x.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[380px_1fr]">
        <aside>
          <h1 className="font-display text-3xl">Plan your trip</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI builds a day-by-day plan tailored to your interests.</p>
          <Card className="mt-6 space-y-4 p-5">
            <div>
              <Label htmlFor="dest">Destination</Label>
              <Input id="dest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Kyoto" />
            </div>
            <div>
              <Label htmlFor="dur">Days ({duration})</Label>
              <input
                id="dur"
                type="range"
                min={1}
                max={14}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>
            <div>
              <Label>Interests</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggle(i)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      picked.includes(i)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => onGenerate(false)} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate preview
              </Button>
              <Button variant="outline" onClick={() => onGenerate(true)} disabled={loading}>
                Generate & save
              </Button>
            </div>
          </Card>

          {list.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl">Saved itineraries</h2>
              <ul className="mt-3 space-y-2">
                {list.map((it) => (
                  <li key={it.id} className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                    <button className="text-left" onClick={() => openSaved(it)}>
                      <p className="font-medium">{it.destination}</p>
                      <p className="text-xs text-muted-foreground">{it.duration} days · {it.interests.join(", ")}</p>
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(it.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main>
          <Card className="min-h-[60vh] p-8">
            {loading && !content ? (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Crafting your itinerary…</p>
              </div>
            ) : content ? (
              <article className="prose prose-stone max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground dark:prose-invert">
                <ReactMarkdown>{content}</ReactMarkdown>
              </article>
            ) : (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 text-primary" />
                <p className="mt-3 max-w-sm">Pick a destination, drag the slider, choose what excites you — your itinerary will appear here.</p>
              </div>
            )}
          </Card>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
