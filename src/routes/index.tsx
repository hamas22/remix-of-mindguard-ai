import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Globe,
  Heart,
  LineChart as LineChartIcon,
  Lock,
  MessageSquare,
  PieChart as PieChartIcon,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";
import heroDesk from "@/assets/hero-desk.png";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindGuard AI — Understand your mind before it gets worse" },
      {
        name: "description",
        content:
          "MindGuard AI analyzes text and images to detect early signs of depression, anxiety and stress — privately, calmly, and with clinical care.",
      },
      { property: "og:title", content: "MindGuard AI — Early mental health signals, understood." },
      {
        property: "og:description",
        content: "Multi-modal AI for early depression, anxiety, and stress detection.",
      },
    ],
  }),
  component: Landing,
});

/* ————————————————————————————————————————————————
 * Design tokens (kept local so the landing page never
 * fights the app's global "Serene Plum" theme).
 * ———————————————————————————————————————————————— */
const C = {
  bg: "#FCFAFB",
  card: "#FFFFFF",
  ink: "#1F1F24",
  sub: "#6E6670",
  primary: "#873159",
  primaryTo: "#B75A88",
  soft1: "#F9F7F8",
  soft2: "#F6EEF3",
  soft3: "#E8D9E2",
  success: "#5FA86D",
  warn: "#E4A94D",
  danger: "#E57373",
};

const shadowSoft = "0 20px 60px rgba(0,0,0,.06)";
const shadowLift = "0 30px 80px rgba(135,49,89,.14)";
const hairline = "1px solid rgba(135,49,89,.08)";

const moodData = [
  { d: "Mon", v: 62 },
  { d: "Tue", v: 55 },
  { d: "Wed", v: 71 },
  { d: "Thu", v: 48 },
  { d: "Fri", v: 66 },
  { d: "Sat", v: 78 },
  { d: "Sun", v: 82 },
];

const riskData = [
  { name: "Low", value: 58, color: C.success },
  { name: "Medium", value: 27, color: C.warn },
  { name: "High", value: 15, color: C.danger },
];

function Landing() {
  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{
        background: C.bg,
        color: C.ink,
        fontFamily:
          '"Plus Jakarta Sans", "Satoshi", "General Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      {/* Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .mg-fadeup { animation: mgFadeUp .9s cubic-bezier(.22,1,.36,1) both; }
        .mg-fadeup-2 { animation: mgFadeUp .9s .12s cubic-bezier(.22,1,.36,1) both; }
        .mg-fadeup-3 { animation: mgFadeUp .9s .24s cubic-bezier(.22,1,.36,1) both; }
        .mg-float { animation: mgFloat 8s ease-in-out infinite; }
        @keyframes mgFadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .mg-card-hover { transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s ease; }
        .mg-card-hover:hover { transform: translateY(-4px); box-shadow: ${shadowLift}; }
        .mg-btn-primary { transition: transform .3s ease, box-shadow .3s ease, filter .3s ease; }
        .mg-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(135,49,89,.35); filter: brightness(1.03); }
        .mg-btn-ghost { transition: background .3s ease, border-color .3s ease, transform .3s ease; }
        .mg-btn-ghost:hover { background: ${C.soft2}; transform: translateY(-1px); }
      `}</style>

      <Nav />

      <main className="relative">
        {/* Ambient blush glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-60"
          style={{ background: `radial-gradient(closest-side, ${C.soft2}, transparent 70%)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[520px] -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-60"
          style={{ background: `radial-gradient(closest-side, ${C.soft3}55, transparent 70%)` }}
        />

        <Hero />
        <FloatingStats />
        <BentoPreview />
        <HowItWorks />
        <Conditions />
        <Trust />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}

/* ———————————————— NAV ———————————————— */

