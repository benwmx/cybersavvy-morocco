import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { useI18n } from "@/hooks/use-i18n";
import { api, ScenarioRow } from "@/lib/supabase/api";
import { getDB } from "@/lib/offline/db";
import { ArrowRight, Layout, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/game")({
  component: GameLayout,
});

function GameLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLobby = path === "/game" || path === "/game/";

  if (!isLobby) {
    return <Outlet />;
  }

  return <GameLobby />;
}

function GameLobby() {
  const { t } = useLang();
  const { student } = useStudent();
  const { translate, lang } = useI18n();
  const navigate = useNavigate();
  const [assignedScenarios, setAssignedScenarios] = useState<ScenarioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      const isGuest = localStorage.getItem("cs.guest");
      if (isGuest) navigate({ to: "/guest" });
      else navigate({ to: "/login" });
      return;
    }

    const fetchScenarios = async () => {
      try {
        const db = getDB();
        if (db) {
          const statusRows = await db.class_scenario_status
            .where("class_id")
            .equals(student.class_id)
            .filter(r => r.is_visible)
            .toArray();

          if (statusRows.length > 0) {
            const ids = statusRows.map(r => r.scenario_id);
            const local = await db.scenarios.where("id").anyOf(ids).toArray();
            setAssignedScenarios(local as ScenarioRow[]);
            setLoading(false);
            return;
          }
        }

        // Fallback: fetch from Supabase when Dexie is empty (first load / online)
        if (navigator.onLine) {
          const scenarios = await api.listVisibleScenarios(student.class_id);
          setAssignedScenarios(scenarios);
        }
      } catch (err) {
        console.error("Failed to fetch scenarios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [student, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        <p className="font-bold text-[#1E3A8A] tracking-widest uppercase text-xs">
          {t("syncing")}
        </p>
      </div>
    </div>
  );

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-12 max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold border border-blue-100 uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{lang === 'fr' ? 'Ma Classe' : 'قسمي'}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1E3A8A]">
            {lang === "fr" ? `Bonjour, ${student.name_fr}` : `مرحباً، ${student.name_ar}`}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">{t("chooseTrack")}</p>
        </div>

        {assignedScenarios.length === 0 ? (
          <Card className="max-w-md border-none shadow-xl shadow-slate-200 bg-white p-8 rounded-2xl text-center space-y-4 animate-in zoom-in duration-500">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Layout className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground font-medium italic">
              {lang === "fr" ? "Aucun parcours n'est encore disponible pour votre classe." : "لا توجد مسارات متاحة لقسمك حالياً."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assignedScenarios.map((tr, idx) => {
              const Icon = Layout;
              return (
                <Link 
                  key={tr.id} 
                  to="/game/$trackId" 
                  params={{ trackId: tr.id }} 
                  className="group block animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Card className="h-full border-none shadow-lg shadow-slate-200 bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl overflow-hidden">
                    <div className="h-1.5 bg-[#1E3A8A]" />
                    <CardHeader className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-[#1E3A8A] mb-4 transition-transform group-hover:scale-110 duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                        {translate(tr.title)}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {translate(tr.description)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-sm font-bold text-[#1E3A8A]">
                          {Array.isArray(tr.questions) ? tr.questions.length : 0} {t("question").toLowerCase()}s
                        </span>
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors duration-300">
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        
        <div className="mt-16 pt-8 border-t border-slate-200">
          <Button variant="ghost" asChild className="rounded-xl text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 font-bold">
            <Link to="/">
              <ArrowRight className="h-4 w-4 me-2 rotate-180 rtl:rotate-0" />
              {lang === "fr" ? "Retour à l'accueil" : "العودة إلى الرئيسية"}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
