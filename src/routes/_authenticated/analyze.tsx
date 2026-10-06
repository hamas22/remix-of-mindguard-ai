import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, X, Sparkles, Loader2, Brain, MessageSquare, Image as ImageIcon, ArrowLeft, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchAIRisk } from "@/lib/ai-risk";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { VoiceAgent } from "@/components/VoiceAgent";
import modeNlp from "@/assets/mode-nlp.jpg";
import modeCv from "@/assets/mode-cv.jpg";


export const Route = createFileRoute("/_authenticated/analyze")({
  head: () => ({ meta: [{ title: "Analyze — MindGuard AI" }] }),
  component: AnalyzePage,
});

type Mode = "nlp" | "cv" | "voice";

const MODES: {
  id: Mode;
  label: string;
  shortKey: string;
  taglineKey: string;
  descKey: string;
  image: string;
  icon: typeof MessageSquare;
  accent: string;
}[] = [
  {
    id: "nlp",
    label: "NLP",
    shortKey: "an.nlpTag",
    taglineKey: "an.nlpTag2",
    descKey: "an.nlpDesc",
    image: modeNlp,
    icon: MessageSquare,
    accent: "from-[oklch(0.42_0.12_355)] to-[oklch(0.6_0.13_355)]",
  },
  {
    id: "cv",
    label: "CV",
    shortKey: "an.cvTag",
    taglineKey: "an.cvTag2",
    descKey: "an.cvDesc",
    image: modeCv,
    icon: ImageIcon,
    accent: "from-[oklch(0.6_0.13_355)] to-[oklch(0.72_0.09_20)]",
  },
  {
    id: "voice",
    label: "Voice",
    shortKey: "an.voiceTag",
    taglineKey: "an.voiceTag2",
    descKey: "an.voiceDesc",
    image: modeNlp,
    icon: Mic,
    accent: "from-[oklch(0.55_0.14_280)] to-[oklch(0.7_0.12_320)]",
  },
];


