-- ============================================================
-- Migration 019: Seed tutorial content
--   Global (teacher_id = NULL)  → visible to all teachers
--   Private (teacher_id = uuid) → visible to that teacher only
-- Idempotent: fixed UUIDs + ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO public.tutorials (id, teacher_id, category_id, title, content, image_url)
VALUES

-- ─── 1. Hameçonnage — Reconnaître un email frauduleux ─────────────────────
(
  '30000000-0000-0000-0000-000000000001',
  NULL,
  '10000000-0000-0000-0000-000000000001',
  '{"fr":"Reconnaître et déjouer le hameçonnage","ar":"التعرف على التصيد الاحتيالي والتصدي له"}',
  '{
    "fr": "## Qu''est-ce que le hameçonnage ?\n\nLe **hameçonnage** (ou *phishing*) est une technique utilisée par des escrocs pour vous tromper et vous pousser à divulguer des informations personnelles (mot de passe, numéro de carte bancaire, etc.). Ils se font passer pour une personne ou un organisme de confiance.\n\n## Comment reconnaître un message frauduleux ?\n\n- **L''expéditeur est suspect** : l''adresse e-mail ressemble à une vraie adresse mais comporte une faute (ex. `support@faceboook.com`).\n- **Urgence et pression** : le message vous demande d''agir *immédiatement* (« Votre compte sera bloqué dans 24h »).\n- **Lien suspect** : survolez le lien sans cliquer — l''URL affichée ne correspond pas au site réel.\n- **Fautes d''orthographe** : les messages frauduleux contiennent souvent des erreurs de langue.\n- **Demande d''informations sensibles** : aucune banque ou plateforme sérieuse ne demande votre mot de passe par e-mail.\n\n## Que faire si vous recevez un tel message ?\n\n1. **Ne cliquez sur aucun lien** et n''ouvrez aucune pièce jointe.\n2. **Signalez le message** à un adulte ou à l''enseignant.\n3. **Supprimez le message** immédiatement.\n4. Si vous avez déjà cliqué, **changez votre mot de passe** sans attendre.\n\n> 💡 **Astuce** : En cas de doute, allez directement sur le site officiel en tapant l''adresse vous-même dans votre navigateur.",
    "ar": "## ما هو التصيد الاحتيالي؟\n\n**التصيد الاحتيالي** (Phishing) هو أسلوب يستخدمه المحتالون لخداعك ودفعك إلى الكشف عن معلوماتك الشخصية (كلمة المرور، رقم البطاقة البنكية...). يتظاهرون بأنهم جهة أو شخص موثوق.\n\n## كيف تتعرف على الرسالة الاحتيالية؟\n\n- **عنوان المرسل مشبوه**: البريد الإلكتروني يشبه العنوان الحقيقي لكنه يحوي خطأً (مثال: `support@faceboook.com`).\n- **الإلحاح والضغط**: تطلب منك الرسالة التصرف *فوراً* («سيُغلق حسابك خلال 24 ساعة»).\n- **رابط مشبوه**: مرر الفأرة فوق الرابط دون الضغط — عنوان URL لا يطابق الموقع الحقيقي.\n- **أخطاء إملائية**: غالباً ما تحوي الرسائل الاحتيالية أخطاء لغوية واضحة.\n- **طلب معلومات حساسة**: لا يطلب أي بنك أو منصة جدية كلمة مرورك عبر البريد.\n\n## ماذا تفعل عند تلقي مثل هذه الرسالة؟\n\n1. **لا تضغط على أي رابط** ولا تفتح أي مرفق.\n2. **أبلغ** أحد الكبار أو الأستاذ.\n3. **احذف الرسالة** فوراً.\n4. إن كنت قد ضغطت بالفعل، **غيّر كلمة مرورك** على الفور.\n\n> 💡 **نصيحة**: عند الشك، اذهب مباشرة إلى الموقع الرسمي بكتابة عنوانه بنفسك في المتصفح."
  }',
  NULL
),

