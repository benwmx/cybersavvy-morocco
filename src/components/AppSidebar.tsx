import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, LogOut, Shield, Settings, User, GraduationCap, Users, BookOpen, BookMarked } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { api } from "@/lib/supabase/api";

export function AppSidebar() {
  const { t, lang } = useLang();
  const { student, logout: studentLogout } = useStudent();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const path = useRouterState({ select: r => r.location.pathname });

  const items = [
    { url: "/dashboard", label: lang === "fr" ? "Vue d'ensemble" : "نظرة عامة", icon: LayoutDashboard },
    { url: "/analytics", label: t("analytics"), icon: BarChart3 },
    { url: "/classes", label: t("classes"), icon: GraduationCap },
    { url: "/quizzes", label: lang === "fr" ? "Parcours" : "المسارات", icon: BookOpen },
    { url: "/students", label: lang === "fr" ? "Élèves" : "التلاميذ", icon: Users },
    { url: "/tutorials", label: lang === "fr" ? "Tutoriels" : "الدروس", icon: BookMarked },
    { url: "/settings", label: t("settings"), icon: Settings },
  ];

  const logout = async () => {
    if (student) {
      studentLogout();
    } else {
      await api.signOut();
    }
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2 min-h-[48px] justify-center lg:justify-start">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20 shrink-0 mx-auto lg:mx-0">
            <Shield className="h-4 w-4" />
          </div>
          {state === "expanded" && (
            <span className="font-semibold truncate animate-in fade-in duration-300 ms-2 text-[#1E3A8A]">
              {t("appName")}
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {student && (
          <SidebarGroup>
            <SidebarGroupLabel>{lang === "fr" ? "Mon Profil" : "ملفي الشخصي"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
                      <User className="h-4 w-4" />
                    </div>
                    {state === "expanded" && (
                      <span className="truncate">
                        {lang === "fr" ? student.name_fr : student.name_ar}
                      </span>
                    )}
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>{t("dashboard")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={path === item.url}
                    className="data-[active=true]:bg-blue-50 data-[active=true]:text-[#1E3A8A]"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-10 px-3 font-bold"
            >
              <LogOut className="h-4 w-4 ms-0 me-3" />
              <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
