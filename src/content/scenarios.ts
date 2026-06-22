import type { VisualType, VisualConfig } from "@/lib/visuals";

export interface Question {
  id: string;
  prompt: { fr: string; ar: string };
  choices: { fr: string[]; ar: string[] };
  correctIndex: number;
  explanation: { fr: string; ar: string };
  media_url?: string | null;
  visual_type?: VisualType | null;
  visual_config?: VisualConfig | null;
}

export interface Track {
  id: string;
  icon: "Fish" | "KeyRound" | "Users" | "MessageSquareWarning" | "Lock" | "Bug";
  color: string;
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  questions: Question[];
}

export const CATEGORIES: Track[] = [
  {
    id: "phishing",
    icon: "Fish",
    color: "text-chart-1",
    title: { fr: "Hameçonnage", ar: "التصيد الاحتيالي" },
    description: { fr: "Reconnaître les messages piégés.", ar: "تعرّف على الرسائل المخادعة." },
    questions: [
      {
        id: "phishing-q1",
        prompt: {
          fr: "Tu reçois un email disant que ton compte sera bloqué si tu ne cliques pas sur un lien. Que fais-tu ?",
          ar: "تتلقى بريداً يقول إن حسابك سيُغلق إن لم تنقر على رابط. ماذا تفعل؟",
        },
        choices: {
          fr: ["Je clique vite", "Je vérifie l'expéditeur et je ne clique pas", "Je transfère à mes amis"],
          ar: ["أنقر بسرعة", "أتحقق من المرسل ولا أنقر", "أرسله إلى أصدقائي"],
        },
        correctIndex: 1,
        explanation: {
          fr: "Les pirates créent l'urgence pour te faire cliquer. Vérifie toujours l'expéditeur.",
          ar: "يستخدم القراصنة الاستعجال لخداعك. تحقق دائماً من المرسل.",
        },
        visual_type: "email_client",
        visual_config: {
          sender_name: "Admin-Security",
          sender_email: "security@alert-system.net",
          subject_fr: "URGENT : Sécurité du compte",
          subject_ar: "عاجل: أمان الحساب",
          body_fr: "Votre compte sera bloqué si vous ne validez pas vos informations immédiatement...",
          body_ar: "سيتم حظر حسابك إذا لم تقم بتأكيد معلوماتك فوراً...",
          cta_fr: "Cliquez ici",
          cta_ar: "انقر هنا",
        },
      },
      {
        id: "phishing-q2",
        prompt: {
          fr: "Un lien commence par http://banque-secure-login.xyz. Est-ce sûr ?",
          ar: "رابط يبدأ بـ http://banque-secure-login.xyz. هل هو آمن؟",
        },
        choices: {
          fr: ["Oui, le mot 'secure' rassure", "Non, le domaine est suspect", "Oui car c'est http"],
          ar: ["نعم، كلمة secure تطمئن", "لا، النطاق مشبوه", "نعم لأنه http"],
        },
        correctIndex: 1,
        explanation: {
          fr: "Le nom de domaine étrange est un signal d'hameçonnage. Vérifie le vrai site officiel.",
          ar: "اسم النطاق الغريب علامة على التصيد. تحقق من الموقع الرسمي.",
        },
        visual_type: "browser_login",
        visual_config: {
          url: "http://banque-secure-login.xyz/login",
          brand_fr: "BANQUE NATIONALE",
          brand_ar: "البنك الوطني",
        },
      },
      {
        id: "phishing-q3",
        prompt: {
          fr: "Un SMS te promet un cadeau si tu donnes ton mot de passe. Réaction ?",
          ar: "رسالة تعدك بهدية مقابل كلمة المرور. كيف ترد؟",
        },
        choices: {
          fr: ["Je le donne", "Je supprime le message", "Je clique pour voir"],
          ar: ["أعطيها", "أحذف الرسالة", "أنقر لأرى"],
        },
        correctIndex: 1,
        explanation: {
          fr: "Aucun service sérieux ne demande ton mot de passe. Supprime et signale.",
          ar: "لا تطلب أي خدمة جدية كلمة المرور. احذف وأبلغ.",
        },
        visual_type: "sms_phishing",
        visual_config: {
          sender: "+212 6XX XXX XXX",
          messages: [
            {
              text_fr: "Félicitations ! Vous avez gagné un cadeau. Envoyez votre mot de passe pour recevoir votre lot.",
              text_ar: "تهانينا! لقد فزت بجائزة. أرسل كلمة مرورك لتستلم جائزتك.",
              side: "left",
            },
          ],
        },
      },
    ],
  },
  {
    id: "passwords",
    icon: "KeyRound",
    color: "text-chart-2",
    title: { fr: "Mots de passe", ar: "كلمات المرور" },
    description: { fr: "Créer et garder des mots de passe forts.", ar: "إنشاء وحماية كلمات مرور قوية." },
    questions: [
      {
        id: "passwords-q1",
        prompt: { fr: "Quel mot de passe est le plus solide ?", ar: "أيّ كلمة مرور أقوى؟" },
        choices: { fr: ["123456", "azerty", "Tigre!Lune42$"], ar: ["123456", "azerty", "Tigre!Lune42$"] },
        correctIndex: 2,
        explanation: {
          fr: "Un bon mot de passe mélange lettres, chiffres et symboles, et est long.",
          ar: "كلمة المرور الجيدة تجمع بين الحروف والأرقام والرموز وتكون طويلة.",
        },
        visual_type: "password_form",
        visual_config: { password: "Tigre!Lune42$", strong: true },
      },
      {
        id: "passwords-q2",
        prompt: {
          fr: "Faut-il utiliser le même mot de passe partout ?",
          ar: "هل نستخدم نفس كلمة المرور في كل مكان؟",
        },
        choices: { fr: ["Oui c'est plus simple", "Non, un par compte", "Oui si court"], ar: ["نعم أسهل", "لا، واحدة لكل حساب", "نعم إن كانت قصيرة"] },
        correctIndex: 1,
        explanation: {
          fr: "Si un site est piraté, tous tes comptes deviennent vulnérables.",
          ar: "إذا اختُرق موقع، تصبح كل حساباتك في خطر.",
        },
        visual_type: "password_form",
        visual_config: { password: "123456", strong: false },
      },
      {
        id: "passwords-q3",
        prompt: { fr: "L'authentification à deux facteurs sert à...", ar: "المصادقة الثنائية تُستخدم لـ..." },
        choices: {
          fr: ["Décorer le compte", "Ajouter une couche de sécurité", "Ralentir l'ordi"],
          ar: ["تزيين الحساب", "إضافة طبقة أمان", "إبطاء الحاسوب"],
        },
        correctIndex: 1,
        explanation: {
          fr: "La 2FA ajoute un code temporaire en plus du mot de passe.",
          ar: "تضيف رمزاً مؤقتاً إلى جانب كلمة المرور.",
        },
        visual_type: "two_factor",
        visual_config: { service_fr: "Ma Banque", service_ar: "بنكي", email: "y***f@gmail.com", code: "482913" },
      },
    ],
  },
  {
    id: "social-media",
    icon: "Users",
    color: "text-chart-3",
    title: { fr: "Réseaux sociaux", ar: "الشبكات الاجتماعية" },
    description: { fr: "Partager avec prudence.", ar: "شارك بحذر." },
    questions: [
      {
        id: "social-q1",
        prompt: {
          fr: "Tu peux publier ta photo d'école avec l'adresse visible ?",
          ar: "هل يمكنك نشر صورة مدرستك مع ظهور العنوان؟",
        },
        choices: { fr: ["Oui", "Non, c'est risqué", "Si peu de gens"], ar: ["نعم", "لا، خطر", "إذا قليل من الناس"] },
        correctIndex: 1,
        explanation: {
          fr: "Ne diffuse pas d'infos qui localisent toi ou ta famille.",
          ar: "لا تنشر معلومات تكشف مكانك أو عائلتك.",
        },
        visual_type: "social_feed",
        visual_config: {
          username: "youssef_22",
          caption_fr: "Enfin fini les cours !",
          caption_ar: "أخيراً انتهت الحصص!",
          show_location: true,
          location_fr: "Lycée Ibn Toufail - Rabat",
          location_ar: "ثانوية ابن طفيل - الرباط",
        },
      },
      {
        id: "social-q2",
        prompt: { fr: "Un inconnu t'envoie une demande d'ami. Tu...", ar: "غريب يطلب صداقتك. أنت..." },
        choices: { fr: ["Acceptes vite", "Refuses ou ignores", "Acceptes si jolie photo"], ar: ["تقبل بسرعة", "ترفض أو تتجاهل", "تقبل إذا الصورة جميلة"] },
        correctIndex: 1,
        explanation: { fr: "Tout le monde n'est pas qui il prétend être.", ar: "ليس الجميع كما يدّعون." },
        visual_type: "dm_request",
        visual_config: {
          username: "ahmed_inconnue_2024",
          mutual_count: 0,
          preview_fr: "Salut ! Tu es vraiment sympa sur tes photos 😍",
          preview_ar: "مرحباً! أنتَ رائع جداً في صورك 😍",
        },
      },
      {
        id: "social-q3",
        prompt: { fr: "Que faire avant de publier une photo de ton ami ?", ar: "ماذا تفعل قبل نشر صورة صديقك؟" },
        choices: { fr: ["Rien", "Lui demander", "Le taguer"], ar: ["لا شيء", "أستأذنه", "أضع اسمه"] },
        correctIndex: 1,
        explanation: { fr: "Respecte le consentement de tes amis.", ar: "احترم موافقة أصدقائك." },
        visual_type: "social_feed",
        visual_config: {
          username: "sara_photo",
          caption_fr: "Belle journée avec les amis ☀️",
          caption_ar: "يوم جميل مع الأصدقاء ☀️",
          show_location: false,
        },
      },
    ],
  },
  {
    id: "cyberbullying",
    icon: "MessageSquareWarning",
    color: "text-chart-4",
    title: { fr: "Cyberharcèlement", ar: "التنمر الإلكتروني" },
    description: { fr: "Réagir face aux insultes en ligne.", ar: "كيف نتصرف مع الإهانات على الإنترنت." },
    questions: [
      {
        id: "cyber-q1",
        prompt: { fr: "Un camarade reçoit des insultes en ligne. Que faire ?", ar: "زميل يتلقى إهانات على الإنترنت. ماذا نفعل؟" },
        choices: { fr: ["Rire avec les autres", "Le soutenir et signaler", "Ignorer"], ar: ["نضحك معهم", "ندعمه ونبلّغ", "نتجاهل"] },
        correctIndex: 1,
        explanation: { fr: "Aide la victime et signale aux adultes ou à la plateforme.", ar: "ساعد الضحية وأبلغ الكبار أو المنصة." },
        visual_type: "chat_group",
        visual_config: {
          group_name_fr: "Groupe Classe",
          group_name_ar: "مجموعة القسم",
          messages: [
            { username: "Anas", color: "#f97316", text_fr: "T'as vu sa tête sur la photo ? 😂", text_ar: "هل رأيت وجهه في الصورة؟ 😂", side: "left" },
            { username: "Sarah", color: "#3b82f6", text_fr: "Grave, quel looser", text_ar: "فعلاً، يا له من فاشل", side: "left" },
          ],
        },
      },
      {
        id: "cyber-q2",
        prompt: { fr: "On t'insulte sur un chat. Tu...", ar: "يهينك أحدهم في محادثة. أنت..." },
        choices: { fr: ["Réponds violemment", "Bloques, gardes les preuves, parles à un adulte", "Supprimes ton compte"], ar: ["ترد بعنف", "تحجب وتحفظ الأدلة وتخبر شخصاً بالغاً", "تحذف حسابك"] },
        correctIndex: 1,
        explanation: { fr: "Capture d'écran + bloquer + parler. Tu n'es pas seul.", ar: "لقطة شاشة + حجب + التحدث. لست وحدك." },
        visual_type: "chat_group",
        visual_config: {
          group_name_fr: "Groupe Classe",
          group_name_ar: "مجموعة القسم",
          messages: [
            { username: "Mehdi", color: "#8b5cf6", text_fr: "T'es vraiment nul en sport 🤡", text_ar: "أنت حقاً سيء في الرياضة 🤡", side: "left" },
            { username: "Anas", color: "#f97316", text_fr: "Ouais tout le monde le sait", text_ar: "نعم، الجميع يعرف ذلك", side: "left" },
            { username: "", color: "", text_fr: "...", text_ar: "...", side: "right" },
          ],
        },
      },
      {
        id: "cyber-q3",
        prompt: { fr: "Le harcèlement en ligne est...", ar: "التنمر الإلكتروني هو..." },
        choices: { fr: ["Un jeu", "Puni par la loi", "Sans conséquence"], ar: ["لعبة", "يعاقب عليه القانون", "بلا عواقب"] },
        correctIndex: 1,
        explanation: { fr: "C'est un délit, avec des conséquences réelles.", ar: "إنه جريمة ولها عواقب حقيقية." },
        visual_type: "comment_section",
        visual_config: {
          post_caption_fr: "Ma première journée au lycée 🎒",
          post_caption_ar: "أول يوم لي في الثانوية 🎒",
          comments: [
            { username: "karim_22", text_fr: "Super photo !", text_ar: "صورة رائعة!", type: "supportive" },
            { username: "anonyme123", text_fr: "Haha t'as l'air ridicule 😂", text_ar: "هههه تبدو سخيفاً 😂", type: "mean" },
            { username: "nour_s", text_fr: "Ignore-les, tu es super !", text_ar: "تجاهلهم، أنت رائع!", type: "supportive" },
          ],
        },
      },
    ],
  },
  {
    id: "privacy",
    icon: "Lock",
    color: "text-chart-5",
    title: { fr: "Vie privée", ar: "الحياة الخاصة" },
    description: { fr: "Maîtriser ses données personnelles.", ar: "السيطرة على بياناتك الشخصية." },
    questions: [
      {
        id: "privacy-q1",
        prompt: { fr: "Une appli demande l'accès à tes contacts pour jouer. Tu...", ar: "تطبيق يطلب جهات اتصالك للعب. أنت..." },
        choices: { fr: ["Acceptes", "Refuses si pas nécessaire", "Acceptes une fois"], ar: ["تقبل", "ترفض إن لم يكن ضرورياً", "تقبل مرة"] },
        correctIndex: 1,
        explanation: { fr: "Donne uniquement les permissions vraiment utiles.", ar: "امنح فقط الأذونات الضرورية." },
        visual_type: "phone_permissions",
        visual_config: {
          app_name: "Super Calculator",
          permission_fr: "accéder à vos contacts",
          permission_ar: "الوصول إلى جهات الاتصال",
          allow_fr: "Autoriser",
          allow_ar: "سماح",
          deny_fr: "Refuser",
          deny_ar: "رفض",
        },
      },
      {
        id: "privacy-q2",
        prompt: { fr: "Profil public ou privé pour un ado ?", ar: "الحساب عام أم خاص للمراهق؟" },
        choices: { fr: ["Public", "Privé", "Peu importe"], ar: ["عام", "خاص", "لا فرق"] },
        correctIndex: 1,
        explanation: { fr: "Un profil privé limite qui voit tes contenus.", ar: "الحساب الخاص يحدّ من رؤية محتواك." },
        visual_type: "phone_permissions",
        visual_config: {
          app_name: "InstaPost",
          permission_fr: "rendre votre profil public et visible par tous",
          permission_ar: "جعل حسابك عاماً ومرئياً للجميع",
          allow_fr: "Profil public",
          allow_ar: "حساب عام",
          deny_fr: "Rester privé",
          deny_ar: "البقاء خاصاً",
        },
      },
      {
        id: "privacy-q3",
        prompt: { fr: "Tes données partagées sur internet sont...", ar: "بياناتك المنشورة على الإنترنت..." },
        choices: { fr: ["Effaçables facilement", "Souvent permanentes", "Toujours privées"], ar: ["تُحذف بسهولة", "غالباً دائمة", "خاصة دائماً"] },
        correctIndex: 1,
        explanation: { fr: "Ce que tu publies peut rester en ligne longtemps.", ar: "ما تنشره قد يبقى على الإنترنت طويلاً." },
        visual_type: "cookie_consent",
        visual_config: {
          site_name: "actualite-maroc.ma",
          body_fr: "Nous partageons vos données avec nos partenaires publicitaires dans 45 pays.",
          body_ar: "نشارك بياناتك مع شركاء إعلانيين في 45 دولة.",
          accept_fr: "Tout accepter",
          accept_ar: "قبول الكل",
          reject_fr: "Gérer les préférences",
          reject_ar: "إدارة التفضيلات",
        },
      },
    ],
  },
  {
    id: "malware",
    icon: "Bug",
    color: "text-destructive",
    title: { fr: "Virus & logiciels", ar: "الفيروسات والبرمجيات" },
    description: { fr: "Éviter les programmes malveillants.", ar: "تجنب البرامج الخبيثة." },
    questions: [
      {
        id: "malware-q1",
        prompt: { fr: "Tu télécharges un jeu gratuit sur un site inconnu. Risque ?", ar: "تحمّل لعبة مجانية من موقع مجهول. الخطر؟" },
        choices: { fr: ["Aucun", "Possible virus", "Plus de vitesse"], ar: ["لا شيء", "احتمال فيروس", "سرعة أكبر"] },
        correctIndex: 1,
        explanation: { fr: "Utilise les magasins officiels et un antivirus.", ar: "استخدم المتاجر الرسمية وبرنامج حماية." },
        visual_type: "fake_download",
        visual_config: {
          app_name: "Game Zone Pro",
          app_desc_fr: "Téléchargement gratuit — Jeux illimités",
          app_desc_ar: "تحميل مجاني — ألعاب غير محدودة",
          buttons: [
            { label_fr: "✓ Télécharger GRATUITEMENT", label_ar: "✓ تحميل مجاناً", style: "primary" },
            { label_fr: "⬇ Téléchargement rapide", label_ar: "⬇ تحميل سريع", style: "danger" },
            { label_fr: "Version officielle", label_ar: "النسخة الرسمية", style: "secondary" },
          ],
        },
      },
      {
        id: "malware-q2",
        prompt: { fr: "Une pop-up dit 'Ton PC est infecté ! Clique ici'. Tu...", ar: "نافذة تقول 'حاسوبك مصاب! انقر هنا'. أنت..." },
        choices: { fr: ["Cliques", "Fermes la fenêtre", "Donnes ta carte"], ar: ["تنقر", "تغلق النافذة", "تعطي بطاقتك"] },
        correctIndex: 1,
        explanation: { fr: "Les fausses alertes installent souvent des malwares.", ar: "التحذيرات الزائفة تثبّت برامج خبيثة." },
        visual_type: "browser_popup",
        visual_config: {
          url: "games-free.com",
          title_fr: "VOTRE PC EST INFECTÉ !",
          title_ar: "جهازك مصاب بالفيروسات!",
          body_fr: "Nettoyez votre système immédiatement pour éviter la perte de données.",
          body_ar: "نظف نظامك فوراً لتجنب فقدان البيانات.",
          cta_fr: "TÉLÉCHARGER",
          cta_ar: "تحميل",
        },
      },
      {
        id: "malware-q3",
        prompt: { fr: "Mettre à jour ses applis sert à...", ar: "تحديث التطبيقات يُستخدم لـ..." },
        choices: { fr: ["Rien", "Corriger les failles de sécurité", "Vider la batterie"], ar: ["لا شيء", "إصلاح الثغرات الأمنية", "تفريغ البطارية"] },
        correctIndex: 1,
        explanation: { fr: "Les mises à jour bouchent les trous utilisés par les pirates.", ar: "التحديثات تغلق الثغرات التي يستغلها القراصنة." },
        visual_type: "fake_download",
        visual_config: {
          app_name: "Mise à jour système",
          app_desc_fr: "Téléchargez depuis des sources officielles uniquement",
          app_desc_ar: "حمّل من المصادر الرسمية فقط",
          buttons: [
            { label_fr: "App Store officiel ✓", label_ar: "المتجر الرسمي ✓", style: "secondary" },
            { label_fr: "⬇ Télécharger ici (gratuit!)", label_ar: "⬇ حمّل هنا (مجاناً!)", style: "danger" },
          ],
        },
      },
    ],
  },
];

export function getCategory(id: string) {
  return CATEGORIES.find((t) => t.id === id);
}

export function getCategories() {
  return CATEGORIES;
}