-- ─── 2. Mots de passe — Créer un mot de passe solide ─────────────────────
(
  '30000000-0000-0000-0000-000000000002',
  NULL,
  '10000000-0000-0000-0000-000000000002',
  '{"fr":"Créer et gérer des mots de passe sécurisés","ar":"إنشاء كلمات مرور قوية وإدارتها"}',
  '{
    "fr": "## Pourquoi les mots de passe sont-ils importants ?\n\nVotre mot de passe est la **première barrière** qui protège vos comptes contre les intrusions. Un mot de passe faible peut être deviné en quelques secondes par un programme automatique.\n\n## Caractéristiques d''un mot de passe solide\n\nUn bon mot de passe doit être :\n- **Long** : au minimum 12 caractères.\n- **Complexe** : mélange de lettres majuscules, minuscules, chiffres et symboles (`!`, `@`, `#`...).\n- **Unique** : un mot de passe différent pour chaque compte.\n- **Imprévisible** : évitez votre prénom, date de naissance ou `123456`.\n\n## La technique de la phrase secrète\n\nPlutôt qu''un mot impossible à retenir, construisez une **phrase secrète** :\n\n> `MonChat@Boit3CafésParJour!`\n\nCette phrase est longue, mémorisable et très difficile à deviner.\n\n## Ce qu''il ne faut jamais faire\n\n❌ Utiliser le même mot de passe partout.  \n❌ Écrire son mot de passe sur un papier visible.  \n❌ Partager son mot de passe, même avec un ami.\n\n## Gérer ses mots de passe\n\nSi vous avez du mal à mémoriser plusieurs mots de passe, utilisez un **gestionnaire de mots de passe** (Bitwarden, KeePass). Ces outils stockent vos mots de passe de façon chiffrée et sécurisée.\n\n> 💡 **Astuce** : Activez toujours la **double authentification (2FA)** quand c''est possible — même si quelqu''un vole votre mot de passe, il ne pourra pas accéder à votre compte.",
    "ar": "## لماذا كلمات المرور مهمة؟\n\nكلمة المرور هي **الحاجز الأول** الذي يحمي حساباتك من الاختراق. كلمة المرور الضعيفة يمكن لبرنامج آلي تخمينها في ثوانٍ معدودة.\n\n## خصائص كلمة المرور القوية\n\nكلمة المرور الجيدة يجب أن تكون:\n- **طويلة**: 12 حرفاً على الأقل.\n- **معقدة**: مزيج من الحروف الكبيرة والصغيرة والأرقام والرموز (`!`, `@`, `#`...).\n- **فريدة**: كلمة مرور مختلفة لكل حساب.\n- **غير متوقعة**: تجنب اسمك أو تاريخ ميلادك أو `123456`.\n\n## تقنية العبارة السرية\n\nبدلاً من كلمة يصعب تذكرها، كوّن **عبارة سرية**:\n\n> `قطتي@تشرب3قهوات_يومياً!`\n\nهذه العبارة طويلة وسهلة التذكر وصعبة التخمين للغاية.\n\n## ما يجب تجنبه تماماً\n\n❌ استخدام نفس كلمة المرور في كل مكان.  \n❌ كتابة كلمة المرور على ورقة في متناول الآخرين.  \n❌ مشاركة كلمة المرور مع أي شخص، حتى الأصدقاء.\n\n## إدارة كلمات المرور\n\nإن كان من الصعب حفظ عدة كلمات مرور، استخدم **مدير كلمات المرور** (Bitwarden، KeePass). تخزن هذه الأدوات كلمات مرورك بشكل مشفر وآمن.\n\n> 💡 **نصيحة**: فعّل دائماً **المصادقة الثنائية (2FA)** عند الإمكان — حتى لو سُرقت كلمة مرورك، لن يتمكن أحد من الوصول إلى حسابك."
  }',
  NULL
),

