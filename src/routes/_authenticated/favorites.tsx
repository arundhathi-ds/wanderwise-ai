import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { listFavorites, removeFavorite } from "@/lib/favorites.functions";

type Fav = { id: string; destination_id: string; destination_name: string; attraction_name: string | null; image_url: string | null };

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "Favorites · Smart Travel Explorer" }] }),
  component: FavPage,
});

function FavPage() {
  const list = useServerFn(listFavorites);
  const rm = useServerFn(removeFavorite);
  const [items, setItems] = useState<Fav[]>([]);

  useEffect(() => {
    list().then((r) => setItems(r as Fav[])).catch(() => {});
  }, [list]);

  async function remove(id: string) {
    try {
      await rm({ data: { id } });
      setItems((s) => s.filter((x) => x.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Couldn't remove");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl">Your favorites</h1>
        <p className="mt-2 text-muted-foreground">Places you've saved for later inspiration.</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            No favorites yet.{" "}
            <Link to="/explore" className="text-primary underline">Browse destinations</Link>{" "}
            to save some.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((f) => (
              <div key={f.id} className="group relative overflow-hidden rounded-xl border bg-card">
                <Link to="/destination/$id" params={{ id: f.destination_id }}>
                  {f.image_url ? (
                    <img src={f.image_url} alt={f.destination_name} loading="lazy" className="h-40 w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="h-40 w-full bg-secondary" />
                  )}
                </Link>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-display text-lg">{f.destination_name}</p>
                    {f.attraction_name && <p className="text-xs text-muted-foreground">{f.attraction_name}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(f.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
