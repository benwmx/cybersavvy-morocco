import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/supabase/api';

export function useStudentHistory(studentId?: string) {
  const historyQuery = useQuery({
    queryKey: ['student-history', studentId],
    queryFn: () => api.listResultsForStudent(studentId!),
    enabled: !!studentId,
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
  };
}