-- ─── 3. Cyberharcèlement — Réagir face au harcèlement en ligne ───────────
(
  '30000000-0000-0000-0000-000000000003',
  NULL,
  '10000000-0000-0000-0000-000000000004',
  '{"fr":"Comprendre et réagir face au cyberharcèlement","ar":"فهم التنمر الإلكتروني والتصدي له"}',
  '{
    "fr": "## Qu''est-ce que le cyberharcèlement ?\n\nLe **cyberharcèlement** désigne tout comportement répété, intentionnel et agressif envers une personne à travers les outils numériques (messages, réseaux sociaux, jeux en ligne). Il peut prendre différentes formes :\n\n- Insultes ou moqueries répétées en ligne.\n- Diffusion de photos ou vidéos humiliantes sans consentement.\n- Exclusion délibérée d''un groupe ou d''une communauté en ligne.\n- Usurpation d''identité pour nuire à la réputation de quelqu''un.\n\n## Comment réagir si tu es victime ?\n\n1. **Ne réponds pas** aux messages agressifs — cela peut aggraver la situation.\n2. **Conserve les preuves** : fais des captures d''écran des messages.\n3. **Bloque l''auteur** sur la plateforme concernée.\n4. **Signale le contenu** à la plateforme et au portail e-himaya.gov.ma.\n5. **Parle à un adulte de confiance** : parent, enseignant, conseiller.\n\n## Comment réagir si tu es témoin ?\n\n- Ne relaie pas ni ne commente les messages agressifs.\n- Soutiens la victime en privé.\n- Signale le contenu à un adulte ou à la plateforme.\n\n## Ce que dit la loi\n\nAu Maroc, le cyberharcèlement est **punissable par la loi**. La loi n° 09-08 relative à la protection des données personnelles et le Code pénal prévoient des sanctions contre les auteurs d''actes de harcèlement numérique.\n\n> 💡 **À retenir** : Personne ne mérite d''être harcelé. Si tu te sens en danger, appelle le **numéro national de protection de l''enfance**.",
    "ar": "## ما هو التنمر الإلكتروني؟\n\n**التنمر الإلكتروني** هو أي سلوك متكرر ومتعمد وعدواني تجاه شخص ما عبر الأدوات الرقمية (الرسائل، الشبكات الاجتماعية، الألعاب الإلكترونية). يمكن أن يتخذ أشكالاً مختلفة:\n\n- الإهانات والسخرية المتكررة عبر الإنترنت.\n- نشر صور أو مقاطع فيديو مهينة دون موافقة.\n- الإقصاء المتعمد من مجموعة أو مجتمع إلكتروني.\n- انتحال الهوية للنيل من سمعة شخص ما.\n\n## كيف تتصرف إن كنت ضحية؟\n\n1. **لا تردّ** على الرسائل العدوانية — قد يؤدي ذلك إلى تفاقم الوضع.\n2. **احتفظ بالأدلة**: خذ لقطات شاشة للرسائل.\n3. **احجب المعتدي** على المنصة المعنية.\n4. **أبلغ عن المحتوى** للمنصة وبوابة e-himaya.gov.ma.\n5. **تحدث إلى شخص بالغ تثق به**: ولي أمر، أستاذ، مرشد.\n\n## كيف تتصرف إن كنت شاهداً؟\n\n- لا تعيد نشر الرسائل العدوانية ولا تعلق عليها.\n- ادعم الضحية في الخاص.\n- أبلغ عن المحتوى لشخص بالغ أو المنصة.\n\n## ماذا يقول القانون؟\n\nفي المغرب، التنمر الإلكتروني **مجرَّم قانونياً**. ينص القانون رقم 09-08 المتعلق بحماية المعطيات الشخصية والقانون الجنائي على عقوبات بحق مرتكبي أعمال التنمر الرقمي.\n\n> 💡 **تذكر**: لا أحد يستحق أن يُتنمر عليه. إن شعرت بالخطر، اتصل برقم **حماية الطفل الوطني**."
  }',
  NULL
),

