import { BedDouble, MapPin, Utensils, Bus, Footprints, Users, Lightbulb, AlertTriangle, Moon, Heart, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StayRecommendations } from "@/lib/stays.functions";

const TIER_STYLES: Record<string, string> = {
  Budget: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  "Mid-range": "bg-amber-500/10 text-amber-800 border-amber-500/30 dark:text-amber-300",
  Premium: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300",
};

export function StayRecommendationsSection({ data }: { data: StayRecommendations }) {
  return (
    <section className="mt-10 space-y-8">
      <header className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <BedDouble className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl">AI Stay Recommendations</h2>
          <p className="text-sm text-muted-foreground">Where to stay, picked for your trip.</p>
        </div>
      </header>

      {data.cities.map((city) => (
        <div key={city.city} className="space-y-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-display text-xl">{city.city}</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {city.areas.map((area) => (
              <Card key={`${city.city}-${area.tier}`} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg leading-tight">{area.name}</p>
                    <p className="mt-1 text-sm font-medium text-primary">{area.nightly_cost} <span className="text-xs font-normal text-muted-foreground">/ night</span></p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${TIER_STYLES[area.tier] ?? ""}`}>
                    {area.tier}
                  </span>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why stay here</p>
                  <ul className="space-y-1 text-sm">
                    {area.why.map((w, i) => (
                      <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{w}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {area.suited_for.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1 text-xs"><Users className="h-3 w-3" />{s}</Badge>
                  ))}
                </div>

                <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="flex gap-2">
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nearby attractions</p>
                      <p>{area.highlights.attractions.join(" · ")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Food hotspots</p>
                      <p>{area.highlights.food.join(" · ")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Bus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm">{area.highlights.transport}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Walkability</span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-border">
                        <div className="h-full bg-primary" style={{ width: `${area.highlights.walkability * 10}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium">{area.highlights.walkability}/10</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-transparent p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="font-display text-base">Travel Guide Insights — {city.city}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InsightTile icon={<Heart className="h-4 w-4" />} label="First-time visitors" text={city.guide_insights.first_time} />
              <InsightTile icon={<Moon className="h-4 w-4" />} label="Nightlife" text={city.guide_insights.nightlife} />
              <InsightTile icon={<Users className="h-4 w-4" />} label="Families" text={city.guide_insights.families} />
            </div>
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" /> Mistakes to avoid
              </p>
              <ul className="space-y-1 text-sm">
                {city.guide_insights.mistakes.map((m, i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{m}</span></li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      ))}
    </section>
  );
}

function InsightTile({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>{label}
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function StayRecommendationsSkeleton() {
  return (
    <section className="mt-10 space-y-5">
      <Skeleton className="h-7 w-64" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    </section>
  );
}
