-- ============================================================
-- Migration 015: Add 2 additional scenarios per category
-- IDs 007–018, continuing from 002_seed_public_data.sql
-- Idempotent: ON CONFLICT (id) DO NOTHING
-- ============================================================

-- ─── Category 1: Hameçonnage ──────────────────────────────

INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000007', NULL,
  '10000000-0000-0000-0000-000000000001',
  '{"fr":"Arnaques par email professionnel","ar":"الاحتيال عبر البريد المهني"}'::jsonb,
  '{"fr":"Identifier les faux emails d''entreprise.","ar":"كشف رسائل البريد الإلكتروني المزيفة من الشركات."}'::jsonb,
  '[
    {
      "id": "bec-q1",
      "prompt": {"fr":"Tu reçois un email de ton «directeur» te demandant de virer de l''argent en urgence. Que fais-tu ?","ar":"تتلقى بريداً من «مديرك» يطلب تحويل أموال بشكل عاجل. ماذا تفعل؟"},
      "choices": {"fr":["Je vire l''argent immédiatement","Je contacte mon directeur par téléphone pour vérifier","Je transfère l''email à un collègue"],"ar":["أحول الأموال فوراً","أتصل بمديري هاتفياً للتحقق","أعيد توجيه البريد لزميل"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les arnaques BEC imitent les supérieurs. Vérifiez toujours par un autre canal (téléphone).","ar":"يقلد المحتالون المسؤولين. تحقق دائماً عبر قناة أخرى كالهاتف."}
    },
    {
      "id": "bec-q2",
      "prompt": {"fr":"L''adresse expéditrice est «direction@monentreprise-secure.fr». Est-ce fiable ?","ar":"عنوان المرسل هو «direction@monentreprise-secure.fr». هل هو موثوق؟"},
      "choices": {"fr":["Oui, le nom d''entreprise y figure","Non, le domaine est différent du vrai","Oui si l''email semble urgent"],"ar":["نعم، يظهر اسم الشركة","لا، النطاق مختلف عن الأصلي","نعم إذا بدا البريد عاجلاً"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les pirates créent des domaines similaires. Comparez avec le domaine officiel exact.","ar":"يصنع القراصنة نطاقات مشابهة. قارن مع النطاق الرسمي الدقيق."}
    },
    {
      "id": "bec-q3",
      "prompt": {"fr":"Quel indice révèle un email de phishing professionnel ?","ar":"ما الدليل الذي يكشف بريد تصيد مهني؟"},
      "choices": {"fr":["Un ton neutre et professionnel","Urgence + demande inhabituelle + adresse légèrement différente","Un logo d''entreprise dans la signature"],"ar":["نبرة محايدة ومهنية","استعجال + طلب غير معتاد + عنوان مختلف قليلاً","شعار الشركة في التوقيع"]},
      "correctIndex": 1,
      "explanation": {"fr":"L''urgence artificielle et les demandes inhabituelles sont les principaux signaux d''alarme.","ar":"الاستعجال الاصطناعي والطلبات غير المعتادة هي أبرز علامات التحذير."}
    },
    {
      "id": "bec-q4",
      "prompt": {"fr":"Que faire si tu as cliqué sur un lien suspect dans un email pro ?","ar":"ماذا تفعل إن نقرت على رابط مشبوه في بريد مهني؟"},
      "choices": {"fr":["Rien, c''est trop tard","Déconnecter l''appareil du réseau et alerter le responsable informatique","Changer son mot de passe email uniquement"],"ar":["لا شيء، فات الأوان","فصل الجهاز عن الشبكة وإبلاغ المسؤول التقني","تغيير كلمة مرور البريد فقط"]},
      "correctIndex": 1,
      "explanation": {"fr":"Isoler l''appareil limite la propagation. Avertir le service informatique est indispensable.","ar":"عزل الجهاز يحد من الانتشار. إبلاغ التقنية أمر ضروري."}
    }
  ]'::jsonb,
  'Mail', 'text-chart-1', true
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000008', NULL,
  '10000000-0000-0000-0000-000000000001',
  '{"fr":"Phishing sur les réseaux sociaux","ar":"التصيد عبر الشبكات الاجتماعية"}'::jsonb,
  '{"fr":"Reconnaître les pièges sur Instagram, WhatsApp et Facebook.","ar":"كشف الفخاخ على إنستغرام وواتساب وفيسبوك."}'::jsonb,
  '[
    {
      "id": "social-phish-q1",
      "prompt": {"fr":"Un inconnu sur Instagram t''offre un iPhone si tu donnes tes identifiants pour «vérifier ton compte». Que fais-tu ?","ar":"يعرض عليك شخص على إنستغرام هاتفاً مجاناً مقابل بياناتك لـ«التحقق من حسابك». ماذا تفعل؟"},
      "choices": {"fr":["Je donne mes identifiants pour gagner","Je refuse et signale le profil","Je demande plus de détails d''abord"],"ar":["أعطي بياناتي للفوز","أرفض وأبلغ عن الحساب","أطلب مزيداً من التفاصيل أولاً"]},
      "correctIndex": 1,
      "explanation": {"fr":"Aucun concours légitime ne demande tes identifiants. Signale immédiatement.","ar":"لا توجد مسابقة شرعية تطلب بياناتك. أبلغ فوراً."}
    },
    {
      "id": "social-phish-q2",
      "prompt": {"fr":"Tu reçois sur WhatsApp un lien «pour voir qui visite ton profil». C''est :","ar":"تتلقى على واتساب رابطاً «لرؤية من يزور ملفك الشخصي». هذا هو:"},
      "choices": {"fr":["Une vraie fonctionnalité","Une arnaque pour voler tes données","Un bug de l''application"],"ar":["ميزة حقيقية","احتيال لسرقة بياناتك","خلل في التطبيق"]},
      "correctIndex": 1,
      "explanation": {"fr":"Cette fonctionnalité n''existe pas sur WhatsApp. Ces liens volent vos données ou installent des logiciels malveillants.","ar":"هذه الميزة غير موجودة على واتساب. تسرق هذه الروابط بياناتك أو تثبت برامج خبيثة."}
    },
    {
      "id": "social-phish-q3",
      "prompt": {"fr":"Un ami t''envoie un message «Regarde cette photo de toi !» avec un lien bizarre. Réaction ?","ar":"يرسل لك صديق رسالة «انظر هذه الصورة لك!» مع رابط غريب. كيف تتصرف؟"},
      "choices": {"fr":["Je clique, c''est mon ami","Je contacte mon ami directement pour vérifier","Je partage le lien avec d''autres"],"ar":["أنقر، إنه صديقي","أتواصل مع صديقي مباشرة للتحقق","أشارك الرابط مع الآخرين"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le compte de ton ami a peut-être été piraté. Vérifie toujours par un autre moyen.","ar":"ربما اختُرق حساب صديقك. تحقق دائماً بوسيلة أخرى."}
    },
    {
      "id": "social-phish-q4",
      "prompt": {"fr":"Comment reconnaître un faux profil sur les réseaux sociaux ?","ar":"كيف تتعرف على ملف تعريف مزيف على الشبكات الاجتماعية؟"},
      "choices": {"fr":["Peu de publications, photos génériques, création récente","Beaucoup d''abonnés et de publications","Un nom français ou marocain"],"ar":["منشورات قليلة، صور عامة، حساب حديث","كثير من المتابعين والمنشورات","اسم فرنسي أو مغربي"]},
      "correctIndex": 0,
      "explanation": {"fr":"Les faux profils sont souvent récents, avec peu de contenu personnel et des photos volées.","ar":"الملفات المزيفة غالباً حديثة، بمحتوى شخصي قليل وصور مسروقة."}
    }
  ]'::jsonb,
  'SmartphoneNfc', 'text-chart-1', true
) ON CONFLICT (id) DO NOTHING;


-- ─── Category 2: Mots de passe ────────────────────────────

INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000009', NULL,
  '10000000-0000-0000-0000-000000000002',
  '{"fr":"Gestionnaire de mots de passe","ar":"مدير كلمات المرور"}'::jsonb,
  '{"fr":"Utiliser un gestionnaire pour sécuriser ses accès.","ar":"استخدام مدير كلمات المرور لتأمين حساباتك."}'::jsonb,
  '[
    {
      "id": "passm-q1",
      "prompt": {"fr":"Quel est l''avantage principal d''un gestionnaire de mots de passe ?","ar":"ما الميزة الرئيسية لمدير كلمات المرور؟"},
      "choices": {"fr":["Il retient un seul mot de passe pour tout","Il génère et stocke des mots de passe uniques et complexes","Il partage tes mots de passe avec tes amis"],"ar":["يحفظ كلمة مرور واحدة للجميع","يُنشئ ويحفظ كلمات مرور فريدة ومعقدة","يشارك كلمات مرورك مع أصدقائك"]},
      "correctIndex": 1,
      "explanation": {"fr":"Un bon gestionnaire crée un mot de passe fort unique par site, stocké de façon chiffrée.","ar":"يُنشئ المدير الجيد كلمة مرور قوية فريدة لكل موقع، مخزنة بشكل مشفر."}
    },
    {
      "id": "passm-q2",
      "prompt": {"fr":"Écrire ses mots de passe dans un carnet papier est :","ar":"كتابة كلمات المرور في دفتر ورقي هو:"},
      "choices": {"fr":["Une bonne pratique de backup","Risqué si le carnet est perdu ou volé","Conseillé par les experts"],"ar":["ممارسة نسخ احتياطي جيدة","خطر إذا فُقد الدفتر أو سُرق","موصى به من قبل الخبراء"]},
      "correctIndex": 1,
      "explanation": {"fr":"Un carnet peut être volé, perdu ou photographié. Préférez un gestionnaire numérique chiffré.","ar":"يمكن سرقة الدفتر أو فقدانه أو تصويره. فضّل مديراً رقمياً مشفراً."}
    },
    {
      "id": "passm-q3",
      "prompt": {"fr":"Le mot de passe maître d''un gestionnaire doit être :","ar":"كلمة المرور الرئيسية لمدير كلمات المرور يجب أن تكون:"},
      "choices": {"fr":["Simple pour ne pas l''oublier","Long, complexe et unique — et mémorisé","Le même que ton email"],"ar":["بسيطة لتتذكرها","طويلة ومعقدة وفريدة — وتحفظها","نفس كلمة مرور بريدك"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le mot de passe maître protège tout. Il doit être très fort et ne jamais être réutilisé.","ar":"كلمة المرور الرئيسية تحمي كل شيء. يجب أن تكون قوية جداً ولا تُعاد استخدامها أبداً."}
    },
    {
      "id": "passm-q4",
      "prompt": {"fr":"Que faire si tu oublies le mot de passe maître de ton gestionnaire ?","ar":"ماذا تفعل إن نسيت كلمة المرور الرئيسية لمديرك؟"},
      "choices": {"fr":["Créer un nouveau compte et tout recommencer","Utiliser le code de récupération prévu à la création","Contacter le service client par email"],"ar":["إنشاء حساب جديد والبدء من الصفر","استخدام رمز الاسترداد المُنشأ عند التسجيل","الاتصال بخدمة العملاء عبر البريد"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le code de récupération est généré à la création. Conservez-le hors ligne dans un endroit sûr.","ar":"رمز الاسترداد يُنشأ عند التسجيل. احفظه خارج الإنترنت في مكان آمن."}
    }
  ]'::jsonb,
  'KeyRound', 'text-chart-2', true
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000010', NULL,
  '10000000-0000-0000-0000-000000000002',
  '{"fr":"Fuites de données et vos comptes","ar":"تسريبات البيانات وحساباتك"}'::jsonb,
  '{"fr":"Que faire quand vos données ont été volées.","ar":"ماذا تفعل حين تُسرق بياناتك."}'::jsonb,
  '[
    {
      "id": "breach-q1",
      "prompt": {"fr":"Tu apprends qu''un site où tu es inscrit a été piraté. Première action ?","ar":"علمت أن موقعاً مسجلاً فيه قد اختُرق. أول إجراء؟"},
      "choices": {"fr":["Attendre de voir si quelque chose se passe","Changer immédiatement ton mot de passe sur ce site et sur tous les sites où tu utilises le même","Supprimer ton compte"],"ar":["الانتظار لمعرفة ما سيحدث","تغيير كلمة المرور فوراً في هذا الموقع وكل المواقع التي تستخدم فيها نفسها","حذف حسابك"]},
      "correctIndex": 1,
      "explanation": {"fr":"La réutilisation de mots de passe est dangereuse après une fuite. Changez-les partout immédiatement.","ar":"إعادة استخدام كلمات المرور خطرة بعد التسريب. غيّرها في كل مكان فوراً."}
    },
    {
      "id": "breach-q2",
      "prompt": {"fr":"Quel outil gratuit permet de vérifier si votre email a été impliqué dans une fuite ?","ar":"أي أداة مجانية تتيح التحقق إن كان بريدك مشمولاً في تسريب؟"},
      "choices": {"fr":["Google Translate","HaveIBeenPwned.com","VirusTotal"],"ar":["Google Translate","HaveIBeenPwned.com","VirusTotal"]},
      "correctIndex": 1,
      "explanation": {"fr":"HaveIBeenPwned recense les fuites de données et vérifie si votre email y apparaît.","ar":"يتتبع HaveIBeenPwned تسريبات البيانات ويتحقق إن ظهر بريدك فيها."}
    },
    {
      "id": "breach-q3",
      "prompt": {"fr":"Après une fuite, activer la double authentification (2FA) est :","ar":"بعد تسريب، تفعيل المصادقة الثنائية (2FA) هو:"},
      "choices": {"fr":["Inutile si on a changé son mot de passe","Essentiel pour bloquer les connexions non autorisées","Optionnel pour les comptes peu importants"],"ar":["غير ضروري إن غيرنا كلمة المرور","ضروري لمنع تسجيل الدخول غير المصرح به","اختياري للحسابات غير المهمة"]},
      "correctIndex": 1,
      "explanation": {"fr":"La 2FA empêche l''attaquant d''utiliser un mot de passe volé sans accès à votre téléphone.","ar":"تمنع المصادقة الثنائية المهاجم من استخدام كلمة المرور المسروقة دون الوصول لهاتفك."}
    },
    {
      "id": "breach-q4",
      "prompt": {"fr":"Une fuite expose votre numéro de téléphone. Risque principal ?","ar":"تسريب يكشف رقم هاتفك. الخطر الرئيسي؟"},
      "choices": {"fr":["Aucun risque, c''est juste un numéro","Smishing (SMS frauduleux) et SIM swapping","Le téléphone peut tomber en panne"],"ar":["لا خطر، مجرد رقم","Smishing (رسائل SMS احتيالية) وسرقة الشريحة","قد يتعطل الهاتف"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les numéros de téléphone sont utilisés pour des SMS d''arnaque (smishing) et des attaques de transfert de numéro (SIM swap).","ar":"تُستخدم أرقام الهاتف في رسائل الاحتيال وهجمات نقل الشريحة."}
    }
  ]'::jsonb,
  'ShieldAlert', 'text-chart-2', true
) ON CONFLICT (id) DO NOTHING;


-- ─── Category 3: Réseaux sociaux ──────────────────────────

INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000011', NULL,
  '10000000-0000-0000-0000-000000000003',
  '{"fr":"Paramètres de confidentialité","ar":"إعدادات الخصوصية"}'::jsonb,
  '{"fr":"Maîtriser les paramètres de vie privée sur les réseaux.","ar":"التحكم في إعدادات الخصوصية على الشبكات."}'::jsonb,
  '[
    {
      "id": "privacy-settings-q1",
      "prompt": {"fr":"Ton profil Instagram est en mode public. Qui peut voir tes photos ?","ar":"ملفك على إنستغرام عام. من يمكنه رؤية صورك؟"},
      "choices": {"fr":["Seulement tes abonnés","N''importe qui sur internet, y compris des inconnus","Seulement tes amis proches"],"ar":["متابعوك فقط","أي شخص على الإنترنت، بما فيهم الغرباء","أصدقاؤك المقربون فقط"]},
      "correctIndex": 1,
      "explanation": {"fr":"Un profil public est visible par tout le monde, même sans compte. Passez en mode privé pour contrôler.","ar":"الملف العام مرئي للجميع، حتى بدون حساب. انتقل للوضع الخاص للتحكم."}
    },
    {
      "id": "privacy-settings-q2",
      "prompt": {"fr":"Quelle information ne devrait jamais apparaître sur un profil public ?","ar":"أي معلومة يجب ألا تظهر على ملف عام؟"},
      "choices": {"fr":["Ta passion pour le foot","Ton adresse personnelle et ton numéro de téléphone","La ville où tu habites"],"ar":["شغفك بكرة القدم","عنوانك الشخصي ورقم هاتفك","المدينة التي تسكن فيها"]},
      "correctIndex": 1,
      "explanation": {"fr":"L''adresse et le téléphone permettent à des personnes malveillantes de vous localiser ou vous contacter directement.","ar":"العنوان والهاتف يسمحان للمحتالين بتحديد مكانك أو التواصل معك مباشرة."}
    },
    {
      "id": "privacy-settings-q3",
      "prompt": {"fr":"Une application demande l''accès à ta localisation, tes contacts et ta caméra pour fonctionner. Que fais-tu ?","ar":"يطلب تطبيق الوصول إلى موقعك وجهات اتصالك وكاميرتك للعمل. ماذا تفعل؟"},
      "choices": {"fr":["J''accepte tout pour utiliser l''appli","Je refuse les permissions inutiles à sa fonction","Je désinstalle immédiatement"],"ar":["أقبل الكل لاستخدام التطبيق","أرفض الصلاحيات غير الضرورية لوظيفته","أحذفه فوراً"]},
      "correctIndex": 1,
      "explanation": {"fr":"Accordez uniquement les permissions nécessaires. Un jeu n''a pas besoin de vos contacts.","ar":"امنح الصلاحيات الضرورية فقط. لا يحتاج الألعاب إلى جهات اتصالك."}
    },
    {
      "id": "privacy-settings-q4",
      "prompt": {"fr":"Que signifie «se connecter avec Facebook» sur un site tiers ?","ar":"ماذا يعني «تسجيل الدخول بفيسبوك» على موقع خارجي؟"},
      "choices": {"fr":["Facebook paie l''abonnement","Tu accordes au site l''accès à certaines données de ton profil Facebook","Tu crées automatiquement un compte Facebook"],"ar":["فيسبوك يدفع الاشتراك","تمنح الموقع وصولاً لبعض بيانات ملفك على فيسبوك","تُنشئ حساب فيسبوك تلقائياً"]},
      "correctIndex": 1,
      "explanation": {"fr":"Cette connexion partage des données (email, amis, likes). Vérifiez les autorisations avant d''accepter.","ar":"هذا الاتصال يشارك بيانات (البريد، الأصدقاء، الإعجابات). تحقق من الأذونات قبل القبول."}
    }
  ]'::jsonb,
  'Lock', 'text-chart-3', true
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000012', NULL,
  '10000000-0000-0000-0000-000000000003',
  '{"fr":"Réputation numérique","ar":"السمعة الرقمية"}'::jsonb,
  '{"fr":"Comprendre l''impact durable de ce qu''on publie.","ar":"فهم الأثر الدائم لما تنشره."}'::jsonb,
  '[
    {
      "id": "reputation-q1",
      "prompt": {"fr":"Tu publies une photo embarrassante d''un ami sans sa permission. Conséquence possible ?","ar":"تنشر صورة محرجة لصديق دون إذنه. ما العاقبة المحتملة؟"},
      "choices": {"fr":["Aucune, c''est une blague","Atteinte à la vie privée pouvant mener à des sanctions légales","L''ami sera content après"],"ar":["لا شيء، مجرد مزحة","انتهاك الخصوصية قد يؤدي إلى عقوبات قانونية","سيكون الصديق سعيداً بعدها"]},
      "correctIndex": 1,
      "explanation": {"fr":"Publier des photos de quelqu''un sans accord est illégal dans de nombreux pays et peut causer un tort sérieux.","ar":"نشر صور شخص دون موافقته مخالف للقانون في كثير من الدول وقد يسبب ضرراً بالغاً."}
    },
    {
      "id": "reputation-q2",
      "prompt": {"fr":"Un message que tu supprimes reste-t-il sur internet ?","ar":"هل تبقى رسالة حذفتها على الإنترنت؟"},
      "choices": {"fr":["Non, c''est effacé définitivement","Oui, d''autres peuvent l''avoir capturé ou partagé","Seulement pendant 24h"],"ar":["لا، تُحذف نهائياً","نعم، ربما التقطها آخرون أو شاركوها","فقط لمدة 24 ساعة"]},
      "correctIndex": 1,
      "explanation": {"fr":"Une capture d''écran peut immortaliser n''importe quel contenu. «Internet n''oublie jamais.»","ar":"يمكن لقطة الشاشة توثيق أي محتوى. «الإنترنت لا ينسى أبداً.»"}
    },
    {
      "id": "reputation-q3",
      "prompt": {"fr":"Des recruteurs peuvent-ils consulter tes réseaux sociaux avant de t''embaucher ?","ar":"هل يمكن للمُوظِّفين الاطلاع على شبكاتك الاجتماعية قبل توظيفك؟"},
      "choices": {"fr":["Non, c''est interdit par la loi","Oui, les profils publics sont accessibles à tous","Seulement LinkedIn"],"ar":["لا، يحظره القانون","نعم، الملفات العامة متاحة للجميع","LinkedIn فقط"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les profils publics sont visibles par les employeurs. Votre présence en ligne fait partie de votre image professionnelle.","ar":"الملفات العامة مرئية للمُوظِّفين. حضورك على الإنترنت جزء من صورتك المهنية."}
    },
    {
      "id": "reputation-q4",
      "prompt": {"fr":"La meilleure façon de protéger ta réputation numérique est de :","ar":"أفضل طريقة لحماية سمعتك الرقمية هي:"},
      "choices": {"fr":["Ne jamais publier quoi que ce soit","Réfléchir avant de publier : «Est-ce que j''assumerais cela dans 10 ans ?»","Utiliser un faux nom"],"ar":["لا تنشر شيئاً أبداً","التفكير قبل النشر: «هل سأتحمل هذا بعد 10 سنوات؟»","استخدام اسم مستعار"]},
      "correctIndex": 1,
      "explanation": {"fr":"La règle des 10 ans est un bon filtre. Ce que tu publies aujourd''hui peut impacter ton futur.","ar":"قاعدة الـ 10 سنوات مرشح جيد. ما تنشره اليوم قد يؤثر على مستقبلك."}
    }
  ]'::jsonb,
  'Star', 'text-chart-3', true
) ON CONFLICT (id) DO NOTHING;


-- ─── Category 4: Cyberharcèlement ─────────────────────────

INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000013', NULL,
  '10000000-0000-0000-0000-000000000004',
  '{"fr":"Réagir face au cyberharcèlement","ar":"كيف تتصرف في مواجهة التنمر الإلكتروني"}'::jsonb,
  '{"fr":"Identifier le harcèlement en ligne et savoir quoi faire.","ar":"تحديد التنمر عبر الإنترنت ومعرفة كيفية التصرف."}'::jsonb,
  '[
    {
      "id": "bullying-react-q1",
      "prompt": {"fr":"Un élève reçoit des messages insultants répétés sur WhatsApp. C''est :","ar":"يتلقى تلميذ رسائل مسيئة متكررة على واتساب. هذا هو:"},
      "choices": {"fr":["Une blague entre amis","Du cyberharcèlement — une forme de violence","Un malentendu passager"],"ar":["مزحة بين أصدقاء","تنمر إلكتروني — شكل من أشكال العنف","سوء فهم عابر"]},
      "correctIndex": 1,
      "explanation": {"fr":"Des messages répétés et blessants constituent du harcèlement, même en ligne. C''est sérieux et illégal.","ar":"الرسائل المتكررة والمؤلمة تُعدّ تنمراً، حتى عبر الإنترنت. إنه أمر جدي وغير قانوني."}
    },
    {
      "id": "bullying-react-q2",
      "prompt": {"fr":"Que faire en premier si tu es victime de cyberharcèlement ?","ar":"ماذا تفعل أولاً إن كنت ضحية تنمر إلكتروني؟"},
      "choices": {"fr":["Répondre aux messages pour te défendre","Ne rien faire et espérer que ça s''arrête","Sauvegarder les preuves (captures d''écran), bloquer l''harceleur et en parler à un adulte de confiance"],"ar":["الرد على الرسائل للدفاع عن نفسك","لا تفعل شيئاً وأمل أن يتوقف","احفظ الأدلة (لقطات شاشة)، احجب المتنمر وأخبر بالغاً موثوقاً"]},
      "correctIndex": 2,
      "explanation": {"fr":"Les preuves sont essentielles. Bloquer coupe le contact. Un adulte (parent, professeur) peut aider concrètement.","ar":"الأدلة ضرورية. الحجب يقطع التواصل. البالغ (أحد الوالدين، أستاذ) يمكنه المساعدة الفعلية."}
    },
    {
      "id": "bullying-react-q3",
      "prompt": {"fr":"Ton ami est victime de cyberharcèlement. En tant que témoin, tu dois :","ar":"صديقك ضحية تنمر إلكتروني. كشاهد، يجب أن:"},
      "choices": {"fr":["Liker les messages pour paraître neutre","Soutenir la victime et signaler le contenu sans relayer les messages cruels","Ignorer pour ne pas te mêler"],"ar":["تضغط إعجاباً للظهور محايداً","تدعم الضحية وتبلغ عن المحتوى دون إعادة نشر الرسائل القاسية","تتجاهل الأمر لتبقى بعيداً"]},
      "correctIndex": 1,
      "explanation": {"fr":"Rester neutre favorise le harceleur. Soutenir la victime et signaler sans partager est la bonne attitude.","ar":"البقاء محايداً يفيد المتنمر. دعم الضحية والإبلاغ دون المشاركة هو الموقف الصحيح."}
    },
    {
      "id": "bullying-react-q4",
      "prompt": {"fr":"Une plateforme comme Instagram permet de signaler un compte harceleur. Cette fonction sert à :","ar":"منصة كإنستغرام تتيح الإبلاغ عن حساب متنمر. هذه الوظيفة تخدم:"},
      "choices": {"fr":["Bloquer ses propres publications","Alerter la plateforme qui peut suspendre le compte","Envoyer un avertissement au harceleur"],"ar":["حظر منشوراتك الخاصة","تنبيه المنصة التي يمكنها تعليق الحساب","إرسال تحذير للمتنمر"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le signalement déclenche une vérification par la plateforme pouvant mener à la suspension du compte abusif.","ar":"الإبلاغ يطلق مراجعة من المنصة قد تؤدي إلى تعليق الحساب المسيء."}
    }
  ]'::jsonb,
  'ShieldOff', 'text-chart-4', true
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000014', NULL,
  '10000000-0000-0000-0000-000000000004',
  '{"fr":"Signaler et se protéger","ar":"الإبلاغ وحماية النفس"}'::jsonb,
  '{"fr":"Les outils et les droits pour lutter contre le harcèlement.","ar":"الأدوات والحقوق للتصدي للتنمر."}'::jsonb,
  '[
    {
      "id": "report-q1",
      "prompt": {"fr":"Au Maroc, le cyberharcèlement peut être signalé à :","ar":"في المغرب، يمكن الإبلاغ عن التنمر الإلكتروني لـ:"},
      "choices": {"fr":["Seulement à la plateforme concernée","La police, le parquet, ou via les plateformes de signalement comme e-blagh.ma","À personne, c''est privé"],"ar":["المنصة المعنية فقط","الشرطة، النيابة، أو عبر منصات الإبلاغ كـ e-blagh.ma","لا أحد، الأمر خاص"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le Maroc dispose de voies légales (art. 446-1 CP) et de plateformes officielles pour signaler le cyberharcèlement.","ar":"يمتلك المغرب مسارات قانونية (المادة 446-1 ق.ج.) ومنصات رسمية للإبلاغ عن التنمر الإلكتروني."}
    },
    {
      "id": "report-q2",
      "prompt": {"fr":"Quel type de contenu doit être signalé immédiatement à la police ?","ar":"أي نوع من المحتوى يجب الإبلاغ عنه فوراً للشرطة؟"},
      "choices": {"fr":["Des mèmes amusants","Des menaces de violence physique ou du contenu sexuel impliquant des mineurs","Des critiques d''opinion"],"ar":["ميمات مضحكة","تهديدات بالعنف الجسدي أو محتوى جنسي يتضمن قاصرين","انتقادات رأي"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les menaces réelles et le contenu illicite impliquant des mineurs sont des délits graves nécessitant une intervention policière.","ar":"التهديدات الحقيقية والمحتوى غير المشروع المتعلق بالقاصرين جرائم خطيرة تستوجب تدخل الشرطة."}
    },
    {
      "id": "report-q3",
      "prompt": {"fr":"Comment se protéger AVANT d''être harcelé ?","ar":"كيف تحمي نفسك قبل التعرض للتنمر؟"},
      "choices": {"fr":["Ne pas utiliser internet du tout","Profil privé, ne pas partager d''infos personnelles, choisir soigneusement ses contacts en ligne","Accepter toutes les demandes d''ami pour être populaire"],"ar":["تجنب الإنترنت كلياً","ملف خاص، عدم مشاركة المعلومات الشخصية، اختيار جهات الاتصال بعناية","قبول كل طلبات الصداقة لتكون مشهوراً"]},
      "correctIndex": 1,
      "explanation": {"fr":"La prévention passe par la maîtrise de sa présence en ligne : profil privé, informations limitées, contacts vérifiés.","ar":"الوقاية تمر بالتحكم في حضورك الرقمي: ملف خاص، معلومات محدودة، جهات اتصال موثقة."}
    }
  ]'::jsonb,
  'Flag', 'text-chart-4', true
) ON CONFLICT (id) DO NOTHING;


-- ─── Category 5: Vie privée ───────────────────────────────

INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000015', NULL,
  '10000000-0000-0000-0000-000000000005',
  '{"fr":"Données personnelles et applications","ar":"البيانات الشخصية والتطبيقات"}'::jsonb,
  '{"fr":"Comprendre ce que les applis collectent sur vous.","ar":"فهم ما تجمعه التطبيقات عنك."}'::jsonb,
  '[
    {
      "id": "appdata-q1",
      "prompt": {"fr":"Pourquoi des applications gratuites collectent-elles tes données ?","ar":"لماذا تجمع التطبيقات المجانية بياناتك؟"},
      "choices": {"fr":["Par curiosité technique","Pour les vendre à des annonceurs ou les utiliser à des fins commerciales","Pour améliorer uniquement l''expérience utilisateur"],"ar":["من فضول تقني","لبيعها لمعلنين أو استخدامها لأغراض تجارية","لتحسين تجربة المستخدم فقط"]},
      "correctIndex": 1,
      "explanation": {"fr":"«Si c''est gratuit, vous êtes le produit.» Les données sont la monnaie des services gratuits.","ar":"«إذا كانت مجانية، فأنت المنتج.» البيانات هي عملة الخدمات المجانية."}
    },
    {
      "id": "appdata-q2",
      "prompt": {"fr":"Une appli de lampe de poche demande accès à tes contacts et ta localisation. Tu :","ar":"تطبيق مصباح يدوي يطلب الوصول لجهات اتصالك وموقعك. أنت:"},
      "choices": {"fr":["Acceptes, ça ne change rien","Refuses ces permissions inutiles et cherches une alternative","Acceptes pour éviter les publicités"],"ar":["تقبل، لا يهم","ترفض هذه الصلاحيات غير الضرورية وتبحث عن بديل","تقبل لتجنب الإعلانات"]},
      "correctIndex": 1,
      "explanation": {"fr":"Une lampe de poche n''a besoin ni de contacts ni de localisation. Ce sont des signaux d''alerte clairs.","ar":"المصباح لا يحتاج لجهات الاتصال أو الموقع. هذه إشارات تحذير واضحة."}
    },
    {
      "id": "appdata-q3",
      "prompt": {"fr":"Qu''est-ce qu''un «cookie» sur un site web ?","ar":"ما هو «الكوكي» على موقع إلكتروني؟"},
      "choices": {"fr":["Un virus informatique","Un fichier qui stocke des informations sur ta navigation pour personnaliser ton expérience","Un type de mot de passe"],"ar":["فيروس حاسوبي","ملف يخزن معلومات تصفحك لتخصيص تجربتك","نوع من كلمات المرور"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les cookies permettent aux sites de te reconnaître et de personnaliser le contenu, mais peuvent aussi tracker ton comportement.","ar":"تتيح الكوكيز للمواقع التعرف عليك وتخصيص المحتوى، لكنها قد تتتبع سلوكك أيضاً."}
    },
    {
      "id": "appdata-q4",
      "prompt": {"fr":"Le RGPD (ou loi 09-08 au Maroc) donne aux citoyens le droit de :","ar":"يمنح RGPD (أو القانون 09-08 في المغرب) المواطنين حق:"},
      "choices": {"fr":["Interdire tout traitement de données","Accéder à leurs données, les corriger et demander leur suppression","Utiliser les données des autres librement"],"ar":["حظر أي معالجة للبيانات","الوصول إلى بياناتهم وتصحيحها وطلب حذفها","استخدام بيانات الآخرين بحرية"]},
      "correctIndex": 1,
      "explanation": {"fr":"La loi marocaine 09-08 protège les données personnelles et donne des droits d''accès, de rectification et d''effacement.","ar":"يحمي القانون المغربي 09-08 البيانات الشخصية ويمنح حقوق الوصول والتصحيح والمحو."}
    }
  ]'::jsonb,
  'Database', 'text-chart-5', true
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000016', NULL,
  '10000000-0000-0000-0000-000000000005',
  '{"fr":"Consentement et identité numérique","ar":"الموافقة والهوية الرقمية"}'::jsonb,
  '{"fr":"Comprendre ses droits sur ses propres données.","ar":"فهم حقوقك على بياناتك الخاصة."}'::jsonb,
  '[
    {
      "id": "consent-q1",
      "prompt": {"fr":"Cocher «J''accepte les conditions» sans les lire, c''est :","ar":"وضع علامة على «أقبل الشروط» دون قراءتها هو:"},
      "choices": {"fr":["Normal, tout le monde le fait","Risqué : tu accordes peut-être des droits importants sur tes données","Obligatoire par la loi"],"ar":["طبيعي، الجميع يفعل ذلك","خطر: ربما تمنح حقوقاً مهمة على بياناتك","إلزامي بموجب القانون"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les conditions peuvent inclure la vente de données ou des abonnements. Lisez au moins le résumé.","ar":"قد تتضمن الشروط بيع البيانات أو اشتراكات. اقرأ على الأقل الملخص."}
    },
    {
      "id": "consent-q2",
      "prompt": {"fr":"L''identité numérique comprend :","ar":"تشمل الهوية الرقمية:"},
      "choices": {"fr":["Uniquement ton email","Tout ce qui te représente en ligne : photos, commentaires, comptes, historique de navigation","Seulement ton nom légal"],"ar":["بريدك الإلكتروني فقط","كل ما يمثلك على الإنترنت: صور، تعليقات، حسابات، سجل تصفح","اسمك القانوني فقط"]},
      "correctIndex": 1,
      "explanation": {"fr":"L''empreinte numérique est vaste. Chaque action en ligne contribue à construire une identité numérique.","ar":"البصمة الرقمية واسعة. كل فعل على الإنترنت يساهم في بناء هوية رقمية."}
    },
    {
      "id": "consent-q3",
      "prompt": {"fr":"Tu veux supprimer tes données chez une entreprise. Tu peux :","ar":"تريد حذف بياناتك لدى شركة. يمكنك:"},
      "choices": {"fr":["Seulement désinstaller leur application","Envoyer une demande de suppression (droit à l''effacement)","Rien — les données appartiennent à l''entreprise"],"ar":["إلغاء تثبيت تطبيقهم فقط","إرسال طلب حذف (حق المحو)","لا شيء — البيانات ملك الشركة"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le droit à l''effacement vous permet de demander la suppression de vos données personnelles chez toute entreprise.","ar":"حق المحو يتيح لك طلب حذف بياناتك الشخصية من أي شركة."}
    }
  ]'::jsonb,
  'UserCheck', 'text-chart-5', true
) ON CONFLICT (id) DO NOTHING;


-- ─── Category 6: Virus & logiciels ────────────────────────

INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000017', NULL,
  '10000000-0000-0000-0000-000000000006',
  '{"fr":"Ransomware et sauvegardes","ar":"برامج الفدية والنسخ الاحتياطية"}'::jsonb,
  '{"fr":"Comprendre les rançongiciels et s''en protéger.","ar":"فهم برامج الفدية والحماية منها."}'::jsonb,
  '[
    {
      "id": "ransom-q1",
      "prompt": {"fr":"Un ransomware est un logiciel qui :","ar":"برنامج الفدية هو برنامج:"},
      "choices": {"fr":["Accélère ton ordinateur","Chiffre tes fichiers et exige une rançon pour les récupérer","Affiche des publicités"],"ar":["يُسرّع حاسوبك","يُشفّر ملفاتك ويطلب فدية لاستردادها","يعرض إعلانات"]},
      "correctIndex": 1,
      "explanation": {"fr":"Le ransomware crypte vos données et exige un paiement pour la clé de déchiffrement. Souvent irréversible sans sauvegarde.","ar":"يُشفّر برنامج الفدية بياناتك ويطلب دفعاً مقابل مفتاح فك التشفير. غالباً لا رجعة منه بدون نسخة احتياطية."}
    },
    {
      "id": "ransom-q2",
      "prompt": {"fr":"La meilleure protection contre les ransomwares est :","ar":"أفضل حماية من برامج الفدية هي:"},
      "choices": {"fr":["Payer la rançon rapidement","Sauvegardes régulières hors-ligne + mises à jour + antivirus","Utiliser uniquement des applications Apple"],"ar":["دفع الفدية بسرعة","نسخ احتياطية منتظمة خارج الشبكة + تحديثات + مضاد فيروسات","استخدام تطبيقات Apple فقط"]},
      "correctIndex": 1,
      "explanation": {"fr":"La règle 3-2-1 : 3 copies, 2 supports différents, 1 hors-ligne. Les mises à jour corrigent les failles exploitées.","ar":"قاعدة 3-2-1: 3 نسخ، على وسيطين مختلفين، 1 خارج الشبكة. التحديثات تُصلح الثغرات المستغلة."}
    },
    {
      "id": "ransom-q3",
      "prompt": {"fr":"Tu es infecté par un ransomware. Que faire en premier ?","ar":"أُصبت ببرنامج فدية. ماذا تفعل أولاً؟"},
      "choices": {"fr":["Payer la rançon","Déconnecter immédiatement l''appareil du réseau pour limiter la propagation","Redémarrer l''ordinateur"],"ar":["دفع الفدية","فصل الجهاز فوراً عن الشبكة لتحديد الانتشار","إعادة تشغيل الحاسوب"]},
      "correctIndex": 1,
      "explanation": {"fr":"La déconnexion limite la propagation aux autres appareils du réseau. Ne payez pas — cela encourage les criminels.","ar":"الفصل يحد من الانتشار إلى أجهزة الشبكة الأخرى. لا تدفع — هذا يشجع المجرمين."}
    },
    {
      "id": "ransom-q4",
      "prompt": {"fr":"Quelle pratique réduit le risque d''être infecté par un ransomware ?","ar":"أي ممارسة تقلل خطر الإصابة ببرنامج فدية؟"},
      "choices": {"fr":["Ouvrir toutes les pièces jointes reçues par email","Ne pas ouvrir les pièces jointes non sollicitées et maintenir son système à jour","Désactiver son antivirus pour accélérer l''ordi"],"ar":["فتح كل المرفقات الواردة بالبريد","عدم فتح المرفقات غير المطلوبة والحفاظ على تحديث النظام","تعطيل مضاد الفيروسات لتسريع الحاسوب"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les pièces jointes malveillantes sont le vecteur principal. Les mises à jour comblent les failles connues.","ar":"المرفقات الخبيثة هي الناقل الرئيسي. التحديثات تسد الثغرات المعروفة."}
    }
  ]'::jsonb,
  'Skull', 'text-chart-6', true
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public.scenarios (id, teacher_id, category_id, title, description, questions, icon, color, is_public)
VALUES (
  '20000000-0000-0000-0000-000000000018', NULL,
  '10000000-0000-0000-0000-000000000006',
  '{"fr":"Téléchargements sûrs","ar":"التنزيلات الآمنة"}'::jsonb,
  '{"fr":"Éviter les logiciels malveillants lors de vos téléchargements.","ar":"تجنب البرامج الخبيثة عند التنزيل."}'::jsonb,
  '[
    {
      "id": "download-q1",
      "prompt": {"fr":"Tu veux télécharger un jeu gratuit. Source la plus sûre ?","ar":"تريد تنزيل لعبة مجانية. أكثر المصادر أماناً؟"},
      "choices": {"fr":["Un site aléatoire trouvé sur Google","Le site officiel du développeur ou une boutique officielle (Play Store, App Store)","Un lien partagé sur un forum"],"ar":["موقع عشوائي من Google","الموقع الرسمي للمطور أو متجر رسمي (Play Store, App Store)","رابط مشارَك في منتدى"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les sources officielles vérifient les applications. Les sites tiers peuvent proposer des versions modifiées contenant des virus.","ar":"المصادر الرسمية تتحقق من التطبيقات. المواقع الخارجية قد تعرض نسخاً معدلة تحتوي على فيروسات."}
    },
    {
      "id": "download-q2",
      "prompt": {"fr":"Un logiciel payant proposé gratuitement sur un site inconnu, c''est probablement :","ar":"برنامج مدفوع يُعرض مجاناً على موقع مجهول، على الأرجح هو:"},
      "choices": {"fr":["Une promotion officielle","Un cracker ou une version pirate contenant des malwares","Un cadeau du développeur"],"ar":["عرض رسمي","برنامج مكسور أو نسخة مقرصنة تحتوي على برامج خبيثة","هدية من المطور"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les logiciels piratés contiennent fréquemment des chevaux de Troie ou des mineurs de cryptomonnaie cachés.","ar":"كثيراً ما تحتوي البرامج المقرصنة على أحصنة طروادة أو عمّالات عملة مشفرة مخفية."}
    },
    {
      "id": "download-q3",
      "prompt": {"fr":"Avant d''installer un fichier téléchargé, il est conseillé de :","ar":"قبل تثبيت ملف تم تنزيله، يُنصح بـ:"},
      "choices": {"fr":["L''installer directement pour gagner du temps","Le scanner avec un antivirus et vérifier sa signature numérique","Partager le lien avec des amis d''abord"],"ar":["تثبيته مباشرة لتوفير الوقت","فحصه بمضاد فيروسات والتحقق من توقيعه الرقمي","مشاركة الرابط مع الأصدقاء أولاً"]},
      "correctIndex": 1,
      "explanation": {"fr":"Un scan antivirus et la vérification de la signature (éditeur vérifié) sont les meilleures défenses avant installation.","ar":"الفحص بمضاد الفيروسات والتحقق من التوقيع (الناشر المعتمد) هما أفضل دفاع قبل التثبيت."}
    },
    {
      "id": "download-q4",
      "prompt": {"fr":"Que faire si ton antivirus bloque un fichier lors d''une installation ?","ar":"ماذا تفعل إذا حجب مضاد الفيروسات ملفاً أثناء التثبيت؟"},
      "choices": {"fr":["Désactiver l''antivirus et continuer","Prendre l''alerte au sérieux et ne pas forcer l''installation","Signaler un bug à l''antivirus"],"ar":["تعطيل مضاد الفيروسات والمتابعة","أخذ التنبيه بجدية وعدم إجبار التثبيت","الإبلاغ عن خطأ لمضاد الفيروسات"]},
      "correctIndex": 1,
      "explanation": {"fr":"Les alertes antivirus ne sont pas des erreurs. Elles signalent un danger réel. Cherchez une alternative propre.","ar":"تنبيهات مضاد الفيروسات ليست أخطاء. تشير إلى خطر حقيقي. ابحث عن بديل نظيف."}
    }
  ]'::jsonb,
  'Download', 'text-chart-6', true
) ON CONFLICT (id) DO NOTHING;
