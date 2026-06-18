import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const STYLES = ["budget", "mid-range", "luxury"] as const;

export const listBudgets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("budgets")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const GenSchema = z.object({
  destination: z.string().min(2).max(120),
  duration: z.number().int().min(1).max(60),
  travelers: z.number().int().min(1).max(20),
  travel_style: z.enum(STYLES),
  currency: z.string().min(3).max(4).default("USD"),
  origin: z.string().max(120).optional(),
  save: z.boolean().optional(),
});

const BreakdownSchema = z.object({
  currency: z.string(),
  total_estimate: z.number(),
  summary: z.string(),
  breakdown: z.array(
    z.object({
      category: z.string(),
      amount: z.number(),
      note: z.string(),
    }),
  ),
  tips: z.array(z.string()),
});

export type BudgetBreakdown = z.infer<typeof BreakdownSchema>;

export const generateBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GenSchema.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `Estimate a realistic travel budget for this trip.
Destination: ${data.destination}
${data.origin ? `Origin: ${data.origin}` : ""}
Duration: ${data.duration} days
Travelers: ${data.travelers}
Style: ${data.travel_style}
Currency: ${data.currency}

Return a JSON object with:
- currency: the currency code provided
- total_estimate: total cost for the whole trip for all travelers (number, no formatting)
- summary: one short paragraph describing the estimate
- breakdown: array of categories like Flights, Accommodation, Food, Local transport, Activities, Misc — each with category, amount (number), and a brief note explaining the assumption
- tips: 3-5 concise money-saving tips specific to this destination

All amounts must be in ${data.currency}. Be realistic and specific to the destination and chosen style.`;

    try {
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
        experimental_output: Output.object({ schema: BreakdownSchema }),
      });

      const result = experimental_output;

      if (data.save) {
        const { data: saved, error } = await context.supabase
          .from("budgets")
          .insert({
            user_id: context.userId,
            destination: data.destination,
            duration: data.duration,
            travelers: data.travelers,
            travel_style: data.travel_style,
            currency: result.currency || data.currency,
            total_estimate: result.total_estimate,
            breakdown: result.breakdown,
            notes: result.summary,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return { result, saved };
      }

      return { result, saved: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI error";
      if (msg.includes("429"))
        throw new Error("Rate limited — please wait a moment and try again.");
      if (msg.includes("402"))
        throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(msg);
    }
  });

export const deleteBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("budgets")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
