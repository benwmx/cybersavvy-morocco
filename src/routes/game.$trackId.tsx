import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { useLang } from "@/lib/i18n/LanguageContext";
import { getTrack } from "@/content/scenarios";
import { saveResult } from "@/lib/offline/queue";
import { Check, X, Lightbulb, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/game/$trackId")({
  component: ScenarioRunner,
});

function ScenarioRunner() {
  const { trackId } = useParams({ from: "/game/$trackId" });
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const track = useMemo(() => getTrack(trackId), [trackId]);

  const [student, setStudent] = useState<{ class_id: string; name: string } | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("cs.student");
    if (!raw) navigate({ to: "/login" });
    else setStudent(JSON.parse(raw));
  }, [navigate]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "online" | "queued">("idle");

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Track not found</p>
      </div>
    );
  }

  const q = track.questions[idx];
  const total = track.questions.length;

  const handlePick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
    else setMistakes((m) => [...m, q.id]);
  };

  const handleNext = async () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      setDone(true);
      if (student) {
        const res = await saveResult({
          class_id: student.class_id,
          student_name: student.name,
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-xl mx-auto text-center overflow-hidden">
            <div className="bg-gradient-to-br from-amber-300 to-amber-500 py-10">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
                <Trophy className="h-12 w-12 text-amber-500" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{track.title[lang]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("yourScore")}</p>
              <p className="text-5xl font-bold my-3">
                {score} <span className="text-2xl text-muted-foreground">/ {total}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                {saveState === "queued" ? `↻ ${t("syncQueued")}` : `✓ ${t("syncDone")}`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button asChild>
                  <Link to="/game">
                    <ArrowRight className="ltr:mr-2 rtl:ml-2 rtl:rotate-180 h-4 w-4" />
                    {t("backToTracks")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIdx(0);
                    setSelected(null);
                    setMistakes([]);
                    setScore(0);
                    setDone(false);
                    setSaveState("idle");
                  }}
                >
                  <RefreshCw className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {lang === "fr" ? "Rejouer" : "إعادة"}
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{track.title[lang]}</span>
              <span>
                {t("question")} {idx + 1} {t("of")} {total}
              </span>
            </div>
            <Progress value={((idx + (selected !== null ? 1 : 0)) / total) * 100} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">{q.prompt[lang]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaPlaceholder />
              <div className="grid gap-2">
                {q.choices[lang].map((choice, i) => {
                  const isPicked = selected === i;
                  const isAnswer = i === q.correctIndex;
                  let style = "border-border hover:border-primary hover:bg-primary/5";
                  if (selected !== null) {
                    if (isAnswer) style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                    else if (isPicked) style = "border-destructive bg-destructive/5";
                    else style = "border-border opacity-60";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selected !== null}
                      onClick={() => handlePick(i)}
                      className={`text-start rounded-xl border-2 px-4 py-3 transition-all flex items-center justify-between gap-3 ${style}`}
                    >
                      <span>{choice}</span>
                      {selected !== null && isAnswer && <Check className="h-5 w-5 text-emerald-600 shrink-0" />}
                      {selected !== null && isPicked && !isAnswer && (
                        <X className="h-5 w-5 text-destructive shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div
                    className={`rounded-xl p-4 border-2 ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                    }`}
                  >
                    <p className="font-semibold flex items-center gap-2">
                      {isCorrect ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <X className="h-5 w-5 text-amber-600" />
                      )}
                      {isCorrect ? t("correct") : t("incorrect")}
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                    <p className="font-semibold flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      {t("whyMatters")}
                    </p>
                    <p className="text-sm text-muted-foreground">{q.explanation[lang]}</p>
                  </div>
                  <Button className="w-full" onClick={handleNext}>
                    {idx + 1 < total ? t("next") : t("finish")}
                    <ArrowRight className="ltr:ml-2 rtl:mr-2 rtl:rotate-180 h-4 w-4" />
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
