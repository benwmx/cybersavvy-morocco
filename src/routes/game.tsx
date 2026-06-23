import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameWorld } from "@/components/GameWorld";
import { CategoryCard } from "@/components/CategoryCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { useI18n } from "@/hooks/use-i18n";
import { api, ScenarioRow, CategoryRow, TutorialRow } from "@/lib/supabase/api";
import { syncClassScenarios } from "@/lib/offline/syncService";
import { getDB } from "@/lib/offline/db";
import { Loader2, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";
import { DocMarkdown } from "@/components/DocMarkdown";
import type { Json } from "@/lib/database.types";

const CARD_ACCENTS = [
  { bg: "var(--gw-blue)",       icon: "white" },
  { bg: "var(--gw-amber)",      icon: "var(--gw-ink)" },
  { bg: "var(--gw-mint)",       icon: "var(--gw-ink)" },
  { bg: "oklch(0.58 0.17 330)", icon: "white" },
  { bg: "oklch(0.55 0.18 145)", icon: "white" },
  { bg: "oklch(0.60 0.22 40)",  icon: "white" },
] as const;

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
  const { student, initialized, logout } = useStudent();
  const { translate } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [tutorials, setTutorials] = useState<TutorialRow[]>([]);
  const [readerTut, setReaderTut] = useState<TutorialRow | null>(null);
  const [tab, setTab] = useState<"scenarios" | "resources">("scenarios");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
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
          await syncClassScenarios(student.class_id);
          if (db) {
            const rows2 = await db.class_scenario_status
              .where("class_id")
              .equals(student.class_id)
              .filter((r) => r.is_visible)
              .toArray();
            if (rows2.length > 0) {
              const ids2 = rows2.map((r) => r.scenario_id);
              visibleScenarios = (await db.scenarios.where("id").anyOf(ids2).toArray()) as ScenarioRow[];
            }
          }
        }

        const byCat: Record<string, ScenarioRow[]> = {};
        for (const s of visibleScenarios) {
          if (!byCat[s.category_id]) byCat[s.category_id] = [];
          byCat[s.category_id].push(s);
        }
        const catIds = Object.keys(byCat);
        if (catIds.length === 0) { setLoading(false); return; }

        let cats: CategoryRow[] = [];
        if (db) {
          cats = (await db.categories.where("id").anyOf(catIds).toArray()) as CategoryRow[];
        }
        if (cats.length === 0 && navigator.onLine) {
          const all = await api.listCategories();
          cats = all.filter((c) => byCat[c.id]);
        }

        const results = navigator.onLine ? await api.listResultsForStudent(student.id).catch(() => []) : [];
        const completedIds = new Set(results.map((r) => r.scenario_id));

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
  }, [student, initialized, navigate]);

  if (loading) return <LoadingScreen />;
  if (!student) return null;

  // Full-page reader — replaces the lobby entirely
  if (readerTut) {
    return (
      <TutorialReaderPage
        tut={readerTut}
        onBack={() => {
          setReaderTut(null);
          setTab("resources");
        }}
      />
    );
  }

  const greeting = t("greetingName").replace(
    "{name}",
    lang === "fr" ? student.name_fr : student.name_ar,
  );

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <GameWorld mascotPose="neutral" onLogout={handleLogout}>
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
                <CategoryCard
                  key={category.id}
                  categoryId={category.id}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tutorials.map((tut, idx) => {
              const title = parseBilingualGame(tut.title);
              const displayTitle = lang === "fr" ? title.fr : title.ar;
              const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
              return (
                <button
                  key={tut.id}
                  onClick={() => setReaderTut(tut)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 18px",
                    background: "var(--gw-card)",
                    border: "1.5px solid var(--gw-card-border)",
                    borderRadius: "16px",
                    cursor: "pointer",
                    textAlign: lang === "ar" ? "right" : "left",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px oklch(0.52 0.19 255 / 0.14)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: "12px",
                    background: accent.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <BookOpen style={{ width: 20, height: 20, color: accent.icon }} />
                  </div>
                  <p style={{
                    flex: 1,
                    fontWeight: 700,
                    fontSize: "0.93rem",
                    color: "var(--gw-ink)",
                    lineHeight: 1.35,
                    margin: 0,
                  }}>
                    {displayTitle}
                  </p>
                  <span style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--gw-blue)",
                    opacity: 0.8,
                  }}>
                    {t("readTutorial")}
                    <ChevronRight style={{ width: 14, height: 14, transform: lang === "ar" ? "rotate(180deg)" : "none" }} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </GameWorld>
  );
}

