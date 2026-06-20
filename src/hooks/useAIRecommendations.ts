import { useMutation } from "@tanstack/react-query";
import { callAI, type AIConfig, type AIMessage } from "@/lib/ai";
import type { Lang } from "@/lib/i18n/translations";

interface CategoryStat { name: string; score: number; max: number; }
interface MistakeStat { fr: string; ar: string; count: number; }
export interface AnalyticsStats {
  average: number;
  totalAttempts: number;
  uniqueStudents: number;
  categoryStats: CategoryStat[];
  commonMistakes: MistakeStat[];
  scenarioChartData: { name: string; score: number }[];
}

const PROMPT_STRINGS = {
  fr: {
    respondIn: "French",
    noData: "  - Aucune donnée",
    noWeak: "  - Aucun scénario faible (bonne performance !)",
    s1: "Diagnostic",
    s1desc: "(2-3 phrases identifiant les lacunes critiques et les sujets nécessitant une attention urgente)",
    s2: "Actions prioritaires pour les prochaines séances",
    s2desc: "(3 étapes concrètes que l'enseignant devrait mettre en œuvre lors des 2-3 prochaines séances)",
    s3: "Méthodes pédagogiques recommandées",
    s3desc: "(2-3 activités de classe adaptées au contexte marocain — jeux de rôle, ateliers, études de cas, approche par compétences du programme GENIE)",
    s4: "Tutoriels à créer dans CyberSafe",
    s4desc: "(2-3 titres de tutoriels spécifiques à créer dans l'application pour renforcer les points faibles identifiés)",
  },
  ar: {
    respondIn: "Arabic",
    noData: "  - لا توجد بيانات",
    noWeak: "  - لا توجد سيناريوهات ضعيفة (أداء جيد!)",
    s1: "التشخيص",
    s1desc: "(2-3 جمل تحدد الثغرات الرئيسية والموضوعات التي تحتاج إلى اهتمام عاجل)",
    s2: "الإجراءات ذات الأولوية للجلسات القادمة",
    s2desc: "(3 خطوات ملموسة وقابلة للتنفيذ يجب على المعلم تطبيقها في الجلسات الـ2-3 القادمة)",
    s3: "الأساليب البيداغوجية الموصى بها",
    s3desc: "(2-3 أنشطة صفية مكيفة مع السياق التعليمي المغربي — لعب الأدوار، الورش، دراسات الحالة، المقاربة بالكفاءات من برنامج جيني)",
    s4: "دروس تعليمية لإنشائها في CyberSafe",
    s4desc: "(2-3 عناوين دروس تعليمية محددة يمكن إنشاؤها في التطبيق لتعزيز نقاط الضعف المحددة)",
  },
} as const;

export function getDefaultSystemPrompt(lang: Lang): string {
  const s = PROMPT_STRINGS[lang];
  return `You are a pedagogical advisor for Moroccan secondary school teachers (collèges and lycées) using the CyberSafe platform to teach digital citizenship and cybersecurity.

Based on the class performance data the teacher provides and the Moroccan national digital competency framework (programme GENIE / CNTE), generate structured, practical recommendations.

Respond ONLY in ${s.respondIn}. Use clear headers with ** and bullet points with -. Be specific and concise.

Structure your response with exactly these 4 sections:

**1. ${s.s1}**
${s.s1desc}

**2. ${s.s2}**
${s.s2desc}

**3. ${s.s3}**
${s.s3desc}

**4. ${s.s4}**
${s.s4desc}`;
}

function buildMessage(stats: AnalyticsStats, lang: Lang, className: string | null, config: AIConfig): AIMessage {
  const s = PROMPT_STRINGS[lang];

  const customPrompt = lang === "ar" ? config.customPromptAr : config.customPromptFr;
  const system = customPrompt ?? getDefaultSystemPrompt(lang);

  const catLines = stats.categoryStats
    .map(c => `  - ${c.name}: ${Math.round((c.score / c.max) * 100)}%`)
    .join("\n") || s.noData;

  const weakScenarios = [...stats.scenarioChartData]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .filter(sc => sc.score < 70)
    .map(sc => `  - ${sc.name}: ${sc.score}%`)
    .join("\n") || s.noWeak;

  const scope = className ?? "all classes combined";

  const mistakeLines = stats.commonMistakes.length > 0
    ? stats.commonMistakes
        .map(m => `  - "${lang === "ar" ? m.ar : m.fr}" (${m.count} students failed)`)
        .join("\n")
    : s.noWeak;

  const user = `CLASS PERFORMANCE DATA:
- Scope: ${scope}
- Students participated: ${stats.uniqueStudents}
- Total quiz attempts: ${stats.totalAttempts}
- Global average: ${Math.round(stats.average)}%

Performance by cybersecurity category:
${catLines}

Scenarios where students performed weakest:
${weakScenarios}

Questions most frequently failed by students:
${mistakeLines}`;

  return { system, user };
}

export function useAIRecommendations(
  config: AIConfig | null,
  stats: AnalyticsStats | null,
  lang: Lang,
  className: string | null,
) {
  return useMutation({
    mutationFn: async () => {
      if (!config) throw new Error("no_key");
      if (!stats) throw new Error("no_data");
      return callAI(config, buildMessage(stats, lang, className, config));
    },
  });
}
