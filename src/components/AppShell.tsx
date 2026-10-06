import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, History, HeartPulse, LogOut, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useLang } from "@/lib/i18n";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/analyze", key: "nav.analyze", icon: Sparkles },
  { to: "/history", key: "nav.history", icon: History },
  { to: "/resources", key: "nav.resources", icon: HeartPulse },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, lang, setLang } = useLang();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  return (
    <div className="min-h-screen relative flex overflow-x-hidden">
      {/* Sidebar — desktop only, full-height rectangle */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 w-64 flex-col z-30 p-5 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, white 94%, transparent) 0%, color-mix(in oklab, oklch(0.96 0.025 355) 96%, transparent) 100%)",
          borderRight: "1px solid color-mix(in oklab, oklch(0.42 0.12 355) 12%, transparent)",
          boxShadow:
            "0 30px 80px -30px oklch(0.42 0.12 355 / 0.25), inset 0 1px 0 color-mix(in oklab, white 80%, transparent)",
        }}
      >
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group px-1 pt-1">
          <Logo size={38} className="transition-transform duration-500 group-hover:rotate-6" />
          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-tight text-foreground leading-none">
              MindGuard
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
              Understand. Support. Empower.
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="mt-8 flex flex-col gap-1.5">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  active
                    ? "text-white shadow-[0_10px_28px_-8px_oklch(0.42_0.12_355_/_0.55)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/[0.06]"
                }`}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.32 0.13 355) 0%, oklch(0.42 0.14 355) 60%, oklch(0.52 0.13 355) 100%)",
                      }
                    : undefined
                }
              >
                <Icon className={`size-4 ${active ? "" : "text-primary/70"}`} />
                <span>{t(n.key)}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto pt-6 space-y-2">
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/[0.06] transition-all"
          >
            <Languages className="size-4 text-primary/70" />
            <span>{t("nav.language")}</span>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-primary/70">
              {lang === "en" ? "EN" : "AR"}
            </span>
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/[0.06] transition-all"
          >
            <LogOut className="size-4 text-primary/70" />
            <span>{t("nav.signout")}</span>
          </button>
        </div>
      </aside>


      {/* Mobile top strip — brand + utilities (fixed, out of flex row) */}
      <header className="md:hidden fixed top-3 left-0 right-0 z-30 px-3">
        <div
          className="rounded-full px-3 h-12 flex items-center justify-between backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, white 90%, transparent) 0%, color-mix(in oklab, oklch(0.96 0.02 355) 92%, transparent) 100%)",
            border: "1px solid color-mix(in oklab, oklch(0.42 0.12 355) 14%, transparent)",
            boxShadow:
              "0 10px 40px -18px oklch(0.42 0.12 355 / 0.28), inset 0 1px 0 color-mix(in oklab, white 80%, transparent)",
          }}
        >
          <Link to="/dashboard" className="flex items-center gap-2 pl-1 min-w-0">
            <Logo size={24} />
            <span className="text-sm font-semibold text-foreground truncate">
              MindGuard<span className="text-gradient font-bold"> AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleLang}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-primary/5 hover:bg-primary/10 transition-all"
              aria-label="Toggle language"
            >
              <Languages className="size-3.5" />
            </button>
            <button
              onClick={signOut}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-primary/5 hover:bg-primary/10 transition-all"
              aria-label="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full md:ml-64 rtl:md:ml-0 rtl:md:mr-64 px-4 sm:px-6 pt-20 md:pt-8 pb-32 md:pb-8 min-w-0 overflow-x-hidden">
        <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
      </main>


      {/* Mobile bottom dock — circles with labels */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-30 px-3 pointer-events-none">
        <nav
          className="mx-auto max-w-md rounded-[1.75rem] px-2 py-2 flex items-start justify-around pointer-events-auto backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, white 92%, transparent) 0%, color-mix(in oklab, oklch(0.96 0.02 355) 94%, transparent) 100%)",
            border: "1px solid color-mix(in oklab, oklch(0.42 0.12 355) 14%, transparent)",
            boxShadow: "0 20px 50px -20px oklch(0.42 0.12 355 / 0.4)",
          }}
          aria-label="Primary"
        >
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-label={t(n.key)}
                className="flex flex-col items-center gap-1 px-1.5 py-1 flex-1 min-w-0"
              >
                <div
                  className={`size-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    active
                      ? "text-white scale-105 shadow-[0_10px_24px_-6px_oklch(0.42_0.12_355_/_0.55)]"
                      : "bg-primary/[0.06] text-muted-foreground"
                  }`}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.32 0.13 355) 0%, oklch(0.42 0.14 355) 60%, oklch(0.52 0.13 355) 100%)",
                        }
                      : undefined
                  }
                >
                  <Icon className="size-5" />
                </div>
                <span
                  className={`text-[10px] font-medium leading-none truncate max-w-full ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {t(n.key)}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