function TutorialReaderPage({ tut, onBack }: { tut: TutorialRow; onBack: () => void }) {
  const { t, lang, dir } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const title = parseBilingualGame(tut.title);
  const content = parseBilingualGame(tut.content);
  const displayTitle = lang === "fr" ? title.fr : title.ar;
  const displayContent = lang === "fr" ? content.fr : content.ar;

  return (
    <div
      className="game-world"
      dir={dir}
      style={{
        minHeight: "100dvh",
        background: "var(--gw-bg)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.28s ease-out, transform 0.28s ease-out",
      }}
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "340px", height: "340px", borderRadius: "50%", background: "var(--gw-mint)", opacity: 0.35 }} />
        <svg width="180" height="160" style={{ position: "absolute", bottom: "-60px", right: "18%", opacity: 0.4 }} aria-hidden="true">
          <polygon points="90,0 180,160 0,160" fill="var(--gw-peach)" />
        </svg>
        <div style={{ position: "absolute", top: "35%", right: "28%", width: "120px", height: "120px", borderRadius: "50%", background: "var(--gw-blue-light)", opacity: 0.2 }} />
      </div>

      {/* Sticky nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          flexShrink: 0,
          background: "oklch(0.97 0.01 255 / 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.22 0.07 258 / 0.06)",
        }}
      >
        <button
          onClick={onBack}
          aria-label={t("backToTracks")}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 44, height: 44, borderRadius: 12,
            background: "var(--gw-amber)",
            color: "var(--gw-ink)",
            boxShadow: "0 4px 12px oklch(0.60 0.145 68 / 0.35)",
            border: "none", cursor: "pointer", flexShrink: 0,
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <ArrowLeft style={{ width: 20, height: 20, transform: dir === "rtl" ? "rotate(180deg)" : "none" }} />
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ background: "var(--gw-amber)", borderRadius: 12, padding: "0 4px", boxShadow: "0 4px 12px oklch(0.60 0.145 68 / 0.35)" }}>
          <LanguageSwitcher compact />
        </div>
      </div>

      {/* Reading content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          maxWidth: 740,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(28px, 5vw, 56px) clamp(20px, 5vw, 40px) 96px",
        }}
      >
        {/* Hero image */}
        {tut.image_url && (
          <img
            src={tut.image_url}
            alt=""
            style={{
              width: "100%",
              height: "clamp(160px, 28vw, 260px)",
              objectFit: "cover",
              borderRadius: 16,
              marginBottom: 36,
              display: "block",
            }}
          />
        )}

        {/* Title */}
        <h1
          style={{
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
            color: "var(--gw-blue)",
            lineHeight: 1.18,
            letterSpacing: "-0.025em",
            marginBottom: 14,
            textWrap: "balance",
          }}
        >
          {displayTitle}
        </h1>

        {/* Accent rule */}
        <div
          style={{
            width: 44,
            height: 3,
            borderRadius: 999,
            background: "var(--gw-blue)",
            opacity: 0.28,
            marginBottom: 36,
          }}
        />

        {/* Body */}
        <div
          style={{
            fontSize: "clamp(1rem, 2.2vw, 1.08rem)",
            lineHeight: 1.86,
            color: "oklch(0.22 0.07 258)",
            textWrap: "pretty",
            maxWidth: "68ch",
          }}
        >
          <DocMarkdown text={displayContent} />
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .game-world { transition: none !important; }
        }
      `}</style>
    </div>
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