-- ─── 4. Vie privée — Protéger ses données personnelles ───────────────────
(
  '30000000-0000-0000-0000-000000000004',
  NULL,
  '10000000-0000-0000-0000-000000000005',
  '{"fr":"Protéger ses données personnelles en ligne","ar":"حماية بياناتك الشخصية على الإنترنت"}',
  '{
    "fr": "## Qu''est-ce qu''une donnée personnelle ?\n\nUne **donnée personnelle** est toute information qui permet d''identifier une personne, directement ou indirectement :\n- Nom, prénom, adresse.\n- Numéro de téléphone, adresse e-mail.\n- Photo ou vidéo.\n- Localisation (GPS), adresse IP.\n\n## Pourquoi protéger ses données ?\n\nVos données ont de la valeur. Des entreprises ou des personnes malveillantes peuvent les utiliser pour vous cibler avec des publicités, usurper votre identité ou vous escroquer.\n\n## Bonnes pratiques à adopter\n\n✅ **Lire les paramètres de confidentialité** avant d''installer une application.  \n✅ **Limiter les informations partagées** sur les réseaux sociaux (n''affichez pas votre adresse ou votre numéro de téléphone publiquement).  \n✅ **Désactiver la géolocalisation** pour les applications qui n''en ont pas besoin.  \n✅ **Utiliser des pseudonymes** plutôt que votre vrai nom sur les forums et jeux en ligne.  \n✅ **Éviter les réseaux Wi-Fi publics** pour accéder à des comptes sensibles.\n\n## Ce que dit le droit\n\nAu Maroc, la **loi n° 09-08** protège vos données personnelles. Vous avez le droit de savoir comment vos données sont utilisées, et de demander leur suppression.\n\n> 💡 **Règle d''or** : Si une information vous mettrait mal à l''aise si votre famille la voyait, ne la publiez pas en ligne.",
    "ar": "## ما هي البيانات الشخصية؟\n\n**البيانات الشخصية** هي أي معلومة تتيح التعرف على شخص ما، بشكل مباشر أو غير مباشر:\n- الاسم الكامل والعنوان.\n- رقم الهاتف والبريد الإلكتروني.\n- الصورة أو مقطع الفيديو.\n- الموقع الجغرافي (GPS)، عنوان IP.\n\n## لماذا نحمي بياناتنا؟\n\nبياناتك لها قيمة. يمكن للشركات أو الأشخاص الخبثاء استخدامها لاستهدافك بالإعلانات، أو انتحال هويتك، أو النصب عليك.\n\n## الممارسات الجيدة التي ينبغي اتباعها\n\n✅ **اقرأ إعدادات الخصوصية** قبل تثبيت أي تطبيق.  \n✅ **حدّ من المعلومات التي تشاركها** على الشبكات الاجتماعية (لا تعرض عنوانك أو رقم هاتفك علناً).  \n✅ **عطّل خاصية تحديد الموقع** للتطبيقات التي لا تحتاجها.  \n✅ **استخدم أسماء مستعارة** بدلاً من اسمك الحقيقي في المنتديات والألعاب الإلكترونية.  \n✅ **تجنب شبكات Wi-Fi العامة** للوصول إلى الحسابات الحساسة.\n\n## ماذا يقول القانون؟\n\nفي المغرب، **القانون رقم 09-08** يحمي بياناتك الشخصية. لديك الحق في معرفة كيفية استخدام بياناتك والمطالبة بحذفها.\n\n> 💡 **القاعدة الذهبية**: إذا كانت المعلومة ستُحرجك أمام عائلتك، فلا تنشرها على الإنترنت."
  }',
  NULL
)

ON CONFLICT (id) DO NOTHING;

-- ─── Private tutorials (teacher-specific) ─────────────────────────────────
-- Each teacher can create tutorials visible only to themselves / their students.
-- morojohn101@gmail.com is the platform admin → excluded.

INSERT INTO public.tutorials (id, teacher_id, category_id, title, content, image_url)
VALUES

-- ── moro.clubbing929@silomails.com ── 2 tutoriels privés ─────────────────

(
  '30000000-0000-0000-0000-000000000005',
  (SELECT id FROM auth.users WHERE email = 'moro.clubbing929@silomails.com'),
  '10000000-0000-0000-0000-000000000003',
  '{"fr":"Les pièges des réseaux sociaux : conseils pour ma classe","ar":"مخاطر الشبكات الاجتماعية : نصائح لفصلي"}',
  '{
    "fr": "## Tutoriel personnalisé — Classe de 3e Informatique\n\nCe tutoriel complète les scénarios sur les réseaux sociaux. Il est adapté aux situations réelles observées en classe.\n\n## Les risques les plus fréquents chez les collégiens\n\n- **Partage excessif** : photos de classe, emplois du temps, adresse du domicile postés publiquement.\n- **Faux profils** : accepter des demandes d''amis d''inconnus qui se font passer pour des camarades.\n- **Arnaques de concours** : « Tu as gagné un téléphone ! Clique ici » — c''est toujours faux.\n- **Contenu inapproprié** : republier des vidéos ou images sans vérifier leur origine.\n\n## Règles de base pour mes élèves\n\n1. Ton profil doit être **privé** — seuls tes amis confirmés voient tes publications.\n2. N''accepte jamais une demande d''ami d''une personne que tu ne connais pas.\n3. Avant de publier une photo, demande-toi : est-ce que je serais à l''aise si mon prof ou mes parents la voyaient ?\n4. Signale tout contenu choquant à un adulte.\n\n> 🔔 **Rappel de classe** : Nous reverrons ces points lors de la séance de remédiation du mois prochain.",
    "ar": "## درس مخصص — قسم السنة الثالثة إعدادي\n\nيكمّل هذا الدرس سيناريوهات الشبكات الاجتماعية، وهو مُكيَّف مع المواقف الفعلية الملاحظة داخل الفصل.\n\n## أكثر المخاطر شيوعاً لدى تلاميذ الإعدادي\n\n- **المشاركة المفرطة**: نشر صور الفصل وجداول الدروس وعنوان المنزل بشكل علني.\n- **الملفات الشخصية المزيفة**: قبول طلبات صداقة من مجهولين يتظاهرون بأنهم زملاء.\n- **نصب المسابقات**: «لقد ربحت هاتفاً! اضغط هنا» — هذا دائماً كذب.\n- **محتوى غير لائق**: إعادة نشر مقاطع أو صور دون التحقق من مصدرها.\n\n## قواعد أساسية لتلاميذي\n\n1. يجب أن يكون ملفك الشخصي **خاصاً** — لا يرى منشوراتك إلا أصدقاؤك المؤكدون.\n2. لا تقبل أبداً طلب صداقة من شخص لا تعرفه.\n3. قبل نشر صورة، اسأل نفسك: هل سأكون مرتاحاً لو رآها أستاذي أو والداي؟\n4. أبلغ عن أي محتوى صادم لشخص بالغ.\n\n> 🔔 **تذكير للفصل**: سنراجع هذه النقاط في جلسة المعالجة الشهر القادم."
  }',
  NULL
),

