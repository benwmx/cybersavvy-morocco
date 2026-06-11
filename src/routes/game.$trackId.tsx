import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScenarioVisuals } from "@/components/ScenarioVisuals";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { getTrack } from "@/content/scenarios";
import { api, ScenarioRow } from "@/lib/supabase/api";
import { getDB } from "@/lib/offline/db";
import { saveResult } from "@/lib/offline/queue";
import { Check, X, Lightbulb, Trophy, ArrowRight, RefreshCw, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/game/$trackId")({
  component: ScenarioRunner,
});

function ScenarioRunner() {
  const { trackId } = useParams({ from: "/game/$trackId" });
  const { t, lang } = useLang();
  const navigate = useNavigate();
  
  const [dynamicTrack, setDynamicTrack] = useState<ScenarioRow | null>(null);
  const [loading, setLoading] = useState(true);

  const staticTrack = useMemo(() => getTrack(trackId), [trackId]);

  useEffect(() => {
    if (staticTrack) {
      setLoading(false);
      return;
    }

    (async () => {
      // Prefer local Dexie, fall back to Supabase when online
      const db = getDB();
      if (db) {
        const local = await db.scenarios.get(trackId);
        if (local) {
          setDynamicTrack(local as ScenarioRow);
          setLoading(false);
          return;
        }
      }
      if (navigator.onLine) {
        const remote = await api.getScenario(trackId).catch(() => null);
        if (remote) setDynamicTrack(remote);
      }
      setLoading(false);
    })();
  }, [trackId, staticTrack]);

  const { student } = useStudent();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (!student) {
      if (localStorage.getItem("cs.guest")) {
        setIsGuest(true);
      } else {
        navigate({ to: "/login" });
      }
    }
  }, [student, navigate]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "online" | "queued" | "guest">("idle");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-[#1E3A8A] animate-pulse">
      {t("syncing")}
    </div>
  );

  const track = staticTrack || dynamicTrack;

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("trackNotFound")}</p>
      </div>
    );
  }

  const questions = track.questions;
  const q = questions[idx];
  const total = questions.length;

  const handlePick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
    else setMistakes((m) => [...m, q.id || idx.toString()]);
  };

  const handleNext = async () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      setDone(true);
      if (isGuest) {
        const history = JSON.parse(localStorage.getItem("cs.guest_history") || "[]");
        history.push({ trackId: track.id, score, total, date: new Date().toISOString() });
        localStorage.setItem("cs.guest_history", JSON.stringify(history));
        setSaveState("guest");
      } else if (student) {
        const res = await saveResult({
          student_id: student.id,
          class_id: student.class_id,
          scenario_id: track.id,
          score,
          max_score: total,
          mistakes,
        });
        setSaveState(res);
        toast.success(res === "online" ? t("syncDone") : t("syncQueued"));
      }
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <main className="container mx-auto px-4 py-12 lg:py-20">
          <Card className="max-w-xl mx-auto text-center border-none shadow-2xl shadow-slate-200 bg-white rounded-3xl overflow-hidden animate-in zoom-in duration-700">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 py-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]" />
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl shadow-inner animate-in fade-in zoom-in delay-300 duration-1000">
                <Trophy className="h-14 w-14 text-white drop-shadow-lg" />
              </div>
            </div>
            <CardHeader className="p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold border border-blue-100 mx-auto mb-4">
                <span>{'category' in track ? track.category : 'Simulation'}</span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">{track.title[lang]}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-1 mb-8">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{t("yourScore")}</p>
                <div className="flex items-center justify-center gap-3">
                   <p className="text-7xl font-black text-[#1E3A8A]">{score}</p>
                   <p className="text-3xl font-bold text-slate-300 mt-4">/ {total}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-10 flex items-center justify-center gap-3">
                <div className={`h-2 w-2 rounded-full ${saveState === 'idle' ? 'bg-slate-300' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {saveState === "queued" ? t("syncQueued") : saveState === "guest" ? t("guestHistory") : t("syncDone")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-bold shadow-xl shadow-blue-900/10 active:scale-95 transition-all">
                  <Link to={isGuest ? "/guest" : "/game"}>
                    <ArrowRight className="ms-0 me-2 h-4 w-4 rotate-180 rtl:rotate-0" />
                    {t("backToTracks")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold active:scale-95 transition-all"
                  onClick={() => {
                    setIdx(0);
                    setSelected(null);
                    setMistakes([]);
                    setScore(0);
                    setDone(false);
                    setSaveState("idle");
                  }}
                >
                  <RefreshCw className="ms-0 me-2 h-4 w-4" />
                  {t("retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isCorrect = selected === q.correctIndex;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-[#1E3A8A]">
              <span className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{track.title[lang]}</span>
              <span className="text-slate-400">
                {t("question")} {idx + 1} / {total}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-[#1E3A8A] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(30,58,138,0.3)] rounded-full"
                style={{ width: `${((idx + (selected !== null ? 1 : 0)) / total) * 100}%` }}
              />
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200 bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 md:p-12 pb-6 text-center">
              <CardTitle className="text-2xl md:text-3xl font-extrabold leading-tight text-slate-900 tracking-tight">
                {q.prompt[lang]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0 space-y-8">
              {q.media_url ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner group">
                  {q.media_url.match(/\.(mp4|webm|ogg)$/) || q.media_url.includes('youtube.com') || q.media_url.includes('vimeo.com') ? (
                    <video src={q.media_url} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={q.media_url} alt="Assessment visual" className="w-full h-full object-contain" />
                  )}
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden border border-slate-100 bg-slate-50/50">
                  <ScenarioVisuals trackId={track.id} questionId={q.id || idx.toString()} />
                </div>
              )}
              
              <div className="grid gap-4">
                {q.choices[lang].map((choice: string, i: number) => {
                  const isPicked = selected === i;
                  const isAnswer = i === q.correctIndex;
                  let style = "border-slate-100 bg-slate-50/50 text-slate-700 hover:border-[#1E3A8A] hover:bg-blue-50 hover:text-[#1E3A8A] shadow-sm";
                  if (selected !== null) {
                    if (isAnswer) style = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500";
                    else if (isPicked) style = "border-rose-200 bg-rose-50 text-rose-800 opacity-90";
                    else style = "border-slate-100 bg-slate-50 text-slate-400 opacity-40 grayscale";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selected !== null}
                      onClick={() => handlePick(i)}
                      className={`text-start rounded-2xl border-2 px-6 py-5 transition-all duration-300 flex items-center justify-between gap-4 font-bold text-lg group ${style}`}
                    >
                      <span>{choice}</span>
                      {selected !== null && isAnswer && (
                        <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-in zoom-in duration-300">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                      {selected !== null && isPicked && !isAnswer && (
                        <div className="h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 animate-in zoom-in duration-300">
                          <X className="h-5 w-5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div
                    className={`rounded-2xl p-6 border-2 flex items-start gap-4 ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-amber-200 bg-amber-50/50"
                    }`}
                  >
                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1">
                      <p className={`font-black uppercase tracking-widest text-sm ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isCorrect ? t("correct") : t("incorrect")}
                      </p>
                      <div className="flex items-start gap-2 pt-2">
                        <Lightbulb className="h-4 w-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                        <p className="text-slate-600 text-base leading-relaxed font-medium">
                          {q.explanation[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-16 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-lg font-black shadow-2xl shadow-blue-900/10 active:scale-[0.98] transition-all group" 
                    onClick={handleNext}
                  >
                    {idx + 1 < total ? t("next") : t("finish")}
                    <ArrowRight className="ms-2 h-5 w-5 transition-transform group-hover:translate-x-2 rtl:rotate-180 rtl:group-hover:-translate-x-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
