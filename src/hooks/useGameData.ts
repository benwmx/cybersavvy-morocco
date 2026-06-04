import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ScenarioRow, CategoryRow } from '@/lib/supabase/api';

export function useGameData(classId?: string, studentId?: string) {
  const queryClient = useQueryClient();

  // Fetch categories available
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.listCategories(),
    enabled: !!classId,
  });

  // Fetch scenarios filtered by class visibility
  const scenariosQuery = useQuery({
    queryKey: ['scenarios', classId],
    queryFn: () => api.listVisibleScenarios(classId!),
    enabled: !!classId,
  });

  // Save result using student_id
  const saveResultMutation = useMutation({
    mutationFn: (payload: {
      scenario_id: string;
      score: number;
      max_score: number;
      mistakes: string[];
    }) => {
      if (!studentId || !classId) throw new Error('Missing student or class context');
      return api.insertResult({
        student_id: studentId,
        class_id: classId,
        scenario_id: payload.scenario_id,
        score: payload.score,
        max_score: payload.max_score,
        mistakes: payload.mistakes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-history', studentId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', classId] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    scenarios: scenariosQuery.data || [],
    isLoading: categoriesQuery.isLoading || scenariosQuery.isLoading,
    saveResult: saveResultMutation.mutateAsync,
    isSaving: saveResultMutation.isPending,
  };
}
