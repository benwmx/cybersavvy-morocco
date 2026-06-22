import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameWorld } from "@/components/GameWorld";
import { TrackCard } from "@/components/TrackCard";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { api, ScenarioRow, CategoryRow } from "@/lib/supabase/api";
import { TRACKS } from "@/content/scenarios";
import { History, Loader2 } from "lucide-react";

export const Route = createFileRoute("/guest")({
  component: GuestLobby,
});

interface CategoryItem {
  category: CategoryRow;
  scenarios: ScenarioRow[];
  totalQuestions: number;
}

type HistoryEntry = { trackId: string; titleFr?: string; titleAr?: string; score: number; total: number; date: string };

function GuestLobby() {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const [loading, setLoading] = useState(true);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    localStorage.setItem("cs.guest", "true");
    const raw = localStorage.getItem("cs.guest_history");
    if (raw) setHistory(JSON.parse(raw));

    (async () => {
      if (navigator.onLine) {
        try {
          const [scenarios, categories] = await Promise.all([
            api.listScenarios(),
            api.listCategories(),
          ]);
          const byCat: Record<string, ScenarioRow[]> = {};
          for (const s of scenarios) {
            if (!byCat[s.category_id]) byCat[s.category_id] = [];
            byCat[s.category_id].push(s);
          }
          const items = categories
            .filter((c) => (byCat[c.id]?.length ?? 0) > 0)
            .map((c) => ({
              category: c,
              scenarios: byCat[c.id],
              totalQuestions: byCat[c.id].reduce(
                (sum, s) => sum + ((s.questions as unknown[])?.length ?? 0),
                0,
              ),
            }));
          setCategoryItems(items);
        } catch {
          /* fall through to static tracks */
        }
      }
      setLoading(false);
    })();
  }, []);

  return (
    <GameWorld mascotPose="neutral" backTo="/">
      <div style={{ maxWidth: "780px", width: "100%" }}>
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              color: "var(--gw-blue)",
              fontWeight: 800,
              fontSize: "clamp(1.3rem, 4vw, 1.9rem)",
              letterSpacing: "-0.02em",
              marginBottom: "6px",
              textWrap: "balance",
            }}
          >
            {t("freeAccess")}
          </p>
          <p
            style={{
              color: "oklch(0.22 0.07 258 / 0.5)",
              fontWeight: 600,
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
            }}
          >
            {t("guestDesc")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: history.length > 0 ? "1fr auto" : "1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Category / track grid */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}>
              <Loader2 style={{ width: 28, height: 28, color: "var(--gw-blue)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : categoryItems.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              {categoryItems.map(({ category, scenarios, totalQuestions }, idx) => (
                <TrackCard
                  key={category.id}
                  trackId={category.id}
                  title={translate(category.name)}
                  description={`${scenarios.length} ${t("trackCount")}`}
                  questionCount={totalQuestions}
                  iconName={category.icon}
                  accentColor={category.color_code}
                  index={idx}
                  t={t}
                />
              ))}
            </div>
          ) : (
            /* Offline fallback: static tracks */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              {TRACKS.map((tr, idx) => (
                <TrackCard
                  key={tr.id}
                  trackId={tr.id}
                  title={tr.title[lang as "fr" | "ar"]}
                  description={tr.description[lang as "fr" | "ar"]}
                  questionCount={tr.questions.length}
                  iconName={tr.icon}
                  index={idx}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* History sidebar */}
          {history.length > 0 && (
            <div style={{ minWidth: "180px", maxWidth: "220px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <History style={{ width: 15, height: 15, color: "var(--gw-blue)" }} />
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "var(--gw-ink)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("guestHistory")}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history
                  .slice(-5)
                  .reverse()
                  .map((h, i) => {
                    const tr = TRACKS.find((tk) => tk.id === h.trackId);
                    const pct = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
                    const displayTitle =
                      (lang === "ar" ? h.titleAr : h.titleFr) ||
                      (tr ? tr.title[lang as "fr" | "ar"] : null) ||
                      (h.titleFr || h.titleAr || "—");
                    return (
                      <div
                        key={i}
                        style={{
                          background: "var(--gw-card)",
                          border: "2px solid var(--gw-card-border)",
                          borderRadius: "14px",
                          padding: "12px 14px",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            color: "var(--gw-ink)",
                            marginBottom: "4px",
                            lineHeight: 1.3,
                          }}
                        >
                          {displayTitle}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <p style={{ fontSize: "0.7rem", color: "oklch(0.22 0.07 258 / 0.45)", fontWeight: 600 }}>
                            {new Date(h.date).toLocaleDateString(
                              lang === "fr" ? "fr-FR" : "ar-MA",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              color:
                                pct >= 70
                                  ? "oklch(0.45 0.16 150)"
                                  : pct >= 40
                                    ? "oklch(0.55 0.14 75)"
                                    : "oklch(0.50 0.16 30)",
                            }}
                          >
                            {h.score}/{h.total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </GameWorld>
  );
}