function Nav() {
  return (
    <div className="sticky top-4 z-40 px-4">
      <div
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between rounded-[24px] px-4 md:px-6"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: hairline,
          boxShadow: shadowSoft,
        }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-tight" style={{ color: C.ink }}>
            MindGuard <span style={{ color: C.primary }}>AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { l: "Dashboard", to: "/dashboard" },
            { l: "Analyze", to: "/analyze" },
            { l: "History", to: "/history" },
            { l: "Resources", to: "/resources" },
          ].map((i) => (
            <Link
              key={i.l}
              to={i.to}
              className="mg-btn-ghost rounded-full px-3.5 py-2 text-[13.5px] font-medium"
              style={{ color: C.sub }}
            >
              {i.l}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="mg-btn-ghost hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium sm:inline-flex"
            style={{ color: C.sub, border: hairline }}
          >
            <Globe className="h-3.5 w-3.5" />
            EN
          </button>
          <Link
            to="/auth"
            className="mg-btn-ghost hidden rounded-full px-3.5 py-2 text-[13.5px] font-medium sm:inline-block"
            style={{ color: C.ink }}
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mg-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryTo} 100%)`,
              boxShadow: "0 10px 24px rgba(135,49,89,.28)",
            }}
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div
      className="grid h-9 w-9 place-items-center rounded-[12px]"
      style={{
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryTo})`,
        boxShadow: "0 8px 20px rgba(135,49,89,.28)",
      }}
    >
      <Heart className="h-4.5 w-4.5" strokeWidth={2.2} color="#fff" />
    </div>
  );
}

/* ———————————————— HERO ———————————————— */