(
  '30000000-0000-0000-0000-000000000006',
  (SELECT id FROM auth.users WHERE email = 'moro.clubbing929@silomails.com'),
  '10000000-0000-0000-0000-000000000006',
  '{"fr":"Virus et logiciels malveillants : comment protéger son appareil","ar":"الفيروسات والبرمجيات الخبيثة : كيف تحمي جهازك"}',
  '{
    "fr": "## Qu''est-ce qu''un logiciel malveillant ?\n\nUn **logiciel malveillant** (*malware*) est un programme conçu pour endommager, espionner ou prendre le contrôle de votre appareil à votre insu. Il en existe plusieurs types :\n\n| Type | Ce qu''il fait |\n|------|---------------|\n| Virus | S''attache à des fichiers et se propage |\n| Cheval de Troie | Se déguise en application utile |\n| Rançongiciel | Bloque vos fichiers et exige une rançon |\n| Logiciel espion | Surveille vos activités sans que vous le sachiez |\n\n## Comment éviter une infection ?\n\n✅ Télécharger uniquement depuis des sources officielles (Play Store, App Store).  \n✅ Ne jamais ouvrir une pièce jointe d''un expéditeur inconnu.  \n✅ Maintenir son système d''exploitation et ses applications à jour.  \n✅ Ne pas brancher une clé USB de provenance inconnue.\n\n## Que faire si l''appareil est infecté ?\n\n1. Déconnectez-le d''Internet immédiatement.\n2. Prévenez un adulte ou un technicien.\n3. Ne payez jamais une rançon — cela n''est pas une garantie de récupérer vos fichiers.",
    "ar": "## ما هو البرنامج الخبيث؟\n\n**البرنامج الخبيث** (Malware) هو برنامج مصمم للإضرار بجهازك أو التجسس عليه أو التحكم فيه دون علمك. توجد عدة أنواع:\n\n| النوع | ما يفعله |\n|-------|----------|\n| الفيروس | يلتصق بالملفات وينتشر |\n| حصان طروادة | يتنكر في هيئة تطبيق مفيد |\n| برنامج الفدية | يحجب ملفاتك ويطلب فدية |\n| برنامج التجسس | يراقب نشاطاتك دون علمك |\n\n## كيف تتجنب الإصابة؟\n\n✅ حمّل التطبيقات من المصادر الرسمية فقط (Play Store، App Store).  \n✅ لا تفتح أبداً مرفقاً من مرسل مجهول.  \n✅ حافظ على تحديث نظام التشغيل وتطبيقاتك.  \n✅ لا توصّل قرصاً USB مجهول المصدر.\n\n## ماذا تفعل إذا أُصيب الجهاز؟\n\n1. افصله عن الإنترنت فوراً.\n2. أبلغ شخصاً بالغاً أو تقنياً.\n3. لا تدفع الفدية أبداً — ليس ضماناً لاسترداد ملفاتك."
  }',
  NULL
),

-- ── raymond.absence129@slmail.me ── 2 tutoriels privés ───────────────────