function AnalyzePage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode | null>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error(t("an.errImgFile"));
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = async () => {
    if (!mode) return;
    if (mode !== "cv" && !text.trim()) {
      toast.error(t("an.errText"));
      return;
    }
    if (mode !== "nlp" && !file) {
      toast.error(t("an.errImg"));
      return;
    }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user!.id;

      let imageUrl: string | null = null;
      if (file) {
        const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("analysis-images").upload(path, file);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage.from("analysis-images").createSignedUrl(path, 60 * 60 * 24 * 365);
        imageUrl = signed?.signedUrl ?? path;
      }

      const result = await fetchAIRisk({ text: mode === "cv" ? "" : text, imageUrl: imageUrl ?? undefined, imageFile: file ?? undefined, mode: mode === "voice" ? "nlp" : mode });

      const { data: inserted, error: insErr } = await supabase.from("analyses").insert({
        user_id: userId,
        text_content: mode === "cv" ? null : (text || null),
        image_url: imageUrl,
        risk_level: result.risk_level,
        risk_score: result.risk_score,
        condition: result.condition,
        nlp_insights: result.nlp_insights,
        cv_insights: result.cv_insights,
        shap_data: result.shap_data,
        is_demo: result.is_demo,
        mode,
      }).select("id").single();
      if (insErr) throw insErr;

      navigate({ to: "/results/$id", params: { id: inserted.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("an.errFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative size-40">
          <div className="absolute inset-0 rounded-full gradient-primary opacity-30 animate-ping" />
          <div className="absolute inset-4 rounded-full gradient-primary opacity-40 blur-xl animate-pulse-glow" />
          <div className="absolute inset-8 rounded-full glass-strong flex items-center justify-center">
            <Brain className="size-14 text-white animate-pulse" />
          </div>
        </div>
        <p className="mt-10 text-xl font-medium">{t("an.reading")}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "nlp" && t("an.subNlp")}
          {mode === "cv" && t("an.subCv")}
        </p>
      </div>
    );
  }

  // Mode selection screen
  if (!mode) {
    return (
      <div className="space-y-10 animate-fade-up">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs mb-5">
            <Sparkles className="size-3.5 text-accent" />
            <span className="text-muted-foreground">{t("an.choose")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {t("an.howread")} <span className="text-gradient">{t("an.read")}</span> {t("an.youtoday")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t("an.three")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {MODES.map((m, i) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{ animationDelay: `${i * 120}ms` }}
                className="group relative aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden text-left animate-fade-up transition-all duration-500 hover:-translate-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Image */}
                <img
                  src={m.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />

                {/* Dark transparent overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/85" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${m.accent} opacity-0 group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen`} />

                {/* Aurora border on hover */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500" />
                <div className={`absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${m.accent} blur-2xl -z-10`} />

                {/* Shimmer sweep */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1200 ease-out" />
                </div>

                {/* Big label overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <div className="size-11 rounded-2xl glass-dark flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="size-5 text-white" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60 group-hover:text-white/90 transition">
                      {t("an.mode")} {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div>
                    <div className="text-white/60 text-sm uppercase tracking-widest mb-1 group-hover:text-white/80 transition">
                      {t(m.shortKey)}
                    </div>
                    <h3
                      className="font-display text-6xl md:text-7xl font-bold text-white leading-none tracking-tight"
                      style={{ textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}
                    >
                      {m.label}
                    </h3>
                    <p className="mt-3 text-sm text-white/70 group-hover:text-white transition">
                      {t(m.taglineKey)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-white/90 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <span>{t("an.choosebtn")}</span>
                      <span aria-hidden>→</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Input screen for the chosen mode
  const active = MODES.find((m) => m.id === mode)!;
  const ActiveIcon = active.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setMode(null); clearFile(); setText(""); }} className="gap-2 -ml-2">
          <ArrowLeft className="size-4" /> {t("an.change")}
        </Button>
        <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <ActiveIcon className="size-3.5 text-accent" />
          <span className="text-muted-foreground">
            {t(active.shortKey)} · <span className="text-foreground font-medium">{active.label}</span>
          </span>
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden">
        <img src={active.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-background" />
        <div className="relative p-8 md:p-12">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white">
            <span className="text-gradient">{active.label}</span> · {t(active.taglineKey)}
          </h1>
          <p className="mt-3 text-white/70 max-w-lg">
            {t(active.descKey)}
          </p>
        </div>
      </div>

      {mode === "voice" ? (
        <VoiceAgent />
      ) : (
        <div className="glass-strong rounded-3xl p-6 space-y-5">
          {mode !== "cv" && (
            <div>
              <label className="text-sm font-medium">{t("an.yourtext")}</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("an.textph")}
                className="mt-2 min-h-40 resize-none bg-background/40 border-white/10"
                maxLength={4000}
              />
              <div className="mt-1 text-xs text-muted-foreground text-right">{text.length}/4000</div>
            </div>
          )}

          {mode !== "nlp" && (
            <div>
              <label className="text-sm font-medium">{t("an.imglabel")}</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                onClick={() => inputRef.current?.click()}
                className={`mt-2 relative rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  dragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-white/15 bg-background/30 hover:border-white/30 hover:bg-background/50"
                }`}
              >
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                {preview ? (
                  <div className="relative p-3">
                    <img src={preview} alt="preview" className="mx-auto max-h-72 rounded-xl object-contain" />
                    <Button size="sm" variant="secondary" className="absolute top-4 right-4 gap-1" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                      <X className="size-3.5" /> {t("an.remove")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="size-12 rounded-2xl gradient-primary-soft flex items-center justify-center mb-3 glow">
                      <UploadCloud className="size-6 text-white" />
                    </div>
                    <p className="font-medium">{t("an.drag")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("an.orclick")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {t("an.demo")} <span className="text-accent font-medium">{t("an.demoMode")}</span>
            </p>
            <Button size="lg" onClick={analyze} className="gap-2 gradient-primary text-white border-0 hover:scale-105 transition-transform glow">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {t("an.analyze")}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
