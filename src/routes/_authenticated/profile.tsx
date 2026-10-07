import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Save, ArrowLeft, Mail, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/powlink";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => pageHead("الملف الشخصي"),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useLang();
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [signedAvatar, setSignedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;
      setUserId(u.id);
      setEmail(u.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", u.id)
        .maybeSingle();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
        if (profile.avatar_url) {
          const { data: signed } = await supabase.storage
            .from("avatars")
            .createSignedUrl(profile.avatar_url, 3600);
          if (signed) setSignedAvatar(signed.signedUrl);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleUpload = async (file: File) => {
    if (!userId) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
      setAvatarUrl(path);
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      if (signed) setSignedAvatar(signed.signedUrl);
      toast.success(t("pr.avatarUpdated"));
    } catch (e: any) {
      toast.error(e.message || t("pr.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("pr.saved"));
  };

  const initial = (fullName || email || "U").charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" /> {t("pr.back")}
      </Link>

      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background:
            "var(--primary-gradient)",
        }}
      >
        
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0">
            <div className="size-24 rounded-2xl overflow-hidden bg-card/20 backdrop-blur border border-border/30 flex items-center justify-center text-primary-foreground text-3xl font-semibold">
              {signedAvatar ? (
                <img src={signedAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 size-9 rounded-full bg-card text-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-60"
              aria-label="Upload avatar"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
          </div>
          <div className="text-primary-foreground min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">{t("pr.your")}</div>
            <h1 className="text-2xl sm:text-3xl font-semibold mt-1">{fullName || t("pr.welcome")}</h1>
            <p className="text-primary-foreground/80 text-sm mt-1 truncate">{email}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-primary/15 p-6 sm:p-8  space-y-5">
        <h2 className="text-lg font-semibold text-foreground">{t("pr.account")}</h2>

        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
            <UserIcon className="size-3.5" /> {t("pr.fullName")}
          </label>
          <input
            type="text"
            value={fullName}
            disabled={loading}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("pr.namePh")}
            className="w-full h-11 rounded-lg px-4 text-sm bg-card border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
            <Mail className="size-3.5" /> {t("pr.email")}
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full h-11 rounded-lg px-4 text-sm bg-muted/40 border border-primary/10 text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-primary-foreground text-sm font-medium disabled:opacity-60"
            style={{
              background:
                "var(--primary-gradient)",
            }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t("pr.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
