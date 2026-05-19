import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { TRACKS } from "@/content/scenarios";
import { api, ScenarioRow, supabaseClient } from "@/lib/supabase/api";
import { ArrowRight, Bug, Fish, KeyRound, Lock, MessageSquareWarning, Users, Layout, ShieldCheck } from "lucide-react";

const ICONS = { Fish, KeyRound, Users, MessageSquareWarning, Lock, Bug };

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
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [student, setStudent] = useState<{ name_fr: string; name_ar: string; class_id: string; class_name: string } | null>(null);
  const [assignedScenarios, setAssignedScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("cs.student");
    const isGuest = localStorage.getItem("cs.guest");

    if (!raw) {
      if (isGuest) navigate({ to: "/guest" });
      else navigate({ to: "/login" });
      return;
    }
    
    const s = JSON.parse(raw);
    setStudent(s);

    const fetchScenarios = async () => {
      try {
        const { data: cls } = await supabaseClient
          .from("classes")
          .select("assigned_scenarios")
          .eq("id", s.class_id)
          .single();
        
        if (cls?.assigned_scenarios) {
          const ids = cls.assigned_scenarios as string[];
          const staticAssigned = TRACKS.filter(t => ids.includes(t.id));
          
          const customIds = ids.filter(id => id.includes("-") || id.length > 20);
          let customTracks: any[] = [];
          if (customIds.length > 0) {
            const { data } = await supabaseClient
              .from("scenarios")
              .select("*")
              .in("id", customIds);
            customTracks = data || [];
          }

          setAssignedScenarios([...staticAssigned, ...customTracks]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-[#1E3A8A] animate-pulse">
      {t("syncing")}
    </div>
  );
  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-12 max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold border border-blue-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{student.class_name}</span>
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
              {lang === "fr" ? "Aucun parcours n'est encore assigné à votre classe." : "لا توجد مسارات مخصصة لقسمك بعد."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assignedScenarios.map((tr, idx) => {
              const Icon = tr.icon ? ICONS[tr.icon as keyof typeof ICONS] : Layout;
              return (
                <Link 
                  key={tr.id} 
                  to="/game/$trackId" 
                  params={{ trackId: tr.id }} 
                  className="group block animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Card className="h-full border-none shadow-lg shadow-slate-200 bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl overflow-hidden">
                    <div className={`h-1.5 ${tr.color ? tr.color.replace('text-', 'bg-') : 'bg-primary'}`} />
                    <CardHeader className="p-6">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 ${tr.color || "text-[#1E3A8A]"} mb-4 transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900">{tr.title[lang]}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{tr.description[lang]}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-sm font-bold text-[#1E3A8A]">
                          {tr.questions.length} {t("question").toLowerCase()}s
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
