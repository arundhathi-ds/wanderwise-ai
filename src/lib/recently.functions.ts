import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listRecent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("recently_viewed")
      .select("*")
      .eq("user_id", context.userId)
      .order("viewed_at", { ascending: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const trackView = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        destination_id: z.string().min(1).max(100),
        destination_name: z.string().min(1).max(120),
        image_url: z.string().url().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("recently_viewed")
      .upsert(
        {
          user_id: context.userId,
          destination_id: data.destination_id,
          destination_name: data.destination_name,
          image_url: data.image_url ?? null,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,destination_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
