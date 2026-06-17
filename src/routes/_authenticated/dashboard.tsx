import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Compass, Heart, MapPin, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listRecent } from "@/lib/recently.functions";
import { listFavorites } from "@/lib/favorites.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { DESTINATIONS } from "@/lib/destinations";
import { DestinationCard } from "@/components/destination-card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Smart Travel Explorer" }] }),
  component: Dashboard,
});

function Dashboard() {
  const recent = useServerFn(listRecent);
  const favs = useServerFn(listFavorites);
  const profile = useServerFn(getMyProfile);
  const [recentList, setRecent] = useState<Array<{ id: string; destination_id: string; destination_name: string; image_url: string | null }>>([]);
  const [favList, setFavs] = useState<Array<{ id: string; destination_name: string; image_url: string | null; destination_id: string }>>([]);
  const [name, setName] = useState<string>("Traveler");

  useEffect(() => {
    recent().then((r) => setRecent(r as never)).catch(() => {});
    favs().then((r) => setFavs(r as never)).catch(() => {});
    profile().then((p) => p && setName((p as { display_name?: string }).display_name || "Traveler")).catch(() => {});
  }, [recent, favs, profile]);

  const recommended = DESTINATIONS.slice().sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.28em] text-primary">Dashboard</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Welcome back, {name}.</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick up where you left off, or let the AI guide help you plan your next escape.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link to="/explore">
            <Card className="group p-6 transition hover:border-primary">
              <Compass className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-lg">Explore destinations</h3>
              <p className="text-sm text-muted-foreground">Search worldwide places.</p>
            </Card>
          </Link>
          <Link to="/itinerary">
            <Card className="group p-6 transition hover:border-primary">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-lg">Generate itinerary</h3>
              <p className="text-sm text-muted-foreground">AI-crafted day-by-day plan.</p>
            </Card>
          </Link>
          <Link to="/chat">
            <Card className="group p-6 transition hover:border-primary">
              <Heart className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-lg">Ask the AI guide</h3>
              <p className="text-sm text-muted-foreground">Chat about anywhere.</p>
            </Card>
          </Link>
        </div>

        <Section title="Recently viewed" empty="Visit a destination to see it here.">
          {recentList.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentList.map((r) => (
                <Link key={r.id} to="/destination/$id" params={{ id: r.destination_id }} className="group block overflow-hidden rounded-xl border bg-card">
                  {r.image_url && (
                    <img src={r.image_url} alt={r.destination_name} className="h-32 w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  )}
                  <div className="p-3 text-sm font-medium">{r.destination_name}</div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Saved places" empty="Tap the heart on any destination to save it.">
          {favList.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favList.slice(0, 8).map((f) => (
                <Link key={f.id} to="/destination/$id" params={{ id: f.destination_id }} className="group block overflow-hidden rounded-xl border bg-card">
                  {f.image_url && (
                    <img src={f.image_url} alt={f.destination_name} className="h-32 w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  )}
                  <div className="p-3 text-sm">
                    <p className="font-medium">{f.destination_name}</p>
                    <p className="text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />Saved</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recommended for you">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((d) => <DestinationCard key={d.id} d={d} />)}
          </div>
        </Section>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty?: string; children?: React.ReactNode }) {
  const hasChildren = children !== undefined && children !== null && children !== false;
  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      {hasChildren ? children : <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}
