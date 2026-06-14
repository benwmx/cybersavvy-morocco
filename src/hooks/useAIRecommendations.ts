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

function buildPrompt(stats: AnalyticsStats, lang: Lang): string {
  const respondIn = lang === "fr" ? "French" : "Arabic";

  const catLines = stats.categoryStats
    .map(c => `  - ${c.name}: ${Math.round((c.score / c.max) * 100)}%`)
    .join("\n") || "  - No data";

  const weakScenarios = [...stats.scenarioChartData]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .filter(s => s.score < 70)
    .map(s => `  - ${s.name}: ${s.score}%`)
    .join("\n") || "  - No weak scenarios (good performance!)";

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

Respond ONLY in ${respondIn}. Use clear headers with ** and bullet points with -. Be specific, practical, and concise.

Structure your response with exactly these 4 sections:

**1. Diagnostic**
(2-3 sentences identifying the critical gaps and which specific topics need urgent attention)

**2. Actions prioritaires pour les prochaines séances**
(3 concrete, actionable steps the teacher should do in the next 2-3 sessions)

**3. Méthodes pédagogiques recommandées**
(2-3 specific classroom activities adapted to Moroccan educational context — reference jeux de rôle, ateliers, études de cas, approche par compétences from the Moroccan curriculum where relevant)

**4. Tutoriels à créer dans CyberSafe**
(2-3 specific tutorial titles the teacher could create in the app to reinforce the weak areas)`;
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
