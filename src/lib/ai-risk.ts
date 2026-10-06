// AI Risk Detection Service — CV powered by Lovable AI (Gemini vision) via server function.
import { analyzeFacialExpression } from "@/lib/cv-analyze.functions";



export type RiskLevel = "low" | "medium" | "high";
export type Condition =
  | "Depression"
  | "Anxiety"
  | "Bipolar"
  | "Stress"
  | "Stable"
  // FER raw display names (from the CV backend) — shown as-is in CV mode
  | "Sadness"
  | "Neutral"
  | "Anxiety (proxy: Fear)"
  | "Disgust";

export interface AIRiskResult {
  risk_level: RiskLevel;
  risk_score: number; // 0-100
  condition: Condition;
  nlp_insights: {
    sentiment: string;
    dominant_emotions: string[];
    keywords: string[];
    summary: string;
  };
  cv_insights: {
    visual_mood: string;
    color_palette: string;
    detected_patterns: string[];
    summary: string;
  };
  shap_data: {
    features: { name: string; contribution: number }[];
    explanation: string;
  };
  is_demo: boolean;
}

export interface AIRiskInput {
  text?: string;
  imageUrl?: string;
  imageFile?: File;
  mode?: "nlp" | "cv";
}


// Emoji mapping — condition + severity
export function conditionEmoji(c: Condition): string {
  switch (c) {
    case "Depression": return "😔";
    case "Anxiety": return "😰";
    case "Bipolar": return "🌗";
    case "Stress": return "😖";
    case "Stable": return "🌱";
    case "Sadness": return "😔";
    case "Neutral": return "😐";
    case "Anxiety (proxy: Fear)": return "😰";
    case "Disgust": return "🤢";
    default: return "🧠";
  }
}

export function riskEmoji(level: RiskLevel): string {
  return level === "low" ? "🌿" : level === "medium" ? "⚠️" : "🚨";
}

export function conditionLabel(c: Condition): string {
  return c === "Stable" ? "Stable / Balanced" : c;
}

