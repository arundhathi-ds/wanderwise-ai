import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ToggleSchema = z.object({
  destination_id: z.string().min(1).max(100),
  destination_name: z.string().min(1).max(120),
  attraction_name: z.string().max(120).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
});

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ToggleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const attraction = data.attraction_name ?? "";
    const { data: existing } = await context.supabase
      .from("favorites")
      .select("id")
      .eq("user_id", context.userId)
      .eq("destination_id", data.destination_id)
      .eq("attraction_name", attraction)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await context.supabase.from("favorites").insert({
      user_id: context.userId,
      destination_id: data.destination_id,
      destination_name: data.destination_name,
      attraction_name: attraction,
      image_url: data.image_url ?? null,
    });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("favorites")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
