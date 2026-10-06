import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type FerLike = {
  label: string;
  display_name: string;
  confidence: number;
  all_probs: Record<string, number>;
  disclaimer: string;
};

export const analyzeFacialExpression = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ imageUrl: z.string().url() }).parse(input))
  .handler(async ({ data }): Promise<FerLike> => {
    const labels = ["Sadness", "Neutral", "Anxiety (proxy: Fear)", "Disgust"] as const;
    type Label = (typeof labels)[number];

    const fallbackExpression = (label: Label = "Neutral"): FerLike => ({
      label,
      display_name: label,
      confidence: 0.45,
      all_probs: {
        Sadness: label === "Sadness" ? 0.45 : 0.18,
        Neutral: label === "Neutral" ? 0.45 : 0.28,
        "Anxiety (proxy: Fear)": label === "Anxiety (proxy: Fear)" ? 0.45 : 0.22,
        Disgust: label === "Disgust" ? 0.45 : 0.12,
      },
      disclaimer: "Demo classification — AI service unavailable.",
    });

    const lovableKey = process.env.LOVABLE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!lovableKey && !geminiKey) return fallbackExpression();

    const systemPrompt = `You are a facial expression classifier. Given a photo of a person, classify the dominant facial expression into EXACTLY one of these four labels: "Sadness", "Neutral", "Anxiety (proxy: Fear)", "Disgust". Return probabilities for all four labels that sum to 1.0. Be conservative — if no clear face is visible, default to "Neutral" with low confidence. This is for a wellbeing demo, not a medical diagnosis.`;

    const parseResult = (parsed: { label: string; probs: Record<string, number> }) => {
      const label = (labels as readonly string[]).includes(parsed.label) ? parsed.label : "Neutral";
      const probs = parsed.probs || {};
      const sum = Object.values(probs).reduce((a, b) => a + b, 0) || 1;
      const all_probs: Record<string, number> = {};
      for (const k of labels) all_probs[k] = (probs[k] ?? 0) / sum;
      const confidence = all_probs[label] ?? 0.5;
      return {
        label,
        display_name: label,
        confidence,
        all_probs,
        disclaimer: "Demo classification — not a medical diagnosis.",
      };
    };

    // ---- Path A: Lovable AI Gateway (OpenAI-compatible) ----
    if (lovableKey) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": lovableKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Classify the facial expression in this image." },
                { type: "image_url", image_url: { url: data.imageUrl } },
              ],
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "report_expression",
              description: "Return the classified facial expression and probabilities.",
              parameters: {
                type: "object",
                properties: {
                  label: { type: "string", enum: labels as unknown as string[] },
                  probs: {
                    type: "object",
                    properties: {
                      Sadness: { type: "number" },
                      Neutral: { type: "number" },
                      "Anxiety (proxy: Fear)": { type: "number" },
                      Disgust: { type: "number" },
                    },
                    required: ["Sadness", "Neutral", "Anxiety (proxy: Fear)", "Disgust"],
                    additionalProperties: false,
                  },
                },
                required: ["label", "probs"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "report_expression" } },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        if (res.status === 429) throw new Error("Rate limit reached, please try again shortly.");
        if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
        throw new Error(`AI gateway error ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = await res.json();
      const call = json?.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) throw new Error("AI did not return a classification.");
      return parseResult(JSON.parse(call.function.arguments));
    }

    // ---- Path B: Google Gemini API (native) — used on Vercel ----
    // Fetch the image and inline it as base64 for Gemini.
    const imgRes = await fetch(data.imageUrl);
    if (!imgRes.ok) throw new Error(`Failed to fetch image (${imgRes.status})`);
    const mimeType = imgRes.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const buf = await imgRes.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");

    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{
            role: "user",
            parts: [
              { text: "Classify the facial expression in this image. Respond ONLY with JSON: {\"label\":\"<one of the 4>\",\"probs\":{\"Sadness\":n,\"Neutral\":n,\"Anxiety (proxy: Fear)\":n,\"Disgust\":n}}" },
              { inline_data: { mime_type: mimeType, data: b64 } },
            ],
          }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      },
    );

    if (!gRes.ok) {
      const body = await gRes.text().catch(() => "");
      throw new Error(`Gemini error ${gRes.status}: ${body.slice(0, 200)}`);
    }
    const gJson = await gRes.json();
    const text = gJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini did not return a classification.");
    return parseResult(JSON.parse(text));
  });
