import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameWorld } from "@/components/GameWorld";
import { TrackCard } from "@/components/TrackCard";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { useI18n } from "@/hooks/use-i18n";
import { api, ScenarioRow, CategoryRow, TutorialRow } from "@/lib/supabase/api";
import { getDB } from "@/lib/offline/db";
import { Loader2, BookOpen, X } from "lucide-react";
import { DocMarkdown } from "@/components/DocMarkdown";
import type { Json } from "@/lib/database.types";

export const Route = createFileRoute("/game")({
  component: GameLayout,
});

function GameLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLobby = path === "/game" || path === "/game/";
  if (!isLobby) return <Outlet />;
  return <GameLobby />;
}

interface CategoryItem {
  category: CategoryRow;
  scenarios: ScenarioRow[];
  totalQuestions: number;
  isDone: boolean;
  catScore?: { earned: number; max: number };
}

function GameLobby() {
  const { t, lang } = useLang();
  const { student } = useStudent();
  const { translate } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [tutorials, setTutorials] = useState<TutorialRow[]>([]);
  const [readerTut, setReaderTut] = useState<TutorialRow | null>(null);
  const [tab, setTab] = useState<"scenarios" | "resources">("scenarios");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      if (localStorage.getItem("cs.guest")) navigate({ to: "/guest" });
      else navigate({ to: "/login" });
      return;
    }
    (async () => {
      try {
        let visibleScenarios: ScenarioRow[] = [];

        const db = getDB();
        if (db) {
          const rows = await db.class_scenario_status
            .where("class_id")
            .equals(student.class_id)
            .filter((r) => r.is_visible)
            .toArray();
          if (rows.length > 0) {
            const ids = rows.map((r) => r.scenario_id);
            visibleScenarios = (await db.scenarios.where("id").anyOf(ids).toArray()) as ScenarioRow[];
          }
        }

        if (visibleScenarios.length === 0 && navigator.onLine) {
          visibleScenarios = await api.listVisibleScenarios(student.class_id);
        }

        // Group by category
        const byCat: Record<string, ScenarioRow[]> = {};
        for (const s of visibleScenarios) {
          if (!byCat[s.category_id]) byCat[s.category_id] = [];
          byCat[s.category_id].push(s);
        }
        const catIds = Object.keys(byCat);
        if (catIds.length === 0) { setLoading(false); return; }

        // Load categories
        let cats: CategoryRow[] = [];
        if (db) {
          cats = (await db.categories.where("id").anyOf(catIds).toArray()) as CategoryRow[];
        }
        if (cats.length === 0 && navigator.onLine) {
          const all = await api.listCategories();
          cats = all.filter((c) => byCat[c.id]);
        }

        // Load results to mark completion and build per-category scores
        const results = navigator.onLine ? await api.listResultsForStudent(student.id) : [];
        const completedIds = new Set(results.map((r) => r.scenario_id));

        // Load visible tutorials for this class
        if (navigator.onLine) {
          try {
            const visibleTuts = await api.listVisibleTutorials(student.class_id);
            setTutorials(visibleTuts);
          } catch { /* non-blocking */ }
        }

        setItems(
          cats.map((cat) => {
            const scenarios = byCat[cat.id] ?? [];
            const catScenarioIds = new Set(scenarios.map((s) => s.id));
            const catResults = results.filter((r) => catScenarioIds.has(r.scenario_id));
            const catScore =
              catResults.length > 0
                ? {
                    earned: catResults.reduce((sum, r) => sum + r.score, 0),
                    max: catResults.reduce((sum, r) => sum + r.max_score, 0),
                  }
                : undefined;
            return {
              category: cat,
              scenarios,
              totalQuestions: scenarios.reduce(
                (sum, s) => sum + ((s.questions as unknown[])?.length ?? 0),
                0,
              ),
              isDone: scenarios.length > 0 && scenarios.every((s) => completedIds.has(s.id)),
              catScore,
            };
          }),
        );
      } catch {
        /* handled by empty state below */
      } finally {
        setLoading(false);
      }
    })();
  }, [student, navigate]);

  if (loading) return <LoadingScreen />;
  if (!student) return null;

  const greeting = t("greetingName").replace(
    "{name}",
    lang === "fr" ? student.name_fr : student.name_ar,
  );

  return (
    <GameWorld mascotPose="neutral" backTo="/login">
      <div style={{ maxWidth: "720px" }}>
        <p
          style={{
            color: "var(--gw-blue)",
            fontWeight: 800,
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            letterSpacing: "-0.02em",
            marginBottom: "6px",
            textWrap: "balance",
          }}
        >
          {greeting} 👋
        </p>
        <p
          style={{
            color: "oklch(0.22 0.07 258 / 0.55)",
            fontWeight: 600,
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            marginBottom: "24px",
          }}
        >
          {t("chooseTrack")}
        </p>

        {/* Tab bar — only rendered when the teacher assigned tutorials */}
        {tutorials.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            <button
              onClick={() => setTab("scenarios")}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 20px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.88rem",
                transition: "all 0.2s ease",
                background: tab === "scenarios" ? "var(--gw-blue)" : "oklch(0.22 0.07 258 / 0.08)",
                color: tab === "scenarios" ? "white" : "oklch(0.22 0.07 258 / 0.5)",
                boxShadow: tab === "scenarios" ? "0 4px 14px oklch(0.52 0.19 255 / 0.28)" : "none",
              }}
            >
              {t("tracks")}
            </button>
            <button
              onClick={() => setTab("resources")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "9px 20px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.88rem",
                transition: "all 0.2s ease",
                background: tab === "resources" ? "var(--gw-blue)" : "oklch(0.22 0.07 258 / 0.08)",
                color: tab === "resources" ? "white" : "oklch(0.22 0.07 258 / 0.5)",
                boxShadow: tab === "resources" ? "0 4px 14px oklch(0.52 0.19 255 / 0.28)" : "none",
              }}
            >
              {t("tutorialsSection")}
              <span style={{
                background: tab === "resources" ? "white" : "var(--gw-blue)",
                color: tab === "resources" ? "var(--gw-blue)" : "white",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 800,
                padding: "1px 7px",
                lineHeight: "18px",
                minWidth: "18px",
                textAlign: "center",
              }}>
                {tutorials.length}
              </span>
            </button>
          </div>
        )}

        {/* ── Scenarios tab ── */}
        {tab === "scenarios" && (
          items.length === 0 ? (
            <div
              style={{
                background: "var(--gw-card)",
                border: "2px solid var(--gw-card-border)",
                borderRadius: "24px",
                padding: "40px 32px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "oklch(0.22 0.07 258 / 0.5)", fontWeight: 600, fontSize: "0.95rem" }}>
                {t("noTracksAvailable")}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {items.map(({ category, scenarios, totalQuestions, isDone, catScore }, idx) => (
                <TrackCard
                  key={category.id}
                  trackId={category.id}
                  title={translate(category.name)}
                  description={`${scenarios.length} ${t("trackCount")}`}
                  questionCount={totalQuestions}
                  iconName={category.icon}
                  accentColor={category.color_code}
                  done={isDone}
                  score={catScore}
                  index={idx}
                  t={t}
                />
              ))}
            </div>
          )
        )}

        {/* ── Resources tab ── */}
        {tab === "resources" && tutorials.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "14px",
          }}>
            {tutorials.map(tut => {
              const title = parseBilingualGame(tut.title);
              const displayTitle = lang === "fr" ? title.fr : title.ar;
              return (
                <button
                  key={tut.id}
                  onClick={() => setReaderTut(tut)}
                  style={{
                    position: "relative",
                    height: "160px",
                    borderRadius: "18px",
                    border: "none",
                    cursor: "pointer",
                    overflow: "hidden",
                    padding: 0,
                    background: "oklch(0.28 0.12 255)",
                  }}
                >
                  {tut.image_url ? (
                    <img
                      src={tut.image_url}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(135deg, oklch(0.42 0.18 255), oklch(0.28 0.14 270))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <BookOpen style={{ width: 44, height: 44, color: "white", opacity: 0.3 }} />
                    </div>
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, oklch(0.10 0.05 258 / 0.82) 0%, oklch(0.10 0.05 258 / 0.1) 55%, transparent 100%)",
                  }} />
                  <p style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    padding: "12px 14px",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    lineHeight: 1.3,
                    textAlign: lang === "ar" ? "right" : "left",
                    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }}>
                    {displayTitle}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tutorial reader overlay */}
      {readerTut && (() => {
        const title = parseBilingualGame(readerTut.title);
        const content = parseBilingualGame(readerTut.content);
        const displayTitle = lang === "fr" ? title.fr : title.ar;
        const displayContent = lang === "fr" ? content.fr : content.ar;
        return (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setReaderTut(null)}
          >
            <div
              style={{ background: "var(--gw-card)", borderRadius: 20, maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
              onClick={e => e.stopPropagation()}
            >
              {readerTut.image_url && (
                <img src={readerTut.image_url} alt="" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: "20px 20px 0 0" }} />
              )}
              <div style={{ padding: "24px 28px", direction: lang === "ar" ? "rtl" : "ltr" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 800, color: "var(--gw-blue)", fontSize: "1.15rem" }}>{displayTitle}</h2>
                  <button onClick={() => setReaderTut(null)} style={{ color: "oklch(0.22 0.07 258 / 0.4)", marginLeft: 12, flexShrink: 0, background: "none", border: "none", cursor: "pointer" }}>
                    <X style={{ width: 20, height: 20 }} />
                  </button>
                </div>
                <div style={{ color: "oklch(0.22 0.07 258 / 0.75)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  <DocMarkdown text={displayContent} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </GameWorld>
  );
}

function parseBilingualGame(val: Json): { fr: string; ar: string } {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    return { fr: String(v.fr ?? ""), ar: String(v.ar ?? "") };
  }
  return { fr: "", ar: "" };
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gw-bg)",
      }}
      className="game-world"
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <Loader2
          style={{
            width: 36,
            height: 36,
            color: "var(--gw-blue)",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            color: "var(--gw-blue)",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          ...
        </p>
      </div>
    </div>
  );
}
