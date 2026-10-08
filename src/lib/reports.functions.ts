import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const lookupAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).parse(d))
  .handler(async ({ data }) => {
    const { reverseGeocode } = await import("./places.server");
    try {
      return { address: await reverseGeocode(data.lat, data.lng) };
    } catch {
      return { address: null };
    }
  });

export type DogMatch = {
  id: string;
  score: number;
  reason: string;
  address: string;
  eventDate: string;
  photoUrl: string | null;
};

const matchSchema = z.object({
  matches: z.array(
    z.object({
      index: z.number().int(),
      score: z.number().int().min(0).max(100),
      reason: z.string(),
    }),
  ),
});

/** Compare a lost-dog report photo with recent found/stray reports and score likely matches. */
export const findDogMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reportId: z.string().uuid(), lang: z.enum(["ar", "en"]) }).parse(d))
  .handler(async ({ data, context }): Promise<{ matches: DogMatch[]; error?: string }> => {
    const { supabase } = context;
    const { data: lost } = await supabase.from("dog_reports").select("*").eq("id", data.reportId).single();
    if (!lost) return { matches: [], error: "not_found" };
    const { data: candidates } = await supabase
      .from("dog_reports")
      .select("id, address, event_date, photo_path, marks, description")
      .in("report_kind", ["found", "stray", "treatment"])
      .neq("id", lost.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (!candidates?.length) return { matches: [] };

    const paths = [lost.photo_path, ...candidates.map((c) => c.photo_path)];
    const { data: signed } = await supabase.storage.from("dog-photos").createSignedUrls(paths, 60 * 30);
    const urls = signed?.map((s) => s.signedUrl ?? null) ?? [];
    if (!urls[0]) return { matches: [], error: "photo_unavailable" };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { matches: [], error: "not_configured" };

    const { streamText, Output } = await import("ai");
    const { createGatewayOpenAI } = await import("./ai/responses");
    const { createLovableAiGatewayRunIdFetch } = await import("./ai/run-id");
    const provider = createGatewayOpenAI(apiKey, createLovableAiGatewayRunIdFetch().fetch);

    const content: ({ type: "text"; text: string } | { type: "image"; image: URL })[] = [
      { type: "text", text: `LOST DOG (reference). Marks: ${lost.marks ?? "-"}. ${lost.description}` },
      { type: "image", image: new URL(urls[0]) },
    ];
    candidates.forEach((c, i) => {
      if (!urls[i + 1]) return;
      content.push({ type: "text", text: `CANDIDATE ${i}. Marks: ${c.marks ?? "-"}. ${c.description}` });
      content.push({ type: "image", image: new URL(urls[i + 1]!) });
    });

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: `You compare dog photos for a lost-and-found service in Egypt. For each CANDIDATE, estimate the probability (0-100) that it is the SAME individual dog as the LOST DOG, based on coat colour and pattern, unique spots, ear shape, tail, body build, collar and written marks. Many Egyptian baladi dogs look alike, so be conservative: only give 80+ for distinctive matching features. Return every candidate index. Write each reason in ${data.lang === "ar" ? "Egyptian Arabic" : "English"}, max 20 words.`,
        messages: [{ role: "user", content }],
        output: Output.object({ schema: matchSchema }),
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      const matches = out.matches
        .filter((m) => candidates[m.index] && m.score >= 30)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((m) => {
          const c = candidates[m.index]!;
          return { id: c.id, score: m.score, reason: m.reason, address: c.address, eventDate: c.event_date, photoUrl: urls[m.index + 1] ?? null };
        });
      return { matches };
    } catch (error) {
      console.error("Dog matching failed", error);
      return { matches: [], error: "ai_failed" };
    }
  });