(
  '30000000-0000-0000-0000-000000000007',
  (SELECT id FROM auth.users WHERE email = 'raymond.absence129@slmail.me'),
  '10000000-0000-0000-0000-000000000001',
  '{"fr":"Hameçonnage avancé : les nouvelles techniques à connaître","ar":"التصيد المتقدم : الأساليب الجديدة التي يجب معرفتها"}',
  '{
    "fr": "## Au-delà du phishing classique\n\nVos élèves connaissent déjà le phishing par e-mail. Ce tutoriel couvre les **formes avancées** qui ciblent désormais les jeunes sur mobile et réseaux sociaux.\n\n## Le smishing (SMS frauduleux)\n\nUn SMS vous demande de cliquer sur un lien pour « récupérer un colis » ou « éviter la suspension de votre compte ». Ces messages imitent des transporteurs (Aramex, Amana) ou des banques.\n\n**Règle** : aucun transporteur ne demande un paiement par SMS avec un lien raccourci.\n\n## Le vishing (appel frauduleux)\n\nUn « agent bancaire » vous appelle et vous demande votre code secret ou vos coordonnées de carte. Les banques ne demandent **jamais** ces informations par téléphone.\n\n## Le quishing (QR code malveillant)\n\nUn QR code affiché dans un lieu public (restaurant, affiche) redirige vers un faux site pour voler vos identifiants. Vérifiez toujours l''URL affichée après avoir scanné.\n\n## Exercice pour la classe\n\nMontrez trois captures d''écran de messages (1 vrai, 2 frauduleux) et demandez aux élèves d''identifier les indices qui trahissent le faux.",
    "ar": "## ما وراء التصيد الكلاسيكي\n\nتلاميذك يعرفون التصيد عبر البريد الإلكتروني. يغطي هذا الدرس **الأشكال المتقدمة** التي تستهدف الشباب عبر الهاتف والشبكات الاجتماعية.\n\n## التصيد عبر الرسائل النصية (Smishing)\n\nرسالة نصية تطلب منك الضغط على رابط لـ«استلام طرد» أو «تفادي تعليق حسابك». تحاكي هذه الرسائل شركات الشحن (أرامكس، أمانة) أو البنوك.\n\n**القاعدة**: لا تطلب أي شركة شحن دفعاً عبر رسالة نصية برابط مختصر.\n\n## التصيد عبر الهاتف (Vishing)\n\nيتصل بك «موظف بنكي» ويطلب رمزك السري أو بيانات بطاقتك. لا تطلب البنوك هذه المعلومات **أبداً** عبر الهاتف.\n\n## التصيد عبر رمز QR (Quishing)\n\nرمز QR معروض في مكان عام يعيد توجيهك إلى موقع مزيف لسرقة بياناتك. تحقق دائماً من عنوان URL الظاهر بعد المسح.\n\n## تمرين للفصل\n\naعرض ثلاث لقطات شاشة لرسائل (رسالة حقيقية ورسالتان احتياليتان) واطلب من التلاميذ تحديد الأدلة التي تكشف الزيف."
  }',
  NULL
),

