import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { TRACKS } from "@/content/scenarios";
import { ArrowRight, Bug, Fish, KeyRound, Lock, MessageSquareWarning, Users } from "lucide-react";

const ICONS = { Fish, KeyRound, Users, MessageSquareWarning, Lock, Bug };

export const Route = createFileRoute("/game")({
  component: GameLobby,
});

function GameLobby() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [student, setStudent] = useState<{ name: string; class_name: string } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("cs.student");
    if (!raw) {
      navigate({ to: "/login" });
      return;
    }
    setStudent(JSON.parse(raw));
  }, [navigate]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm text-muted-foreground">{student.class_name}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === "fr" ? `Bonjour ${student.name} !` : `مرحباً ${student.name}!`}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("chooseTrack")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((tr) => {
            const Icon = ICONS[tr.icon];
            return (
              <Link key={tr.id} to="/game/$trackId" params={{ trackId: tr.id }} className="group">
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg border-2 hover:border-primary">
                  <CardHeader>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-card border ${tr.color}`}>
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
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/">← Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
