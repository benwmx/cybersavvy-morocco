import { useMutation } from "@tanstack/react-query";
import { callAI, type AIConfig } from "@/lib/ai";
import type { Lang } from "@/lib/i18n/translations";

interface CategoryStat { name: string; score: number; max: number; }
interface AnalyticsStats {
  average: number;
  totalAttempts: number;
  uniqueStudents: number;
  categoryStats: CategoryStat[];
  commonMistakes: [string, number][];
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

function buildPrompt(stats: AnalyticsStats, lang: Lang): string {
  const s = PROMPT_STRINGS[lang];

  const catLines = stats.categoryStats
    .map(c => `  - ${c.name}: ${Math.round((c.score / c.max) * 100)}%`)
    .join("\n") || s.noData;

  const weakScenarios = [...stats.scenarioChartData]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .filter(s => s.score < 70)
    .map(s => `  - ${s.name}: ${s.score}%`)
    .join("\n") || s.noWeak;

  return `You are a pedagogical advisor for Moroccan secondary school teachers (collèges and lycées) using the CyberSafe platform to teach digital citizenship and cybersecurity.

CLASS PERFORMANCE DATA:
- Global average: ${Math.round(stats.average)}%
- Total quiz attempts: ${stats.totalAttempts}
- Students participated: ${stats.uniqueStudents}

Performance by cybersecurity category:
${catLines}

Scenarios where students performed weakest:
${weakScenarios}

Frequently failed questions: ${stats.commonMistakes.length} patterns identified

Based on this data and the Moroccan national digital competency framework (programme GENIE / CNTE):

Respond ONLY in ${s.respondIn}. Use clear headers with ** and bullet points with -. Be specific, practical, and concise.

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

export function useAIRecommendations(
  config: AIConfig | null,
  stats: AnalyticsStats | null,
  lang: Lang,
) {
  return useMutation({
    mutationFn: async () => {
      if (!config) throw new Error("no_key");
      if (!stats) throw new Error("no_data");
      return callAI(config, buildPrompt(stats, lang));
    },
  });
}
