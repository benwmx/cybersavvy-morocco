export interface Question {
  id: string;
  prompt: { fr: string; ar: string };
  choices: { fr: string[]; ar: string[] };
  correctIndex: number;
  explanation: { fr: string; ar: string };
}

export interface Track {
  id: string;
  icon: "Fish" | "KeyRound" | "Users" | "MessageSquareWarning" | "Lock" | "Bug";
  color: string; // tailwind class for accent
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  questions: Question[];
}

export const TRACKS: Track[] = [
  {
    id: "phishing",
    icon: "Fish",
    color: "text-chart-1",
    title: { fr: "Hameçonnage", ar: "التصيد الاحتيالي" },
    description: {
      fr: "Reconnaître les messages piégés.",
      ar: "تعرّف على الرسائل المخادعة.",
    },
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
        prompt: {
          fr: "Quel mot de passe est le plus solide ?",
          ar: "أيّ كلمة مرور أقوى؟",
        },
        choices: { fr: ["123456", "azerty", "Tigre!Lune42$"], ar: ["123456", "azerty", "Tigre!Lune42$"] },
        correctIndex: 2,
        explanation: {
          fr: "Un bon mot de passe mélange lettres, chiffres et symboles, et est long.",
          ar: "كلمة المرور الجيدة تجمع بين الحروف والأرقام والرموز وتكون طويلة.",
        },
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
      },
      {
        id: "social-q2",
        prompt: { fr: "Un inconnu t'envoie une demande d'ami. Tu...", ar: "غريب يطلب صداقتك. أنت..." },
        choices: { fr: ["Acceptes vite", "Refuses ou ignores", "Acceptes si jolie photo"], ar: ["تقبل بسرعة", "ترفض أو تتجاهل", "تقبل إذا الصورة جميلة"] },
        correctIndex: 1,
        explanation: { fr: "Tout le monde n'est pas qui il prétend être.", ar: "ليس الجميع كما يدّعون." },
      },
      {
        id: "social-q3",
        prompt: { fr: "Que faire avant de publier une photo de ton ami ?", ar: "ماذا تفعل قبل نشر صورة صديقك؟" },
        choices: { fr: ["Rien", "Lui demander", "Le taguer"], ar: ["لا شيء", "أستأذنه", "أضع اسمه"] },
        correctIndex: 1,
        explanation: { fr: "Respecte le consentement de tes amis.", ar: "احترم موافقة أصدقائك." },
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
      },
      {
        id: "cyber-q2",
        prompt: { fr: "On t'insulte sur un chat. Tu...", ar: "يهينك أحدهم في محادثة. أنت..." },
        choices: { fr: ["Réponds violemment", "Bloques, gardes les preuves, parles à un adulte", "Supprimes ton compte"], ar: ["ترد بعنف", "تحجب وتحفظ الأدلة وتخبر شخصاً بالغاً", "تحذف حسابك"] },
        correctIndex: 1,
        explanation: { fr: "Capture d'écran + bloquer + parler. Tu n'es pas seul.", ar: "لقطة شاشة + حجب + التحدث. لست وحدك." },
      },
      {
        id: "cyber-q3",
        prompt: { fr: "Le harcèlement en ligne est...", ar: "التنمر الإلكتروني هو..." },
        choices: { fr: ["Un jeu", "Puni par la loi", "Sans conséquence"], ar: ["لعبة", "يعاقب عليه القانون", "بلا عواقب"] },
        correctIndex: 1,
        explanation: { fr: "C'est un délit, avec des conséquences réelles.", ar: "إنه جريمة ولها عواقب حقيقية." },
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
      },
      {
        id: "privacy-q2",
        prompt: { fr: "Profil public ou privé pour un ado ?", ar: "الحساب عام أم خاص للمراهق؟" },
        choices: { fr: ["Public", "Privé", "Peu importe"], ar: ["عام", "خاص", "لا فرق"] },
        correctIndex: 1,
        explanation: { fr: "Un profil privé limite qui voit tes contenus.", ar: "الحساب الخاص يحدّ من رؤية محتواك." },
      },
      {
        id: "privacy-q3",
        prompt: { fr: "Tes données partagées sur internet sont...", ar: "بياناتك المنشورة على الإنترنت..." },
        choices: { fr: ["Effaçables facilement", "Souvent permanentes", "Toujours privées"], ar: ["تُحذف بسهولة", "غالباً دائمة", "خاصة دائماً"] },
        correctIndex: 1,
        explanation: { fr: "Ce que tu publies peut rester en ligne longtemps.", ar: "ما تنشره قد يبقى على الإنترنت طويلاً." },
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
      },
      {
        id: "malware-q2",
        prompt: { fr: "Une pop-up dit 'Ton PC est infecté ! Clique ici'. Tu...", ar: "نافذة تقول 'حاسوبك مصاب! انقر هنا'. أنت..." },
        choices: { fr: ["Cliques", "Fermes la fenêtre", "Donnes ta carte"], ar: ["تنقر", "تغلق النافذة", "تعطي بطاقتك"] },
        correctIndex: 1,
        explanation: { fr: "Les fausses alertes installent souvent des malwares.", ar: "التحذيرات الزائفة تثبّت برامج خبيثة." },
      },
      {
        id: "malware-q3",
        prompt: { fr: "Mettre à jour ses applis sert à...", ar: "تحديث التطبيقات يُستخدم لـ..." },
        choices: { fr: ["Rien", "Corriger les failles de sécurité", "Vider la batterie"], ar: ["لا شيء", "إصلاح الثغرات الأمنية", "تفريغ البطارية"] },
        correctIndex: 1,
        explanation: { fr: "Les mises à jour bouchent les trous utilisés par les pirates.", ar: "التحديثات تغلق الثغرات التي يستغلها القراصنة." },
      },
    ],
  },
];

export function getTrack(id: string) {
  return TRACKS.find((t) => t.id === id);
}
