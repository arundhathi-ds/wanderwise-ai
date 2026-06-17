import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar, ChefHat, Globe2, Heart, Languages, MapPin, ShieldAlert, Sparkles, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDestination, DESTINATIONS, type Destination } from "@/lib/destinations";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { toggleFavorite } from "@/lib/favorites.functions";
import { trackView } from "@/lib/recently.functions";

export const Route = createFileRoute("/destination/$id")({
  loader: ({ params }) => {
    const d = getDestination(params.id);
    if (!d) throw notFound();
    return { d };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.d.name}, ${loaderData.d.country} · Smart Travel Explorer` },
          { name: "description", content: loaderData.d.tagline },
          { property: "og:title", content: `${loaderData.d.name} · Smart Travel Explorer` },
          { property: "og:description", content: loaderData.d.tagline },
          { property: "og:image", content: loaderData.d.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <h1 className="font-display text-3xl">Destination not found</h1>
        <Link to="/explore" className="mt-4 inline-block text-primary underline">
          Back to explore
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => {
    const r = useRouter();
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <h1 className="font-display text-2xl">Couldn't load destination</h1>
          <Button className="mt-4" onClick={() => { r.invalidate(); reset(); }}>Try again</Button>
        </div>
      </div>
    );
  },
  component: DestPage,
});

function DestPage() {
  const { d } = Route.useLoaderData() as { d: Destination };
  const [authed, setAuthed] = useState(false);
  const [fav, setFav] = useState(false);
  const toggle = useServerFn(toggleFavorite);
  const track = useServerFn(trackView);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      if (data.user) {
        track({ data: { destination_id: d.id, destination_name: d.name, image_url: d.image } }).catch(() => {});
      }
    });
  }, [d.id, d.name, d.image, track]);

  async function onFav() {
    if (!authed) {
      toast.message("Sign in to save destinations");
      return;
    }
    try {
      const r = await toggle({ data: { destination_id: d.id, destination_name: d.name, image_url: d.image, attraction_name: null } });
      setFav(r.favorited);
      toast.success(r.favorited ? "Saved to favorites" : "Removed from favorites");
    } catch {
      toast.error("Couldn't update favorite");
    }
  }

  const nearby = DESTINATIONS.filter((x) => x.region === d.region && x.id !== d.id).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <img src={d.image} alt={d.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <Link
            to="/explore"
            className="text-xs uppercase tracking-[0.28em] text-white/70 hover:text-white"
          >
            ← {d.region} · {d.country}
          </Link>
          <h1 className="mt-3 font-display text-5xl text-white sm:text-7xl">{d.name}</h1>
          <p className="mt-2 max-w-xl text-base text-white/90 sm:text-lg">{d.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={onFav} variant="secondary">
              <Heart className={`mr-2 h-4 w-4 ${fav ? "fill-current" : ""}`} /> {fav ? "Saved" : "Save"}
            </Button>
            <Link to="/itinerary" search={{ destination: d.name }}>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" /> Plan with AI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attractions">Attractions</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="culture">Culture</TabsTrigger>
              <TabsTrigger value="tips">Tips & Safety</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6 space-y-6">
              <p className="text-lg leading-relaxed">{d.overview}</p>
              <div>
                <h3 className="font-display text-xl">History</h3>
                <p className="mt-2 text-muted-foreground">{d.history}</p>
              </div>
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" /> Best time to visit
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{d.bestTime}</p>
              </Card>
            </TabsContent>
            <TabsContent value="attractions" className="mt-6 space-y-3">
              {d.attractions.map((a) => (
                <Card key={a.name} className="p-5">
                  <h4 className="font-display text-lg">{a.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="food" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl">Must-eat local dishes</h3>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {d.food.map((f) => (
                    <li key={f} className="rounded-md bg-secondary/50 px-4 py-2 text-sm">{f}</li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="culture" className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <Languages className="h-5 w-5 text-primary" />
                <h4 className="mt-2 font-display text-lg">Language</h4>
                <p className="text-sm text-muted-foreground">{d.language}</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {d.phrases.map((p) => (
                    <li key={p.phrase} className="flex justify-between gap-3 border-b border-dashed py-1">
                      <span className="font-medium">{p.phrase}</span>
                      <span className="text-muted-foreground">{p.meaning}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5">
                <Wallet className="h-5 w-5 text-primary" />
                <h4 className="mt-2 font-display text-lg">Currency</h4>
                <p className="text-sm text-muted-foreground">{d.currency}</p>
                <div className="mt-4 border-t pt-4">
                  <h5 className="text-sm font-medium">Budget tips</h5>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {d.budgetTips.map((b) => (<li key={b}>• {b}</li>))}
                  </ul>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="tips" className="mt-6 space-y-4">
              <Card className="p-5">
                <h4 className="font-display text-lg">Travel tips</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {d.tips.map((t) => (<li key={t}>• {t}</li>))}
                </ul>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  <h4 className="font-display text-lg">Safety</h4>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{d.safety}</p>
                <p className="mt-3 text-sm font-medium">Emergency: <span className="text-muted-foreground">{d.emergency}</span></p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-display text-lg">
              <Globe2 className="h-4 w-4 text-primary" /> Quick facts
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Country" v={d.country} />
              <Row k="Region" v={d.region} />
              <Row k="Language" v={d.language} />
              <Row k="Currency" v={d.currency} />
              <Row k="Best season" v={d.bestTime.split(";")[0]} />
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-display text-lg">
              <MapPin className="h-4 w-4 text-primary" /> Nearby
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {d.nearby.map((n) => (<li key={n}>• {n}</li>))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-lg">Travel checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {["Passport (6+ months valid)", "Travel insurance", "Local SIM or eSIM", "Power adapter", "Comfortable shoes", "Reusable water bottle"].map((c) => (
                <li key={c} className="flex items-start gap-2"><input type="checkbox" className="mt-1 accent-primary" />{c}</li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-2xl">More in {d.region}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((n) => (
              <Link key={n.id} to="/destination/$id" params={{ id: n.id }} className="group block overflow-hidden rounded-xl border bg-card">
                <img src={n.image} alt={n.name} className="h-40 w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                <div className="p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{n.country}</p>
                  <h3 className="mt-1 font-display text-lg">{n.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed py-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