function Hero() {
  return (
    <section className="relative mx-auto max-w-[1440px] px-6 pb-6 pt-16 md:pt-24">
      <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-[1.05fr_1fr]">
        {/* Left */}
        <div className="mg-fadeup">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium"
            style={{ background: C.soft2, color: C.primary, border: hairline }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Mental Health Assistant
          </span>

          <h1
            className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[56px] lg:text-[68px]"
            style={{ color: C.ink }}
          >
            Understand your mind
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryTo})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              before it gets worse.
            </span>
          </h1>

          <p
            className="mt-6 max-w-[560px] text-[17px] leading-[1.6]"
            style={{ color: C.sub }}
          >
            MindGuard quietly analyzes your words and images to detect the earliest signs of{" "}
            <span style={{ color: C.ink, fontWeight: 600 }}>depression</span>,{" "}
            <span style={{ color: C.ink, fontWeight: 600 }}>anxiety</span>, and{" "}
            <span style={{ color: C.ink, fontWeight: 600 }}>stress</span> — so support can arrive
            long before a crisis does.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mg-btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryTo} 100%)`,
                boxShadow: "0 16px 36px rgba(135,49,89,.32)",
              }}
            >
              Start Analysis <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="mg-btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold"
              style={{ color: C.ink, border: hairline, background: C.card }}
            >
              Learn More
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]" style={{ color: C.sub }}>
            {[
              { i: Lock, l: "Secure" },
              { i: ShieldCheck, l: "Private" },
              { i: Sparkles, l: "AI Powered" },
            ].map(({ i: Icon, l }) => (
              <span key={l} className="inline-flex items-center gap-2">
                <span
                  className="grid h-5 w-5 place-items-center rounded-full"
                  style={{ background: C.soft2, color: C.primary }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span style={{ color: C.ink, fontWeight: 500 }}>{l}</span>
                <Icon className="h-3.5 w-3.5 opacity-40" />
              </span>
            ))}
          </div>
        </div>

        {/* Right — hero image */}
        <div className="mg-fadeup-2 relative">
          <div
            className="relative overflow-hidden rounded-[28px]"
            style={{ boxShadow: shadowLift, border: hairline }}
          >
            <img
              src={heroDesk}
              alt="A calm wooden desk with a journal, coffee, dried flowers and a framed print — 'Take care of your mind. Everything else follows.'"
              className="block h-[420px] w-full object-cover sm:h-[520px] lg:h-[600px]"
            />
            {/* Very subtle warmth wash to unify with palette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(252,250,251,0) 60%, rgba(252,250,251,0.35) 100%)",
              }}
            />
          </div>

          {/* Floating quote card */}
          <div
            className="mg-float absolute -bottom-6 -left-4 hidden max-w-[260px] rounded-[20px] p-4 sm:block"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(16px)",
              border: hairline,
              boxShadow: shadowSoft,
            }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.primary }}>
              <Heart className="h-3.5 w-3.5" /> Today's note
            </div>
            <p className="mt-2 text-[14px] leading-[1.45]" style={{ color: C.ink }}>
              "Take care of your mind. Everything else follows."
            </p>
          </div>

          {/* Floating status pill */}
          <div
            className="mg-float absolute -top-4 right-4 hidden items-center gap-2 rounded-full px-3 py-2 sm:inline-flex"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: hairline,
              boxShadow: shadowSoft,
              animationDelay: "1.5s",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                style={{ background: C.success }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: C.success }} />
            </span>
            <span className="text-[12px] font-medium" style={{ color: C.ink }}>
              Analysis online
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ———————————————— FLOATING STATS ———————————————— */

function FloatingStats() {
  const items = [
    { icon: Brain, label: "Current State", value: "Calm", tone: C.success, sub: "Stable · 7d" },
    { icon: Activity, label: "Average Risk", value: "Low", tone: C.success, sub: "-12% vs last week" },
    { icon: BarChart3, label: "Total Analyses", value: "128", tone: C.primary, sub: "+9 this week" },
    { icon: LineChartIcon, label: "Mood Trend", value: "↗ 8%", tone: C.primary, sub: "improving" },
    { icon: Heart, label: "Check-ins", value: "5/7", tone: C.warn, sub: "this week" },
  ];
  return (
    <section className="relative mx-auto max-w-[1440px] px-6 pt-16 md:pt-24">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(({ icon: Icon, label, value, tone, sub }, i) => (
          <div
            key={label}
            className="mg-card-hover mg-fadeup rounded-[24px] p-5"
            style={{
              background: C.card,
              border: hairline,
              boxShadow: shadowSoft,
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div
              className="grid h-9 w-9 place-items-center rounded-[12px]"
              style={{ background: `${tone}14`, color: tone }}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            </div>
            <div className="mt-4 text-[12px] font-medium uppercase tracking-[0.12em]" style={{ color: C.sub }}>
              {label}
            </div>
            <div className="mt-1 text-[24px] font-bold tracking-tight" style={{ color: C.ink }}>
              {value}
            </div>
            <div className="mt-0.5 text-[12.5px]" style={{ color: C.sub }}>
              {sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ———————————————— BENTO DASHBOARD PREVIEW ———————————————— */

function BentoPreview() {
  return (
    <section className="relative mx-auto max-w-[1440px] px-6 pt-20 md:pt-28">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-xl">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.primary }}>
            The dashboard
          </span>
          <h2
            className="mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[44px]"
            style={{ color: C.ink }}
          >
            Your mind, made legible.
          </h2>
          <p className="mt-3 max-w-[520px] text-[15.5px] leading-[1.6]" style={{ color: C.sub }}>
            A quiet, well-composed workspace. Trends you can trust, signals you can act on — and
            nothing you don't need.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="mg-btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-semibold"
          style={{ color: C.ink, border: hairline, background: C.card }}
        >
          Open dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-6 lg:grid-rows-[auto_auto]">
        {/* Mood history — big */}
        <Bento className="lg:col-span-4 lg:row-span-1">
          <div className="flex items-start justify-between">
            <div>
              <BentoEyebrow icon={LineChartIcon}>Mood history</BentoEyebrow>
              <div className="mt-1 text-[22px] font-bold tracking-tight" style={{ color: C.ink }}>
                Feeling steadier this week
              </div>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: `${C.success}18`, color: C.success }}
            >
              +8%
            </span>
          </div>
          <div className="mt-5 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mgArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEE6EB" vertical={false} />
                <XAxis dataKey="d" stroke={C.sub} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={C.sub} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: hairline,
                    borderRadius: 12,
                    boxShadow: shadowSoft,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="v" stroke={C.primary} strokeWidth={2.5} fill="url(#mgArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Bento>

        {/* Risk distribution — pie */}
        <Bento className="lg:col-span-2">
          <BentoEyebrow icon={PieChartIcon}>Risk distribution</BentoEyebrow>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-[160px] w-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    innerRadius={44}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((r) => (
                      <Cell key={r.name} fill={r.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-[13px]">
              {riskData.map((r) => (
                <li key={r.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                  <span style={{ color: C.ink, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ color: C.sub }}>· {r.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Bento>

        {/* Recent analysis */}
        <Bento className="lg:col-span-3">
          <BentoEyebrow icon={MessageSquare}>Recent analysis</BentoEyebrow>
          <div className="mt-3 space-y-2.5">
            {[
              { t: "Journaling · morning", r: "Low", tone: C.success, s: "Warm tone, gratitude cues" },
              { t: "Social post · draft", r: "Medium", tone: C.warn, s: "Fatigue signals detected" },
              { t: "Photo mood board", r: "Low", tone: C.success, s: "Balanced composition" },
            ].map((row) => (
              <div
                key={row.t}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3"
                style={{ background: C.soft1, border: hairline }}
              >
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold" style={{ color: C.ink }}>
                    {row.t}
                  </div>
                  <div className="truncate text-[12px]" style={{ color: C.sub }}>
                    {row.s}
                  </div>
                </div>
                <span
                  className="ml-3 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: `${row.tone}18`, color: row.tone }}
                >
                  {row.r}
                </span>
              </div>
            ))}
          </div>
        </Bento>

        {/* Daily reminder */}
        <Bento
          className="lg:col-span-2"
          style={{
            background: `linear-gradient(150deg, ${C.primary} 0%, ${C.primaryTo} 100%)`,
            color: "#fff",
            border: "1px solid rgba(255,255,255,.14)",
          }}
        >
          <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] opacity-90">
            <Sparkles className="h-3.5 w-3.5" /> Daily reminder
          </div>
          <p className="mt-3 text-[19px] font-semibold leading-[1.35]">
            "Progress, not perfection. One breath at a time."
          </p>
          <div className="mt-6 flex items-center gap-2 text-[12.5px] opacity-90">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div className="h-full w-3/5 rounded-full bg-white" />
            </div>
            <span>3 / 5</span>
          </div>
        </Bento>

        {/* Breathing exercise */}
        <Bento className="lg:col-span-1">
          <BentoEyebrow icon={Wind}>Breathe</BentoEyebrow>
          <div className="mt-3 grid place-items-center">
            <div
              className="grid h-24 w-24 place-items-center rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${C.soft2}, ${C.soft3})`,
                boxShadow: "inset 0 0 0 6px rgba(255,255,255,.9)",
              }}
            >
              <div className="text-[13px] font-semibold" style={{ color: C.primary }}>
                4 · 7 · 8
              </div>
            </div>
          </div>
          <div className="mt-3 text-center text-[12px]" style={{ color: C.sub }}>
            Inhale · hold · exhale
          </div>
        </Bento>
      </div>
    </section>
  );
}

