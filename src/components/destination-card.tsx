import { Link } from "@tanstack/react-router";
import type { Destination } from "@/lib/destinations";

export function DestinationCard({ d }: { d: Destination }) {
  return (
    <Link
      to="/destination/$id"
      params={{ id: d.id }}
      className="group relative block overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={d.image}
          alt={d.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.18em] opacity-80">{d.country}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{d.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm opacity-90">{d.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.categories.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
