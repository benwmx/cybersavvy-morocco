import { useLang } from "@/lib/i18n/LanguageContext";
import {
  Mail, Lock, MessageCircle, KeyRound, ShieldCheck,
  Image, UserPlus, Users, MessageSquare, Bell,
  Cookie, AlertTriangle, Download, Layout, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  VISUAL_CATEGORIES, DEFAULT_CONFIGS,
  type VisualType, type ChatMessage, type SmsMessage,
  type Comment, type DownloadButton,
} from "@/lib/visuals";
import { ScenarioVisuals } from "@/components/ScenarioVisuals";

// ── Icon map ──────────────────────────────────────────────────────────────────

const TEMPLATE_ICONS: Record<VisualType, LucideIcon> = {
  email_client:       Mail,
  browser_login:      Lock,
  sms_phishing:       MessageCircle,
  password_form:      KeyRound,
  two_factor:         ShieldCheck,
  social_feed:        Image,
  dm_request:         UserPlus,
  chat_group:         Users,
  comment_section:    MessageSquare,
  phone_permissions:  Bell,
  cookie_consent:     Cookie,
  browser_popup:      AlertTriangle,
  fake_download:      Download,
};

const TEMPLATE_LABEL_KEYS: Record<VisualType, string> = {
  email_client:      "visualEmailClient",
  browser_login:     "visualBrowserLogin",
  sms_phishing:      "visualSmsPhishing",
  password_form:     "visualPasswordForm",
  two_factor:        "visualTwoFactor",
  social_feed:       "visualSocialFeed",
  dm_request:        "visualDmRequest",
  chat_group:        "visualChatGroup",
  comment_section:   "visualCommentSection",
  phone_permissions: "visualPhonePermissions",
  cookie_consent:    "visualCookieConsent",
  browser_popup:     "visualBrowserPopup",
  fake_download:     "visualFakeDownload",
};

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  phishing:       "visualCategoryPhishing",
  passwords:      "visualCategoryPasswords",
  "social-media": "visualCategorySocial",
  cyberbullying:  "visualCategoryCyber",
  privacy:        "visualCategoryPrivacy",
  malware:        "visualCategoryMalware",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  visualType:   VisualType | null | undefined;
  visualConfig: Record<string, unknown> | null | undefined;
  onChange:     (type: VisualType | null, config: Record<string, unknown> | null) => void;
}

