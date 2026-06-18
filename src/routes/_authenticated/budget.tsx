import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Trash2, Wallet } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateBudget,
  listBudgets,
  deleteBudget,
  type BudgetBreakdown,
} from "@/lib/budgets.functions";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [{ title: "AI Budget Planner · Smart Travel Explorer" }],
  }),
  component: BudgetPage,
});

const STYLE_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
] as const;

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"] as const;

type SavedBudget = {
  id: string;
  destination: string;
  duration: number;
  travelers: number;
  travel_style: string;
  currency: string;
  total_estimate: number | string;
  breakdown: Array<{ category: string; amount: number; note: string }>;
  notes: string | null;
  created_at: string;
};

function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

function BudgetPage() {
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [duration, setDuration] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState<(typeof STYLE_OPTIONS)[number]["value"]>("mid-range");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("USD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetBreakdown | null>(null);
  const [list, setList] = useState<SavedBudget[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const gen = useServerFn(generateBudget);
  const ls = useServerFn(listBudgets);
  const del = useServerFn(deleteBudget);

  useEffect(() => {
    ls()
      .then((r) => setList(r as unknown as SavedBudget[]))
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, [ls]);

  const perPerPerDay = useMemo(() => {
    if (!result) return null;
    const n = result.total_estimate / Math.max(1, duration) / Math.max(1, travelers);
    return fmt(n, result.currency);
  }, [result, duration, travelers]);

  async function onGenerate(save: boolean) {
    if (!destination.trim()) return toast.error("Add a destination first");
    setLoading(true);
    setResult(null);
    try {
      const r = await gen({
        data: {
          destination: destination.trim(),
          origin: origin.trim() || undefined,
          duration,
          travelers,
          travel_style: style,
          currency,
          save,
        },
      });
      setResult(r.result);
      if (save && r.saved) {
        toast.success("Budget saved");
        ls().then((rr) => setList(rr as unknown as SavedBudget[]));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate budget");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    await del({ data: { id } });
    setList((s) => s.filter((x) => x.id !== id));
    toast.success("Deleted");
  }

  function loadSaved(b: SavedBudget) {
    setDestination(b.destination);
    setDuration(b.duration);
    setTravelers(b.travelers);
    setResult({
      currency: b.currency,
      total_estimate: Number(b.total_estimate),
      summary: b.notes ?? "",
      breakdown: b.breakdown ?? [],
      tips: [],
    });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[380px_1fr]">
        <aside>
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">AI Budget Planner</span>
          </div>
          <h1 className="mt-2 font-display text-3xl">Estimate your trip cost</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A quick, realistic breakdown across flights, stay, food, and more.
          </p>

          <Card className="mt-6 space-y-4 p-5">
            <div>
              <Label htmlFor="dest">Destination</Label>
              <Input
                id="dest"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Lisbon"
              />
            </div>
            <div>
              <Label htmlFor="origin">Origin (optional)</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. New York"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dur">Days ({duration})</Label>
                <input
                  id="dur"
                  type="range"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
              <div>
                <Label htmlFor="trav">Travelers ({travelers})</Label>
                <input
                  id="trav"
                  type="range"
                  min={1}
                  max={10}
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as typeof currency)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => onGenerate(false)} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Estimate
              </Button>
              <Button variant="outline" onClick={() => onGenerate(true)} disabled={loading}>
                Estimate & save
              </Button>
            </div>
          </Card>

          <div className="mt-8">
            <h2 className="font-display text-xl">Saved budgets</h2>
            {listLoading ? (
              <div className="mt-3 space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-md border bg-card" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No saved budgets yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {list.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-md border bg-card p-3 text-sm"
                  >
                    <button className="min-w-0 text-left" onClick={() => loadSaved(b)}>
                      <p className="truncate font-medium">{b.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.duration}d · {b.travelers} ppl · {fmt(Number(b.total_estimate), b.currency)}
                      </p>
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(b.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main>
          <Card className="min-h-[60vh] p-6 sm:p-8">
            {loading ? (
              <div className="space-y-4">
                <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="mt-6 space-y-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              </div>
            ) : result ? (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Estimated total
                    </p>
                    <p className="font-display text-4xl text-primary sm:text-5xl">
                      {fmt(result.total_estimate, result.currency)}
                    </p>
                    {perPerPerDay && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        ~ {perPerPerDay} per person · per day
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{destination || "Trip"}</p>
                    <p>
                      {duration} days · {travelers} traveler{travelers > 1 ? "s" : ""} · {style}
                    </p>
                  </div>
                </div>

                {result.summary && (
                  <p className="mt-6 text-sm leading-relaxed text-foreground/90">
                    {result.summary}
                  </p>
                )}

                <div className="mt-6">
                  <h3 className="font-display text-lg">Breakdown</h3>
                  <ul className="mt-3 divide-y rounded-lg border">
                    {result.breakdown.map((b, i) => {
                      const pct = result.total_estimate
                        ? Math.round((b.amount / result.total_estimate) * 100)
                        : 0;
                      return (
                        <li key={i} className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{b.category}</span>
                            <span className="font-mono text-sm">
                              {fmt(b.amount, result.currency)}{" "}
                              <span className="text-muted-foreground">({pct}%)</span>
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          {b.note && (
                            <p className="mt-2 text-xs text-muted-foreground">{b.note}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {result.tips && result.tips.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-display text-lg">Money-saving tips</h3>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                      {result.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
                <Wallet className="h-10 w-10 text-primary" />
                <p className="mt-3 max-w-sm">
                  Tell us where you're going and how you like to travel — we'll estimate the cost
                  with a category breakdown.
                </p>
              </div>
            )}
          </Card>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
