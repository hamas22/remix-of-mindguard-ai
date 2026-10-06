import { createFileRoute } from "@tanstack/react-router";
import { Phone, Wind, Users, BookOpen, HeartPulse, AlertTriangle, Sparkles, Sun } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/resources")({
  head: () => ({ meta: [{ title: "Resources — MindGuard AI" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { t } = useLang();

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12"
        style={{
          background: "linear-gradient(135deg, oklch(0.96 0.03 295) 0%, oklch(0.97 0.02 200) 100%)",
        }}
      >
        <div className="absolute -top-24 -right-16 size-72 rounded-full opacity-40 blur-3xl gradient-primary" />
        <div className="absolute -bottom-20 -left-10 size-56 rounded-full opacity-30 blur-3xl" style={{ background: "var(--aurora-cyan)" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs mb-4">
            <Sparkles className="size-3.5 text-accent" />
            <span className="text-muted-foreground">{t("res.gentle")}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            {t("res.title")}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">{t("res.subtitle")}</p>
        </div>
      </div>

      {/* Crisis strip */}
      <div className="relative">
        <div
          className="relative overflow-hidden p-6 md:p-8"
          style={{
            borderRadius: "2rem 4rem 2rem 4rem",
            background: "linear-gradient(135deg, oklch(0.96 0.06 20) 0%, oklch(0.98 0.03 20) 100%)",
            boxShadow: "0 20px 60px -20px oklch(0.6 0.24 20 / 0.35)",
          }}
        >
          <div className="absolute -right-10 -top-10 size-40 rounded-full opacity-20" style={{ background: "var(--risk-high)" }} />
          <div className="relative flex items-start gap-4">
            <div className="size-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--risk-high)", color: "white" }}>
              <AlertTriangle className="size-6" />
            </div>
            <div className="flex-1">
              <div className="font-display text-2xl font-semibold" style={{ color: "var(--risk-high)" }}>
                {t("res.crisis")}
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {t("res.crisisNote")} — {t("res.crisis247")}
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  { name: "988 Suicide & Crisis (US)", num: "988" },
                  { name: "Samaritans (UK & IE)", num: "116 123" },
                  { name: "Egypt · مصر", num: "08008880700" },
                ].map((c, i) => (
                  <div
                    key={c.name}
                    className="group relative overflow-hidden rounded-2xl bg-white/70 p-3 border border-white/60 hover:-translate-y-1 transition-all duration-300"
                    style={{ borderRadius: i % 2 === 0 ? "1.5rem 0.75rem 1.5rem 0.75rem" : "0.75rem 1.5rem 0.75rem 1.5rem" }}
                  >
                    <div className="text-xs text-muted-foreground">{c.name}</div>
                    <div className="font-semibold flex items-center gap-1.5 mt-1">
                      <Phone className="size-3.5 text-destructive" /> {c.num}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-6 gap-4">
        <CreativeCard
          className="md:col-span-3"
          shape="1.5rem 3rem 1.5rem 3rem"
          gradient="linear-gradient(135deg, oklch(0.94 0.08 165) 0%, oklch(0.98 0.04 200) 100%)"
          accent="var(--risk-low)"
          icon={Wind}
          badge={t("res.min2")}
          title={t("res.breath.title")}
          subtitle={t("res.breath.sub")}
        >
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            <li>{t("res.breath.s1")} <strong className="text-foreground">{t("res.breath.sec4")}</strong>.</li>
            <li>{t("res.breath.s2")} <strong className="text-foreground">{t("res.breath.sec7")}</strong>.</li>
            <li>{t("res.breath.s3")} <strong className="text-foreground">{t("res.breath.sec8")}</strong>.</li>
            <li>{t("res.breath.s4")}</li>
          </ol>
        </CreativeCard>

        <CreativeCard
          className="md:col-span-3"
          shape="3rem 1.5rem 3rem 1.5rem"
          gradient="linear-gradient(135deg, oklch(0.95 0.06 75) 0%, oklch(0.97 0.03 340) 100%)"
          accent="var(--risk-medium)"
          icon={HeartPulse}
          badge={t("res.grounding")}
          title={t("res.senses.title")}
          subtitle={t("res.senses.sub")}
        >
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { n: "5", w: t("res.senses.see") },
              { n: "4", w: t("res.senses.touch") },
              { n: "3", w: t("res.senses.hear") },
              { n: "2", w: t("res.senses.smell") },
              { n: "1", w: t("res.senses.taste") },
            ].map((s, i) => (
              <div
                key={s.n}
                className="rounded-2xl bg-white/70 p-3 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="font-display text-2xl font-semibold text-gradient">{s.n}</div>
                <div className="text-muted-foreground mt-0.5">{s.w}</div>
              </div>
            ))}
          </div>
        </CreativeCard>

        <CreativeCard
          className="md:col-span-2"
          shape="2rem"
          gradient="linear-gradient(135deg, oklch(0.94 0.08 295) 0%, oklch(0.97 0.04 340) 100%)"
          accent="var(--aurora-violet)"
          icon={Users}
          badge={t("res.connect")}
          title={t("res.msg.title")}
          subtitle={t("res.msg.sub")}
        >
          <p className="text-sm text-muted-foreground">{t("res.msg.body")}</p>
        </CreativeCard>

        <CreativeCard
          className="md:col-span-2"
          shape="3rem 3rem 1rem 1rem"
          gradient="linear-gradient(135deg, oklch(0.94 0.08 200) 0%, oklch(0.97 0.04 295) 100%)"
          accent="var(--aurora-cyan)"
          icon={Sun}
          badge={t("res.daily")}
          title={t("res.light.title")}
          subtitle={t("res.light.sub")}
        >
          <p className="text-sm text-muted-foreground">{t("res.light.body")}</p>
        </CreativeCard>

        <CreativeCard
          className="md:col-span-2"
          shape="1rem 1rem 3rem 3rem"
          gradient="linear-gradient(135deg, oklch(0.95 0.05 340) 0%, oklch(0.97 0.03 295) 100%)"
          accent="var(--aurora-magenta)"
          icon={BookOpen}
          badge={t("res.read")}
          title={t("res.evi.title")}
          subtitle={t("res.evi.sub")}
        >
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex gap-2"><span className="text-accent">›</span> {t("res.evi.1")}</li>
            <li className="flex gap-2"><span className="text-accent">›</span> {t("res.evi.2")}</li>
            <li className="flex gap-2"><span className="text-accent">›</span> {t("res.evi.3")}</li>
          </ul>
        </CreativeCard>
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        {t("res.disclaimer")}
      </p>
    </div>
  );
}

function CreativeCard({
  className = "",
  shape,
  gradient,
  accent,
  icon: Icon,
  badge,
  title,
  subtitle,
  children,
}: {
  className?: string;
  shape: string;
  gradient: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden p-6 hover:-translate-y-1 transition-all duration-500 ${className}`}
      style={{
        borderRadius: shape,
        background: gradient,
        boxShadow: `0 20px 60px -25px ${accent}55`,
      }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-16 -right-16 size-40 rounded-full opacity-30 blur-2xl group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className="size-11 rounded-2xl flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
            style={{ background: accent, boxShadow: `0 8px 20px -6px ${accent}` }}
          >
            <Icon className="size-5" />
          </div>
          <span
            className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm font-medium"
            style={{ color: accent }}
          >
            {badge}
          </span>
        </div>
        <div className="font-display text-2xl font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mb-3">{subtitle}</div>
        {children}
      </div>
    </div>
  );
}
