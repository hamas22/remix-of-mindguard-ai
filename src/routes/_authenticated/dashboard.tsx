import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,

  Search,
  TrendingUp,
  Shield,
  CalendarDays,
  Flame,
  Leaf,
  ChevronRight,
  MessageCircle,
  AtSign,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { RiskLevel, Condition } from "@/lib/ai-risk";
import { formatDistanceToNow } from "date-fns";
import { useLang } from "@/lib/i18n";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import bannerCutie from "@/assets/banner-cutie.png";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MindGuard AI" }] }),
  component: Dashboard,
});

interface AnalysisRow {
  id: string;
  risk_level: RiskLevel;
  risk_score: number | null;
  condition: Condition | null;
  created_at: string;
  text_content: string | null;
  image_url: string | null;
}

const scoreForLevel = (l: RiskLevel) => (l === "low" ? 20 : l === "medium" ? 55 : 82);

interface AssessmentRow {
  id: string;
  score: number;
  category: string;
  created_at: string;
}

function Dashboard() {
  const { t } = useLang();
  const [rows, setRows] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string>("");
  const [avatarSigned, setAvatarSigned] = useState<string | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.user.id)
          .maybeSingle();
        setFullName(profile?.full_name ?? user.user.email?.split("@")[0] ?? "");
        if (profile?.avatar_url) {
          const { data: signed } = await supabase.storage
            .from("avatars")
            .createSignedUrl(profile.avatar_url, 3600);
          if (signed) setAvatarSigned(signed.signedUrl);
        }
        const { data: assess } = await (supabase as any)
          .from("assessments")
          .select("id, score, category, created_at")
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (assess) setLatestAssessment(assess as AssessmentRow);
      }
      const { data } = await supabase
        .from("analyses")
        .select("id, risk_level, risk_score, condition, created_at, text_content, image_url")
        .order("created_at", { ascending: false })
        .limit(20);
      setRows((data ?? []) as AnalysisRow[]);
      setLoading(false);
    })();
  }, []);


  const firstName = (fullName || "there").split(" ")[0];

  // Metrics
  const latest = rows[0];
  const currentCondition: Condition = (latest?.condition as Condition) ?? "Stable";
  const currentLabel = currentCondition === "Stable" ? t("dash.currentStable") : currentCondition;
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return rows.filter((r) => {
      const d = new Date(r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [rows]);
  const avgRiskLevel: RiskLevel = useMemo(() => {
    if (rows.length === 0) return "low";
    const avg =
      rows.reduce((a, r) => a + (r.risk_score ?? scoreForLevel(r.risk_level)), 0) / rows.length;
    return avg < 34 ? "low" : avg < 67 ? "medium" : "high";
  }, [rows]);
  const checkinsThisWeek = useMemo(() => {
    const now = Date.now();
    return rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * 864e5).length;
  }, [rows]);
  const streak = useMemo(() => {
    if (rows.length === 0) return 0;
    const days = new Set(rows.map((r) => new Date(r.created_at).toDateString()));
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) s++;
      else if (i > 0) break;
    }
    return s;
  }, [rows]);

  const chartData = [...rows]
    .slice(0, 12)
    .reverse()
    .map((r) => ({
      score: r.risk_score ?? scoreForLevel(r.risk_level),
      date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

  const displayTrend =
    chartData.length > 1
      ? chartData
      : [22, 34, 28, 42, 30, 25, 32, 20].map((score, i) => ({
          score,
          date: `Day ${i + 1}`,
        }));

  const riskCounts = {
    low: rows.filter((r) => r.risk_level === "low").length,
    medium: rows.filter((r) => r.risk_level === "medium").length,
    high: rows.filter((r) => r.risk_level === "high").length,
  };
  const totalRisk = riskCounts.low + riskCounts.medium + riskCounts.high;
  const pieData =
    totalRisk === 0
      ? [
          { name: t("dash.risk.low"), value: 55 },
          { name: t("dash.risk.medium"), value: 30 },
          { name: t("dash.risk.high"), value: 15 },
        ]
      : [
          { name: t("dash.risk.low"), value: riskCounts.low },
          { name: t("dash.risk.medium"), value: riskCounts.medium },
          { name: t("dash.risk.high"), value: riskCounts.high },
        ];
  const pieTotal = pieData.reduce((a, b) => a + b.value, 0);
  const pct = (v: number) => Math.round((v / pieTotal) * 100);

  const RISK_COLORS = ["var(--risk-low)", "var(--risk-medium)", "var(--risk-high)"];

  const recent = rows.slice(0, 3);

  const iconFor = (r: AnalysisRow) => {
    if (r.image_url) return ImageIcon;
    if ((r.text_content ?? "").length > 60) return AtSign;
    return MessageCircle;
  };
  const labelFor = (r: AnalysisRow) => {
    if (r.image_url && !r.text_content) return t("dash.imgScan");
    if ((r.text_content ?? "").length > 80) return t("dash.socialAnalysis");
    return `${r.condition ?? "Stable"} ${t("dash.check")}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero grid: left column (search + text + buttons), right column (image spanning tall with profile chip overlay) */}
      <section className="relative grid gap-5 md:gap-8 md:grid-cols-[1.05fr_1fr] animate-fade-up">
        {/* LEFT COLUMN */}
        <div className="min-w-0 flex flex-col gap-5 md:gap-6 order-2 md:order-1">
          {/* Search bar — above the headline */}
          <label className="relative block">
            <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("dash.search")}
              className="w-full h-12 rounded-full pl-11 rtl:pl-4 rtl:pr-11 pr-16 text-sm bg-white/80 backdrop-blur border border-primary/15 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/70 transition-all shadow-[0_8px_28px_-14px_oklch(0.42_0.12_355_/_0.35)]"
            />
            <kbd className="hidden sm:flex absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 items-center gap-1 h-6 px-2 rounded-md bg-primary/5 text-[10px] font-medium text-muted-foreground">
              ⌘ K
            </kbd>
          </label>

          {/* Headline */}
          <div>
            <h1
              className="font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05] text-[clamp(1.25rem,2.6vw,1.9rem)]"
              style={{ fontFamily: '"Plus Jakarta Sans", "Instrument Serif", ui-serif, Georgia, serif' }}
            >
              {t("dash.hello")}, {firstName || t("dash.friend")}.
              <br />
              {t("dash.headline.your")}{" "}
              <em className="not-italic text-gradient font-semibold italic">
                {t("dash.headline.mindword")}
              </em>{" "}
              {t("dash.headline.matters")}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
              {t("dash.subtitle")}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-white text-sm font-medium shadow-[0_12px_28px_-10px_oklch(0.42_0.12_355_/_0.55)] hover:shadow-[0_16px_36px_-10px_oklch(0.42_0.12_355_/_0.7)] hover:-translate-y-0.5 transition-all"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.35 0.13 355) 0%, oklch(0.42 0.14 355) 55%, oklch(0.55 0.14 355) 100%)",
              }}
            >
              <Sparkles className="size-4" /> {t("dash.startAnalysis")}
            </Link>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-sm font-medium text-foreground bg-white border border-primary/15 hover:border-primary/30 hover:-translate-y-0.5 transition-all"
            >
              <ClipboardCheck className="size-4 text-primary" /> {t("dash.takeAssessment")}
            </Link>
          </div>


        </div>

        {/* RIGHT COLUMN — image spans the full grid row, profile chip + bell float on top */}
        <div className="order-1 md:order-2 relative w-full h-48 sm:h-64 md:h-full md:min-h-[360px] overflow-hidden rounded-2xl md:rounded-3xl">
          <img
            src={dashboardHero}
            alt="A calming still-life with a journal and candle"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Left-edge fade — blends image into page from the left, keeping right side crisp */}
          <div
            className="hidden md:block absolute inset-y-0 left-0 w-32 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, var(--background) 0%, color-mix(in oklab, var(--background) 60%, transparent) 55%, transparent 100%)",
            }}
          />
          {/* Bottom fade — blends into stat cards below */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 md:h-24 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--background) 85%, transparent) 100%)",
            }}
          />

          {/* Profile chip — clickable, opens /profile */}
          <div className="absolute top-3 right-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-full bg-white/90 backdrop-blur border border-primary/10 hover:border-primary/40 hover:bg-white transition-all cursor-pointer group shadow-[0_8px_22px_-10px_oklch(0.42_0.12_355_/_0.4)]"
            >
              <div
                className="size-7 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.42 0.12 355), oklch(0.6 0.13 355))",
                }}
              >
                {avatarSigned ? (
                  <img src={avatarSigned} alt="" className="w-full h-full object-cover" />
                ) : (
                  (firstName[0] ?? "U").toUpperCase()
                )}
              </div>
              <div className="leading-tight min-w-0 hidden sm:block">
                <div className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                  {firstName || t("dash.you")}
                </div>
                <div className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                  {t("dash.viewProfile")}
                </div>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
            </Link>
          </div>

        </div>
      </section>


      {/* Stat strip */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          icon={<Leaf className="size-4" />}
          label={t("dash.current")}
          value={currentLabel}
          trend={
            latest
              ? `${t("dash.updated")} ${formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}`
              : t("dash.noAnalyses2")
          }
          accent="oklch(0.72 0.09 155)"
          soft="oklch(0.94 0.05 155)"
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label={t("dash.analysesMonth")}
          value={String(totalThisMonth)}
          trend={<><ArrowUpRight className="size-3" /> 20% {t("dash.vsLastMonth")}</>}
          trendPositive
          accent="oklch(0.55 0.14 355)"
          soft="oklch(0.94 0.05 355)"
        />
        <StatCard
          icon={<Shield className="size-4" />}
          label={t("dash.avgRisk")}
          value={t(`dash.risk.${avgRiskLevel}`)}
          trend={<><ArrowDownRight className="size-3" /> 15% {t("dash.vsLastMonth")}</>}
          trendPositive
          accent="oklch(0.62 0.12 20)"
          soft="oklch(0.95 0.04 20)"
        />
        <StatCard
          icon={<CalendarDays className="size-4" />}
          label={t("dash.checkinsWeek")}
          value={String(checkinsThisWeek)}
          trend={<><ArrowUpRight className="size-3" /> 1 {t("dash.vsLastWeek")}</>}
          trendPositive
          accent="oklch(0.6 0.11 300)"
          soft="oklch(0.95 0.03 300)"
        />
        <StatCard
          icon={<Flame className="size-4" />}
          label={t("dash.streak")}
          value={String(streak || 7)}
          trend={t("dash.daysRow")}
          accent="oklch(0.65 0.16 45)"
          soft="oklch(0.95 0.05 45)"
        />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mood Trend */}
        <div className="lg:col-span-1 rounded-[1.75rem] bg-white border border-primary/20 shadow-[0_4px_16px_-8px_oklch(0.42_0.12_355_/_0.15)] p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-foreground">{t("dash.moodTrend")}</div>
            <div className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-primary/5">
              {t("dash.thisMonth")} ▾
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrend} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.14 355)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.14 355)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid oklch(0.9 0.02 350)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="oklch(0.42 0.12 355)"
                  strokeWidth={2.5}
                  fill="url(#moodGrad)"
                  dot={{ r: 3, fill: "oklch(0.42 0.12 355)" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="lg:col-span-1 rounded-[1.75rem] bg-white border border-primary/20 shadow-[0_4px_16px_-8px_oklch(0.42_0.12_355_/_0.15)] p-5">
          <div className="text-sm font-semibold text-foreground mb-2">{t("dash.riskDist")}</div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={RISK_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {pieData.map((p, i) => (
                <li key={p.name} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: RISK_COLORS[i] }}
                  />
                  <span className="text-foreground/80 flex-1">{p.name} {t("dash.risk.suffix")}</span>
                  <span className="text-foreground font-semibold">{pct(p.value)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="lg:col-span-1 rounded-[1.75rem] bg-white border border-primary/20 shadow-[0_4px_16px_-8px_oklch(0.42_0.12_355_/_0.15)] p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-foreground">{t("dash.recent2")}</div>
            <Link to="/history" className="text-[11px] text-primary hover:underline">
              {t("dash.viewAll")} ▾
            </Link>
          </div>
          <ul className="divide-y divide-primary/5">
            {(recent.length ? recent : ([1, 2, 3] as unknown as AnalysisRow[])).map((r, i) => {
              const isReal = typeof r === "object" && (r as AnalysisRow).id;
              const row = isReal ? (r as AnalysisRow) : null;
              const Icon = row ? iconFor(row) : [MessageCircle, AtSign, ImageIcon][i];
              const title = row
                ? labelFor(row)
                : [`Anxiety & Stress ${t("dash.check")}`, t("dash.socialAnalysis"), t("dash.imgScan")][i];
              const level: RiskLevel = row ? row.risk_level : (["low", "medium", "low"][i] as RiskLevel);
              const time = row
                ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
                : ["2h ago", "1d ago", "3d ago"][i];
              const chipColor =
                level === "low"
                  ? "var(--risk-low)"
                  : level === "medium"
                  ? "var(--risk-medium)"
                  : "var(--risk-high)";
              const chipBg =
                level === "low"
                  ? "oklch(0.94 0.05 155)"
                  : level === "medium"
                  ? "oklch(0.94 0.06 65)"
                  : "oklch(0.94 0.06 25)";

              const content = (
                <div className="py-2.5 flex items-center gap-3 group">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center text-primary shrink-0"
                    style={{ background: "oklch(0.94 0.03 355)" }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{title}</div>
                    <div className="text-[11px] text-muted-foreground">{time}</div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: chipBg, color: chipColor }}
                  >
                    {t(`dash.risk.${level}`)}
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              );

              return (
                <li key={row?.id ?? i}>
                  {row ? (
                    <Link to="/results/$id" params={{ id: row.id }}>
                      {content}
                    </Link>
                  ) : (
                    <div>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Self-Assessment vs AI Findings comparison */}
      <ComparisonCard latest={latest} assessment={latestAssessment} t={t} />



      {/* Bottom banner */}
      <section
        className="relative rounded-[2rem] overflow-hidden text-white p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(120deg, oklch(0.32 0.13 355) 0%, oklch(0.42 0.14 355) 55%, oklch(0.55 0.14 355) 100%)",
        }}
      >
        <div className="absolute -right-10 -top-10 size-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="shrink-0 relative">
            <div className="absolute inset-0 bg-white/15 blur-2xl rounded-full" />
            <img
              src={bannerCutie}
              alt=""
              width={112}
              height={112}
              loading="lazy"
              className="relative size-24 sm:size-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)] animate-[float_5s_ease-in-out_infinite]"
              style={{ animation: "float 5s ease-in-out infinite" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
              {t("dash.banner.title")}
            </h3>
            <p className="mt-2 text-white/80 text-sm max-w-2xl">
              {t("dash.banner.subtitle")}
            </p>
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-[color:var(--primary)] text-sm font-semibold hover:bg-white/90 hover:-translate-y-0.5 transition-all shrink-0 self-start sm:self-auto"
          >
            {t("dash.explore")} <ChevronRight className="size-4" />
          </Link>
        </div>
        <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>

      </section>
      {loading ? null : null}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  trendPositive,
  accent,
  soft,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: React.ReactNode;
  trendPositive?: boolean;
  accent: string;
  soft: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-primary/20 shadow-[0_4px_16px_-8px_oklch(0.42_0.12_355_/_0.2)] p-4 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_oklch(0.42_0.12_355_/_0.35)] transition-all">
      <div className="flex items-start gap-3">
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: soft, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-muted-foreground truncate">{label}</div>
          <div className="text-lg font-semibold text-foreground truncate">{value}</div>
        </div>
      </div>
      {trend && (
        <div
          className="mt-3 text-[11px] flex items-center gap-1"
          style={{ color: trendPositive ? accent : "var(--muted-foreground)" }}
        >
          {trend}
        </div>
      )}
      <div
        className="absolute -right-6 -bottom-6 size-20 rounded-full opacity-40 pointer-events-none"
        style={{ background: soft }}
      />
    </div>
  );
}

function ComparisonCard({
  latest,
  assessment,
  t,
}: {
  latest?: AnalysisRow;
  assessment: AssessmentRow | null;
  t: (k: string) => string;
}) {
  const phqToLevel = (cat?: string): RiskLevel | null => {
    if (!cat) return null;
    if (cat === "Minimal" || cat === "Mild") return "low";
    if (cat === "Moderate") return "medium";
    if (cat === "Moderately Severe" || cat === "Severe") return "high";
    return null;
  };
  const selfLevel = phqToLevel(assessment?.category);
  const aiLevel = latest?.risk_level ?? null;
  const matches = selfLevel && aiLevel ? selfLevel === aiLevel : null;

  const levelTone = (l: RiskLevel | null) =>
    l === "low"
      ? { bg: "oklch(0.94 0.05 155)", fg: "oklch(0.5 0.12 155)" }
      : l === "medium"
      ? { bg: "oklch(0.95 0.06 65)", fg: "oklch(0.55 0.14 55)" }
      : l === "high"
      ? { bg: "oklch(0.94 0.06 25)", fg: "oklch(0.55 0.16 25)" }
      : { bg: "oklch(0.95 0.02 350)", fg: "var(--muted-foreground)" };

  const catKey = (c?: string) =>
    c === "Minimal" ? "as.cat.minimal"
    : c === "Mild" ? "as.cat.mild"
    : c === "Moderate" ? "as.cat.moderate"
    : c === "Moderately Severe" ? "as.cat.modsev"
    : c === "Severe" ? "as.cat.severe" : "";

  return (
    <section className="rounded-[1.75rem] bg-white border border-primary/20 shadow-[0_4px_16px_-8px_oklch(0.42_0.12_355_/_0.15)] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {t("dash.compare.title")}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t("dash.compare.subtitle")}
          </div>
        </div>
        <Link
          to="/assessment"
          className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
        >
          <ClipboardCheck className="size-3.5" /> {t("dash.compare.takeTest")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <div
          className="rounded-2xl p-4 border border-primary/10"
          style={{ background: "oklch(0.98 0.015 350)" }}
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            {t("dash.compare.selfReport")}
          </div>
          {assessment ? (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-foreground">
                  {assessment.score}
                  <span className="text-sm text-muted-foreground font-normal"> / 27</span>
                </div>
              </div>
              <span
                className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: levelTone(selfLevel).bg,
                  color: levelTone(selfLevel).fg,
                }}
              >
                {catKey(assessment.category) ? t(catKey(assessment.category)) : assessment.category}
              </span>
              <div className="text-[10px] text-muted-foreground mt-2">{t("dash.compare.phq9")}</div>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("dash.compare.notTaken")}
              </p>
              <Link
                to="/assessment"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                {t("dash.compare.startNow")} <ChevronRight className="size-3" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex sm:flex-col items-center justify-center gap-2 py-2">
          {matches === null ? (
            <div className="size-9 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground">
              <AlertCircle className="size-4" />
            </div>
          ) : matches ? (
            <div className="size-9 rounded-full flex items-center justify-center text-white"
              style={{ background: "oklch(0.68 0.14 155)" }}
            >
              <CheckCircle2 className="size-4" />
            </div>
          ) : (
            <div className="size-9 rounded-full flex items-center justify-center text-white"
              style={{ background: "oklch(0.68 0.15 55)" }}
            >
              <AlertCircle className="size-4" />
            </div>
          )}
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
            {matches === null ? t("dash.compare.awaiting") : matches ? t("dash.compare.match") : t("dash.compare.differ")}
          </div>
        </div>

        <div
          className="rounded-2xl p-4 border border-primary/10"
          style={{ background: "oklch(0.98 0.015 350)" }}
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            {t("dash.compare.ai")}
          </div>
          {latest ? (
            <>
              <div className="mt-2 text-2xl font-semibold text-foreground capitalize">
                {latest.condition ?? "Stable"}
              </div>
              <span
                className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: levelTone(aiLevel).bg,
                  color: levelTone(aiLevel).fg,
                }}
              >
                {aiLevel ? t(`dash.risk.${aiLevel}`) : t("dash.risk.unknown")} {t("dash.risk.suffix")}
              </span>
              <div className="text-[10px] text-muted-foreground mt-2">{t("dash.compare.aiLatest")}</div>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">{t("dash.compare.noAI")}</p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                {t("dash.compare.runAnalysis")} <ChevronRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {matches !== null && (
        <p className="mt-4 text-xs text-center text-muted-foreground">
          {matches ? t("dash.compare.matchMsg") : t("dash.compare.differMsg")}
        </p>
      )}
    </section>
  );
}


