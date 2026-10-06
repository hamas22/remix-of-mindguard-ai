import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import authHero from "@/assets/auth-hero.jpg";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — MindGuard AI" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome to MindGuard.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };



  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 gradient-hero" />
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/3 left-1/2 size-64 rounded-full bg-[oklch(0.85_0.08_355)]/30 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      {/* Floating decorative badges — professional take on the reference vibe */}
      <div className="hidden lg:block absolute top-12 right-16 animate-float" style={{ animationDelay: "0.5s" }}>
        <div className="glass rounded-2xl p-3 shadow-xl rotate-6">
          <ShieldCheck className="size-6 text-primary" />
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-16 left-16 animate-float" style={{ animationDelay: "2.5s" }}>
        <div className="glass rounded-2xl p-3 shadow-xl -rotate-6">
          <Sparkles className="size-6 text-accent" />
        </div>
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] gap-6 items-stretch animate-fade-up">
        {/* Left: dreamy still-life image with brand + tagline */}
        <div className="relative hidden lg:block rounded-[2.5rem] overflow-hidden shadow-2xl">
          <img
            src={authHero}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 mesh-bg opacity-30 mix-blend-overlay" />

          <div className="relative h-full flex flex-col justify-between p-10">
            <Link to="/" className="inline-flex items-center gap-2.5 self-start">
              <Logo size={34} />
              <span className="text-lg font-semibold text-white">
                MindGuard<span className="text-white/90 font-bold"> AI</span>
              </span>
            </Link>

            <div className="max-w-sm">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white leading-tight">
                A quieter, kinder kind of check-in.
              </h1>
              <p className="mt-3 text-white/80 text-sm leading-relaxed">
                Understand your emotional state through gentle, private AI analysis.
                Your history stays yours.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="size-4" />
                <span>Private · Encrypted · Confidential</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: creative form card */}
        <div className="relative">
          {/* Decorative floating orb behind card */}
          <div className="absolute -top-4 -right-4 size-24 rounded-full gradient-primary opacity-30 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 size-32 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative glass-strong rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
            {/* Mobile brand */}
            <div className="lg:hidden flex justify-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <Logo size={32} />
                <span className="text-lg font-semibold">
                  MindGuard<span className="text-gradient font-bold"> AI</span>
                </span>
              </Link>
            </div>

            {/* Segmented tab switch */}
            <div className="mx-auto max-w-xs mb-7 relative grid grid-cols-2 p-1 rounded-full bg-primary/5 border border-primary/10">
              <span
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full gradient-primary transition-transform duration-500 ease-out shadow-[0_6px_18px_-4px_oklch(0.42_0.12_355_/_0.45)]"
                style={{ transform: isSignup ? "translateX(calc(100% + 4px))" : "translateX(0)" }}
              />
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`relative z-10 py-2 text-sm font-medium rounded-full transition-colors ${!isSignup ? "text-white" : "text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`relative z-10 py-2 text-sm font-medium rounded-full transition-colors ${isSignup ? "text-white" : "text-muted-foreground"}`}
              >
                Sign up
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                {isSignup ? "Welcome," : "Welcome"} <span className="text-gradient">{isSignup ? "friend" : "back"}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isSignup ? "Create an account to begin your check-ins." : "Continue where you left off."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignup && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full name"
                    className="w-full h-12 pl-11 pr-4 rounded-full bg-white/70 border border-primary/10 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                  />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email address"
                  className="w-full h-12 pl-11 pr-4 rounded-full bg-white/70 border border-primary/10 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Password"
                  className="w-full h-12 pl-11 pr-11 rounded-full bg-white/70 border border-primary/10 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {!isSignup && (
                <div className="text-right">
                  <button type="button" className="text-xs text-accent hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full gradient-primary text-white border-0 hover:scale-[1.02] transition-transform glow font-medium"
              >
                {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                {isSignup ? "Create account" : "Sign in"}
              </Button>
            </form>


            <p className="text-xs text-muted-foreground mt-6 text-center">
              By continuing you agree to our privacy-first approach. Analyses are for
              self-reflection only and are not a medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
