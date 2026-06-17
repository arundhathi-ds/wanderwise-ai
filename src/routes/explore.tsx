import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { DestinationCard } from "@/components/destination-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DESTINATIONS, CATEGORIES } from "@/lib/destinations";

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Explore destinations · Smart Travel Explorer" },
      { name: "description", content: "Search world destinations by region, interest and category." },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { q: initialQ, category: initialCat } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [cat, setCat] = useState<string | null>(initialCat ?? null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return DESTINATIONS.filter((d) => {
      if (cat && !d.categories.includes(cat)) return false;
      if (!ql) return true;
      return (
        d.name.toLowerCase().includes(ql) ||
        d.country.toLowerCase().includes(ql) ||
        d.region.toLowerCase().includes(ql) ||
        d.tagline.toLowerCase().includes(ql)
      );
    });
  }, [q, cat]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.28em] text-primary">Explore</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Find your next trip</h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search city, country, region…"
            className="sm:max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={cat === null ? "default" : "outline"}
              onClick={() => setCat(null)}
            >
              All
            </Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={cat === c ? "default" : "outline"}
                onClick={() => setCat(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {filtered.length} destination{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DestinationCard key={d.id} d={d} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            No destinations match. Try a different keyword or category.
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
