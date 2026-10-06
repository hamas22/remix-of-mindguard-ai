import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { riskColor } from "@/components/RiskMeter";
import type { RiskLevel, Condition } from "@/lib/ai-risk";
import { conditionEmoji, conditionLabel } from "@/lib/ai-risk";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — MindGuard AI" }] }),
  component: HistoryPage,
});

interface Row {
  id: string;
  created_at: string;
  risk_level: RiskLevel;
  risk_score: number | null;
  condition: Condition | null;
  text_content: string | null;
  is_demo: boolean;
}

function HistoryPage() {
  const { t } = useLang();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("analyses")
      .select("id, created_at, risk_level, risk_score, condition, text_content, is_demo")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filter !== "all" && r.risk_level !== filter) return false;
    if (q && !(r.text_content ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [rows, q, filter]);

  const del = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success(t("hist.deleted"));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("hist.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("hist.subtitle")}</p>
      </div>

      <div className="glass rounded-3xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("hist.search")} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 rtl:pl-3 rtl:pr-9 bg-background/40 border-white/10" />
        </div>
        <div className="flex gap-2">
          {(["all", "low", "medium", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === f ? "gradient-primary text-white glow" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >{t(`hist.${f}`)}</button>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-muted-foreground">{t("hist.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">{t("hist.empty")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left rtl:text-right px-4 py-3">{t("hist.date")}</th>
                <th className="text-left rtl:text-right px-4 py-3">{t("hist.condition")}</th>
                <th className="text-left rtl:text-right px-4 py-3">{t("hist.risk")}</th>
                <th className="text-left rtl:text-right px-4 py-3">{t("hist.scoreCol")}</th>
                <th className="text-left rtl:text-right px-4 py-3">{t("hist.content")}</th>
                <th className="text-right rtl:text-left px-4 py-3">{t("hist.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const cond = (r.condition ?? "Stable") as Condition;
                return (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{format(new Date(r.created_at), "MMM d, yyyy · HH:mm")}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-lg" aria-hidden>{conditionEmoji(cond)}</span>
                        {conditionLabel(cond)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ background: riskColor(r.risk_level) }} />
                        {t(`hist.${r.risk_level}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.risk_score ?? "—"}</td>
                    <td className="px-4 py-3 max-w-md truncate text-muted-foreground">{r.text_content ?? t("hist.imgOnly")}</td>
                    <td className="px-4 py-3 text-right rtl:text-left space-x-2 whitespace-nowrap">
                      <Link to="/results/$id" params={{ id: r.id }} className="text-accent text-sm hover:underline">{t("hist.open")}</Link>
                      <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="size-4 text-muted-foreground" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
