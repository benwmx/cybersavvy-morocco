import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameWorld } from "@/components/GameWorld";
import { TrackCard } from "@/components/TrackCard";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { useI18n } from "@/hooks/use-i18n";
import { api, ScenarioRow } from "@/lib/supabase/api";
import { getDB } from "@/lib/offline/db";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/game")({
  component: GameLayout,
});

function GameLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLobby = path === "/game" || path === "/game/";
  if (!isLobby) return <Outlet />;
  return <GameLobby />;
}

function GameLobby() {
  const { t, lang } = useLang();
  const { student } = useStudent();
  const { translate } = useI18n();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      if (localStorage.getItem("cs.guest")) navigate({ to: "/guest" });
      else navigate({ to: "/login" });
      return;
    }
    (async () => {
      try {
        const db = getDB();
        if (db) {
          const rows = await db.class_scenario_status
            .where("class_id")
            .equals(student.class_id)
            .filter((r) => r.is_visible)
            .toArray();
          if (rows.length > 0) {
            const ids = rows.map((r) => r.scenario_id);
            const local = await db.scenarios.where("id").anyOf(ids).toArray();
            setScenarios(local as ScenarioRow[]);
            setLoading(false);
            return;
          }
        }
        if (navigator.onLine) {
          setScenarios(await api.listVisibleScenarios(student.class_id));
        }
      } catch {
        /* handled below */
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
        {/* Greeting */}
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
            marginBottom: "32px",
          }}
        >
          {t("chooseTrack")}
        </p>

        {/* Scenario cards */}
        {scenarios.length === 0 ? (
          <div
            style={{
              background: "var(--gw-card)",
              border: "2px solid var(--gw-card-border)",
              borderRadius: "24px",
              padding: "40px 32px",
              textAlign: "center",
            }}
          >
            <p
              style={{ color: "oklch(0.22 0.07 258 / 0.5)", fontWeight: 600, fontSize: "0.95rem" }}
            >
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
            {scenarios.map((sc, idx) => (
              <TrackCard
                key={sc.id}
                trackId={sc.id}
                title={translate(sc.title)}
                description={translate(sc.description)}
                questionCount={(sc.questions as unknown[])?.length ?? 0}
                iconName={sc.icon}
                index={idx}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </GameWorld>
  );
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
