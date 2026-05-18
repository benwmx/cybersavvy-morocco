import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { TRACKS } from "@/content/scenarios";
import { ArrowRight, Bug, Fish, KeyRound, Lock, MessageSquareWarning, Users, History } from "lucide-react";

const ICONS = { Fish, KeyRound, Users, MessageSquareWarning, Lock, Bug };

export const Route = createFileRoute("/guest")({
  component: GuestLobby,
});

function GuestLobby() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem("cs.guest", "true");
    const raw = localStorage.getItem("cs.guest_history");
    if (raw) setHistory(JSON.parse(raw));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">{t("guestMode")}</h1>
          <p className="mt-2 text-muted-foreground">{t("guestDesc")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("guestHistory")}
            </h2>
            {history.length === 0 ? (
              <p className="text-muted-foreground">{t("noData")}</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => {
                  const tr = TRACKS.find(t => t.id === h.trackId);
                  return (
                    <Card key={i}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{tr ? tr.title[lang] : h.trackId}</p>
                          <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-lg">{h.score} / {h.total}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
