import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameWorld } from "@/components/GameWorld";
import { CyberMascot } from "@/components/CyberMascot";
import { ScenarioVisuals } from "@/components/ScenarioVisuals";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { useStudent } from "@/context/StudentContext";
import { getCategory } from "@/content/scenarios";
import { api, ScenarioRow } from "@/lib/supabase/api";
import { saveResult } from "@/lib/offline/queue";
import { Check, X, Lightbulb, RotateCcw, ArrowLeft, Loader2, ZoomIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/game/$categoryId")({
  component: CategoryRunner,
});

interface ScenarioResult {
  scenarioId: string;
  score: number;
  max: number;
  mistakes: string[];
}

type Phase = "quiz" | "transition" | "done";

function CategoryRunner() {
  const { categoryId } = useParams({ from: "/game/$categoryId" });
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const navigate = useNavigate();

  const { student } = useStudent();
  const [isGuest, setIsGuest] = useState(false);
  useEffect(() => {
    if (!student) {
      if (localStorage.getItem("cs.guest")) setIsGuest(true);
      else navigate({ to: "/login" });
    }
  }, [student, navigate]);

  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let loaded: ScenarioRow[] = [];
      if (student) {
        loaded = await api.listVisibleScenariosForCategory(student.class_id, categoryId).catch(() => []);
      } else {
        // guest: try public scenarios for this category first
        loaded = await api.listPublicScenariosForCategory(categoryId).catch(() => []);
        // fallback to static track if no DB results (offline guest with old-style track ID)
        if (loaded.length === 0) {
          const staticTrack = getCategory(categoryId);
          if (staticTrack) loaded = [staticTrack as unknown as ScenarioRow];
        }
      }
      setScenarios(loaded);
      setLoading(false);
    })();
  }, [student, isGuest, categoryId]);

  // ── Player state ──────────────────────────────────────────────────────────
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentMistakes, setCurrentMistakes] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [allResults, setAllResults] = useState<ScenarioResult[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "online" | "queued" | "guest">("idle");
  const [lightbox, setLightbox] = useState<{ kind: "img"; url: string } | { kind: "visual" } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (loading) return <QuizLoading />;

  if (scenarios.length === 0) {
    return (
      <div
        className="game-world"
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gw-bg)",
        }}
      >
        <p style={{ color: "var(--gw-blue)", fontWeight: 700 }}>{t("trackNotFound")}</p>
      </div>
    );
  }

  const currentScenario = scenarios[scenarioIdx];
  type Question = Record<string, unknown>;
  const questions = ((currentScenario.questions as Question[]) ?? []) as Question[];
  const q = questions[questionIdx] as Question & {
    prompt: Record<string, string>;
    choices: Record<string, string[]>;
    correctIndex: number;
    explanation: Record<string, string>;
    media_url?: string;
    visual_type?: string;
    visual_config?: unknown;
    id?: string;
  };

  const questionsBeforeNow = scenarios
    .slice(0, scenarioIdx)
    .reduce((sum, s) => sum + ((s.questions as unknown[])?.length ?? 0), 0);
  const totalQuestions = scenarios.reduce(
    (sum, s) => sum + ((s.questions as unknown[])?.length ?? 0),
    0,
  );

  const isCorrect = selected === q?.correctIndex;
  const categoryTitle = translate(currentScenario.title);

  const handlePick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setCurrentScore((s) => s + 1);
    else setCurrentMistakes((m) => [...m, q.id || String(questionIdx)]);
  };

  const handleNext = async () => {
    if (questionIdx + 1 < questions.length) {
      setQuestionIdx((i) => i + 1);
      setSelected(null);
    } else {
      // End of this scenario — save result
      const result: ScenarioResult = {
        scenarioId: currentScenario.id,
        score: currentScore,
        max: questions.length,
        mistakes: currentMistakes,
      };
      const updated = [...allResults, result];
      setAllResults(updated);

      if (isGuest) {
        const h = JSON.parse(localStorage.getItem("cs.guest_history") || "[]");
        const titleObj = currentScenario.title as { fr?: string; ar?: string } | null;
        h.push({
          categoryId: currentScenario.id,
          titleFr: titleObj?.fr ?? "",
          titleAr: titleObj?.ar ?? "",
          score: currentScore,
          total: questions.length,
          date: new Date().toISOString(),
        });
        localStorage.setItem("cs.guest_history", JSON.stringify(h));
        setSaveState("guest");
      } else if (student) {
        const res = await saveResult({
          student_id: student.id,
          class_id: student.class_id,
          scenario_id: currentScenario.id,
          score: currentScore,
          max_score: questions.length,
          mistakes: currentMistakes,
        });
        setSaveState(res);
      }

      if (scenarioIdx + 1 < scenarios.length) {
        setPhase("transition");
      } else {
        toast.success(saveState === "online" || isGuest ? t("syncDone") : t("syncQueued"));
        setPhase("done");
      }
    }
  };

  const handleContinue = () => {
    setScenarioIdx((i) => i + 1);
    setQuestionIdx(0);
    setSelected(null);
    setCurrentScore(0);
    setCurrentMistakes([]);
    setPhase("quiz");
  };

  // ── Done ─────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const totalScore = allResults.reduce((s, r) => s + r.score, 0);
    const totalMax = allResults.reduce((s, r) => s + r.max, 0);
    return (
      <ResultsScreen
        score={totalScore}
        total={totalMax}
        saveState={saveState}
        isGuest={isGuest}
        title={categoryTitle}
        onRetry={() => {
          setScenarioIdx(0);
          setQuestionIdx(0);
          setSelected(null);
          setCurrentScore(0);
          setCurrentMistakes([]);
          setAllResults([]);
          setPhase("quiz");
          setSaveState("idle");
        }}
        t={t}
        lang={lang}
      />
    );
  }

  // ── Transition ───────────────────────────────────────────────────────────
  if (phase === "transition") {
    const nextScenario = scenarios[scenarioIdx + 1];
    const lastResult = allResults[allResults.length - 1];
    return (
      <TransitionScreen
        nextScenario={nextScenario}
        lastScore={lastResult.score}
        lastMax={lastResult.max}
        onContinue={handleContinue}
        isGuest={isGuest}
        scenarios={scenarios}
        scenarioIdx={scenarioIdx}
        t={t}
        lang={lang}
        translate={translate}
      />
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  const isVideo = q.media_url ? /\.(mp4|webm|ogg)$/.test(q.media_url) : false;
  const hasSideBySide = (!!q.media_url && !isVideo) || !!q.visual_type;

  const renderChoices = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {q.choices[lang].map((choice: string, i: number) => (
        <AnswerPill
          key={i}
          label={choice}
          state={
            selected === null
              ? "idle"
              : i === q.correctIndex
                ? "correct"
                : i === selected
                  ? "wrong"
                  : "dim"
          }
          onClick={() => handlePick(i)}
          disabled={selected !== null}
        />
      ))}
    </div>
  );

  const renderExplanation = () =>
    selected !== null ? (
      <>
        <div
          style={{
            borderRadius: "18px",
            padding: "20px 24px",
            background: isCorrect ? "oklch(0.55 0.18 150 / 0.12)" : "oklch(0.62 0.16 30 / 0.1)",
            marginBottom: "16px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              flexShrink: 0,
              background: isCorrect ? "oklch(0.55 0.18 150)" : "oklch(0.65 0.18 30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCorrect ? (
              <Check style={{ width: 18, height: 18, color: "white" }} />
            ) : (
              <X style={{ width: 18, height: 18, color: "white" }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "6px", color: isCorrect ? "oklch(0.35 0.14 150)" : "oklch(0.45 0.14 30)" }}>
              {isCorrect ? t("gameBravo") : t("gameOups")}
            </p>
            {!isCorrect && (
              <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "oklch(0.35 0.12 258)", marginBottom: "8px" }}>
                {t("gameCorrectIs")} <strong>{q.choices[lang][q.correctIndex]}</strong>
              </p>
            )}
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <Lightbulb style={{ width: 16, height: 16, flexShrink: 0, marginTop: "2px", color: "var(--gw-blue)" }} />
              <p style={{ fontSize: "0.95rem", color: "oklch(0.28 0.08 258)", lineHeight: 1.55, fontWeight: 500 }}>
                {q.explanation[lang]}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleNext}
          style={{
            width: "100%",
            padding: "16px",
            background: "var(--gw-blue)",
            color: "white",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "-0.01em",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            boxShadow: "0 6px 20px oklch(0.52 0.19 255 / 0.35)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
        >
          {questionIdx + 1 < questions.length ? t("next") : t("finish")}
        </button>
      </>
    ) : null;

  return (
    <GameWorld
      mascotPose={selected === null ? "neutral" : isCorrect ? "celebrate" : "think"}
      backTo={isGuest ? "/guest" : "/game"}
      title={categoryTitle}
      contentAlign="center"
      progress={{
        current: questionsBeforeNow + questionIdx + 1,
        total: totalQuestions,
        segments: scenarios.map(s => ({ count: (s.questions as unknown[])?.length ?? 0 })),
        segmentIdx: scenarioIdx,
      }}
    >
      <div style={{ maxWidth: hasSideBySide ? "min(1060px, 96vw)" : "640px", width: "100%" }}>
        {hasSideBySide ? (
          /* ── Side-by-side card (image left, Q+choices right) ── */
          <div
            style={{
              background: "var(--gw-card)",
              border: "2px solid var(--gw-card-border)",
              borderRadius: "28px",
              overflow: "hidden",
              animation: "gw-pop-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            {/* Top row */}
            <div className="quiz-sbs-row" style={{ display: "flex" }}>
              {/* Left: image column — blurred bg fills letterbox, foreground image fully visible */}
              <div
                className="quiz-sbs-img"
                style={{ flex: "0 0 58%", position: "relative", minHeight: "clamp(380px, 52vh, 560px)", overflow: "hidden", background: "oklch(0.12 0.04 258)", cursor: "zoom-in" }}
                onClick={() => q.media_url ? setLightbox({ kind: "img", url: q.media_url }) : setLightbox({ kind: "visual" })}
              >
                {q.media_url ? (
                  <>
                    {/* Blurred backdrop — fills letterbox space */}
                    <img
                      src={q.media_url}
                      aria-hidden="true"
                      style={{
                        position: "absolute", inset: "-8px", width: "calc(100% + 16px)", height: "calc(100% + 16px)",
                        objectFit: "cover",
                        filter: "blur(18px) brightness(0.45) saturate(1.3)",
                      }}
                    />
                    {/* Foreground — full image, no cropping */}
                    <img
                      src={q.media_url}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                    />
                    {/* Zoom hint */}
                    <div style={{ position: "absolute", top: 12, right: 12, background: "oklch(0 0 0 / 0.45)", borderRadius: "8px", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                      <ZoomIn style={{ width: 16, height: 16, color: "white" }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <ScenarioVisuals
                        visualType={(q.visual_type ?? null) as import("@/lib/visuals").VisualType | null}
                        visualConfig={(q.visual_config ?? null) as Record<string, unknown> | null}
                        imageUrl={"image_url" in currentScenario ? (currentScenario as ScenarioRow).image_url : null}
                      />
                    </div>
                    <div style={{ position: "absolute", top: 12, right: 12, background: "oklch(0 0 0 / 0.35)", borderRadius: "8px", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                      <ZoomIn style={{ width: 16, height: 16, color: "white" }} />
                    </div>
                  </>
                )}
              </div>
              {/* Right: prompt + choices */}
              <div style={{ flex: 1, padding: "clamp(20px, 3vw, 32px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px", minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", color: "var(--gw-ink)", lineHeight: 1.4, textWrap: "balance" }}>
                  {q.prompt[lang]}
                </p>
                {renderChoices()}
              </div>
            </div>
            {/* Explanation — spans full width below both columns */}
            {selected !== null && (
              <div
                style={{
                  padding: "20px clamp(20px, 3vw, 32px) clamp(20px, 3vw, 32px)",
                  borderTop: "2px solid var(--gw-card-border)",
                  animation: "gw-slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                {renderExplanation()}
              </div>
            )}
          </div>
        ) : (
          /* ── Vertical card (video / no-media questions) ── */
          <div
            style={{
              background: "var(--gw-card)",
              border: "2px solid var(--gw-card-border)",
              borderRadius: "28px",
              padding: "clamp(20px, 4vw, 36px)",
              animation: "gw-pop-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <p style={{ fontWeight: 800, fontSize: "clamp(1rem, 2.8vw, 1.25rem)", color: "var(--gw-ink)", lineHeight: 1.4, marginBottom: "24px", textWrap: "balance" }}>
              {q.prompt[lang]}
            </p>
            {q.media_url && (
              <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "20px", background: "oklch(0.22 0.07 258 / 0.05)" }}>
                <video src={q.media_url} controls style={{ width: "100%", maxHeight: "220px", objectFit: "contain" }} />
              </div>
            )}
            {renderChoices()}
            {selected !== null && (
              <div style={{ animation: "gw-slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both", marginTop: "20px" }}>
                {renderExplanation()}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 680px) {
          .quiz-sbs-row { flex-direction: column !important; }
          .quiz-sbs-img { flex: none !important; height: 240px !important; min-height: 0 !important; }
        }
        @keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lb-img-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .lb-overlay, .lb-img { animation: none !important; }
        }
      `}</style>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="lb-overlay"
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "oklch(0 0 0 / 0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
            animation: "lb-in 0.2s ease both",
          }}
        >
          {lightbox.kind === "img" ? (
            <img
              className="lb-img"
              src={lightbox.url}
              alt=""
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "100%", maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.6)",
                animation: "lb-img-in 0.25s cubic-bezier(0.16,1,0.3,1) both",
              }}
            />
          ) : (
            <div
              className="lb-img"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(900px, 92vw)", height: "min(680px, 82vh)",
                borderRadius: "20px", overflow: "hidden",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.6)",
                animation: "lb-img-in 0.25s cubic-bezier(0.16,1,0.3,1) both",
                background: "oklch(0.12 0.04 258)",
              }}
            >
              <ScenarioVisuals
                visualType={(q.visual_type ?? null) as import("@/lib/visuals").VisualType | null}
                visualConfig={(q.visual_config ?? null) as Record<string, unknown> | null}
                imageUrl={"image_url" in currentScenario ? (currentScenario as ScenarioRow).image_url : null}
              />
            </div>
          )}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", top: 20, right: 20,
              width: 44, height: 44, borderRadius: "50%",
              background: "oklch(1 0 0 / 0.12)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(1 0 0 / 0.22)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(1 0 0 / 0.12)"; }}
            aria-label="Fermer"
          >
            <X style={{ width: 20, height: 20, color: "white" }} />
          </button>
        </div>
      )}
    </GameWorld>
  );
}

// ── Transition screen ────────────────────────────────────────────────────────

function TransitionScreen({
  nextScenario,
  lastScore,
  lastMax,
  onContinue,
  isGuest,
  scenarios,
  scenarioIdx,
  t,
  lang,
  translate,
}: {
  nextScenario: ScenarioRow;
  lastScore: number;
  lastMax: number;
  onContinue: () => void;
  isGuest: boolean;
  scenarios: ScenarioRow[];
  scenarioIdx: number;
  t: (k: string) => string;
  lang: string;
  translate: (v: unknown) => string;
}) {
  const pct = lastMax > 0 ? Math.round((lastScore / lastMax) * 100) : 0;
  const nextTitle = translate(nextScenario.title);
  const nextDesc = translate(nextScenario.description);
  const hasImage = !!(nextScenario as ScenarioRow).image_url;

  return (
    <div
      className="game-world"
      style={{
        minHeight: "100dvh",
        background: "var(--gw-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Background blobs — clipped independently so mascot can overflow freely */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "var(--gw-mint)",
            opacity: 0.45,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-60px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "var(--gw-peach)",
            opacity: 0.3,
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          maxWidth: "440px",
          width: "100%",
          animation: "gw-pop-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Mascot — 3 bounces then holds; SVG overflow:visible handles arm clipping */}
        <div style={{
          width: "clamp(80px, 20vw, 120px)",
          animationName: "gw-celebrate",
          animationDuration: "0.55s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: 3,
          animationFillMode: "forwards",
        }}>
          <CyberMascot pose="celebrate" />
        </div>

        {/* Checkpoint strip — shown only when category has multiple scenarios */}
        {scenarios.length > 1 && (
          <div style={{ width: "100%", maxWidth: "360px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {scenarios.map((_, i) => {
                const done = i <= scenarioIdx;
                const current = i === scenarioIdx;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: i < scenarios.length - 1 ? 1 : "none" }}>
                    <div
                      style={{
                        width: current ? "46px" : "34px",
                        height: current ? "46px" : "34px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: done ? "var(--gw-blue)" : "oklch(0.22 0.07 258 / 0.07)",
                        border: `2px solid ${done ? "var(--gw-blue)" : "oklch(0.22 0.07 258 / 0.18)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        boxShadow: current
                          ? "0 0 0 5px oklch(0.52 0.19 255 / 0.18), 0 0 20px oklch(0.52 0.19 255 / 0.35)"
                          : "none",
                        animation: current ? "gw-pop-in 0.4s cubic-bezier(0.16,1,0.3,1) both" : undefined,
                      }}
                    >
                      {done ? (
                        <Check style={{ width: current ? 20 : 15, height: current ? 20 : 15, color: "white", flexShrink: 0 }} />
                      ) : (
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "oklch(0.22 0.07 258 / 0.3)" }}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    {i < scenarios.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: "2px",
                          background: i < scenarioIdx
                            ? "var(--gw-blue)"
                            : "oklch(0.22 0.07 258 / 0.12)",
                          transition: "background 0.5s ease",
                          margin: "0 2px",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{
              textAlign: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "oklch(0.22 0.07 258 / 0.4)",
              marginTop: "8px",
              letterSpacing: "0.04em",
            }}>
              {scenarioIdx + 1} / {scenarios.length}
            </p>
          </div>
        )}

        {/* Score recap */}
        <div
          style={{
            background: "var(--gw-card)",
            border: "2px solid var(--gw-card-border)",
            borderRadius: "20px",
            padding: "18px 24px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--gw-ink)", marginBottom: "6px" }}>
            {t("wellDone")}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--gw-blue)", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {lastScore}
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "oklch(0.22 0.07 258 / 0.3)" }}>
              / {lastMax}
            </span>
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: "5px",
              borderRadius: "999px",
              background: "oklch(0.22 0.07 258 / 0.08)",
              overflow: "hidden",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "999px",
                background: pct >= 70 ? "oklch(0.55 0.18 150)" : pct >= 40 ? "var(--gw-amber)" : "oklch(0.62 0.16 30)",
                transformOrigin: "left center",
                transform: `scaleX(${pct / 100})`,
                transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        </div>

        {/* Next scenario preview */}
        <div
          style={{
            background: "var(--gw-card)",
            border: "2px solid var(--gw-card-border)",
            borderRadius: "20px",
            overflow: "hidden",
            width: "100%",
          }}
        >
          {hasImage && (
            <img
              src={(nextScenario as ScenarioRow).image_url!}
              alt=""
              style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }}
            />
          )}
          <div style={{ padding: "16px 20px" }}>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--gw-blue)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "4px",
              }}
            >
              {t("nextChallenge")}
            </p>
            <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--gw-ink)", marginBottom: hasImage ? 0 : "6px" }}>
              {nextTitle}
            </p>
            {!hasImage && nextDesc && (
              <p style={{ fontSize: "0.8rem", color: "oklch(0.22 0.07 258 / 0.5)", fontWeight: 500, lineHeight: 1.45 }}>
                {nextDesc}
              </p>
            )}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "16px",
            background: "var(--gw-blue)",
            color: "white",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "-0.01em",
            boxShadow: "0 6px 20px oklch(0.52 0.19 255 / 0.35)",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
        >
          {t("defiSuivant")}
        </button>

        <Link
          to={isGuest ? "/guest" : "/game"}
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "oklch(0.22 0.07 258 / 0.4)",
            textDecoration: "none",
          }}
        >
          {t("backToTracks")}
        </Link>
      </div>
    </div>
  );
}

