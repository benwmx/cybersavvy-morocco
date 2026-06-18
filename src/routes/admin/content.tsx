import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import type { CategoryRow, ScenarioRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Layers, BookOpen, ChevronRight, HelpCircle, ImageIcon, Layout, X } from "lucide-react";
import type { Json } from "@/lib/database.types";
import { ImageUpload } from "@/components/ImageUpload";
import { VISUAL_CATEGORIES, DEFAULT_CONFIGS } from "@/lib/visuals";
import type { VisualType, ChatMessage, SmsMessage, Comment, DownloadButton } from "@/lib/visuals";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseBilingual(json: Json): { fr: string; ar: string } {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return {
      fr: String((json as Record<string, unknown>).fr ?? ""),
      ar: String((json as Record<string, unknown>).ar ?? ""),
    };
  }
  const s = String(json ?? "");
  return { fr: s, ar: s };
}

interface Question {
  id: string;
  prompt: { fr: string; ar: string };
  choices: { fr: string[]; ar: string[] };
  correctIndex: number;
  explanation: { fr: string; ar: string };
  media_url?: string | null;
  visual_type?: VisualType | null;
  visual_config?: Record<string, unknown> | null;
}

function parseQuestions(json: Json): Question[] {
  try {
    const s = typeof json === "string" ? json : JSON.stringify(json);
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed as Question[];
  } catch {}
  return [];
}

const BLANK_QUESTION = (): Question => ({
  id: `q${Date.now()}`,
  prompt: { fr: "", ar: "" },
  choices: { fr: ["", "", ""], ar: ["", "", ""] },
  correctIndex: 0,
  explanation: { fr: "", ar: "" },
  media_url: null,
});

// ─── Visual template editor ───────────────────────────────────────────────────

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  phishing: "visualCategoryPhishing",
  passwords: "visualCategoryPasswords",
  "social-media": "visualCategorySocial",
  cyberbullying: "visualCategoryCyber",
  privacy: "visualCategoryPrivacy",
  malware: "visualCategoryMalware",
};

const TEMPLATE_LABEL_KEYS: Record<VisualType, string> = {
  email_client: "visualEmailClient",
  browser_login: "visualBrowserLogin",
  sms_phishing: "visualSmsPhishing",
  password_form: "visualPasswordForm",
  two_factor: "visualTwoFactor",
  social_feed: "visualSocialFeed",
  dm_request: "visualDmRequest",
  chat_group: "visualChatGroup",
  comment_section: "visualCommentSection",
  phone_permissions: "visualPhonePermissions",
  cookie_consent: "visualCookieConsent",
  browser_popup: "visualBrowserPopup",
  fake_download: "visualFakeDownload",
};

