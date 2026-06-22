import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { syncClassScenarios } from "@/lib/offline/syncService";

interface StudentDetails {
  id: string;
  class_id: string;
  name_fr: string;
  name_ar: string;
}

interface StudentContextType {
  student: StudentDetails | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (details: StudentDetails) => void;
  logout: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cs.student");
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch {
        localStorage.removeItem("cs.student");
      }
    }
    setInitialized(true);
  }, []);

  const login = useCallback((details: StudentDetails) => {
    setStudent(details);
    localStorage.setItem("cs.student", JSON.stringify(details));
    // Non-blocking: pre-populate Dexie with class scenarios for offline use
    syncClassScenarios(details.class_id).catch(console.error);
  }, []);

  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem("cs.student");
  }, []);

  return (
    <StudentContext.Provider value={{ student, isAuthenticated: !!student, initialized, login, logout }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};
