import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDB } from "@/lib/offline/db";
import { saveResult } from "@/lib/offline/queue";

export function useGameData(classId?: string, studentId?: string) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const db = getDB();
      if (!db) return [];
      return db.categories.toArray();
    },
    enabled: !!classId,
  });

  const scenariosQuery = useQuery({
    queryKey: ["scenarios", classId],
    queryFn: async () => {
      const db = getDB();
      if (!db || !classId) return [];

      const statusRows = await db.class_scenario_status
        .where("class_id")
        .equals(classId)
        .filter(r => r.is_visible)
        .toArray();

      if (statusRows.length === 0) {
        // No class-specific assignments yet — fall back to public scenarios
        return db.scenarios.filter(s => s.is_public).toArray();
      }

      const ids = statusRows.map(r => r.scenario_id);
      return db.scenarios.where("id").anyOf(ids).toArray();
    },
    enabled: !!classId,
  });

  const saveResultMutation = useMutation({
    mutationFn: (payload: {
      scenario_id: string;
      score: number;
      max_score: number;
      mistakes: string[];
    }) => {
      if (!studentId || !classId) throw new Error("Missing student or class context");
      return saveResult({
        student_id: studentId,
        class_id: classId,
        scenario_id: payload.scenario_id,
        score: payload.score,
        max_score: payload.max_score,
        mistakes: payload.mistakes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-history", studentId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", classId] });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    scenarios: scenariosQuery.data ?? [],
    isLoading: categoriesQuery.isLoading || scenariosQuery.isLoading,
    saveResult: saveResultMutation.mutateAsync,
    isSaving: saveResultMutation.isPending,
  };
}