function VisualTemplateEditor({
  visualType,
  visualConfig,
  onChange,
}: {
  visualType: VisualType | null | undefined;
  visualConfig: Record<string, unknown> | null | undefined;
  onChange: (type: VisualType | null, config: Record<string, unknown> | null) => void;
}) {
  const { t } = useLang();
  const cfg = (visualConfig ?? {}) as Record<string, unknown>;

  const set = (patch: Record<string, unknown>) => onChange(visualType!, { ...cfg, ...patch });
  const setMsg = (msgs: ChatMessage[]) => set({ messages: msgs });
  const setComments = (comments: Comment[]) => set({ comments });
  const setSmsMessages = (messages: SmsMessage[]) => set({ messages });
  const setButtons = (buttons: DownloadButton[]) => set({ buttons });

  const inp = "w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#1E3A8A] transition-colors";
  const row = "grid grid-cols-2 gap-2";
  const fieldLabel = "text-[10px] font-medium text-slate-500 mb-0.5";

  return (
    <div className="space-y-3">
      {/* Template type selector */}
      <div className="flex items-center gap-2">
        <Layout className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <label className="text-xs font-medium text-slate-600">{t("visualTemplateLabel")}</label>
      </div>
      <select
        value={visualType ?? ""}
        onChange={e => {
          const val = e.target.value as VisualType | "";
          if (!val) { onChange(null, null); return; }
          onChange(val, DEFAULT_CONFIGS[val] as unknown as Record<string, unknown>);
        }}
        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#1E3A8A] transition-colors"
      >
        <option value="">{t("visualNone")}</option>
        {Object.entries(VISUAL_CATEGORIES).map(([cat, types]) => (
          <optgroup key={cat} label={t((CATEGORY_LABEL_KEYS[cat] ?? cat) as any)}>
            {types.map(vt => (
              <option key={vt} value={vt}>{t((TEMPLATE_LABEL_KEYS[vt]) as any)}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {visualType && (
        <p className="text-[10px] text-slate-400 italic">{t("visualTemplateHint")}</p>
      )}

      {/* Config fields */}
      {visualType === "email_client" && (
        <div className="space-y-2 pt-1">
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualSenderName")}</p><input className={inp} value={String(cfg.sender_name ?? "")} onChange={e => set({ sender_name: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualSenderEmail")}</p><input className={inp} value={String(cfg.sender_email ?? "")} onChange={e => set({ sender_email: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualSubjectFr")}</p><input className={inp} value={String(cfg.subject_fr ?? "")} onChange={e => set({ subject_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualSubjectAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.subject_ar ?? "")} onChange={e => set({ subject_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualBodyFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.body_fr ?? "")} onChange={e => set({ body_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualBodyAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.body_ar ?? "")} onChange={e => set({ body_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualCtaFr")}</p><input className={inp} value={String(cfg.cta_fr ?? "")} onChange={e => set({ cta_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualCtaAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.cta_ar ?? "")} onChange={e => set({ cta_ar: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "browser_login" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualUrl")}</p><input className={inp} value={String(cfg.url ?? "")} onChange={e => set({ url: e.target.value })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualBrandFr")}</p><input className={inp} value={String(cfg.brand_fr ?? "")} onChange={e => set({ brand_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualBrandAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.brand_ar ?? "")} onChange={e => set({ brand_ar: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "sms_phishing" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualSmsSender")}</p><input className={inp} value={String(cfg.sender ?? "")} onChange={e => set({ sender: e.target.value })} /></div>
          <p className={`${fieldLabel} pt-1`}>{t("visualMessages")}</p>
          {((cfg.messages ?? []) as SmsMessage[]).map((msg, i) => (
            <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">#{i + 1}</span>
                <button type="button" onClick={() => setSmsMessages(((cfg.messages ?? []) as SmsMessage[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
              </div>
              <div className={row}>
                <div><p className={fieldLabel}>{t("visualMsgTextFr")}</p><textarea className={`${inp} resize-none h-14`} value={msg.text_fr} onChange={e => { const msgs = [...((cfg.messages ?? []) as SmsMessage[])]; msgs[i] = { ...msg, text_fr: e.target.value }; setSmsMessages(msgs); }} /></div>
                <div><p className={fieldLabel}>{t("visualMsgTextAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={msg.text_ar} onChange={e => { const msgs = [...((cfg.messages ?? []) as SmsMessage[])]; msgs[i] = { ...msg, text_ar: e.target.value }; setSmsMessages(msgs); }} /></div>
              </div>
              <div>
                <p className={fieldLabel}>{t("visualMsgSide")}</p>
                <select className={`${inp} w-auto`} value={msg.side} onChange={e => { const msgs = [...((cfg.messages ?? []) as SmsMessage[])]; msgs[i] = { ...msg, side: e.target.value as "left" | "right" }; setSmsMessages(msgs); }}>
                  <option value="left">{t("visualLeft")}</option>
                  <option value="right">{t("visualRight")}</option>
                </select>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setSmsMessages([...((cfg.messages ?? []) as SmsMessage[]), { text_fr: "", text_ar: "", side: "left" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddMessage")}</button>
        </div>
      )}

      {visualType === "password_form" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualPassword")}</p><input className={`${inp} font-mono`} value={String(cfg.password ?? "")} onChange={e => set({ password: e.target.value })} /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!cfg.strong} onChange={e => set({ strong: e.target.checked })} className="h-3.5 w-3.5 accent-emerald-500 rounded" />
            <span className="text-xs text-slate-600">{t("visualStrongToggle")}</span>
          </label>
        </div>
      )}

      {visualType === "two_factor" && (
        <div className="space-y-2 pt-1">
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualServiceFr")}</p><input className={inp} value={String(cfg.service_fr ?? "")} onChange={e => set({ service_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualServiceAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.service_ar ?? "")} onChange={e => set({ service_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualMaskedEmail")}</p><input className={`${inp} font-mono`} value={String(cfg.email ?? "")} onChange={e => set({ email: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualOtpCode")}</p><input className={`${inp} font-mono`} value={String(cfg.code ?? "")} onChange={e => set({ code: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "social_feed" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualUsername")}</p><input className={inp} value={String(cfg.username ?? "")} onChange={e => set({ username: e.target.value })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualCaptionFr")}</p><input className={inp} value={String(cfg.caption_fr ?? "")} onChange={e => set({ caption_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualCaptionAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.caption_ar ?? "")} onChange={e => set({ caption_ar: e.target.value })} /></div>
          </div>
          <div><p className={fieldLabel}>{t("visualImageUrlOpt")}</p><input className={inp} value={String(cfg.image_url ?? "")} onChange={e => set({ image_url: e.target.value || undefined })} /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!cfg.show_location} onChange={e => set({ show_location: e.target.checked })} className="h-3.5 w-3.5 accent-[#1E3A8A] rounded" />
            <span className="text-xs text-slate-600">{t("visualShowLocation")}</span>
          </label>
          {!!cfg.show_location && (
            <div className={row}>
              <div><p className={fieldLabel}>{t("visualLocationFr")}</p><input className={inp} value={String(cfg.location_fr ?? "")} onChange={e => set({ location_fr: e.target.value })} /></div>
              <div><p className={fieldLabel}>{t("visualLocationAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.location_ar ?? "")} onChange={e => set({ location_ar: e.target.value })} /></div>
            </div>
          )}
        </div>
      )}

      {visualType === "dm_request" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualUsername")}</p><input className={inp} value={String(cfg.username ?? "")} onChange={e => set({ username: e.target.value })} /></div>
          <div><p className={fieldLabel}>{t("visualMutualCount")}</p><input type="number" min={0} className={`${inp} w-24`} value={Number(cfg.mutual_count ?? 0)} onChange={e => set({ mutual_count: Number(e.target.value) })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualPreviewFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.preview_fr ?? "")} onChange={e => set({ preview_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualPreviewAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.preview_ar ?? "")} onChange={e => set({ preview_ar: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "chat_group" && (
        <div className="space-y-2 pt-1">
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualGroupNameFr")}</p><input className={inp} value={String(cfg.group_name_fr ?? "")} onChange={e => set({ group_name_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualGroupNameAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.group_name_ar ?? "")} onChange={e => set({ group_name_ar: e.target.value })} /></div>
          </div>
          <p className={`${fieldLabel} pt-1`}>{t("visualMessages")}</p>
          {((cfg.messages ?? []) as ChatMessage[]).map((msg, i) => (
            <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">#{i + 1}</span>
                <button type="button" onClick={() => setMsg(((cfg.messages ?? []) as ChatMessage[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><p className={fieldLabel}>{t("visualUsername")}</p><input className={inp} value={msg.username} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, username: e.target.value }; setMsg(m); }} /></div>
                <div className="w-20"><p className={fieldLabel}>{t("visualMsgColor")}</p><input type="color" className="h-[30px] w-full rounded border border-slate-200 cursor-pointer" value={msg.color || "#94a3b8"} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, color: e.target.value }; setMsg(m); }} /></div>
                <div><p className={fieldLabel}>{t("visualMsgSide")}</p><select className={`${inp} w-auto`} value={msg.side} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, side: e.target.value as "left" | "right" }; setMsg(m); }}><option value="left">{t("visualLeft")}</option><option value="right">{t("visualRight")}</option></select></div>
              </div>
              <div className={row}>
                <div><p className={fieldLabel}>{t("visualMsgTextFr")}</p><textarea className={`${inp} resize-none h-14`} value={msg.text_fr} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, text_fr: e.target.value }; setMsg(m); }} /></div>
                <div><p className={fieldLabel}>{t("visualMsgTextAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={msg.text_ar} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, text_ar: e.target.value }; setMsg(m); }} /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setMsg([...((cfg.messages ?? []) as ChatMessage[]), { username: "", color: "#94a3b8", text_fr: "", text_ar: "", side: "left" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddMessage")}</button>
        </div>
      )}

      {visualType === "comment_section" && (
        <div className="space-y-2 pt-1">
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualPostCaptionFr")}</p><input className={inp} value={String(cfg.post_caption_fr ?? "")} onChange={e => set({ post_caption_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualPostCaptionAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.post_caption_ar ?? "")} onChange={e => set({ post_caption_ar: e.target.value })} /></div>
          </div>
          <p className={`${fieldLabel} pt-1`}>{t("visualComments")}</p>
          {((cfg.comments ?? []) as Comment[]).map((comment, i) => (
            <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">#{i + 1}</span>
                <button type="button" onClick={() => setComments(((cfg.comments ?? []) as Comment[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><p className={fieldLabel}>{t("visualUsername")}</p><input className={inp} value={comment.username} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, username: e.target.value }; setComments(c); }} /></div>
                <div><p className={fieldLabel}>{t("visualCommentType")}</p>
                  <select className={`${inp} w-auto`} value={comment.type} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, type: e.target.value as Comment["type"] }; setComments(c); }}>
                    <option value="normal">{t("visualCommentNormal")}</option>
                    <option value="mean">{t("visualCommentMean")}</option>
                    <option value="supportive">{t("visualCommentSupportive")}</option>
                  </select>
                </div>
              </div>
              <div className={row}>
                <div><p className={fieldLabel}>{t("visualCommentTextFr")}</p><input className={inp} value={comment.text_fr} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, text_fr: e.target.value }; setComments(c); }} /></div>
                <div><p className={fieldLabel}>{t("visualCommentTextAr")}</p><input className={`${inp} text-right`} dir="rtl" value={comment.text_ar} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, text_ar: e.target.value }; setComments(c); }} /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setComments([...((cfg.comments ?? []) as Comment[]), { username: "", text_fr: "", text_ar: "", type: "normal" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddComment")}</button>
        </div>
      )}

      {visualType === "phone_permissions" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualAppName")}</p><input className={inp} value={String(cfg.app_name ?? "")} onChange={e => set({ app_name: e.target.value })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualPermissionFr")}</p><input className={inp} value={String(cfg.permission_fr ?? "")} onChange={e => set({ permission_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualPermissionAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.permission_ar ?? "")} onChange={e => set({ permission_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualAllowFr")}</p><input className={inp} value={String(cfg.allow_fr ?? "")} onChange={e => set({ allow_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualAllowAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.allow_ar ?? "")} onChange={e => set({ allow_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualDenyFr")}</p><input className={inp} value={String(cfg.deny_fr ?? "")} onChange={e => set({ deny_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualDenyAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.deny_ar ?? "")} onChange={e => set({ deny_ar: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "cookie_consent" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualSiteName")}</p><input className={inp} value={String(cfg.site_name ?? "")} onChange={e => set({ site_name: e.target.value })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualBodyFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.body_fr ?? "")} onChange={e => set({ body_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualBodyAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.body_ar ?? "")} onChange={e => set({ body_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualAcceptFr")}</p><input className={inp} value={String(cfg.accept_fr ?? "")} onChange={e => set({ accept_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualAcceptAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.accept_ar ?? "")} onChange={e => set({ accept_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualRejectFr")}</p><input className={inp} value={String(cfg.reject_fr ?? "")} onChange={e => set({ reject_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualRejectAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.reject_ar ?? "")} onChange={e => set({ reject_ar: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "browser_popup" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualUrl")}</p><input className={inp} value={String(cfg.url ?? "")} onChange={e => set({ url: e.target.value })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualTitleFr")}</p><input className={inp} value={String(cfg.title_fr ?? "")} onChange={e => set({ title_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualTitleAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.title_ar ?? "")} onChange={e => set({ title_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualBodyFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.body_fr ?? "")} onChange={e => set({ body_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualBodyAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.body_ar ?? "")} onChange={e => set({ body_ar: e.target.value })} /></div>
          </div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualCtaFr")}</p><input className={inp} value={String(cfg.cta_fr ?? "")} onChange={e => set({ cta_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualCtaAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.cta_ar ?? "")} onChange={e => set({ cta_ar: e.target.value })} /></div>
          </div>
        </div>
      )}

      {visualType === "fake_download" && (
        <div className="space-y-2 pt-1">
          <div><p className={fieldLabel}>{t("visualAppName")}</p><input className={inp} value={String(cfg.app_name ?? "")} onChange={e => set({ app_name: e.target.value })} /></div>
          <div className={row}>
            <div><p className={fieldLabel}>{t("visualAppDescFr")}</p><input className={inp} value={String(cfg.app_desc_fr ?? "")} onChange={e => set({ app_desc_fr: e.target.value })} /></div>
            <div><p className={fieldLabel}>{t("visualAppDescAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.app_desc_ar ?? "")} onChange={e => set({ app_desc_ar: e.target.value })} /></div>
          </div>
          <p className={`${fieldLabel} pt-1`}>{t("visualButtons")}</p>
          {((cfg.buttons ?? []) as DownloadButton[]).map((btn, i) => (
            <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">#{i + 1}</span>
                <button type="button" onClick={() => setButtons(((cfg.buttons ?? []) as DownloadButton[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
              </div>
              <div className={row}>
                <div><p className={fieldLabel}>{t("visualBtnLabelFr")}</p><input className={inp} value={btn.label_fr} onChange={e => { const b = [...((cfg.buttons ?? []) as DownloadButton[])]; b[i] = { ...btn, label_fr: e.target.value }; setButtons(b); }} /></div>
                <div><p className={fieldLabel}>{t("visualBtnLabelAr")}</p><input className={`${inp} text-right`} dir="rtl" value={btn.label_ar} onChange={e => { const b = [...((cfg.buttons ?? []) as DownloadButton[])]; b[i] = { ...btn, label_ar: e.target.value }; setButtons(b); }} /></div>
              </div>
              <div>
                <p className={fieldLabel}>{t("visualBtnStyle")}</p>
                <select className={`${inp} w-auto`} value={btn.style} onChange={e => { const b = [...((cfg.buttons ?? []) as DownloadButton[])]; b[i] = { ...btn, style: e.target.value as DownloadButton["style"] }; setButtons(b); }}>
                  <option value="primary">{t("visualBtnPrimary")}</option>
                  <option value="secondary">{t("visualBtnSecondary")}</option>
                  <option value="danger">{t("visualBtnDanger")}</option>
                </select>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setButtons([...((cfg.buttons ?? []) as DownloadButton[]), { label_fr: "", label_ar: "", style: "primary" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddButton")}</button>
        </div>
      )}
    </div>
  );
}

// ─── Questions editor ─────────────────────────────────────────────────────────

function QuestionsEditor({
  questions,
  onChange,
  hideAdd = false,
  userId = "",
}: {
  questions: Question[];
  onChange: (qs: Question[]) => void;
  hideAdd?: boolean;
  userId?: string;
}) {
  const { t } = useLang();

  const update = (i: number, patch: Partial<Question>) =>
    onChange(questions.map((q, qi) => (qi === i ? { ...q, ...patch } : q)));

  const updateChoice = (qi: number, ci: number, side: "fr" | "ar", val: string) => {
    const q = questions[qi];
    update(qi, { choices: { ...q.choices, [side]: q.choices[side].map((c, i) => (i === ci ? val : c)) } });
  };

  const addChoice = (qi: number) => {
    const q = questions[qi];
    update(qi, { choices: { fr: [...q.choices.fr, ""], ar: [...q.choices.ar, ""] } });
  };

  const removeChoice = (qi: number, ci: number) => {
    const q = questions[qi];
    const fr = q.choices.fr.filter((_, i) => i !== ci);
    const ar = q.choices.ar.filter((_, i) => i !== ci);
    update(qi, { choices: { fr, ar }, correctIndex: Math.max(0, Math.min(q.correctIndex, fr.length - 1)) });
  };

  const inp = "flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#1E3A8A] transition-colors";

  return (
    <div className="space-y-3">
      {questions.map((q, qi) => (
        <div key={q.id} className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {t("question")} {qi + 1}
            </span>
            {questions.length > 1 && (
              <button type="button" onClick={() => onChange(questions.filter((_, i) => i !== qi))}
                className="text-xs font-medium text-rose-400 hover:text-rose-600">
                {t("delete")}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={q.prompt.fr} onChange={e => update(qi, { prompt: { ...q.prompt, fr: e.target.value } })}
              placeholder={`${t("question")} (FR)`} className={inp} />
            <input value={q.prompt.ar} onChange={e => update(qi, { prompt: { ...q.prompt, ar: e.target.value } })}
              placeholder={`${t("question")} (AR)`} dir="rtl" className={`${inp} text-right`} />
          </div>
          {userId && (
            <ImageUpload
              value={q.media_url ?? null}
              onChange={url => update(qi, { media_url: url })}
              userId={userId}
              folder="questions"
              label={t("mediaUrl")}
            />
          )}
          <div className="border-t border-slate-100 pt-3">
            <VisualTemplateEditor
              visualType={q.visual_type}
              visualConfig={q.visual_config as Record<string, unknown> | null}
              onChange={(type, config) => update(qi, { visual_type: type, visual_config: config })}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">
              {t("adminChoicesLabel")}
            </p>
            {q.choices.fr.map((_, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === ci}
                  onChange={() => update(qi, { correctIndex: ci })} className="h-4 w-4 accent-emerald-500 shrink-0" />
                <input value={q.choices.fr[ci]} onChange={e => updateChoice(qi, ci, "fr", e.target.value)}
                  placeholder={`${t("adminOption")} ${ci + 1} (FR)`} className={inp} />
                <input value={q.choices.ar[ci]} onChange={e => updateChoice(qi, ci, "ar", e.target.value)}
                  placeholder={`${t("adminOption")} ${ci + 1} (AR)`} dir="rtl" className={`${inp} text-right`} />
                {q.choices.fr.length > 2 && (
                  <button type="button" onClick={() => removeChoice(qi, ci)}
                    className="shrink-0 text-rose-400 hover:text-rose-600 font-bold text-lg leading-none">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addChoice(qi)} className="text-xs font-bold text-[#1E3A8A] hover:underline">
              + {t("adminAddChoice")}
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              {t("adminExplanation")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input value={q.explanation.fr} onChange={e => update(qi, { explanation: { ...q.explanation, fr: e.target.value } })}
                placeholder={`${t("adminExplanation")} (FR)`} className={inp} />
              <input value={q.explanation.ar} onChange={e => update(qi, { explanation: { ...q.explanation, ar: e.target.value } })}
                placeholder={`${t("adminExplanation")} (AR)`} dir="rtl" className={`${inp} text-right`} />
            </div>
          </div>
        </div>
      ))}
      {!hideAdd && (
        <button type="button" onClick={() => onChange([...questions, BLANK_QUESTION()])}
          className="w-full rounded border-2 border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors">
          + {t("addQuestion")}
        </button>
      )}
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  q,
  qi,
  lang,
  onEdit,
  onDelete,
}: {
  q: Question;
  qi: number;
  lang: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useLang();
  const prompt      = lang === "fr" ? q.prompt.fr      : q.prompt.ar;
  const promptOther = lang === "fr" ? q.prompt.ar      : q.prompt.fr;
  const choices     = lang === "fr" ? q.choices.fr     : q.choices.ar;
  const explanation = lang === "fr" ? q.explanation.fr : q.explanation.ar;

  return (
    <div className="rounded border border-slate-200 bg-white shadow-none overflow-hidden hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/80 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            {t("question")} {qi + 1}
          </span>
          {q.media_url && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
              <ImageIcon className="h-2.5 w-2.5" />
              {/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(q.media_url) ? t("adminVideo") : t("adminImage")}
            </span>
          )}
          {q.visual_type && !q.media_url && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              <Layout className="h-2.5 w-2.5" />
              {t((TEMPLATE_LABEL_KEYS[q.visual_type]) as any)}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 transition-colors">
            <Pencil className="h-3 w-3" />
            {t("adminModify")}
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors">
            <Trash2 className="h-3 w-3" />
            {t("delete")}
          </button>
        </div>
      </div>
      <div className="px-5 py-3 space-y-2.5">
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-snug" dir={lang === "ar" ? "rtl" : "ltr"}>
            {prompt || <span className="italic text-slate-300">{t("adminQNoText")}</span>}
          </p>
          {promptOther && (
            <p className="text-xs text-slate-400 mt-0.5 leading-snug" dir={lang === "fr" ? "rtl" : "ltr"}>
              {promptOther}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" dir={lang === "ar" ? "rtl" : "ltr"}>
          {choices.map((c, ci) => (
            <span key={ci} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
              ci === q.correctIndex
                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-slate-100 text-slate-500"
            }`}>
              {ci === q.correctIndex && <span className="font-black text-emerald-500">✓</span>}
              {c}
            </span>
          ))}
        </div>
        {explanation && (
          <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2" dir={lang === "ar" ? "rtl" : "ltr"}>
            {explanation}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Single-question edit dialog ──────────────────────────────────────────────

function QuestionEditDialog({
  open,
  qi,
  question,
  userId,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  qi: number;
  question: Question;
  userId: string;
  onClose: () => void;
  onSave: (q: Question) => void;
  saving: boolean;
}) {
  const { t } = useLang();
  const [q, setQ] = useState<Question>(question);
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-semibold">
            {t("adminEditQuestion")} {qi + 1}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto pe-1 py-2">
          <QuestionsEditor questions={[q]} onChange={qs => setQ(qs[0])} hideAdd userId={userId} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded text-sm font-medium">
            {t("adminCancel")}
          </Button>
          <Button onClick={() => onSave(q)} disabled={saving}
            className="rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category dialog ──────────────────────────────────────────────────────────

interface CategoryFormData { fr: string; ar: string; color_code: string; }

function CategoryDialog({
  open, initial, onClose, onSave, saving,
}: {
  open: boolean; initial: CategoryFormData; onClose: () => void;
  onSave: (d: CategoryFormData) => void; saving: boolean;
}) {
  const { t } = useLang();
  const [fr, setFr] = useState(initial.fr);
  const [ar, setAr] = useState(initial.ar);
  const [color, setColor] = useState(initial.color_code || "#3B82F6");
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-semibold">
            {initial.fr ? t("adminEditCategory") : t("adminNewCategory")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">
              {t("adminNameFr")}
            </Label>
            <Input value={fr} onChange={e => setFr(e.target.value)} placeholder={t("adminCategoryFrPlaceholder")}
              className="rounded" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">
              {t("adminNameAr")}
            </Label>
            <Input value={ar} onChange={e => setAr(e.target.value)} placeholder={t("adminCategoryArPlaceholder")}
              className="rounded text-right" dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">
              {t("adminColor")}
            </Label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="h-8 w-12 rounded border border-slate-200 cursor-pointer" />
              <Input value={color} onChange={e => setColor(e.target.value)} placeholder="#3B82F6"
                className="rounded font-mono flex-1" maxLength={7} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded text-sm font-medium">{t("adminCancel")}</Button>
          <Button onClick={() => onSave({ fr, ar, color_code: color })}
            disabled={!fr.trim() || !ar.trim() || saving}
            className="rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Scenario dialog ──────────────────────────────────────────────────────────

interface ScenarioFormData {
  title_fr: string; title_ar: string;
  desc_fr: string;  desc_ar: string;
  questions: Question[];
  image_url: string | null;
}

const SCENARIO_TEMPLATE: ScenarioFormData = {
  title_fr: "", title_ar: "",
  desc_fr: "", desc_ar: "",
  image_url: null,
  questions: [{
    id: "q1",
    prompt: { fr: "", ar: "" },
    choices: { fr: ["", "", ""], ar: ["", "", ""] },
    correctIndex: 0,
    explanation: { fr: "", ar: "" },
  }],
};

function ScenarioDialog({
  open, initial, userId, onClose, onSave, saving,
}: {
  open: boolean; initial: ScenarioFormData; userId: string; onClose: () => void;
  onSave: (d: ScenarioFormData) => void; saving: boolean;
}) {
  const { t } = useLang();
  const [titleFr, setTitleFr] = useState(initial.title_fr);
  const [titleAr, setTitleAr] = useState(initial.title_ar);
  const [descFr,  setDescFr]  = useState(initial.desc_fr);
  const [descAr,  setDescAr]  = useState(initial.desc_ar);
  const [imageUrl, setImageUrl] = useState<string | null>(initial.image_url);
  const [questions, setQuestions] = useState<Question[]>(
    initial.questions.length > 0 ? initial.questions : SCENARIO_TEMPLATE.questions
  );
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-semibold">
            {initial.title_fr ? t("adminEditScenario") : t("adminNewScenario")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pe-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("adminTitleFrField")}</Label>
              <Input value={titleFr} onChange={e => setTitleFr(e.target.value)} className="rounded" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("adminTitleArField")}</Label>
              <Input value={titleAr} onChange={e => setTitleAr(e.target.value)} className="rounded text-right" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("adminDescFrField")}</Label>
              <Input value={descFr} onChange={e => setDescFr(e.target.value)} className="rounded" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("adminDescArField")}</Label>
              <Input value={descAr} onChange={e => setDescAr(e.target.value)} className="rounded text-right" dir="rtl" />
            </div>
          </div>
          {userId && (
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              userId={userId}
              folder="scenarios"
              label={t("scenarioCoverImage")}
            />
          )}
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">
              {t("adminQuestionsLabel")}
            </Label>
            <QuestionsEditor questions={questions} onChange={setQuestions} userId={userId} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded">{t("adminCancel")}</Button>
          <Button
            onClick={() => onSave({ title_fr: titleFr, title_ar: titleAr, desc_fr: descFr, desc_ar: descAr, questions, image_url: imageUrl })}
            disabled={!titleFr.trim() || !titleAr.trim() || saving}
            className="rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ContentPage() {
  const { lang, t } = useLang();
  const qc = useQueryClient();

  const [selectedCatId,  setSelectedCatId]  = useState<string | null>(null);
  const [selectedScenId, setSelectedScenId] = useState<string | null>(null);
  const [catDialog,  setCatDialog]  = useState<{ open: boolean; row?: CategoryRow }>({ open: false });
  const [scenDialog, setScenDialog] = useState<{ open: boolean; row?: ScenarioRow }>({ open: false });
  const [qDialog,    setQDialog]    = useState<{ scenId: string; qi: number; q: Question } | null>(null);

  const { data: session } = useQuery({ queryKey: ["session"], queryFn: api.getSession });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["admin-global-categories"],
    queryFn: () => api.adminListGlobalCategories(),
    onSuccess: (cats: CategoryRow[]) => {
      if (cats.length > 0 && !selectedCatId) setSelectedCatId(cats[0].id);
    },
  } as any);

  const { data: scenarios = [], isLoading: scenLoading } = useQuery({
    queryKey: ["admin-global-scenarios", selectedCatId],
    queryFn: () => api.adminListGlobalScenarios(selectedCatId ?? undefined),
    enabled: !!selectedCatId,
    onSuccess: (scens: ScenarioRow[]) => {
      if (scens.length > 0 && !selectedScenId) setSelectedScenId(scens[0].id);
      else if (scens.length === 0) setSelectedScenId(null);
    },
  } as any);

  const selectedScen = (scenarios as ScenarioRow[]).find(s => s.id === selectedScenId);
  const scenQuestions: Question[] = selectedScen ? parseQuestions(selectedScen.questions) : [];

  // ── mutations ────────────────────────────────────────────────────────────────

  const catMutation = useMutation({
    mutationFn: ({ id, name, colorCode }: { id?: string; name: Json; colorCode: string }) =>
      api.adminSaveCategory(id ?? null, name, colorCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-categories"] });
      setCatDialog({ open: false });
      toast.success(t("adminCatSaved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const catDelete = useMutation({
    mutationFn: (id: string) => api.adminDeleteCategory(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin-global-categories"] });
      if (selectedCatId === id) { setSelectedCatId(null); setSelectedScenId(null); }
      toast.success(t("adminCatDeleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scenMutation = useMutation({
    mutationFn: ({ id, form }: { id?: string; form: ScenarioFormData }) =>
      api.adminSaveScenario(
        id ?? null,
        selectedCatId!,
        { fr: form.title_fr, ar: form.title_ar } as unknown as Json,
        { fr: form.desc_fr,  ar: form.desc_ar  } as unknown as Json,
        form.questions as unknown as Json,
        form.image_url,
      ),
    onSuccess: (newId, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin-global-scenarios", selectedCatId] });
      setScenDialog({ open: false });
      if (!id) setSelectedScenId(newId); // auto-select newly created scenario
      toast.success(t("adminScenSaved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scenDelete = useMutation({
    mutationFn: (id: string) => api.deleteScenario(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin-global-scenarios", selectedCatId] });
      if (selectedScenId === id) setSelectedScenId(null);
      toast.success(t("adminScenDeleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const qSaveMutation = useMutation({
    mutationFn: ({ scenId, qs }: { scenId: string; qs: Question[] }) =>
      api.adminUpdateScenarioQuestions(scenId, qs as unknown as Json),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-scenarios", selectedCatId] });
      setQDialog(null);
      toast.success(t("adminQSaved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── helpers ──────────────────────────────────────────────────────────────────

  const handleSaveQuestion = (updated: Question) => {
    if (!qDialog) return;
    qSaveMutation.mutate({
      scenId: qDialog.scenId,
      qs: scenQuestions.map((q, i) => (i === qDialog.qi ? updated : q)),
    });
  };

  const handleDeleteQuestion = (qi: number) => {
    if (!selectedScenId) return;
    if (!confirm(t("adminDeleteQConfirm"))) return;
    qSaveMutation.mutate({ scenId: selectedScenId, qs: scenQuestions.filter((_, i) => i !== qi) });
  };

  const handleAddQuestion = () => {
    if (!selectedScenId) return;
    qSaveMutation.mutate({ scenId: selectedScenId, qs: [...scenQuestions, BLANK_QUESTION()] });
  };

  const selectedCat = (categories as CategoryRow[]).find((c: CategoryRow) => c.id === selectedCatId);

  const colLabel = "text-xs font-medium text-slate-500";
  const colCard  = "border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden flex-1 flex flex-col";

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("adminContentTitle")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("adminContentSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex gap-5 min-h-[72vh]">

        {/* ── Col 1: Categories ── */}
        <div className="w-44 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={colLabel}>{t("adminCategories")}</span>
            <button onClick={() => setCatDialog({ open: true })}
              className="h-5 w-5 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 flex items-center justify-center text-white transition-colors">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <Card className={colCard}>
            <div className="h-0.5 bg-[#1E3A8A]" />
            <CardContent className="p-2 overflow-y-auto flex-1">
              {catsLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (categories as CategoryRow[]).length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6 italic">
                  {t("adminNoCategories")}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {(categories as CategoryRow[]).map((cat: CategoryRow) => {
                    const name   = parseBilingual(cat.name);
                    const active = cat.id === selectedCatId;
                    return (
                      <div key={cat.id}
                        onClick={() => { setSelectedCatId(cat.id); setSelectedScenId(null); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded cursor-pointer group transition-all ${
                          active ? "bg-[#1E3A8A] text-white" : "hover:bg-slate-50 text-slate-700"
                        }`}>
                        <div className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color_code || "#94a3b8" }} />
                        <span className="text-xs font-semibold flex-1 truncate">
                          {lang === "fr" ? name.fr : name.ar}
                        </span>
                        {active
                          ? <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                          : (
                            <div className="hidden group-hover:flex gap-0.5">
                              <button onClick={e => { e.stopPropagation(); setCatDialog({ open: true, row: cat }); }}
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-[#1E3A8A]">
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button onClick={e => {
                                e.stopPropagation();
                                if (confirm(t("adminDeleteCatConfirm"))) catDelete.mutate(cat.id);
                              }} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Col 2: Scenarios ── */}
        <div className="w-56 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={colLabel}>
              {t("adminScenarios")}
              {(scenarios as ScenarioRow[]).length > 0 && (
                <span className="ms-1.5 text-slate-300">— {(scenarios as ScenarioRow[]).length}</span>
              )}
            </span>
            <button
              onClick={() => { if (selectedCatId) setScenDialog({ open: true }); }}
              disabled={!selectedCatId}
              className="h-5 w-5 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:opacity-30 flex items-center justify-center text-white transition-colors">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <Card className={colCard}>
            <div className="h-0.5" style={{ backgroundColor: selectedCat?.color_code || "#1E3A8A" }} />
            <CardContent className="p-2 overflow-y-auto flex-1">
              {!selectedCatId ? (
                <p className="text-center text-slate-400 text-xs py-6 italic">
                  {t("adminPickCategory")}
                </p>
              ) : scenLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (scenarios as ScenarioRow[]).length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6 italic">
                  {t("adminNoScenarios")}
                </p>
              ) : (
                <div className="space-y-1">
                  {(scenarios as ScenarioRow[]).map((scen: ScenarioRow) => {
                    const title  = parseBilingual(scen.title);
                    const qs     = parseQuestions(scen.questions);
                    const active = scen.id === selectedScenId;
                    return (
                      <div key={scen.id}
                        onClick={() => setSelectedScenId(scen.id)}
                        className={`rounded px-3 py-2.5 cursor-pointer group transition-all ${
                          active ? "bg-[#1E3A8A] text-white" : "hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200"
                        }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">
                              {lang === "fr" ? title.fr : title.ar}
                            </p>
                            {(lang === "fr" ? title.ar : title.fr) && (
                              <p className={`text-[10px] truncate mt-0.5 ${active ? "text-blue-200" : "text-slate-400"}`}>
                                {lang === "fr" ? title.ar : title.fr}
                              </p>
                            )}
                          </div>
                          <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {qs.length}
                          </span>
                        </div>
                        <div className={`flex gap-1 mt-1.5 ${active ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                          <button onClick={e => { e.stopPropagation(); setScenDialog({ open: true, row: scen }); }}
                            className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                              active ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-100 hover:bg-blue-50 hover:text-[#1E3A8A] text-slate-500"
                            }`}>
                            <Pencil className="h-2.5 w-2.5" />
                            {t("adminModify")}
                          </button>
                          <button onClick={e => {
                            e.stopPropagation();
                            if (confirm(t("adminDeleteScenConfirm"))) scenDelete.mutate(scen.id);
                          }} className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                            active ? "bg-blue-600 hover:bg-rose-500 text-white" : "bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500"
                          }`}>
                            <Trash2 className="h-2.5 w-2.5" />
                            {t("delete")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Col 3: Questions ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className={colLabel}>
              {selectedScen
                ? parseBilingual(selectedScen.title)[lang === "fr" ? "fr" : "ar"]
                : t("adminQuestionsLabel")}
              {scenQuestions.length > 0 && (
                <span className="ms-1.5 text-slate-300">— {scenQuestions.length}</span>
              )}
            </span>
            <button
              onClick={handleAddQuestion}
              disabled={!selectedScenId || qSaveMutation.isPending}
              className="h-6 w-6 rounded-lg bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:opacity-30 flex items-center justify-center text-white transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <Card className={colCard}>
            <div className="h-0.5 bg-gradient-to-r from-[#1E3A8A] to-blue-400" />
            <CardContent className="p-3 overflow-y-auto flex-1">
              {!selectedScenId ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-12">
                  <BookOpen className="h-10 w-10 opacity-20" />
                  <p className="text-xs font-medium">
                    {t("adminPickScenario")}
                  </p>
                </div>
              ) : scenQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-12">
                  <HelpCircle className="h-10 w-10 opacity-20" />
                  <p className="text-xs font-medium italic">
                    {t("adminNoQuestions")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scenQuestions.map((q, qi) => (
                    <QuestionCard
                      key={`${selectedScenId}-${qi}`}
                      q={q}
                      qi={qi}
                      lang={lang}
                      onEdit={() => setQDialog({ scenId: selectedScenId, qi, q })}
                      onDelete={() => handleDeleteQuestion(qi)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Dialogs */}
      <CategoryDialog
        key={catDialog.open ? (catDialog.row?.id ?? "new") : "closed"}
        open={catDialog.open}
        initial={
          catDialog.row
            ? { ...parseBilingual(catDialog.row.name), color_code: catDialog.row.color_code || "#3B82F6" }
            : { fr: "", ar: "", color_code: "#3B82F6" }
        }
        onClose={() => setCatDialog({ open: false })}
        onSave={data => catMutation.mutate({
          id: catDialog.row?.id,
          name: { fr: data.fr, ar: data.ar } as unknown as Json,
          colorCode: data.color_code,
        })}
        saving={catMutation.isPending}
      />

      <ScenarioDialog
        key={scenDialog.open ? (scenDialog.row?.id ?? "new") : "closed"}
        open={scenDialog.open}
        userId={session?.id ?? ""}
        initial={
          scenDialog.row
            ? {
                title_fr: parseBilingual(scenDialog.row.title).fr,
                title_ar: parseBilingual(scenDialog.row.title).ar,
                desc_fr:  parseBilingual(scenDialog.row.description).fr,
                desc_ar:  parseBilingual(scenDialog.row.description).ar,
                questions: parseQuestions(scenDialog.row.questions),
                image_url: scenDialog.row.image_url ?? null,
              }
            : SCENARIO_TEMPLATE
        }
        onClose={() => setScenDialog({ open: false })}
        onSave={form => scenMutation.mutate({ id: scenDialog.row?.id, form })}
        saving={scenMutation.isPending}
      />

      {qDialog && (
        <QuestionEditDialog
          open
          qi={qDialog.qi}
          question={qDialog.q}
          userId={session?.id ?? ""}
          onClose={() => setQDialog(null)}
          onSave={handleSaveQuestion}
          saving={qSaveMutation.isPending}
        />
      )}
    </div>
  );
}
