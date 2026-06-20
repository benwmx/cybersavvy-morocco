export type VisualType =
  | "email_client"
  | "browser_login"
  | "sms_phishing"
  | "password_form"
  | "two_factor"
  | "social_feed"
  | "dm_request"
  | "chat_group"
  | "comment_section"
  | "phone_permissions"
  | "cookie_consent"
  | "browser_popup"
  | "fake_download";

export interface ChatMessage {
  username: string;
  color: string;
  text_fr: string;
  text_ar: string;
  side: "left" | "right";
}

export interface SmsMessage {
  text_fr: string;
  text_ar: string;
  side: "left" | "right";
}

export interface Comment {
  username: string;
  text_fr: string;
  text_ar: string;
  type: "normal" | "mean" | "supportive";
}

export interface DownloadButton {
  label_fr: string;
  label_ar: string;
  style: "primary" | "secondary" | "danger";
}

export interface EmailClientConfig {
  sender_name: string;
  sender_email: string;
  subject_fr: string;
  subject_ar: string;
  body_fr: string;
  body_ar: string;
  cta_fr: string;
  cta_ar: string;
}

export interface BrowserLoginConfig {
  url: string;
  brand_fr: string;
  brand_ar: string;
}

export interface SmsPhishingConfig {
  sender: string;
  messages: SmsMessage[];
}

export interface PasswordFormConfig {
  password: string;
  strong: boolean;
}

export interface TwoFactorConfig {
  service_fr: string;
  service_ar: string;
  email: string;
  code: string;
}

export interface SocialFeedConfig {
  username: string;
  caption_fr: string;
  caption_ar: string;
  image_url?: string;
  show_location: boolean;
  location_fr?: string;
  location_ar?: string;
}

export interface DmRequestConfig {
  username: string;
  mutual_count: number;
  preview_fr: string;
  preview_ar: string;
}

export interface ChatGroupConfig {
  group_name_fr: string;
  group_name_ar: string;
  messages: ChatMessage[];
}

export interface CommentSectionConfig {
  post_caption_fr: string;
  post_caption_ar: string;
  comments: Comment[];
}

export interface PhonePermissionsConfig {
  app_name: string;
  permission_fr: string;
  permission_ar: string;
  allow_fr: string;
  allow_ar: string;
  deny_fr: string;
  deny_ar: string;
}

export interface CookieConsentConfig {
  site_name: string;
  body_fr: string;
  body_ar: string;
  accept_fr: string;
  accept_ar: string;
  reject_fr: string;
  reject_ar: string;
}

export interface BrowserPopupConfig {
  url: string;
  title_fr: string;
  title_ar: string;
  body_fr: string;
  body_ar: string;
  cta_fr: string;
  cta_ar: string;
}

export interface FakeDownloadConfig {
  app_name: string;
  app_desc_fr: string;
  app_desc_ar: string;
  buttons: DownloadButton[];
}

export type VisualConfig =
  | EmailClientConfig
  | BrowserLoginConfig
  | SmsPhishingConfig
  | PasswordFormConfig
  | TwoFactorConfig
  | SocialFeedConfig
  | DmRequestConfig
  | ChatGroupConfig
  | CommentSectionConfig
  | PhonePermissionsConfig
  | CookieConsentConfig
  | BrowserPopupConfig
  | FakeDownloadConfig;

// Maps each template to its category (matches the 6 default scenario categories)
export const VISUAL_CATEGORIES: Record<string, VisualType[]> = {
  phishing:      ["email_client", "browser_login", "sms_phishing"],
  passwords:     ["password_form", "two_factor"],
  "social-media": ["social_feed", "dm_request"],
  cyberbullying: ["chat_group", "comment_section"],
  privacy:       ["phone_permissions", "cookie_consent"],
  malware:       ["browser_popup", "fake_download"],
};

export const ALL_VISUAL_TYPES = Object.values(VISUAL_CATEGORIES).flat() as VisualType[];

