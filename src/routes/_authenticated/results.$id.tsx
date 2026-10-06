import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RiskMeter, riskColor } from "@/components/RiskMeter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Image as ImageIcon, Lightbulb, HeartPulse, Sparkles } from "lucide-react";
import type { RiskLevel, AIRiskResult, Condition } from "@/lib/ai-risk";
import { conditionEmoji, riskEmoji, conditionLabel } from "@/lib/ai-risk";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/results/$id")({
  head: () => ({ meta: [{ title: "Analysis result — MindGuard AI" }] }),
  component: ResultsPage,
});

interface Row {
  id: string;
  created_at: string;
  text_content: string | null;
  image_url: string | null;
  risk_level: RiskLevel;
  risk_score: number | null;
  condition: Condition | null;
  nlp_insights: AIRiskResult["nlp_insights"] | null;
  cv_insights: AIRiskResult["cv_insights"] | null;
  shap_data: AIRiskResult["shap_data"] | null;
  is_demo: boolean;
}

function ResultsPage() {
  const { t } = useLang();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("analyses").select("*").eq("id", id).maybeSingle();
      setRow(data as Row | null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-muted-foreground">{t("results.loading")}</div>;
  if (!row) return <div className="p-8">{t("results.notFound")}</div>;

  const level = row.risk_level;
  const score = row.risk_score ?? (level === "low" ? 20 : level === "medium" ? 55 : 82);
  const condition = (row.condition ?? "Stable") as Condition;
  const nlp = row.nlp_insights;
  const cv = row.cv_insights;
  const shap = row.shap_data;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })} className="gap-2">
          <ArrowLeft className="size-4" /> {t("results.back")}
        </Button>
        {row.is_demo && (
          <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent border border-accent/30">{t("results.demo")}</span>
        )}
      </div>

      {/* Condition banner */}
      <div className="relative rounded-3xl overflow-hidden glass-strong p-6 md:p-8">
        <div className="absolute -top-16 -right-16 size-64 rounded-full opacity-30 blur-3xl" style={{ background: riskColor(level) }} />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="text-7xl md:text-8xl leading-none animate-float" aria-hidden>
            {conditionEmoji(condition)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("results.pattern")}</div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mt-1">
              {conditionLabel(condition)}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-dark">
                <span>{riskEmoji(level)}</span>
                <span>{t(`dash.risk.${level}`)} {t("results.risk")}</span>
              </span>
              <span className="text-muted-foreground">{t("results.score")} {Number(score)}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded image */}
      {row.image_url && (
        <div className="relative rounded-3xl overflow-hidden glass p-4 group">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-2">{t("results.uploaded")}</div>
          <div className="relative rounded-2xl overflow-hidden bg-black/5">
            <img
              src={row.image_url}
              alt=""
              className="w-full max-h-[520px] object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full glass-dark text-white text-xs flex items-center gap-1.5">
              <ImageIcon className="size-3" /> {t("results.cvInput")}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-3xl p-6 md:col-span-1">
          <div className="text-sm text-muted-foreground mb-2">{t("results.meter")}</div>
          <RiskMeter level={level} score={Number(score)} />
          <p className="text-xs text-muted-foreground text-center mt-4">
            {level === "low" && t("results.lowNote")}
            {level === "medium" && t("results.medNote")}
            {level === "high" && t("results.highNote")}
          </p>
        </div>

        <div className="glass rounded-3xl p-6 md:col-span-2 space-y-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="size-4 text-accent" /> {t("results.insights")}</div>

          {nlp && (
            <div>
              <div className="flex items-center gap-2 font-medium"><MessageSquare className="size-4 text-primary" /> {t("results.nlp")}</div>
              <p className="text-sm text-muted-foreground mt-1">{nlp.summary}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full glass-dark">{t("results.sentiment")}: {nlp.sentiment}</span>
                {nlp.dominant_emotions.map((e) => (
                  <span key={e} className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">{e}</span>
                ))}
              </div>
            </div>
          )}
          {cv && (
            <div>
              <div className="flex items-center gap-2 font-medium"><ImageIcon className="size-4 text-accent" /> {t("results.cv")}</div>
              <p className="text-sm text-muted-foreground mt-1">{cv.summary}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full glass-dark">{t("results.mood")}: {cv.visual_mood}</span>
                <span className="text-xs px-2 py-1 rounded-full glass-dark">{t("results.palette")}: {cv.color_palette}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {shap && (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Lightbulb className="size-4 text-accent" /> {t("results.shap")}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{shap.explanation}</p>
          <div className="space-y-3">
            {shap.features.map((f, i) => (
              <div key={f.name} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-up">
                <div className="flex justify-between text-sm mb-1">
                  <span>{f.name}</span>
                  <span className="text-muted-foreground">{Math.round(f.contribution * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${f.contribution * 100}%`, background: `linear-gradient(90deg, var(--aurora-cyan), ${riskColor(level)})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeartPulse className="size-6 text-accent" />
          <div>
            <div className="font-semibold">{t("results.next")}</div>
            <p className="text-sm text-muted-foreground">{t("results.nextSub")}</p>
          </div>
        </div>
        <Link to="/resources">
          <Button className="gradient-primary text-white border-0 glow hover:scale-105 transition-transform">
            {t("results.viewres")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
