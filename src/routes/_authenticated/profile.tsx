import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { listItineraries } from "@/lib/itineraries.functions";
import { listFavorites } from "@/lib/favorites.functions";

type Profile = { id: string; email: string | null; display_name: string | null; bio: string | null; travel_style: string | null };

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · Smart Travel Explorer" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const get = useServerFn(getMyProfile);
  const upd = useServerFn(updateMyProfile);
  const lsIt = useServerFn(listItineraries);
  const lsFav = useServerFn(listFavorites);
  const [p, setP] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ favs: 0, itin: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get().then((r) => setP(r as Profile)).catch(() => {});
    lsIt().then((r) => setStats((s) => ({ ...s, itin: (r as unknown[]).length })));
    lsFav().then((r) => setStats((s) => ({ ...s, favs: (r as unknown[]).length })));
  }, [get, lsIt, lsFav]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    setSaving(true);
    try {
      await upd({ data: { display_name: p.display_name ?? "", bio: p.bio ?? "", travel_style: p.travel_style ?? "" } });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!p) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground sm:px-6">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl">Your profile</h1>
        <p className="mt-1 text-muted-foreground">{p.email}</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Saved places</p>
            <p className="mt-1 font-display text-3xl">{stats.favs}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Itineraries</p>
            <p className="mt-1 font-display text-3xl">{stats.itin}</p>
          </Card>
        </div>

        <form onSubmit={save} className="mt-8 space-y-5 rounded-2xl border bg-card p-6">
          <div>
            <Label htmlFor="dn">Display name</Label>
            <Input id="dn" value={p.display_name ?? ""} onChange={(e) => setP({ ...p, display_name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ts">Travel style</Label>
            <Input
              id="ts"
              placeholder="e.g. Slow traveler, foodie, adventurer"
              value={p.travel_style ?? ""}
              onChange={(e) => setP({ ...p, travel_style: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })} />
          </div>
          <div className="flex justify-between">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            <Button type="button" variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
