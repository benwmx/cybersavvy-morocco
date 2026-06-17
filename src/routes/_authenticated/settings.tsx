import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, User, Sparkles, Eye, EyeOff, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAIConfig, saveAIConfig, removeAIConfig, callAI, AIError, PROVIDER_META, type AIProvider } from "@/lib/ai";
import { getDefaultSystemPrompt } from "@/hooks/useAIRecommendations";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang } = useLang();
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

  // Connection settings
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [model, setModel] = useState(PROVIDER_META.gemini.defaultModel);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");
  const [hasSavedKey, setHasSavedKey] = useState(false);

  // Generation settings
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [promptFr, setPromptFr] = useState(() => getDefaultSystemPrompt("fr"));
  const [promptAr, setPromptAr] = useState(() => getDefaultSystemPrompt("ar"));

  useEffect(() => {
    if (session?.id) {
      const saved = getAIConfig(session.id);
      setHasSavedKey(!!saved);
      if (saved) {
        setProvider(saved.provider);
        setModel(saved.model);
        if (saved.temperature != null) setTemperature(saved.temperature);
        if (saved.maxTokens != null) setMaxTokens(saved.maxTokens);
        if (saved.customPromptFr) setPromptFr(saved.customPromptFr);
        if (saved.customPromptAr) setPromptAr(saved.customPromptAr);
      }
    }
  }, [session?.id]);

  const handleProviderChange = (p: AIProvider) => {
    setProvider(p);
    setModel(PROVIDER_META[p].defaultModel);
    setApiKey("");
    setKeyStatus("idle");
  };

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

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed || !session?.id) return;
    const config = {
      provider,
      model: model.trim() || PROVIDER_META[provider].defaultModel,
      apiKey: trimmed,
      temperature,
      maxTokens,
      customPromptFr: promptFr !== getDefaultSystemPrompt("fr") ? promptFr : undefined,
      customPromptAr: promptAr !== getDefaultSystemPrompt("ar") ? promptAr : undefined,
    };
    setKeyStatus("testing");
    try {
      await callAI(config, { system: "You are a helpful assistant.", user: "Reply with one word: ready" });
      saveAIConfig(session.id, config);
      setHasSavedKey(true);
      setApiKey("");
      setKeyStatus("valid");
      toast.success(t("apiKeySaved"));
      setTimeout(() => setKeyStatus("idle"), 3000);
    } catch (err) {
      // 429 = rate-limited but the key IS valid — save anyway
      if (err instanceof AIError && err.status === 429) {
        saveAIConfig(session.id, config);
        setHasSavedKey(true);
        setApiKey("");
        setKeyStatus("valid");
        toast.success(t("apiKeySaved"));
        setTimeout(() => setKeyStatus("idle"), 3000);
      } else {
        setKeyStatus("invalid");
        setTimeout(() => setKeyStatus("idle"), 3000);
      }
    }
  };

  const handleSavePreferences = () => {
    if (!session?.id) return;
    const current = getAIConfig(session.id);
    if (!current) return;
    saveAIConfig(session.id, {
      ...current,
      temperature,
      maxTokens,
      customPromptFr: promptFr !== getDefaultSystemPrompt("fr") ? promptFr : undefined,
      customPromptAr: promptAr !== getDefaultSystemPrompt("ar") ? promptAr : undefined,
    });
    toast.success(t("preferencesSaved"));
  };

  const handleResetPrompt = () => {
    if (lang === "ar") setPromptAr(getDefaultSystemPrompt("ar"));
    else setPromptFr(getDefaultSystemPrompt("fr"));
  };

  const handleRemoveApiKey = () => {
    if (!session?.id) return;
    removeAIConfig(session.id);
    setHasSavedKey(false);
    setTemperature(0.3);
    setMaxTokens(2000);
    setPromptFr(getDefaultSystemPrompt("fr"));
    setPromptAr(getDefaultSystemPrompt("ar"));
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

  const currentPrompt = lang === "ar" ? promptAr : promptFr;
  const setCurrentPrompt = (v: string) => lang === "ar" ? setPromptAr(v) : setPromptFr(v);
  const isPromptCustomised = currentPrompt !== getDefaultSystemPrompt(lang);

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
        <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden md:col-span-2">
          <div className="h-0.5 bg-violet-500" />
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-violet-700">
              <Sparkles className="h-4 w-4" />
              {t("aiConfig")}
            </CardTitle>
            <CardDescription className="text-xs">{t("aiConfigDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-5">

            {/* ── Connection ── */}
            <div className="space-y-4">
              {hasSavedKey && (
                <div className="flex items-center justify-between p-3 rounded bg-violet-50 border border-violet-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
                    <span className="text-xs font-medium text-violet-700">{t("keyConfigured")}</span>
                    <span className="text-xs text-slate-400">— {PROVIDER_META[provider].label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveApiKey}
                    className="h-6 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2"
                  >
                    {t("removeApiKey")}
                  </Button>
                </div>
              )}
              <form onSubmit={handleSaveApiKey} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">{t("aiProvider")}</Label>
                    <Select value={provider} onValueChange={v => handleProviderChange(v as AIProvider)}>
                      <SelectTrigger className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PROVIDER_META) as AIProvider[]).map(p => (
                          <SelectItem key={p} value={p}>{PROVIDER_META[p].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-model" className="text-xs text-slate-500">{t("aiModel")}</Label>
                    <Input
                      id="ai-model"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-key" className="text-xs text-slate-500">{t("aiApiKey")}</Label>
                    <div className="relative">
                      <Input
                        id="ai-key"
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder={PROVIDER_META[provider].placeholder}
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
                  </div>
                </div>
                <p className="text-xs text-slate-400">{PROVIDER_META[provider].hint}</p>
                <div className="flex items-center gap-3">
                  {keyStatus === "valid" && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("keyValid")}
                    </span>
                  )}
                  {keyStatus === "invalid" && (
                    <span className="flex items-center gap-1.5 text-xs text-rose-500">
                      <XCircle className="h-3.5 w-3.5" />
                      {t("keyInvalid")}
                    </span>
                  )}
                  <Button
                    type="submit"
                    disabled={!apiKey.trim() || keyStatus === "testing" || keyStatus === "valid" || keyStatus === "invalid"}
                    className="h-8 px-4 rounded bg-violet-600 hover:bg-violet-700 text-sm font-medium"
                  >
                    {keyStatus === "testing" ? t("testingKey") : t("saveApiKey")}
                  </Button>
                </div>
              </form>
            </div>

            {/* ── Generation settings (shown only when a key is saved) ── */}
            {hasSavedKey && (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("aiGenerationSettings")}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Temperature */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500">{t("aiTemperature")}</Label>
                      <span className="text-xs font-mono font-semibold text-violet-600">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                    <p className="text-xs text-slate-400">{t("aiTemperatureHint")}</p>
                  </div>

                  {/* Max tokens */}
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens" className="text-xs text-slate-500">{t("aiMaxTokens")}</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      min={500}
                      max={4000}
                      step={100}
                      value={maxTokens}
                      onChange={e => setMaxTokens(parseInt(e.target.value))}
                      className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm font-mono"
                    />
                    <p className="text-xs text-slate-400">{t("aiMaxTokensHint")}</p>
                  </div>
                </div>

                {/* System prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-500">{t("aiPromptLabel")}</Label>
                    {isPromptCustomised && (
                      <button
                        type="button"
                        onClick={handleResetPrompt}
                        className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t("aiPromptReset")}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={currentPrompt}
                    onChange={e => setCurrentPrompt(e.target.value)}
                    rows={10}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className="w-full rounded border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400"
                  />
                  <p className="text-xs text-slate-400">{t("aiPromptHint")}</p>
                </div>

                <Button
                  type="button"
                  onClick={handleSavePreferences}
                  className="h-8 px-4 rounded bg-violet-600 hover:bg-violet-700 text-sm font-medium"
                >
                  {t("savePreferences")}
                </Button>
              </div>
            )}

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
