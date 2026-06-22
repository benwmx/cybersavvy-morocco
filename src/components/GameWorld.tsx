import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { CyberMascot } from "./CyberMascot";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLang } from "@/lib/i18n/LanguageContext";

type Pose = "neutral" | "celebrate" | "think";

interface Props {
  children: React.ReactNode;
  mascotPose?: Pose;
  backTo?: string;
  title?: string;
  progress?: {
    current: number;
    total: number;
    segments?: { count: number }[];
    segmentIdx?: number;
  };
}

export function GameWorld({ children, mascotPose = "neutral", backTo, title, progress }: Props) {
  const { t, dir } = useLang();

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
      }}
    >
      {/* ── Decorative blobs — overflow clipped here, not on outer, so sticky nav works ── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}
      >
        {/* Mint circle top-left */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "var(--gw-mint)",
            opacity: 0.45,
          }}
        />
        {/* Peach triangle bottom-right */}
        <svg
          width="180"
          height="160"
          style={{ position: "absolute", bottom: "-60px", right: "18%", opacity: 0.5 }}
          aria-hidden="true"
        >
          <polygon points="90,0 180,160 0,160" fill="var(--gw-peach)" />
        </svg>
        {/* Small blue circle mid-right */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            right: "28%",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "var(--gw-blue-light)",
            opacity: 0.25,
          }}
        />
        {/* Dotted ring pattern top-right */}
        <svg
          width="200"
          height="200"
          style={{ position: "absolute", top: "20px", right: "20px", opacity: 0.12 }}
        >
          {Array.from({ length: 5 }).map((_, ring) =>
            Array.from({ length: 12 }).map((_, dot) => {
              const r = 30 + ring * 18;
              const angle = (dot / 12) * Math.PI * 2;
              return (
                <circle
                  key={`${ring}-${dot}`}
                  cx={100 + r * Math.cos(angle)}
                  cy={100 + r * Math.sin(angle)}
                  r="3"
                  fill="var(--gw-blue)"
                />
              );
            }),
          )}
        </svg>
        {/* Small mint circle bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "40px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--gw-mint)",
            opacity: 0.35,
          }}
        />
      </div>

      {/* ── Top navigation bar — sticky so it stays visible while scrolling ── */}
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
        {/* Back button */}
        {backTo ? (
          <Link
            to={backTo}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--gw-amber)",
              color: "var(--gw-ink)",
              boxShadow: "0 4px 12px oklch(0.60 0.145 68 / 0.35)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <ArrowLeft
              style={{
                width: 20,
                height: 20,
                transform: dir === "rtl" ? "rotate(180deg)" : "none",
              }}
            />
          </Link>
        ) : (
          <div style={{ width: 44 }} />
        )}

        {/* Center: title + per-scenario question counter */}
        <div style={{ textAlign: "center", flex: 1, padding: "0 12px" }}>
          {title && (
            <p
              style={{
                color: "var(--gw-blue)",
                fontWeight: 800,
                fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                textWrap: "balance",
              }}
            >
              {title}
            </p>
          )}
          {progress && (() => {
            let localQ = progress.current;
            let localTotal = progress.total;
            if (progress.segments && progress.segmentIdx !== undefined) {
              const before = progress.segments
                .slice(0, progress.segmentIdx)
                .reduce((sum, s) => sum + s.count, 0);
              localQ = progress.current - before;
              localTotal = progress.segments[progress.segmentIdx]?.count ?? progress.total;
            }
            return (
              <p style={{ color: "var(--gw-blue)", fontWeight: 700, fontSize: "0.8rem", marginTop: title ? "2px" : 0 }}>
                {t("question")} {localQ} / {localTotal}
              </p>
            );
          })()}
        </div>

        {/* Right: home + language */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--gw-amber)",
              color: "var(--gw-ink)",
              boxShadow: "0 4px 12px oklch(0.60 0.145 68 / 0.35)",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <Home style={{ width: 18, height: 18 }} />
          </Link>
          <div
            style={{
              background: "var(--gw-amber)",
              borderRadius: "12px",
              padding: "0 4px",
              boxShadow: "0 4px 12px oklch(0.60 0.145 68 / 0.35)",
            }}
          >
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>

      {/* ── Progress indicators (quiz only) ── */}
      {progress && (
        <div style={{ position: "relative", zIndex: 10, padding: "0 20px 10px", flexShrink: 0 }}>
          {/* Global bar across all questions */}
          <div style={{ height: "5px", borderRadius: "999px", background: "oklch(0.22 0.07 258 / 0.12)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: "100%",
                background: "var(--gw-blue)",
                borderRadius: "999px",
                transformOrigin: dir === "rtl" ? "right center" : "left center",
                transform: `scaleX(${progress.current / progress.total})`,
                transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 0 10px oklch(0.52 0.19 255 / 0.4)",
              }}
            />
          </div>

          {/* Scenario dots — pill expands on current scenario */}
          {progress.segments && progress.segments.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", marginTop: "8px" }}>
              {progress.segments.map((_, i) => {
                const done = progress.segmentIdx !== undefined && i < progress.segmentIdx;
                const curr = i === (progress.segmentIdx ?? 0);
                return (
                  <div
                    key={i}
                    style={{
                      height: "5px",
                      width: curr ? "22px" : "5px",
                      borderRadius: "999px",
                      background: done
                        ? "oklch(0.52 0.19 255 / 0.45)"
                        : curr
                        ? "var(--gw-blue)"
                        : "oklch(0.22 0.07 258 / 0.15)",
                      transition: "width 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.35s ease",
                      boxShadow: curr ? "0 0 6px oklch(0.52 0.19 255 / 0.5)" : "none",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Main layout: content + mascot ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "24px",
          padding: "16px 20px 24px",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
        className="game-world-layout"
      >
        {/* Content slot */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {children}
        </div>

        {/* Mascot */}
        <div
          className="game-mascot-container"
          style={{
            width: "clamp(100px, 18vw, 200px)",
            alignSelf: "flex-end",
            flexShrink: 0,
            animation: "gw-float 3s ease-in-out infinite",
          }}
        >
          <CyberMascot pose={mascotPose} />
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .game-world-layout {
            grid-template-columns: 1fr !important;
          }
          .game-mascot-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