function Bento({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`mg-card-hover rounded-[24px] p-5 sm:p-6 ${className}`}
      style={{
        background: C.card,
        border: hairline,
        boxShadow: shadowSoft,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BentoEyebrow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.sub }}>
      <span
        className="grid h-6 w-6 place-items-center rounded-[8px]"
        style={{ background: C.soft2, color: C.primary }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {children}
    </div>
  );
}

/* ———————————————— HOW IT WORKS ———————————————— */

function HowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Language, listened to.",
      body: "Fine-tuned NLP reads tone, sentiment, and cognitive patterns from the text you share.",
    },
    {
      icon: Sparkles,
      title: "Imagery, understood.",
      body: "Computer vision picks up mood signals in composition, color, and light — no faces required.",
    },
    {
      icon: LineChartIcon,
      title: "Explained, not black-boxed.",
      body: "Every score comes with a plain-English explanation of the features that drove it.",
    },
  ];
  return (
    <section id="how" className="relative mx-auto max-w-[1440px] px-6 pt-24 md:pt-32">
      <div className="max-w-2xl">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.primary }}>
          How it works
        </span>
        <h2 className="mt-3 text-[36px] font-bold tracking-[-0.02em] sm:text-[44px]" style={{ color: C.ink }}>
          Two modalities. One quiet signal.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="mg-card-hover rounded-[24px] p-6"
            style={{ background: C.card, border: hairline, boxShadow: shadowSoft }}
          >
            <div className="flex items-center justify-between">
              <div
                className="grid h-11 w-11 place-items-center rounded-[14px]"
                style={{ background: C.soft2, color: C.primary }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <span className="text-[12px] font-semibold" style={{ color: C.sub }}>
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-5 text-[19px] font-bold tracking-tight" style={{ color: C.ink }}>
              {title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-[1.6]" style={{ color: C.sub }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ———————————————— CONDITIONS ———————————————— */

function Conditions() {
  const items = [
    { emoji: "🌧", label: "Depression", desc: "Low mood, withdrawal, fatigue" },
    { emoji: "🌪", label: "Anxiety", desc: "Worry, restlessness, racing thoughts" },
    { emoji: "🌗", label: "Bipolar", desc: "Shifting energy and mood cycles" },
    { emoji: "🔥", label: "Stress", desc: "Overload, tension, burnout" },
  ];
  return (
    <section className="relative mx-auto max-w-[1440px] px-6 pt-24">
      <div
        className="rounded-[28px] p-8 sm:p-12"
        style={{ background: C.soft1, border: hairline, boxShadow: shadowSoft }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[32px] font-bold tracking-[-0.02em] sm:text-[40px]" style={{ color: C.ink }}>
            Tuned for the patterns most missed.
          </h2>
          <p className="mt-3 text-[15.5px]" style={{ color: C.sub }}>
            MindGuard is trained across four core mental-health patterns that go undetected in
            everyday life.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <div
              key={c.label}
              className="mg-card-hover rounded-[20px] p-5"
              style={{ background: C.card, border: hairline, boxShadow: shadowSoft }}
            >
              <div className="text-[32px] leading-none" aria-hidden>
                {c.emoji}
              </div>
              <div className="mt-4 text-[16px] font-bold" style={{ color: C.ink }}>
                {c.label}
              </div>
              <div className="mt-1 text-[13px]" style={{ color: C.sub }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ———————————————— TRUST ———————————————— */

function Trust() {
  const rows = [
    {
      icon: ShieldCheck,
      title: "Privacy-first, by design.",
      body: "Data is encrypted at rest, scoped to your account, and never used to train third-party models.",
    },
    {
      icon: Heart,
      title: "Written with clinicians.",
      body: "Copy, thresholds and recommendations are co-designed with mental-health professionals.",
    },
    {
      icon: Sparkles,
      title: "Multi-modal by default.",
      body: "Combining language and imagery reduces the false negatives single-signal tools miss.",
    },
  ];
  return (
    <section id="why" className="relative mx-auto max-w-[1440px] px-6 pt-24 md:pt-32">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.primary }}>
            Why MindGuard
          </span>
          <h2 className="mt-3 text-[36px] font-bold tracking-[-0.02em] sm:text-[44px]" style={{ color: C.ink }}>
            Care that begins with noticing.
          </h2>
          <p className="mt-4 max-w-[440px] text-[15.5px] leading-[1.65]" style={{ color: C.sub }}>
            Screening usually happens after distress has escalated. MindGuard is built to notice
            earlier — from the passive signals people already share — and route them toward care
            with dignity.
          </p>
        </div>
        <div className="grid gap-3">
          {rows.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="mg-card-hover flex gap-4 rounded-[20px] p-5"
              style={{ background: C.card, border: hairline, boxShadow: shadowSoft }}
            >
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px]"
                style={{ background: C.soft2, color: C.primary }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-[16px] font-bold" style={{ color: C.ink }}>
                  {title}
                </div>
                <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: C.sub }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ———————————————— CTA ———————————————— */

function CTA() {
  return (
    <section className="relative mx-auto max-w-[1440px] px-6 pb-24 pt-24 md:pt-32">
      <div
        className="relative overflow-hidden rounded-[32px] px-8 py-14 text-center sm:px-16 sm:py-20"
        style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryTo} 100%)`,
          boxShadow: "0 40px 100px rgba(135,49,89,.32)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #fff, transparent 70%)" }}
        />
        <h2 className="mx-auto max-w-2xl text-[36px] font-bold tracking-[-0.02em] text-white sm:text-[48px]">
          Take care of your mind.
          <br />
          <span className="opacity-90">Everything else follows.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15.5px] text-white/85">
          Create a free account and run your first analysis in under a minute.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mg-btn-primary inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold"
            style={{ color: C.primary, boxShadow: "0 16px 40px rgba(0,0,0,.18)" }}
          >
            Start free analysis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            className="mg-btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-white"
            style={{ border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.08)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ———————————————— FOOTER ———————————————— */

function Footer() {
  return (
    <footer className="mx-auto max-w-[1440px] px-6 pb-10">
      <div
        className="flex flex-col items-center justify-between gap-4 rounded-[24px] px-6 py-6 text-[13px] md:flex-row"
        style={{ background: C.card, border: hairline, boxShadow: shadowSoft, color: C.sub }}
      >
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span style={{ color: C.ink, fontWeight: 600 }}>MindGuard AI</span>
          <span>· Graduation project</span>
        </div>
        <div>
          If you are in crisis, please contact your local emergency services.
        </div>
      </div>
    </footer>
  );
}
