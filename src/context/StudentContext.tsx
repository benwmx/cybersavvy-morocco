import React, { createContext, useContext, useState, useEffect } from 'react';

interface StudentDetails {
  id: string;
  class_id: string;
  name_fr: string;
  name_ar: string;
}

interface StudentContextType {
  student: StudentDetails | null;
  isAuthenticated: boolean;
  login: (details: StudentDetails) => void;
  logout: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentDetails | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cs.student');
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('cs.student');
      }
    }
  }, []);

  const login = (details: StudentDetails) => {
    setStudent(details);
    localStorage.setItem('cs.student', JSON.stringify(details));
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('cs.student');
  };

  return (
    <StudentContext.Provider value={{ 
      student, 
      isAuthenticated: !!student, 
      login, 
      logout 
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