export const DEFAULT_CONFIGS: Record<VisualType, VisualConfig> = {
  email_client: {
    sender_name: "Admin-Security",
    sender_email: "security@alert-system.net",
    subject_fr: "URGENT : Sécurité du compte",
    subject_ar: "عاجل: أمان الحساب",
    body_fr: "Votre compte sera bloqué si vous ne validez pas vos informations immédiatement...",
    body_ar: "سيتم حظر حسابك إذا لم تقم بتأكيد معلوماتك فوراً...",
    cta_fr: "Cliquez ici",
    cta_ar: "انقر هنا",
  },
  browser_login: {
    url: "http://banque-secure-login.xyz/login",
    brand_fr: "BANQUE NATIONALE",
    brand_ar: "البنك الوطني",
  },
  sms_phishing: {
    sender: "+212 6XX XXX XXX",
    messages: [
      {
        text_fr: "Votre colis est en attente. Confirmez ici : http://livraison-maroc.net/confirmer",
        text_ar: "طردك في انتظارك. قم بالتأكيد هنا: http://livraison-maroc.net/confirmer",
        side: "left",
      },
    ],
  },
  password_form: {
    password: "Tigre!Lune42$",
    strong: true,
  },
  two_factor: {
    service_fr: "Ma Banque",
    service_ar: "بنكي",
    email: "y***f@gmail.com",
    code: "482 913",
  },
  social_feed: {
    username: "youssef_22",
    caption_fr: "Enfin fini les cours !",
    caption_ar: "أخيراً انتهت الحصص!",
    show_location: false,
    location_fr: "Lycée Ibn Toufail - Rabat",
    location_ar: "ثانوية ابن طفيل - الرباط",
  },
  dm_request: {
    username: "ahmed_inconnue_2024",
    mutual_count: 0,
    preview_fr: "Salut ! Tu es vraiment sympa sur tes photos 😍",
    preview_ar: "مرحباً! أنتَ رائع جداً في صورك 😍",
  },
  chat_group: {
    group_name_fr: "Groupe Classe",
    group_name_ar: "مجموعة القسم",
    messages: [
      { username: "Anas", color: "#f97316", text_fr: "T'as vu sa tête sur la photo ? 😂", text_ar: "هل رأيت وجهه في الصورة؟ 😂", side: "left" },
      { username: "Sarah", color: "#3b82f6", text_fr: "Grave, quel looser", text_ar: "فعلاً، يا له من فاشل", side: "left" },
    ],
  },
  comment_section: {
    post_caption_fr: "Ma première journée au lycée 🎒",
    post_caption_ar: "أول يوم لي في الثانوية 🎒",
    comments: [
      { username: "karim_22", text_fr: "Super photo !", text_ar: "صورة رائعة!", type: "supportive" },
      { username: "anonyme123", text_fr: "Haha t'as l'air ridicule 😂", text_ar: "هههه تبدو سخيفاً 😂", type: "mean" },
    ],
  },
  phone_permissions: {
    app_name: "Super Calculator",
    permission_fr: "accéder à vos contacts",
    permission_ar: "الوصول إلى جهات الاتصال",
    allow_fr: "Autoriser",
    allow_ar: "سماح",
    deny_fr: "Refuser",
    deny_ar: "رفض",
  },
  cookie_consent: {
    site_name: "actualite-maroc.ma",
    body_fr: "Nous utilisons des cookies pour améliorer votre expérience et vous proposer des publicités personnalisées.",
    body_ar: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وعرض إعلانات مخصصة لك.",
    accept_fr: "Tout accepter",
    accept_ar: "قبول الكل",
    reject_fr: "Gérer les préférences",
    reject_ar: "إدارة التفضيلات",
  },
  browser_popup: {
    url: "games-free.com",
    title_fr: "VOTRE PC EST INFECTÉ !",
    title_ar: "جهازك مصاب بالفيروسات!",
    body_fr: "Nettoyez votre système immédiatement pour éviter la perte de données.",
    body_ar: "نظف نظامك فوراً لتجنب فقدان البيانات.",
    cta_fr: "TÉLÉCHARGER",
    cta_ar: "تحميل",
  },
  fake_download: {
    app_name: "VPN Free Pro Ultra",
    app_desc_fr: "Téléchargement gratuit — 10 millions d'utilisateurs",
    app_desc_ar: "تحميل مجاني — 10 ملايين مستخدم",
    buttons: [
      { label_fr: "✓ Télécharger GRATUITEMENT", label_ar: "✓ تحميل مجاناً", style: "primary" },
      { label_fr: "⬇ Télécharger maintenant", label_ar: "⬇ حمّل الآن", style: "danger" },
      { label_fr: "Téléchargement sécurisé", label_ar: "تحميل آمن", style: "secondary" },
    ],
  },
};
