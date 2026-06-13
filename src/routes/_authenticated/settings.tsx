import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { KeyRound, User, Sparkles, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGeminiKey, saveGeminiKey, removeGeminiKey, callGemini } from "@/lib/gemini";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useLang();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => api.getSession(),
  });

  const [firstName, setFirstName] = useState(() => session?.firstName ?? "");
  const [lastName, setLastName]   = useState(() => session?.lastName  ?? "");
  const [nameLoading, setNameLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [geminiKey, setGeminiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    if (session?.id) {
      const saved = getGeminiKey(session.id);
      setHasSavedKey(!!saved);
    }
  }, [session?.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      await api.updateProfile(firstName, lastName);
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(t("profileUpdated"));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setNameLoading(false);
    }
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = geminiKey.trim();
    if (!trimmed || !session?.id) return;
    setKeyStatus("testing");
    try {
      await callGemini(trimmed, "Reply with one word: ready");
      saveGeminiKey(session.id, trimmed);
      setHasSavedKey(true);
      setGeminiKey("");
      setKeyStatus("valid");
      toast.success(t("apiKeySaved"));
      setTimeout(() => setKeyStatus("idle"), 3000);
    } catch {
      setKeyStatus("invalid");
      setTimeout(() => setKeyStatus("idle"), 3000);
    }
  };

  const handleRemoveGeminiKey = () => {
    if (!session?.id) return;
    removeGeminiKey(session.id);
    setHasSavedKey(false);
    toast.success(t("removeApiKey"));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }
    setPwLoading(true);
    try {
      await api.updatePassword(password);
      toast.success(t("passwordUpdated"));
      setPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold text-slate-900">{t("settings")}</h1>
        <p className="text-sm text-slate-500">{t("settingsSubtitle")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
          <div className="h-0.5 bg-[#1E3A8A]" />
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <User className="h-4 w-4" />
              {t("account")}
            </CardTitle>
            <CardDescription className="text-xs">{t("profileDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="p-3 rounded bg-slate-50 border border-slate-100">
              <Label className="text-xs text-slate-500">{t("email")}</Label>
              <p className="font-medium text-sm text-slate-700 mt-1 select-all">{session?.email || "..."}</p>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs text-slate-500">
                    {t("firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="h-8 rounded bg-slate-50/50 border-slate-200 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs text-slate-500">
                    {t("lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="h-8 rounded bg-slate-50/50 border-slate-200 text-sm"
                  />
                </div>
              </div>
              <Button type="submit" disabled={nameLoading} className="h-8 px-4 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium">
                {t("save")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI config card */}
        <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
          <div className="h-0.5 bg-violet-500" />
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-violet-700">
              <Sparkles className="h-4 w-4" />
              {t("aiConfig")}
            </CardTitle>
            <CardDescription className="text-xs">{t("aiConfigDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            {hasSavedKey && (
              <div className="flex items-center justify-between p-3 rounded bg-violet-50 border border-violet-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-medium text-violet-700">{t("keyConfigured")}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveGeminiKey}
                  className="h-6 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2"
                >
                  {t("removeApiKey")}
                </Button>
              </div>
            )}
            <form onSubmit={handleSaveGeminiKey} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="gemini-key" className="text-xs text-slate-500">{t("geminiApiKey")}</Label>
                <div className="relative">
                  <Input
                    id="gemini-key"
                    type={showKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    placeholder={t("geminiApiKeyPlaceholder")}
                    className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm pe-8 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(v => !v)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">{t("geminiApiKeyHint")}</p>
              </div>
              {keyStatus === "valid" && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("keyValid")}
                </div>
              )}
              {keyStatus === "invalid" && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500">
                  <XCircle className="h-3.5 w-3.5" />
                  {t("keyInvalid")}
                </div>
              )}
              <Button
                type="submit"
                disabled={!geminiKey.trim() || keyStatus === "testing"}
                className="h-8 px-4 rounded bg-violet-600 hover:bg-violet-700 text-sm font-medium"
              >
                {keyStatus === "testing" ? t("testingKey") : t("saveApiKey")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password card */}
        <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
          <div className="h-0.5 bg-rose-500" />
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-rose-600">
              <KeyRound className="h-4 w-4" />
              {t("updatePassword")}
            </CardTitle>
            <CardDescription className="text-xs">{t("updatePasswordDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs text-slate-500">{t("newPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm"
                />
              </div>
              <Button type="submit" disabled={pwLoading || !password} className="h-8 px-4 rounded bg-rose-600 hover:bg-rose-700 text-sm font-medium">
                {t("update")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