const CORE_TEMPLATES: Record<"Stable" | "Stress" | "Anxiety" | "Bipolar" | "Depression", Omit<AIRiskResult, "is_demo" | "risk_score" | "risk_level" | "condition">> = {
  Stable: {
    nlp_insights: {
      sentiment: "Positive",
      dominant_emotions: ["hope", "gratitude", "calm"],
      keywords: ["grateful", "friends", "sunshine", "future"],
      summary: "Language patterns suggest a stable, positive emotional baseline with strong social connection cues.",
    },
    cv_insights: {
      visual_mood: "Bright & optimistic",
      color_palette: "Warm neutrals with soft blues",
      detected_patterns: ["open composition", "natural light", "social context"],
      summary: "Visual signals align with wellbeing markers: openness, warmth, and daylight tones.",
    },
    shap_data: {
      features: [
        { name: "Positive sentiment", contribution: 0.42 },
        { name: "Social references", contribution: 0.28 },
        { name: "Bright color palette", contribution: 0.18 },
        { name: "Future-oriented language", contribution: 0.12 },
      ],
      explanation: "Positive linguistic markers and warm visual composition are the strongest drivers of the low-risk assessment.",
    },
  },
  Stress: {
    nlp_insights: {
      sentiment: "Tense / pressured",
      dominant_emotions: ["overwhelm", "irritability", "fatigue"],
      keywords: ["deadline", "tired", "too much", "can't keep up"],
      summary: "Language centers on time pressure and overload without severe hopelessness — classic stress markers.",
    },
    cv_insights: {
      visual_mood: "Cluttered & fast",
      color_palette: "Warm reds and desaturated grays",
      detected_patterns: ["dense composition", "high contrast", "motion blur"],
      summary: "Visual features indicate a busy, high-arousal environment consistent with chronic stress.",
    },
    shap_data: {
      features: [
        { name: "Time-pressure vocabulary", contribution: 0.34 },
        { name: "Overload language", contribution: 0.26 },
        { name: "Warm high-arousal palette", contribution: 0.22 },
        { name: "Cluttered composition", contribution: 0.18 },
      ],
      explanation: "Time-pressure and overload signals dominate — stress rather than depressive withdrawal.",
    },
  },
  Anxiety: {
    nlp_insights: {
      sentiment: "Apprehensive",
      dominant_emotions: ["worry", "fear", "anticipation"],
      keywords: ["what if", "nervous", "worried", "can't stop thinking"],
      summary: "Language shows anticipatory worry loops and hypervigilance markers characteristic of anxiety.",
    },
    cv_insights: {
      visual_mood: "Restless & fragmented",
      color_palette: "Cool sharp tones",
      detected_patterns: ["asymmetric framing", "sharp edges", "focus jitter"],
      summary: "Visual composition suggests restlessness — sharp, off-balance framing typical of anxious states.",
    },
    shap_data: {
      features: [
        { name: "Anticipatory worry", contribution: 0.38 },
        { name: "Hypervigilance markers", contribution: 0.25 },
        { name: "Fragmented framing", contribution: 0.2 },
        { name: "Rumination loops", contribution: 0.17 },
      ],
      explanation: "Anticipatory worry and rumination loops are the strongest signals of anxiety over depression.",
    },
  },
  Bipolar: {
    nlp_insights: {
      sentiment: "Highly variable",
      dominant_emotions: ["euphoria", "irritability", "crash"],
      keywords: ["invincible", "amazing", "worst", "empty"],
      summary: "Language shows large emotional swings and grandiosity followed by collapse — bipolar-consistent patterns.",
    },
    cv_insights: {
      visual_mood: "Alternating extremes",
      color_palette: "Vivid saturation with dark contrasts",
      detected_patterns: ["extreme framing", "saturation spikes", "tonal inversion"],
      summary: "Visuals oscillate between hyper-saturated highs and dark lows — cyclical mood signature.",
    },
    shap_data: {
      features: [
        { name: "Mood swing amplitude", contribution: 0.36 },
        { name: "Grandiosity language", contribution: 0.22 },
        { name: "Crash markers", contribution: 0.2 },
        { name: "Saturation extremes", contribution: 0.14 },
        { name: "Sleep disruption cues", contribution: 0.08 },
      ],
      explanation: "Rapid oscillation between elevation and collapse across both text and imagery is the defining signal.",
    },
  },
  Depression: {
    nlp_insights: {
      sentiment: "Negative / withdrawn",
      dominant_emotions: ["hopelessness", "sadness", "isolation"],
      keywords: ["alone", "nothing", "can't", "empty"],
      summary: "Language contains multiple depression markers and social withdrawal cues. Professional support is recommended.",
    },
    cv_insights: {
      visual_mood: "Dark & withdrawn",
      color_palette: "Low-key, cold shadows",
      detected_patterns: ["obscured face", "low luminance", "confined space"],
      summary: "Visual composition mirrors linguistic distress: enclosed framing, cold shadow palette, low activation.",
    },
    shap_data: {
      features: [
        { name: "Hopelessness markers", contribution: 0.4 },
        { name: "Social isolation cues", contribution: 0.24 },
        { name: "Low-luminance imagery", contribution: 0.18 },
        { name: "Absolutist language", contribution: 0.12 },
        { name: "Withdrawal patterns", contribution: 0.06 },
      ],
      explanation: "Hopelessness and isolation markers dominate both text and visual channels, driving a high-risk classification.",
    },
  },
};

const DEMO_TEMPLATES: Record<Condition, Omit<AIRiskResult, "is_demo" | "risk_score" | "risk_level" | "condition">> = {
  ...CORE_TEMPLATES,
  Sadness: CORE_TEMPLATES.Depression,
  Neutral: CORE_TEMPLATES.Stable,
  "Anxiety (proxy: Fear)": CORE_TEMPLATES.Anxiety,
  Disgust: CORE_TEMPLATES.Stress,
};