(
  '30000000-0000-0000-0000-000000000008',
  (SELECT id FROM auth.users WHERE email = 'raymond.absence129@slmail.me'),
  '10000000-0000-0000-0000-000000000002',
  '{"fr":"Gestion avancée des mots de passe : gestionnaires et 2FA","ar":"الإدارة المتقدمة لكلمات المرور : المديرون والمصادقة الثنائية"}',
  '{
    "fr": "## Pourquoi un gestionnaire de mots de passe ?\n\nUn adulte possède en moyenne 80 à 100 comptes en ligne. Il est impossible de mémoriser autant de mots de passe forts et uniques. Un **gestionnaire de mots de passe** résout ce problème.\n\n## Comment fonctionne un gestionnaire ?\n\n1. Vous créez un **mot de passe maître** unique et très solide.\n2. Le gestionnaire génère et stocke des mots de passe complexes pour chaque compte.\n3. Tout est chiffré : même le gestionnaire ne peut pas lire vos mots de passe.\n\n## Gestionnaires recommandés (gratuits)\n\n- **Bitwarden** : open source, multiplateforme, coffre chiffré.\n- **KeePassXC** : stockage local (idéal sans connexion permanente).\n\n## La double authentification (2FA)\n\nMême avec un mot de passe parfait, votre compte peut être compromis si votre mot de passe est volé. Le **2FA** ajoute une deuxième couche :\n\n- Un code à usage unique envoyé par SMS.\n- Une application d''authentification (Google Authenticator, Aegis).\n- Une clé physique (YubiKey).\n\n> 💡 **Priorité** : Activez le 2FA en priorité sur votre e-mail principal — c''est la clé de tous vos autres comptes.\n\n## Exercice pratique\n\nFaites créer aux élèves un mot de passe solide pour un compte fictif, puis simulez l''activation du 2FA avec une application démo.",
    "ar": "## لماذا مدير كلمات المرور؟\n\nيمتلك البالغ في المتوسط 80 إلى 100 حساباً على الإنترنت. من المستحيل حفظ كلمات مرور قوية وفريدة لكل هذه الحسابات. **مدير كلمات المرور** يحل هذه المشكلة.\n\n## كيف يعمل المدير؟\n\n1. تنشئ **كلمة مرور رئيسية** واحدة فريدة وقوية جداً.\n2. يولّد المدير كلمات مرور معقدة ويخزنها لكل حساب.\n3. كل شيء مشفّر: حتى المدير نفسه لا يستطيع قراءة كلمات مرورك.\n\n## المديرون المقترحون (مجاني)\n\n- **Bitwarden**: مفتوح المصدر، متعدد المنصات، خزينة مشفرة.\n- **KeePassXC**: تخزين محلي (مثالي بدون اتصال دائم).\n\n## المصادقة الثنائية (2FA)\n\nحتى مع كلمة مرور مثالية، قد يُخترق حسابك إذا سُرقت كلمة مرورك. تضيف **المصادقة الثنائية** طبقة ثانية:\n\n- رمز أحادي الاستخدام يُرسل عبر SMS.\n- تطبيق مصادقة (Google Authenticator، Aegis).\n- مفتاح مادي (YubiKey).\n\n> 💡 **الأولوية**: فعّل المصادقة الثنائية على بريدك الإلكتروني الرئيسي أولاً — إنه مفتاح جميع حساباتك الأخرى.\n\n## تمرين تطبيقي\n\naطلب من التلاميذ إنشاء كلمة مرور قوية لحساب وهمي، ثم محاكاة تفعيل المصادقة الثنائية باستخدام تطبيق تجريبي."
  }',
  NULL
),

-- ── ben.onlooker361@slmail.me ── 2 tutoriels privés ──────────────────────

(
  '30000000-0000-0000-0000-000000000009',
  (SELECT id FROM auth.users WHERE email = 'ben.onlooker361@slmail.me'),
  '10000000-0000-0000-0000-000000000004',
  '{"fr":"Cyberharcèlement : protocole d''intervention en classe","ar":"التنمر الإلكتروني : بروتوكول التدخل داخل الفصل"}',
  '{
    "fr": "## Protocole d''intervention (usage interne enseignant)\n\nCe document est un guide pratique pour gérer une situation de cyberharcèlement impliquant des élèves de votre classe.\n\n## Étape 1 — Identifier la situation\n\n- La victime vous signale les faits ou vous les observez vous-même.\n- Notez les faits : date, heure, plateforme, nature des actes, auteur(s) présumé(s).\n\n## Étape 2 — Sécuriser la victime\n\n- Écoutez sans minimiser. Ne demandez pas « qu''as-tu fait pour provoquer ça ?».\n- Informez la victime qu''elle a le droit de demander l''arrêt de ces actes.\n- Conseillez de ne pas effacer les preuves (captures d''écran).\n\n## Étape 3 — Informer l''administration\n\n- Signalez le cas au directeur de l''établissement.\n- Remplissez le registre de signalement prévu par l''établissement.\n- Contactez les parents des deux parties.\n\n## Étape 4 — Suivi pédagogique\n\n- Organisez une séance de sensibilisation anonymisée avec la classe.\n- Utilisez les scénarios CyberSafe (piste « Stop ! ») comme support de discussion.\n\n## Ressources\n\n- Portail national : **e-himaya.gov.ma** → rubrique Signalement.\n- Numéro vert enfance en danger : **19**.",
    "ar": "## بروتوكول التدخل (للاستخدام الداخلي للأستاذ)\n\nهذه الوثيقة دليل عملي لإدارة حالة تنمر إلكتروني تتعلق بتلاميذ فصلك.\n\n## الخطوة 1 — تحديد الحالة\n\n- تُبلّغك الضحية بالوقائع أو تلاحظها بنفسك.\n- دوّن الوقائع: التاريخ والوقت والمنصة وطبيعة الأفعال والمعتدي(ون) المفترضون.\n\n## الخطوة 2 — تأمين الضحية\n\n- استمع دون التهوين من الأمر. لا تسأل «ماذا فعلت لتستفز ذلك؟».\n- أخبر الضحية بحقها في المطالبة بإيقاف هذه الأفعال.\n- انصح بعدم حذف الأدلة (لقطات الشاشة).\n\n## الخطوة 3 — إخبار الإدارة\n\n- أبلغ مدير المؤسسة بالحالة.\n- أملأ سجل البلاغات المعتمد في المؤسسة.\n- تواصل مع أولياء أمور الطرفين.\n\n## الخطوة 4 — المتابعة التربوية\n\n- نظّم حصة توعوية مجهولة الهوية مع الفصل.\n- استخدم سيناريوهات CyberSafe (مسار «قف!») كدعامة للنقاش.\n\n## الموارد\n\n- البوابة الوطنية: **e-himaya.gov.ma** → خانة البلاغات.\n- الخط الأخضر لحماية الطفل: **19**."
  }',
  NULL
),

