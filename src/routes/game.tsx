import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { TRACKS } from "@/content/scenarios";
import { api, ScenarioRow, supabaseClient } from "@/lib/supabase/api";
import { ArrowRight, Bug, Fish, KeyRound, Lock, MessageSquareWarning, Users, Layout } from "lucide-react";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">{t("syncing")}</div>;
  if (!student) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm text-muted-foreground">{student.class_name}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === "fr" ? `Bonjour ${student.name_fr} !` : `مرحباً ${student.name_ar}!`}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("chooseTrack")}</p>
        </div>

        {assignedScenarios.length === 0 ? (
          <Card className="max-w-md">
            <CardContent className="py-10 text-center text-muted-foreground">
              {t("noData")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedScenarios.map((tr) => {
              const Icon = tr.icon ? ICONS[tr.icon as keyof typeof ICONS] : Layout;
              return (
                <Link key={tr.id} to="/game/$trackId" params={{ trackId: tr.id }} className="group">
                  <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg border-2 hover:border-primary">
                    <CardHeader>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-card border ${tr.color || "text-primary"}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="mt-2">{tr.title[lang]}</CardTitle>
                      <CardDescription>{tr.description[lang]}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center text-sm font-medium text-primary">
                        {tr.questions.length} {t("question").toLowerCase()}s
                        <ArrowRight className="ltr:ml-1 rtl:mr-1 rtl:rotate-180 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/">← Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