// ── Answer pill ──────────────────────────────────────────────────────────────

function AnswerPill({
  label,
  state,
  onClick,
  disabled,
}: {
  label: string;
  state: "idle" | "correct" | "wrong" | "dim";
  onClick: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const styles: React.CSSProperties = {
    width: "100%",
    padding: "14px 20px",
    borderRadius: "14px",
    border: "2px solid",
    cursor: disabled ? "default" : "pointer",
    fontWeight: 700,
    fontSize: "0.95rem",
    textAlign: "start",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    transition: "all 0.2s ease",
    ...(state === "idle" && {
      background: hovered ? "oklch(0.52 0.19 255 / 0.08)" : "white",
      borderColor: hovered ? "var(--gw-blue)" : "var(--gw-card-border)",
      color: "var(--gw-ink)",
      transform: hovered ? "translateX(4px)" : "translateX(0)",
    }),
    ...(state === "correct" && {
      background: "oklch(0.55 0.18 150 / 0.12)",
      borderColor: "oklch(0.55 0.18 150)",
      color: "oklch(0.3 0.14 150)",
      animation: "gw-pop-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
    }),
    ...(state === "wrong" && {
      background: "oklch(0.62 0.16 30 / 0.1)",
      borderColor: "oklch(0.62 0.16 30)",
      color: "oklch(0.38 0.14 30)",
      animation: "gw-shake 0.4s ease both",
    }),
    ...(state === "dim" && {
      background: "oklch(0.96 0.005 258)",
      borderColor: "oklch(0.90 0.01 258)",
      color: "oklch(0.60 0.04 258)",
      opacity: 0.5,
    }),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => !disabled && setHovered(false)}
      style={styles}
    >
      <span>{label}</span>
      {state === "correct" && (
        <span
          style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "oklch(0.55 0.18 150)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Check style={{ width: 13, height: 13, color: "white" }} />
        </span>
      )}
      {state === "wrong" && (
        <span
          style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "oklch(0.62 0.16 30)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <X style={{ width: 13, height: 13, color: "white" }} />
        </span>
      )}
    </button>
  );
}

// ── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  score, total, saveState, isGuest, title, onRetry, t, lang,
}: {
  score: number;
  total: number;
  saveState: string;
  isGuest: boolean;
  title: string;
  onRetry: () => void;
  t: (k: string) => string;
  lang: string;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPerfect = score === total;

  return (
    <div
      className="game-world"
      style={{
        minHeight: "100dvh",
        background: "var(--gw-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute", top: "-80px", left: "-80px",
            width: "340px", height: "340px", borderRadius: "50%",
            background: "var(--gw-mint)", opacity: 0.4,
          }}
        />
        <svg width="180" height="160" style={{ position: "absolute", bottom: "-40px", right: "15%", opacity: 0.45 }} aria-hidden="true">
          <polygon points="90,0 180,160 0,160" fill="var(--gw-peach)" />
        </svg>
      </div>

      <div
        style={{
          position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "32px", maxWidth: "480px", width: "100%",
        }}
      >
        <div
          style={{
            width: "clamp(100px, 25vw, 160px)",
            animation: isPerfect ? "gw-celebrate 0.6s ease-in-out infinite" : "gw-float 3s ease-in-out infinite",
          }}
        >
          <CyberMascot pose={isPerfect ? "celebrate" : score / total >= 0.5 ? "neutral" : "think"} />
        </div>

        <div
          style={{
            background: "var(--gw-card)",
            border: "2px solid var(--gw-card-border)",
            borderRadius: "28px",
            padding: "36px 40px",
            textAlign: "center",
            width: "100%",
            animation: "gw-pop-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <p style={{ color: "oklch(0.22 0.07 258 / 0.5)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
            {title}
          </p>
          <p style={{ color: "var(--gw-blue)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "16px" }}>
            {t("categoryComplete")}
          </p>
          <p style={{ color: "oklch(0.22 0.07 258 / 0.5)", fontWeight: 700, fontSize: "0.8rem", marginBottom: "12px" }}>
            {t("yourScore")}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontSize: "clamp(3rem, 12vw, 5rem)", fontWeight: 900, color: "var(--gw-blue)", lineHeight: 1, letterSpacing: "-0.04em" }}>
              {score}
            </span>
            <span style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)", fontWeight: 700, color: "oklch(0.22 0.07 258 / 0.3)" }}>
              / {total}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            <div style={{ height: "6px", flex: 1, borderRadius: "999px", background: "oklch(0.22 0.07 258 / 0.1)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: pct >= 70 ? "oklch(0.55 0.18 150)" : pct >= 40 ? "var(--gw-amber)" : "oklch(0.62 0.16 30)",
                  width: "100%", borderRadius: "999px",
                  transformOrigin: "left center",
                  transform: `scaleX(${pct / 100})`,
                  transition: "transform 1s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                color: pct >= 70 ? "oklch(0.35 0.14 150)" : pct >= 40 ? "oklch(0.55 0.14 75)" : "oklch(0.45 0.14 30)",
              }}
            >
              {pct}%
            </span>
          </div>

          <div
            style={{
              background: "oklch(0.22 0.07 258 / 0.06)",
              borderRadius: "10px", padding: "8px 14px", marginBottom: "24px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            <div
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: saveState === "idle" ? "oklch(0.75 0.01 258)" : "oklch(0.55 0.18 150)",
                boxShadow: saveState !== "idle" ? "0 0 8px oklch(0.55 0.18 150 / 0.5)" : "none",
              }}
            />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "oklch(0.22 0.07 258 / 0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {saveState === "queued" ? t("syncQueued") : saveState === "guest" ? t("guestHistory") : t("syncDone")}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              to={isGuest ? "/guest" : "/game"}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px", borderRadius: "14px",
                background: "var(--gw-amber)", color: "var(--gw-ink)",
                fontWeight: 800, fontSize: "0.95rem",
                boxShadow: "0 6px 20px oklch(0.60 0.145 68 / 0.35)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              {t("backToTracks")}
            </Link>
            <button
              onClick={onRetry}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px", borderRadius: "14px",
                background: "white", color: "var(--gw-blue)",
                border: "2px solid var(--gw-card-border)",
                fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
              }}
            >
              <RotateCcw style={{ width: 15, height: 15 }} />
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizLoading() {
  return (
    <div
      className="game-world"
      style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gw-bg)" }}
    >
      <Loader2 style={{ width: 36, height: 36, color: "var(--gw-blue)", animation: "spin 1s linear infinite" }} />
    </div>
  );
}