(
  '30000000-0000-0000-0000-000000000010',
  (SELECT id FROM auth.users WHERE email = 'ben.onlooker361@slmail.me'),
  '10000000-0000-0000-0000-000000000005',
  '{"fr":"Vie privée avancée : empreinte numérique et droit à l''oubli","ar":"الخصوصية المتقدمة : البصمة الرقمية والحق في النسيان"}',
  '{
    "fr": "## L''empreinte numérique\n\nChaque action en ligne laisse une **trace permanente** : likes, commentaires, recherches, localisations. L''ensemble de ces traces constitue votre **empreinte numérique**.\n\n## Empreinte active vs passive\n\n- **Empreinte active** : ce que vous publiez volontairement (posts, photos, avis).\n- **Empreinte passive** : ce que les sites collectent à votre insu (cookies, IP, comportement de navigation).\n\n## Pourquoi c''est important pour un collégien ?\n\nDans quelques années, vos élèves chercheront un emploi ou une admission dans un établissement. Les recruteurs et les universités cherchent souvent le nom des candidats en ligne. Une publication embarrassante de l''adolescence peut nuire à leur réputation des années plus tard.\n\n## Le droit à l''oubli\n\nEn vertu de la loi marocaine (n° 09-08) et du RGPD européen (applicable sur de nombreuses plateformes), toute personne a le droit de demander la **suppression de ses données** d''un site ou d''un moteur de recherche.\n\n**Comment exercer ce droit :**\n1. Contactez directement la plateforme via son formulaire de suppression.\n2. Pour Google : https://myaccount.google.com/delete-services-or-account\n3. En cas de refus, saisissez la CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel).\n\n## Exercice de classe\n\nDemandez aux élèves de googliser leur propre prénom + nom et de noter ce qu''ils trouvent. Discutez ensemble de ce qui est souhaitable ou non de laisser visible.",
    "ar": "## البصمة الرقمية\n\nكل نشاط على الإنترنت يترك **أثراً دائماً**: الإعجابات والتعليقات والبحثات ومواقع التواجد. مجموع هذه الآثار يشكّل **بصمتك الرقمية**.\n\n## البصمة النشطة مقابل السلبية\n\n- **البصمة النشطة**: ما تنشره طوعاً (منشورات، صور، آراء).\n- **البصمة السلبية**: ما تجمعه المواقع دون علمك (ملفات تعريف الارتباط، عنوان IP، سلوك التصفح).\n\n## لماذا يهم ذلك تلميذ الإعدادي؟\n\nبعد سنوات، سيبحث تلاميذك عن عمل أو قبول في مؤسسة. كثيراً ما يبحث المسؤولون عن المرشحين عبر الإنترنت. منشور محرج من مرحلة المراهقة قد يضر بسمعتهم بعد سنوات.\n\n## الحق في النسيان\n\nبموجب القانون المغربي (رقم 09-08) والنظام الأوروبي لحماية البيانات (RGPD) المعمول به على كثير من المنصات، لكل شخص الحق في طلب **حذف بياناته** من موقع أو محرك بحث.\n\n**كيفية ممارسة هذا الحق:**\n1. تواصل مع المنصة مباشرة عبر نموذج الحذف الخاص بها.\n2. لجوجل: https://myaccount.google.com/delete-services-or-account\n3. في حالة الرفض، تقدّم بشكوى إلى CNDP (اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي).\n\n## تمرين للفصل\n\naاطلب من التلاميذ البحث في Google عن اسمهم الكامل وتدوين ما يجدونه. ناقشوا معاً ما يُستحسن تركه ظاهراً وما لا يُستحسن."
  }',
  NULL
)

ON CONFLICT (id) DO NOTHING;
