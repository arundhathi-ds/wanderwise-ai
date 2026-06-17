import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const listItineraries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("itineraries")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const GenSchema = z.object({
  destination: z.string().min(2).max(120),
  duration: z.number().int().min(1).max(30),
  interests: z.array(z.string().max(30)).max(10),
  save: z.boolean().optional(),
});

export const generateItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GenSchema.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `Create a detailed ${data.duration}-day travel itinerary for ${data.destination}.
Traveler interests: ${data.interests.join(", ") || "general sightseeing"}.

Format your response in markdown with:
- A short intro paragraph
- A "## Day N — Theme" heading for each day
- Bullet points for morning, afternoon, evening with specific attractions, neighborhoods and food spots
- A "## Practical tips" section at the end with transport, budget and packing notes
Keep it specific, warm and inspiring.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
      });

      if (data.save) {
        const { data: saved, error } = await context.supabase
          .from("itineraries")
          .insert({
            user_id: context.userId,
            destination: data.destination,
            duration: data.duration,
            interests: data.interests,
            itinerary_content: text,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return { content: text, saved };
      }
      return { content: text, saved: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI error";
      if (msg.includes("429")) throw new Error("Rate limited — please wait a moment and try again.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(msg);
    }
  });

export const saveItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        destination: z.string().min(1).max(120),
        duration: z.number().int().min(1).max(30),
        interests: z.array(z.string().max(30)).max(10),
        itinerary_content: z.string().min(1).max(20000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase
      .from("itineraries")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const deleteItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("itineraries")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