export function VisualTemplateEditor({ visualType, visualConfig, onChange }: Props) {
  const { t } = useLang();
  const cfg = (visualConfig ?? {}) as Record<string, unknown>;

  const set         = (patch: Record<string, unknown>) => onChange(visualType!, { ...cfg, ...patch });
  const setMsg      = (msgs: ChatMessage[])     => set({ messages: msgs });
  const setComments = (comments: Comment[])     => set({ comments });
  const setSms      = (messages: SmsMessage[])  => set({ messages });
  const setButtons  = (buttons: DownloadButton[]) => set({ buttons });

  const inp       = "w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#1E3A8A] transition-colors";
  const row       = "grid grid-cols-2 gap-2";
  const lbl       = "text-[10px] font-medium text-slate-500 mb-0.5";

  return (
    <div className="space-y-3">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-600">{t("visualTemplateLabel")}</span>
        </div>
        {visualType && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="h-3 w-3" />
            {t("visualNone")}
          </button>
        )}
      </div>

      {/* ── Card grid picker ── */}
      <div className="space-y-2.5">
        {Object.entries(VISUAL_CATEGORIES).map(([cat, types]) => (
          <div key={cat}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t((CATEGORY_LABEL_KEYS[cat] ?? cat) as any)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {types.map(vt => {
                const Icon    = TEMPLATE_ICONS[vt];
                const active  = visualType === vt;
                return (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => {
                      if (active) { onChange(null, null); return; }
                      onChange(vt, DEFAULT_CONFIGS[vt] as unknown as Record<string, unknown>);
                    }}
                    title={t((TEMPLATE_LABEL_KEYS[vt]) as any)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border w-[4.5rem] transition-all ${
                      active
                        ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[9px] font-medium text-center leading-tight line-clamp-2">
                      {t((TEMPLATE_LABEL_KEYS[vt]) as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Config + preview ── */}
      {visualType && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-5 gap-4">

          {/* Config fields (3/5 width) */}
          <div className="col-span-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("visualTemplateHint")}</p>

            {visualType === "email_client" && (
              <>
                <div className={row}>
                  <div><p className={lbl}>{t("visualSenderName")}</p><input className={inp} value={String(cfg.sender_name ?? "")} onChange={e => set({ sender_name: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualSenderEmail")}</p><input className={inp} value={String(cfg.sender_email ?? "")} onChange={e => set({ sender_email: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualSubjectFr")}</p><input className={inp} value={String(cfg.subject_fr ?? "")} onChange={e => set({ subject_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualSubjectAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.subject_ar ?? "")} onChange={e => set({ subject_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualBodyFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.body_fr ?? "")} onChange={e => set({ body_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualBodyAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.body_ar ?? "")} onChange={e => set({ body_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualCtaFr")}</p><input className={inp} value={String(cfg.cta_fr ?? "")} onChange={e => set({ cta_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualCtaAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.cta_ar ?? "")} onChange={e => set({ cta_ar: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "browser_login" && (
              <>
                <div><p className={lbl}>{t("visualUrl")}</p><input className={inp} value={String(cfg.url ?? "")} onChange={e => set({ url: e.target.value })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualBrandFr")}</p><input className={inp} value={String(cfg.brand_fr ?? "")} onChange={e => set({ brand_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualBrandAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.brand_ar ?? "")} onChange={e => set({ brand_ar: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "sms_phishing" && (
              <>
                <div><p className={lbl}>{t("visualSmsSender")}</p><input className={inp} value={String(cfg.sender ?? "")} onChange={e => set({ sender: e.target.value })} /></div>
                <p className={`${lbl} pt-1`}>{t("visualMessages")}</p>
                {((cfg.messages ?? []) as SmsMessage[]).map((msg, i) => (
                  <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">#{i + 1}</span>
                      <button type="button" onClick={() => setSms(((cfg.messages ?? []) as SmsMessage[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </div>
                    <div className={row}>
                      <div><p className={lbl}>{t("visualMsgTextFr")}</p><textarea className={`${inp} resize-none h-14`} value={msg.text_fr} onChange={e => { const m = [...((cfg.messages ?? []) as SmsMessage[])]; m[i] = { ...msg, text_fr: e.target.value }; setSms(m); }} /></div>
                      <div><p className={lbl}>{t("visualMsgTextAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={msg.text_ar} onChange={e => { const m = [...((cfg.messages ?? []) as SmsMessage[])]; m[i] = { ...msg, text_ar: e.target.value }; setSms(m); }} /></div>
                    </div>
                    <div>
                      <p className={lbl}>{t("visualMsgSide")}</p>
                      <select className={`${inp} w-auto`} value={msg.side} onChange={e => { const m = [...((cfg.messages ?? []) as SmsMessage[])]; m[i] = { ...msg, side: e.target.value as "left" | "right" }; setSms(m); }}>
                        <option value="left">{t("visualLeft")}</option>
                        <option value="right">{t("visualRight")}</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setSms([...((cfg.messages ?? []) as SmsMessage[]), { text_fr: "", text_ar: "", side: "left" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddMessage")}</button>
              </>
            )}

            {visualType === "password_form" && (
              <>
                <div><p className={lbl}>{t("visualPassword")}</p><input className={`${inp} font-mono`} value={String(cfg.password ?? "")} onChange={e => set({ password: e.target.value })} /></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!cfg.strong} onChange={e => set({ strong: e.target.checked })} className="h-3.5 w-3.5 accent-emerald-500 rounded" />
                  <span className="text-xs text-slate-600">{t("visualStrongToggle")}</span>
                </label>
              </>
            )}

            {visualType === "two_factor" && (
              <>
                <div className={row}>
                  <div><p className={lbl}>{t("visualServiceFr")}</p><input className={inp} value={String(cfg.service_fr ?? "")} onChange={e => set({ service_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualServiceAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.service_ar ?? "")} onChange={e => set({ service_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualMaskedEmail")}</p><input className={`${inp} font-mono`} value={String(cfg.email ?? "")} onChange={e => set({ email: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualOtpCode")}</p><input className={`${inp} font-mono`} value={String(cfg.code ?? "")} onChange={e => set({ code: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "social_feed" && (
              <>
                <div><p className={lbl}>{t("visualUsername")}</p><input className={inp} value={String(cfg.username ?? "")} onChange={e => set({ username: e.target.value })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualCaptionFr")}</p><input className={inp} value={String(cfg.caption_fr ?? "")} onChange={e => set({ caption_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualCaptionAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.caption_ar ?? "")} onChange={e => set({ caption_ar: e.target.value })} /></div>
                </div>
                <div><p className={lbl}>{t("visualImageUrlOpt")}</p><input className={inp} value={String(cfg.image_url ?? "")} onChange={e => set({ image_url: e.target.value || undefined })} /></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!cfg.show_location} onChange={e => set({ show_location: e.target.checked })} className="h-3.5 w-3.5 accent-[#1E3A8A] rounded" />
                  <span className="text-xs text-slate-600">{t("visualShowLocation")}</span>
                </label>
                {!!cfg.show_location && (
                  <div className={row}>
                    <div><p className={lbl}>{t("visualLocationFr")}</p><input className={inp} value={String(cfg.location_fr ?? "")} onChange={e => set({ location_fr: e.target.value })} /></div>
                    <div><p className={lbl}>{t("visualLocationAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.location_ar ?? "")} onChange={e => set({ location_ar: e.target.value })} /></div>
                  </div>
                )}
              </>
            )}

            {visualType === "dm_request" && (
              <>
                <div><p className={lbl}>{t("visualUsername")}</p><input className={inp} value={String(cfg.username ?? "")} onChange={e => set({ username: e.target.value })} /></div>
                <div><p className={lbl}>{t("visualMutualCount")}</p><input type="number" min={0} className={`${inp} w-24`} value={Number(cfg.mutual_count ?? 0)} onChange={e => set({ mutual_count: Number(e.target.value) })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualPreviewFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.preview_fr ?? "")} onChange={e => set({ preview_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualPreviewAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.preview_ar ?? "")} onChange={e => set({ preview_ar: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "chat_group" && (
              <>
                <div className={row}>
                  <div><p className={lbl}>{t("visualGroupNameFr")}</p><input className={inp} value={String(cfg.group_name_fr ?? "")} onChange={e => set({ group_name_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualGroupNameAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.group_name_ar ?? "")} onChange={e => set({ group_name_ar: e.target.value })} /></div>
                </div>
                <p className={`${lbl} pt-1`}>{t("visualMessages")}</p>
                {((cfg.messages ?? []) as ChatMessage[]).map((msg, i) => (
                  <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">#{i + 1}</span>
                      <button type="button" onClick={() => setMsg(((cfg.messages ?? []) as ChatMessage[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1"><p className={lbl}>{t("visualUsername")}</p><input className={inp} value={msg.username} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, username: e.target.value }; setMsg(m); }} /></div>
                      <div className="w-20"><p className={lbl}>{t("visualMsgColor")}</p><input type="color" className="h-[30px] w-full rounded border border-slate-200 cursor-pointer" value={msg.color || "#94a3b8"} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, color: e.target.value }; setMsg(m); }} /></div>
                      <div><p className={lbl}>{t("visualMsgSide")}</p><select className={`${inp} w-auto`} value={msg.side} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, side: e.target.value as "left" | "right" }; setMsg(m); }}><option value="left">{t("visualLeft")}</option><option value="right">{t("visualRight")}</option></select></div>
                    </div>
                    <div className={row}>
                      <div><p className={lbl}>{t("visualMsgTextFr")}</p><textarea className={`${inp} resize-none h-14`} value={msg.text_fr} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, text_fr: e.target.value }; setMsg(m); }} /></div>
                      <div><p className={lbl}>{t("visualMsgTextAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={msg.text_ar} onChange={e => { const m = [...((cfg.messages ?? []) as ChatMessage[])]; m[i] = { ...msg, text_ar: e.target.value }; setMsg(m); }} /></div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setMsg([...((cfg.messages ?? []) as ChatMessage[]), { username: "", color: "#94a3b8", text_fr: "", text_ar: "", side: "left" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddMessage")}</button>
              </>
            )}

            {visualType === "comment_section" && (
              <>
                <div className={row}>
                  <div><p className={lbl}>{t("visualPostCaptionFr")}</p><input className={inp} value={String(cfg.post_caption_fr ?? "")} onChange={e => set({ post_caption_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualPostCaptionAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.post_caption_ar ?? "")} onChange={e => set({ post_caption_ar: e.target.value })} /></div>
                </div>
                <p className={`${lbl} pt-1`}>{t("visualComments")}</p>
                {((cfg.comments ?? []) as Comment[]).map((comment, i) => (
                  <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">#{i + 1}</span>
                      <button type="button" onClick={() => setComments(((cfg.comments ?? []) as Comment[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1"><p className={lbl}>{t("visualUsername")}</p><input className={inp} value={comment.username} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, username: e.target.value }; setComments(c); }} /></div>
                      <div><p className={lbl}>{t("visualCommentType")}</p>
                        <select className={`${inp} w-auto`} value={comment.type} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, type: e.target.value as Comment["type"] }; setComments(c); }}>
                          <option value="normal">{t("visualCommentNormal")}</option>
                          <option value="mean">{t("visualCommentMean")}</option>
                          <option value="supportive">{t("visualCommentSupportive")}</option>
                        </select>
                      </div>
                    </div>
                    <div className={row}>
                      <div><p className={lbl}>{t("visualCommentTextFr")}</p><input className={inp} value={comment.text_fr} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, text_fr: e.target.value }; setComments(c); }} /></div>
                      <div><p className={lbl}>{t("visualCommentTextAr")}</p><input className={`${inp} text-right`} dir="rtl" value={comment.text_ar} onChange={e => { const c = [...((cfg.comments ?? []) as Comment[])]; c[i] = { ...comment, text_ar: e.target.value }; setComments(c); }} /></div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setComments([...((cfg.comments ?? []) as Comment[]), { username: "", text_fr: "", text_ar: "", type: "normal" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddComment")}</button>
              </>
            )}

            {visualType === "phone_permissions" && (
              <>
                <div><p className={lbl}>{t("visualAppName")}</p><input className={inp} value={String(cfg.app_name ?? "")} onChange={e => set({ app_name: e.target.value })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualPermissionFr")}</p><input className={inp} value={String(cfg.permission_fr ?? "")} onChange={e => set({ permission_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualPermissionAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.permission_ar ?? "")} onChange={e => set({ permission_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualAllowFr")}</p><input className={inp} value={String(cfg.allow_fr ?? "")} onChange={e => set({ allow_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualAllowAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.allow_ar ?? "")} onChange={e => set({ allow_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualDenyFr")}</p><input className={inp} value={String(cfg.deny_fr ?? "")} onChange={e => set({ deny_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualDenyAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.deny_ar ?? "")} onChange={e => set({ deny_ar: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "cookie_consent" && (
              <>
                <div><p className={lbl}>{t("visualSiteName")}</p><input className={inp} value={String(cfg.site_name ?? "")} onChange={e => set({ site_name: e.target.value })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualBodyFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.body_fr ?? "")} onChange={e => set({ body_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualBodyAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.body_ar ?? "")} onChange={e => set({ body_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualAcceptFr")}</p><input className={inp} value={String(cfg.accept_fr ?? "")} onChange={e => set({ accept_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualAcceptAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.accept_ar ?? "")} onChange={e => set({ accept_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualRejectFr")}</p><input className={inp} value={String(cfg.reject_fr ?? "")} onChange={e => set({ reject_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualRejectAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.reject_ar ?? "")} onChange={e => set({ reject_ar: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "browser_popup" && (
              <>
                <div><p className={lbl}>{t("visualUrl")}</p><input className={inp} value={String(cfg.url ?? "")} onChange={e => set({ url: e.target.value })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualTitleFr")}</p><input className={inp} value={String(cfg.title_fr ?? "")} onChange={e => set({ title_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualTitleAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.title_ar ?? "")} onChange={e => set({ title_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualBodyFr")}</p><textarea className={`${inp} resize-none h-14`} value={String(cfg.body_fr ?? "")} onChange={e => set({ body_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualBodyAr")}</p><textarea className={`${inp} resize-none h-14 text-right`} dir="rtl" value={String(cfg.body_ar ?? "")} onChange={e => set({ body_ar: e.target.value })} /></div>
                </div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualCtaFr")}</p><input className={inp} value={String(cfg.cta_fr ?? "")} onChange={e => set({ cta_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualCtaAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.cta_ar ?? "")} onChange={e => set({ cta_ar: e.target.value })} /></div>
                </div>
              </>
            )}

            {visualType === "fake_download" && (
              <>
                <div><p className={lbl}>{t("visualAppName")}</p><input className={inp} value={String(cfg.app_name ?? "")} onChange={e => set({ app_name: e.target.value })} /></div>
                <div className={row}>
                  <div><p className={lbl}>{t("visualAppDescFr")}</p><input className={inp} value={String(cfg.app_desc_fr ?? "")} onChange={e => set({ app_desc_fr: e.target.value })} /></div>
                  <div><p className={lbl}>{t("visualAppDescAr")}</p><input className={`${inp} text-right`} dir="rtl" value={String(cfg.app_desc_ar ?? "")} onChange={e => set({ app_desc_ar: e.target.value })} /></div>
                </div>
                <p className={`${lbl} pt-1`}>{t("visualButtons")}</p>
                {((cfg.buttons ?? []) as DownloadButton[]).map((btn, i) => (
                  <div key={i} className="border border-slate-100 rounded p-2 space-y-1.5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">#{i + 1}</span>
                      <button type="button" onClick={() => setButtons(((cfg.buttons ?? []) as DownloadButton[]).filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </div>
                    <div className={row}>
                      <div><p className={lbl}>{t("visualBtnLabelFr")}</p><input className={inp} value={btn.label_fr} onChange={e => { const b = [...((cfg.buttons ?? []) as DownloadButton[])]; b[i] = { ...btn, label_fr: e.target.value }; setButtons(b); }} /></div>
                      <div><p className={lbl}>{t("visualBtnLabelAr")}</p><input className={`${inp} text-right`} dir="rtl" value={btn.label_ar} onChange={e => { const b = [...((cfg.buttons ?? []) as DownloadButton[])]; b[i] = { ...btn, label_ar: e.target.value }; setButtons(b); }} /></div>
                    </div>
                    <div>
                      <p className={lbl}>{t("visualBtnStyle")}</p>
                      <select className={`${inp} w-auto`} value={btn.style} onChange={e => { const b = [...((cfg.buttons ?? []) as DownloadButton[])]; b[i] = { ...btn, style: e.target.value as DownloadButton["style"] }; setButtons(b); }}>
                        <option value="primary">{t("visualBtnPrimary")}</option>
                        <option value="secondary">{t("visualBtnSecondary")}</option>
                        <option value="danger">{t("visualBtnDanger")}</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setButtons([...((cfg.buttons ?? []) as DownloadButton[]), { label_fr: "", label_ar: "", style: "primary" }])} className="text-xs font-bold text-[#1E3A8A] hover:underline">{t("visualAddButton")}</button>
              </>
            )}
          </div>

          {/* Live preview (2/5 width) */}
          <div className="col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{t("visualPreviewLabel")}</p>
            <div className="relative rounded-lg border border-slate-200 bg-slate-50 overflow-hidden" style={{ height: "200px" }}>
              <div
                className="absolute top-0 left-0 origin-top-left pointer-events-none"
                style={{ transform: "scale(0.42)", width: "238%", height: "238%" }}
              >
                <ScenarioVisuals
                  visualType={visualType}
                  visualConfig={cfg}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
