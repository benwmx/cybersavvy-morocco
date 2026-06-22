import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameWorld } from "@/components/GameWorld";
import { CyberMascot } from "@/components/CyberMascot";
import { ScenarioVisuals } from "@/components/ScenarioVisuals";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { useStudent } from "@/context/StudentContext";
import { getTrack } from "@/content/scenarios";
import { api, ScenarioRow } from "@/lib/supabase/api";
import { saveResult } from "@/lib/offline/queue";
import { Check, X, Lightbulb, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/game/$trackId")({
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
  const { trackId } = useParams({ from: "/game/$trackId" });
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
        loaded = await api.listVisibleScenariosForCategory(student.class_id, trackId).catch(() => []);
      } else {
        // guest: try public scenarios for this category first
        loaded = await api.listPublicScenariosForCategory(trackId).catch(() => []);
        // fallback to static track if no DB results (offline guest with old-style track ID)
        if (loaded.length === 0) {
          const staticTrack = getTrack(trackId);
          if (staticTrack) loaded = [staticTrack as unknown as ScenarioRow];
        }
      }
      setScenarios(loaded);
      setLoading(false);
    })();
  }, [student, isGuest, trackId]);

  // ── Player state ──────────────────────────────────────────────────────────
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentMistakes, setCurrentMistakes] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [allResults, setAllResults] = useState<ScenarioResult[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "online" | "queued" | "guest">("idle");

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
        h.push({
          trackId: currentScenario.id,
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
        t={t}
        lang={lang}
        translate={translate}
      />
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  return (
    <GameWorld
      mascotPose={selected === null ? "neutral" : isCorrect ? "celebrate" : "think"}
      backTo={isGuest ? "/guest" : "/game"}
      title={categoryTitle}
      progress={{ current: questionsBeforeNow + questionIdx + 1, total: totalQuestions }}
    >
      <div style={{ maxWidth: "640px", width: "100%" }}>
        <div
          style={{
            background: "var(--gw-card)",
            border: "2px solid var(--gw-card-border)",
            borderRadius: "28px",
            padding: "clamp(20px, 4vw, 36px)",
            animation: "gw-pop-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <p
            style={{
              fontWeight: 800,
              fontSize: "clamp(1rem, 2.8vw, 1.25rem)",
              color: "var(--gw-ink)",
              lineHeight: 1.4,
              marginBottom: "24px",
              textWrap: "balance",
            }}
          >
            {q.prompt[lang]}
          </p>

          {(q.media_url || q.visual_type) && (
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "20px",
                background: "oklch(0.22 0.07 258 / 0.05)",
              }}
            >
              {q.media_url ? (
                q.media_url.match(/\.(mp4|webm|ogg)$/) ? (
                  <video
                    src={q.media_url}
                    controls
                    style={{ width: "100%", maxHeight: "220px", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src={q.media_url}
                    alt=""
                    style={{ width: "100%", maxHeight: "220px", objectFit: "contain" }}
                  />
                )
              ) : (
                <ScenarioVisuals
                  visualType={q.visual_type ?? null}
                  visualConfig={q.visual_config ?? null}
                  imageUrl={"image_url" in currentScenario ? (currentScenario as ScenarioRow).image_url : null}
                />
              )}
            </div>
          )}

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

          {selected !== null && (
            <div
              style={{
                animation: "gw-slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  borderRadius: "16px",
                  padding: "16px 20px",
                  background: isCorrect
                    ? "oklch(0.55 0.18 150 / 0.12)"
                    : "oklch(0.62 0.16 30 / 0.1)",
                  marginBottom: "16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: isCorrect ? "oklch(0.55 0.18 150)" : "oklch(0.65 0.18 30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCorrect ? (
                    <Check style={{ width: 14, height: 14, color: "white" }} />
                  ) : (
                    <X style={{ width: 14, height: 14, color: "white" }} />
                  )}
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      marginBottom: "4px",
                      color: isCorrect ? "oklch(0.35 0.14 150)" : "oklch(0.45 0.14 30)",
                    }}
                  >
                    {isCorrect ? t("gameBravo") : t("gameOups")}
                  </p>
                  {!isCorrect && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "oklch(0.35 0.12 258)",
                        marginBottom: "6px",
                      }}
                    >
                      {t("gameCorrectIs")} <strong>{q.choices[lang][q.correctIndex]}</strong>
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                    <Lightbulb
                      style={{ width: 13, height: 13, flexShrink: 0, marginTop: "2px", color: "var(--gw-blue)" }}
                    />
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "oklch(0.28 0.08 258)",
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
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
            </div>
          )}
        </div>
      </div>
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
  t,
  lang,
  translate,
}: {
  nextScenario: ScenarioRow;
  lastScore: number;
  lastMax: number;
  onContinue: () => void;
  isGuest: boolean;
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
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
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
        {/* Mascot */}
        <div style={{ width: "clamp(80px, 20vw, 120px)", animation: "gw-celebrate 0.6s ease-in-out infinite" }}>
          <CyberMascot pose="celebrate" />
        </div>

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
