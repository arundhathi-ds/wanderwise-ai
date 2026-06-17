import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, MapPin, ArrowRight, Calendar, Heart } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DESTINATIONS, CATEGORIES } from "@/lib/destinations";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Travel Explorer — AI-powered travel guide" },
      {
        name: "description",
        content:
          "Discover destinations, plan itineraries with AI, and learn local culture, food and tips with Smart Travel Explorer.",
      },
      { property: "og:title", content: "Smart Travel Explorer" },
      { property: "og:description", content: "AI-powered travel guide for curious explorers." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [q, setQ] = useState("");
  const featured = DESTINATIONS.slice(0, 6);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Sunset over a Mediterranean coastal village"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="mx-auto max-w-5xl px-4 pb-32 pt-24 text-center sm:px-6 sm:pt-32">
          <p className="text-xs uppercase tracking-[0.32em] text-white/80">
            AI-powered travel companion
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium text-white sm:text-6xl md:text-7xl">
            Wander somewhere
            <br />
            <span className="italic text-primary-foreground/95">that moves you.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Discover destinations, decode local culture, and let an AI guide
            craft itineraries tailored to your interests.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/explore?q=${encodeURIComponent(q)}`;
            }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/30 bg-white/95 p-1.5 shadow-2xl backdrop-blur"
          >
            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Where to next? Try Kyoto, Lisbon, Bali…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="rounded-full">
              Explore
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
            <span className="opacity-70">Popular:</span>
            {["Kyoto", "Marrakech", "Lisbon", "Bali", "Reykjavík"].map((p) => (
              <Link
                key={p}
                to="/explore"
                search={{ q: p }}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur hover:bg-white/20"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Featured</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Hand-picked destinations</h2>
          </div>
          <Link
            to="/explore"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DestinationCard key={d.id} d={d} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">Travel by mood</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Browse by category</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/explore"
                search={{ category: c }}
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <p className="font-display text-lg">{c}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Discover {c.toLowerCase()} trips
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { i: Sparkles, t: "AI Travel Guide", d: "Chat with a knowledgeable AI travel companion 24/7." },
            { i: Calendar, t: "Personal itineraries", d: "Day-by-day plans matched to your duration & interests." },
            { i: Heart, t: "Save what you love", d: "Bookmark destinations and attractions for later." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-10 text-center text-primary-foreground shadow-xl sm:p-16">
          <MapPin className="mx-auto h-8 w-8 opacity-80" />
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Ready when you are.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
            Sign in to save destinations, generate personalized itineraries, and chat
            with the AI travel guide.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="mt-6 rounded-full">
              Get started — it's free
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