function pickDemoCondition(text?: string): Condition {
  const t = (text ?? "").toLowerCase();
  if (/(hopeless|worthless|empty|can'?t go on|nothing matters|suicide|depress)/.test(t)) return "Depression";
  if (/(anxious|anxiety|panic|worried|nervous|what if|scared|fear)/.test(t)) return "Anxiety";
  if (/(bipolar|manic|invincible|crash|swing|high then low)/.test(t)) return "Bipolar";
  if (/(stress|deadline|overwhelmed|too much|pressure|burnt? ?out)/.test(t)) return "Stress";
  if (t.length > 0 && /(grateful|happy|excited|love|hope|calm|proud|good)/.test(t)) return "Stable";
  const pool: Condition[] = ["Stable", "Stress", "Anxiety", "Bipolar", "Depression"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function conditionToRisk(c: Condition): { level: RiskLevel; score: number } {
  switch (c) {
    case "Stable": return { level: "low", score: Math.round(12 + Math.random() * 18) };
    case "Stress": return { level: "medium", score: Math.round(40 + Math.random() * 15) };
    case "Anxiety": return { level: "medium", score: Math.round(48 + Math.random() * 18) };
    case "Bipolar": return { level: "high", score: Math.round(66 + Math.random() * 15) };
    case "Depression": return { level: "high", score: Math.round(72 + Math.random() * 22) };
    case "Sadness": return { level: "high", score: Math.round(72 + Math.random() * 22) };
    case "Neutral": return { level: "low", score: Math.round(12 + Math.random() * 18) };
    case "Anxiety (proxy: Fear)": return { level: "medium", score: Math.round(48 + Math.random() * 18) };
    case "Disgust": return { level: "medium", score: Math.round(40 + Math.random() * 15) };
  }
}

// Map FastAPI expression labels to app conditions
// Map FastAPI expression display_name to app condition (kept 1:1 with the 4 FER classes)
function displayNameToCondition(displayName: string): Condition {
  const d = displayName.trim();
  if (d === "Sadness" || d === "Neutral" || d === "Disgust" || d === "Anxiety (proxy: Fear)") {
    return d as Condition;
  }
  // Fallback by keyword if backend ever returns a slightly different name
  const l = d.toLowerCase();
  if (l.includes("fear") || l.includes("anx")) return "Anxiety (proxy: Fear)";
  if (l.includes("sad")) return "Sadness";
  if (l.includes("disgust")) return "Disgust";
  return "Neutral";
}

interface FerResponse {
  label: string;
  display_name: string;
  confidence: number;
  all_probs: Record<string, number>;
  disclaimer?: string;
}

async function callCvApi(imageUrl: string): Promise<AIRiskResult> {
  const data = (await analyzeFacialExpression({ data: { imageUrl } })) as FerResponse;

  const condition = displayNameToCondition(data.display_name || data.label);
  const { level } = conditionToRisk(condition);
  const score = Math.round(data.confidence * 100);
  const base = DEMO_TEMPLATES[condition];

  // Build SHAP-like features from all_probs
  const features = Object.entries(data.all_probs)
    .sort((a, b) => b[1] - a[1])
    .map(([name, contribution]) => ({ name, contribution: Number(contribution.toFixed(4)) }));

  return {
    ...base,
    condition,
    risk_level: level,
    risk_score: score,
    cv_insights: {
      ...base.cv_insights,
      summary: `Facial expression classified as "${data.display_name}" with ${(data.confidence * 100).toFixed(1)}% confidence. ${data.disclaimer ?? ""}`.trim(),
    },
    shap_data: {
      features,
      explanation: `Facial expression model predicted "${data.display_name}" as the dominant signal.`,
    },
    is_demo: false,
  };
}

export async function fetchAIRisk(input: AIRiskInput): Promise<AIRiskResult> {
  // Real CV via Lovable AI when we have an uploaded image URL and mode uses vision
  if (input.imageUrl && input.mode === "cv") {
    try {
      return await callCvApi(input.imageUrl);
    } catch (err) {
      console.error("CV API failed:", err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }



  // Demo mode (NLP not wired yet)
  await new Promise((r) => setTimeout(r, 1500));
  const condition = pickDemoCondition(input.text);
  const { level, score } = conditionToRisk(condition);
  const base = DEMO_TEMPLATES[condition];
  return { ...base, condition, risk_level: level, risk_score: score, is_demo: true };
}

