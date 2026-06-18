import { useLang } from "@/lib/i18n/LanguageContext";
import {
  Mail, Globe, Smartphone, MessageCircle, AlertTriangle, ShieldAlert,
  Lock, User, MoreVertical, ThumbsUp, MapPin, Search, Shield,
  Package, Check, X, Cookie, Download,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type {
  VisualType, EmailClientConfig, BrowserLoginConfig, SmsPhishingConfig,
  PasswordFormConfig, TwoFactorConfig, SocialFeedConfig, DmRequestConfig,
  ChatGroupConfig, CommentSectionConfig, PhonePermissionsConfig,
  CookieConsentConfig, BrowserPopupConfig, FakeDownloadConfig,
} from "@/lib/visuals";

interface VisualsProps {
  visualType?: VisualType | null;
  visualConfig?: Record<string, unknown> | null;
  imageUrl?: string | null;
}

export function ScenarioVisuals({ visualType, visualConfig, imageUrl }: VisualsProps) {
  const { lang, t } = useLang();
  const c = (visualConfig ?? {}) as Record<string, unknown>;

  if (visualType === "email_client") {
    const cfg = c as unknown as EmailClientConfig;
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">{t("visualMailbox")}</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="border rounded-lg p-3 bg-primary/5 border-primary/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold truncate">{cfg.sender_name} &lt;{cfg.sender_email}&gt;</span>
              <span className="text-[10px] text-muted-foreground shrink-0 ms-2">14:22</span>
            </div>
            <p className="text-sm font-semibold mb-1">{lang === "fr" ? cfg.subject_fr : cfg.subject_ar}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{lang === "fr" ? cfg.body_fr : cfg.body_ar}</p>
            <div className="mt-3 py-1.5 px-3 bg-blue-600 text-white text-[10px] rounded inline-block">
              {lang === "fr" ? cfg.cta_fr : cfg.cta_ar}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "browser_login") {
    const cfg = c as unknown as BrowserLoginConfig;
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/20" />
            <div className="w-3 h-3 rounded-full bg-amber-400/20" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
          </div>
          <div className="flex-1 max-w-sm mx-auto bg-background rounded-md px-3 py-1 text-xs border flex items-center gap-2 text-muted-foreground">
            <Lock className="h-3 w-3 shrink-0" />
            <span className="truncate">{cfg.url}</span>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-100">
            {lang === "fr" ? cfg.brand_fr : cfg.brand_ar}
          </h3>
          <div className="w-full max-w-xs space-y-3">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-blue-600 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "sms_phishing") {
    const cfg = c as unknown as SmsPhishingConfig;
    const messages = cfg.messages ?? [];
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-3 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-zinc-600 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-slate-500" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{cfg.sender}</span>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-900 p-4 space-y-2 min-h-24">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                msg.side === "right"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-white dark:bg-zinc-700 text-slate-800 dark:text-slate-100 shadow-sm rounded-bl-sm"
              }`}>
                {lang === "fr" ? msg.text_fr : msg.text_ar}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visualType === "password_form") {
    const cfg = c as unknown as PasswordFormConfig;
    return (
      <div className="w-full aspect-video rounded-xl border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xs space-y-3 bg-card p-6 rounded-xl border shadow-sm">
          <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">{t("visualPasswordLabel")}</p>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={cfg.password}
              className="w-full font-mono border rounded px-3 py-2 text-sm bg-background pe-10"
            />
            <Lock className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          {cfg.strong ? (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[0,1,2,3].map(i => (
                  <div key={i} className="h-1 flex-1 bg-emerald-500 rounded-full" />
                ))}
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">{t("visualPasswordStrong")}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex gap-1">
                <div className="h-1 flex-1 bg-rose-500 rounded-full" />
                {[1,2,3].map(i => <div key={i} className="h-1 flex-1 bg-slate-200 rounded-full" />)}
              </div>
              <p className="text-[10px] text-rose-500 font-medium">{t("visualPasswordWeak")}</p>
            </div>
          )}
          <button type="button" className="w-full h-9 bg-[#1E3A8A] text-white rounded text-sm font-medium">
            {t("visualLoginBtn")}
          </button>
        </div>
      </div>
    );
  }

  if (visualType === "two_factor") {
    const cfg = c as unknown as TwoFactorConfig;
    return (
      <div className="w-full aspect-video rounded-xl border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xs bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-[#1E3A8A] px-4 py-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-xs font-bold text-white">{lang === "fr" ? cfg.service_fr : cfg.service_ar}</span>
          </div>
          <div className="p-4 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">{t("visualOtpSentTo")} <span className="font-mono font-bold text-slate-700">{cfg.email}</span></p>
            <div className="flex justify-center gap-2">
              {cfg.code.replace(/\s/g, "").split("").map((d, i) => (
                <div key={i} className="h-10 w-8 rounded border-2 border-[#1E3A8A] flex items-center justify-center font-mono font-bold text-lg text-[#1E3A8A]">
                  {d}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">{t("visualOtpExpires")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "social_feed") {
    const cfg = c as unknown as SocialFeedConfig;
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight text-blue-600">InstaPost</span>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="aspect-square bg-muted relative">
            {cfg.image_url ? (
              <img src={cfg.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                <User className="h-12 w-12 text-slate-400" />
              </div>
            )}
            {cfg.show_location && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {lang === "fr" ? cfg.location_fr : cfg.location_ar}
              </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-5 w-5" />
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="text-sm">
              <span className="font-bold me-2">{cfg.username}</span>
              {lang === "fr" ? cfg.caption_fr : cfg.caption_ar}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "dm_request") {
    const cfg = c as unknown as DmRequestConfig;
    return (
      <div className="w-full aspect-video rounded-xl border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xs bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="border-b px-4 py-3">
            <p className="text-xs font-semibold text-slate-700">{t("visualDmRequestTitle")}</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {cfg.username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{cfg.username}</p>
                <p className="text-[10px] text-slate-400">
                  {cfg.mutual_count === 0 ? t("visualNoMutual") : `${cfg.mutual_count} ${t("visualMutuals")}`}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic line-clamp-2 border-t border-slate-100 pt-3">
              "{lang === "fr" ? cfg.preview_fr : cfg.preview_ar}"
            </p>
            <div className="flex gap-2">
              <button type="button" className="flex-1 h-8 bg-blue-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1">
                <Check className="h-3 w-3" /> {t("visualAccept")}
              </button>
              <button type="button" className="flex-1 h-8 border border-slate-200 text-slate-600 rounded text-xs font-bold flex items-center justify-center gap-1">
                <X className="h-3 w-3" /> {t("visualDecline")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "chat_group") {
    const cfg = c as unknown as ChatGroupConfig;
    const messages = cfg.messages ?? [];
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm h-64 flex flex-col">
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm">{lang === "fr" ? cfg.group_name_fr : cfg.group_name_ar}</span>
        </div>
        <div className="flex-1 bg-[#e5ddd5] dark:bg-zinc-900 p-4 space-y-3 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.side === "right" ? "items-end" : "items-start"} max-w-[80%] ${msg.side === "right" ? "ms-auto" : ""}`}>
              <div className={`rounded-lg p-2 shadow-sm text-xs ${
                msg.side === "right"
                  ? "bg-[#dcf8c6] dark:bg-emerald-950 text-zinc-900 dark:text-zinc-100"
                  : "bg-white dark:bg-zinc-800"
              }`}>
                {msg.side === "left" && (
                  <span className="font-bold block text-[10px] mb-0.5" style={{ color: msg.color }}>{msg.username}</span>
                )}
                {lang === "fr" ? msg.text_fr : msg.text_ar}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visualType === "comment_section") {
    const cfg = c as unknown as CommentSectionConfig;
    const comments = cfg.comments ?? [];
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          <span className="text-xs font-semibold">user_123</span>
        </div>
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-slate-700">{lang === "fr" ? cfg.post_caption_fr : cfg.post_caption_ar}</p>
        </div>
        <div className="px-4 py-2 space-y-3 max-h-36 overflow-y-auto">
          {comments.map((comment, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                comment.type === "supportive" ? "bg-emerald-500" : comment.type === "mean" ? "bg-rose-500" : "bg-slate-400"
              }`}>
                {comment.username[0]?.toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-700 me-1">{comment.username}</span>
                <span className={`text-xs ${comment.type === "mean" ? "text-rose-600" : "text-slate-600"}`}>
                  {lang === "fr" ? comment.text_fr : comment.text_ar}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visualType === "phone_permissions") {
    const cfg = c as unknown as PhonePermissionsConfig;
    return (
      <div className="w-full aspect-video rounded-xl border bg-zinc-900 flex items-center justify-center p-6 overflow-hidden relative">
        <div className="w-full max-w-[200px] h-[350px] bg-zinc-800 rounded-[30px] border-4 border-zinc-700 p-4 flex flex-col items-center gap-6 shadow-2xl scale-75 sm:scale-90">
          <div className="w-12 h-1 bg-zinc-700 rounded-full mb-2" />
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
            <Search className="h-6 w-6" />
          </div>
          <div className="w-full bg-zinc-900/90 border border-zinc-700 text-white rounded-xl p-3 text-center space-y-3">
            <p className="text-[10px] leading-tight">
              {lang === "fr"
                ? `Autoriser "${cfg.app_name}" à ${cfg.permission_fr} ?`
                : `هل تسمح لـ "${cfg.app_name}" بـ${cfg.permission_ar}؟`}
            </p>
            <div className="flex flex-col gap-1.5">
              <button type="button" className="h-7 text-[10px] border border-zinc-700 text-white hover:bg-zinc-800 rounded px-2">
                {lang === "fr" ? cfg.allow_fr : cfg.allow_ar}
              </button>
              <button type="button" className="h-7 text-[10px] border border-zinc-700 text-blue-400 font-bold rounded px-2">
                {lang === "fr" ? cfg.deny_fr : cfg.deny_ar}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "cookie_consent") {
    const cfg = c as unknown as CookieConsentConfig;
    return (
      <div className="w-full aspect-video rounded-xl border bg-slate-100 dark:bg-zinc-900 flex flex-col overflow-hidden relative">
        {/* Fake website background */}
        <div className="flex-1 p-4 space-y-2 opacity-30">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">{cfg.site_name}</span>
          </div>
          {[80, 65, 90, 55].map((w, i) => (
            <div key={i} className="h-2 bg-slate-300 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Cookie banner */}
        <div className="bg-white dark:bg-zinc-800 border-t border-slate-200 p-4 shadow-lg">
          <div className="flex items-start gap-2 mb-3">
            <Cookie className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
              {lang === "fr" ? cfg.body_fr : cfg.body_ar}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex-1 h-8 bg-[#1E3A8A] text-white rounded text-[10px] font-bold">
              {lang === "fr" ? cfg.accept_fr : cfg.accept_ar}
            </button>
            <button type="button" className="h-8 px-2 border border-slate-200 text-slate-500 rounded text-[10px]">
              {lang === "fr" ? cfg.reject_fr : cfg.reject_ar}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "browser_popup") {
    const cfg = c as unknown as BrowserPopupConfig;
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm relative h-64">
        <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <div className="bg-background rounded px-2 py-0.5 text-[10px] border truncate max-w-32">{cfg.url}</div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <div className="w-full max-w-xs h-32 bg-zinc-100 dark:bg-zinc-800 rounded border flex flex-col items-center justify-center p-4 text-center relative">
            <Badge variant="destructive" className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
              <AlertTriangle className="h-3 w-3" /> {t("visualAlertBadge")}
            </Badge>
            <h4 className="text-sm font-bold mb-1">{lang === "fr" ? cfg.title_fr : cfg.title_ar}</h4>
            <p className="text-[10px] text-muted-foreground mb-3 leading-tight">{lang === "fr" ? cfg.body_fr : cfg.body_ar}</p>
            <Button size="sm" variant="destructive" className="h-8 text-[10px] px-4">
              {lang === "fr" ? cfg.cta_fr : cfg.cta_ar}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "fake_download") {
    const cfg = c as unknown as FakeDownloadConfig;
    const buttons = cfg.buttons ?? [];
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <div className="bg-background rounded px-2 py-0.5 text-[10px] border">free-downloads.net</div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{cfg.app_name}</p>
              <p className="text-[10px] text-slate-400">{lang === "fr" ? cfg.app_desc_fr : cfg.app_desc_ar}</p>
            </div>
          </div>
          <div className="space-y-2">
            {buttons.map((btn, i) => (
              <button key={i} type="button" className={`w-full h-9 rounded text-xs font-bold ${
                btn.style === "primary" ? "bg-green-500 text-white" :
                btn.style === "danger"  ? "bg-red-500 text-white" :
                "border border-slate-200 text-slate-600"
              }`}>
                {lang === "fr" ? btn.label_fr : btn.label_ar}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: scenario-level image/video
  if (imageUrl) {
    const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(imageUrl);
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted/40">
        {isVideo ? (
          <video src={imageUrl} controls className="w-full h-full object-cover" />
        ) : (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        )}
      </div>
    );
  }

  // Generic placeholder
  return (
    <div className="aspect-video w-full rounded-xl border bg-muted/40 flex items-center justify-center">
      <div className="text-muted-foreground flex flex-col items-center gap-2">
        <Smartphone className="h-8 w-8" />
        <span className="text-sm">{t("visualPlaceholder")}</span>
      </div>
    </div>
  );
}
