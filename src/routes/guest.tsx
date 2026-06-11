import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { TRACKS } from "@/content/scenarios";
import { ArrowRight, Bug, Fish, KeyRound, Lock, MessageSquareWarning, Users, History, PlayCircle } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-12 max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 uppercase tracking-wider">
            <PlayCircle className="h-3.5 w-3.5" />
            <span>{t("guestMode")}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1E3A8A]">
            {t("freeAccess")}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">{t("guestDesc")}</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {TRACKS.map((tr, idx) => {
                const Icon = ICONS[tr.icon];
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
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 ${tr.color} mb-4 transition-transform group-hover:scale-110 duration-300`}>
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
          </div>

          <aside className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#1E3A8A]">
                <History className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1E3A8A] tracking-tight">
                {t("guestHistory")}
              </h2>
            </div>
            
            {history.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-transparent p-8 text-center rounded-2xl">
                <p className="text-muted-foreground font-medium text-sm italic">{t("noData")}</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((h, i) => {
                  const tr = TRACKS.find(t => t.id === h.trackId);
                  return (
                    <Card key={i} className="border-none shadow-md shadow-slate-100 bg-white rounded-2xl p-4 transition-all hover:shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold text-[#1E3A8A] text-sm">{tr ? tr.title[lang] : h.trackId}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            {new Date(h.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-xl text-emerald-600 leading-none">{h.score}</p>
                          <p className="text-[10px] font-bold text-slate-400">/ {h.total}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </aside>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200">
          <Button variant="ghost" asChild className="rounded-xl text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 font-bold">
            <Link to="/">
              <ArrowRight className="h-4 w-4 me-2 rotate-180 rtl:rotate-0" />
              {t("backHome")}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
