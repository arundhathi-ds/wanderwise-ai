import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  destination: z.string().min(2).max(160),
  duration: z.number().int().min(1).max(30),
  interests: z.array(z.string().max(30)).max(10).optional(),
  itinerary: z.string().min(20).max(20000),
});

const StaySchema = z.object({
  cities: z
    .array(
      z.object({
        city: z.string(),
        areas: z
          .array(
            z.object({
              tier: z.enum(["Budget", "Mid-range", "Premium"]),
              name: z.string(),
              why: z.array(z.string()).min(2).max(6),
              nightly_cost: z.string(),
              suited_for: z.array(z.string()).min(1).max(5),
              highlights: z.object({
                attractions: z.array(z.string()).min(1).max(5),
                food: z.array(z.string()).min(1).max(5),
                transport: z.string(),
                walkability: z.number().int().min(1).max(10),
              }),
            }),
          )
          .length(3),
        guide_insights: z.object({
          first_time: z.string(),
          nightlife: z.string(),
          families: z.string(),
          mistakes: z.array(z.string()).min(2).max(5),
        }),
      }),
    )
    .min(1)
    .max(6),
});

export type StayRecommendations = z.infer<typeof StaySchema>;

export const generateStays = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are a travel-guide expert. Based on this ${data.duration}-day trip to ${data.destination}, recommend WHERE TO STAY.

Itinerary excerpt:
${data.itinerary.slice(0, 4000)}

For each distinct city or destination visited in the itinerary (max 4), recommend exactly 3 neighborhoods/areas: one Budget, one Mid-range, one Premium.
For each area provide:
- name (real neighborhood)
- why: 3-5 specific reasons (close to attractions, transport, safety, food, shopping, vibe)
- nightly_cost: realistic per-night USD range, e.g. "$30-60"
- suited_for: e.g. ["solo travelers","families"]
- highlights.attractions: 2-4 nearby attractions
- highlights.food: 2-4 food/restaurant hotspots
- highlights.transport: one-sentence description of transport convenience
- highlights.walkability: integer 1-10
Also for each city, give guide_insights: best area for first-time visitors, nightlife, families, and 2-4 common tourist mistakes to avoid.
Be specific and accurate — use real neighborhood names.`;

    try {
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
        experimental_output: Output.object({ schema: StaySchema }),
      });
      return experimental_output as StayRecommendations;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI error";
      if (msg.includes("429")) throw new Error("Rate limited — please wait a moment and try again.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(msg);
    }
  });

export const STAYS_DELIMITER = "\n\n<!--STAYS_JSON-->\n";

export function splitItineraryAndStays(content: string): {
  markdown: string;
  stays: StayRecommendations | null;
} {
  const idx = content.indexOf(STAYS_DELIMITER);
  if (idx === -1) return { markdown: content, stays: null };
  const markdown = content.slice(0, idx);
  const jsonPart = content.slice(idx + STAYS_DELIMITER.length).trim();
  try {
    const parsed = StaySchema.parse(JSON.parse(jsonPart));
    return { markdown, stays: parsed };
  } catch {
    return { markdown, stays: null };
  }
}

export function joinItineraryAndStays(markdown: string, stays: StayRecommendations): string {
  return `${markdown}${STAYS_DELIMITER}${JSON.stringify(stays)}`;
}
