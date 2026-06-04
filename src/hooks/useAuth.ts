import { useState, useCallback } from 'react';
import { api, StudentRow } from '@/lib/supabase/api';

export function useAuth() {
  const [student, setStudent] = useState<StudentRow | null>(() => {
    const stored = localStorage.getItem('cs.student');
    return stored ? JSON.parse(stored) : null;
  });

  const studentLogin = useCallback(async (accessCode: string, massarCode: string) => {
    // 1. Verify Class
    const cls = await api.verifyClassCode(accessCode);
    if (!cls) throw new Error('Invalid class code');

    // 2. Verify Student and fetch student_id
    const data = await api.verifyStudent(cls.id, massarCode);
    if (!data) throw new Error('Student not found in this class');

    // 3. Persist session
    setStudent(data);
    localStorage.setItem('cs.student', JSON.stringify(data));
    
    return data;
  }, []);

  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem('cs.student');
  }, []);

  return {
    student,
    studentLogin,
    logout,
    isAuthenticated: !!student,
  };
}
