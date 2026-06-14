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
import { useQuery } from "@tanstack/react-query";

export function AppSidebar() {
  const { t, lang } = useLang();
  const { student, logout: studentLogout } = useStudent();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const path = useRouterState({ select: r => r.location.pathname });
  const { data: session } = useQuery({ queryKey: ["session"], queryFn: () => api.getSession() });

  const items = [
    { url: "/dashboard", label: t("overview"),      icon: LayoutDashboard },
    { url: "/analytics", label: t("analytics"),     icon: BarChart3 },
    { url: "/classes",   label: t("classes"),       icon: GraduationCap },
    { url: "/quizzes",   label: t("tracks"),        icon: BookOpen },
    { url: "/students",  label: t("studentsLabel"), icon: Users },
    { url: "/tutorials", label: t("tutorialsLabel"),icon: BookMarked },
    { url: "/settings",  label: t("settings"),      icon: Settings },
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
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#1E3A8A] text-white shrink-0 mx-auto lg:mx-0">
            <Shield className="h-3.5 w-3.5" />
          </div>
          {state === "expanded" && (
            <span className="font-semibold truncate ms-2 text-slate-800 text-sm">
              {t("appName")}
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {(student || session) && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("myProfile")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600">
                    <div className="h-6 w-6 rounded-sm bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    {state === "expanded" && (
                      <span className="truncate text-xs font-medium">
                        {student
                          ? (lang === "fr" ? student.name_fr : student.name_ar)
                          : session
                            ? [session.firstName, session.lastName].filter(Boolean).join(" ") || session.email
                            : null}
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
                    className="data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 rounded-sm"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded h-8 px-3 font-medium text-sm"
            >
              <LogOut className="h-4 w-4 ms-0 me-2.5" />
              <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
