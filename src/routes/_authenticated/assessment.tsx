import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/assessment")({
  head: () => ({ meta: [{ title: "Self-Assessment (PHQ-9) — MindGuard AI" }] }),
  component: AssessmentPage,
});

const QUESTION_KEYS = [
  "as.q1","as.q2","as.q3","as.q4","as.q5","as.q6","as.q7","as.q8","as.q9",
];

const OPTION_KEYS = [
  { key: "as.o1", value: 0 },
  { key: "as.o2", value: 1 },
  { key: "as.o3", value: 2 },
  { key: "as.o4", value: 3 },
];

function categorize(score: number): { label: string; tone: string; blurbKey: string; labelKey: string } {
  if (score <= 4) return { label: "Minimal", labelKey: "as.cat.minimal", tone: "oklch(0.72 0.09 155)", blurbKey: "as.blurb.minimal" };
  if (score <= 9) return { label: "Mild", labelKey: "as.cat.mild", tone: "oklch(0.75 0.12 90)", blurbKey: "as.blurb.mild" };
  if (score <= 14) return { label: "Moderate", labelKey: "as.cat.moderate", tone: "oklch(0.7 0.14 55)", blurbKey: "as.blurb.moderate" };
  if (score <= 19) return { label: "Moderately Severe", labelKey: "as.cat.modsev", tone: "oklch(0.65 0.16 35)", blurbKey: "as.blurb.modsev" };
  return { label: "Severe", labelKey: "as.cat.severe", tone: "oklch(0.6 0.17 25)", blurbKey: "as.blurb.severe" };
}

function AssessmentPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(QUESTION_KEYS.length).fill(-1));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);

  const total = QUESTION_KEYS.length;
  const progress = ((step + (done ? 1 : 0)) / total) * 100;
  const currentAnswer = answers[step];

  const select = (v: number) => {
    const next = [...answers];
    next[step] = v;
    setAnswers(next);
  };

  const goNext = () => {
    if (currentAnswer < 0) return;
    if (step < total - 1) setStep(step + 1);
    else finish();
  };
  const goBack = () => step > 0 && setStep(step - 1);

  const finish = async () => {
    setSaving(true);
    const score = answers.reduce((a, b) => a + Math.max(0, b), 0);
    const cat = categorize(score);
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      const { error } = await supabase.from("assessments" as any).insert({
        user_id: user.user.id,
        test_type: "PHQ-9",
        score,
        category: cat.label,
        answers,
      } as any);
      if (error) toast.error(error.message);
    }
    setSavedScore(score);
    setDone(true);
    setSaving(false);
  };

  if (done && savedScore !== null) {
    const cat = categorize(savedScore);
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.32 0.13 355) 0%, oklch(0.42 0.14 355) 55%, oklch(0.6 0.13 355) 100%)",
          }}
        >
          <div className="absolute -right-16 -top-16 size-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="mx-auto size-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4">
              <Heart className="size-8" />
            </div>
            <p className="text-sm text-white/80 uppercase tracking-[0.2em]">{t("as.result")}</p>
            <h1 className="text-4xl sm:text-5xl font-semibold mt-3">{savedScore} / 27</h1>
            <div
              className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold bg-white"
              style={{ color: cat.tone }}
            >
              {t(cat.labelKey)}
            </div>
            <p className="mt-5 text-white/90 max-w-md mx-auto text-sm leading-relaxed">
              {t("as.thanks")} {t(cat.blurbKey)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-white text-sm font-medium"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.35 0.13 355), oklch(0.55 0.14 355))",
            }}
          >
            <Sparkles className="size-4" /> {t("as.backDash")}
          </button>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-white border border-primary/15 hover:border-primary/30 transition-all"
          >
            {t("as.exploreRes")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" /> {t("as.back")}
      </Link>

      <div>
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>{t("as.qOf").replace("{n}", String(step + 1)).replace("{t}", String(total))}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, oklch(0.42 0.14 355), oklch(0.6 0.13 355))",
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-primary/15 shadow-[0_4px_16px_-8px_oklch(0.42_0.12_355_/_0.15)] p-6 sm:p-8 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.18em] text-primary/80 font-semibold">
          {t("as.header")}
        </p>
        <h2
          className="mt-3 text-xl sm:text-2xl font-semibold text-foreground leading-snug"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-serif, Georgia, serif' }}
        >
          {t(QUESTION_KEYS[step])}
        </h2>

        <div className="mt-6 space-y-2.5">
          {OPTION_KEYS.map((opt) => {
            const active = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`w-full text-left rtl:text-right px-4 py-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  active
                    ? "border-primary bg-primary/[0.06] shadow-[0_6px_20px_-10px_oklch(0.42_0.12_355_/_0.4)]"
                    : "border-primary/15 bg-white hover:border-primary/40 hover:bg-primary/[0.02]"
                }`}
              >
                <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>
                  {t(opt.key)}
                </span>
                {active && <CheckCircle2 className="size-5 text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="size-4" /> {t("as.back2")}
          </button>
          <button
            onClick={goNext}
            disabled={currentAnswer < 0 || saving}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.35 0.13 355), oklch(0.55 0.14 355))",
            }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {step === total - 1 ? t("as.seeResult") : t("as.next")}
            {!saving && <ArrowRight className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
