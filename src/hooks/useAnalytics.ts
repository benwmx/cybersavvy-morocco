import { useQuery } from '@tanstack/react-query';
import { api, ResultRow, StudentRow } from '@/lib/supabase/api';
import { useMemo } from 'react';

export function useAnalytics(classId: string) {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['analytics', classId],
    queryFn: () => api.listResultsWithStudents(classId),
    enabled: !!classId,
  });

  const performance = useMemo(() => {
    if (results.length === 0) return null;

    const studentMap: Record<string, { name: string; totalScore: number; totalMax: number; attempts: number }> = {};
    const categoryMap: Record<string, { totalScore: number; totalMax: number; attempts: number }> = {};

    results.forEach((r) => {
      // Per Student aggregation
      const sId = r.student_id;
      if (!studentMap[sId]) {
        studentMap[sId] = { 
          name: r.students.name_fr, 
          totalScore: 0, 
          totalMax: 0, 
          attempts: 0 
        };
      }
      studentMap[sId].totalScore += r.score;
      studentMap[sId].totalMax += r.max_score;
      studentMap[sId].attempts += 1;

      // Per Scenario/Category aggregation (assuming scenario_id can be mapped or used as key)
      const scId = r.scenario_id;
      if (!categoryMap[scId]) {
        categoryMap[scId] = { totalScore: 0, totalMax: 0, attempts: 0 };
      }
      categoryMap[scId].totalScore += r.score;
      categoryMap[scId].totalMax += r.max_score;
      categoryMap[scId].attempts += 1;
    });

    return {
      studentAverages: Object.entries(studentMap).map(([id, data]) => ({
        id,
        name: data.name,
        average: (data.totalScore / data.totalMax) * 100,
      })),
      scenarioAverages: Object.entries(categoryMap).map(([id, data]) => ({
        id,
        average: (data.totalScore / data.totalMax) * 100,
      })),
      globalAverage: (results.reduce((acc, r) => acc + r.score, 0) / results.reduce((acc, r) => acc + r.max_score, 0)) * 100
    };
  }, [results]);

  return {
    performance,
    isLoading,
    rawResults: results,
  };
}
