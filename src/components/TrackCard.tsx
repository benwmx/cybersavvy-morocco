import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Shield, CheckCircle2, type LucideIcon } from "lucide-react";
import { getIconComponent } from "@/lib/icons";

interface Props {
  trackId: string;
  title: string;
  description: string;
  questionCount: number;
  iconName?: string | null;
  accentColor?: string | null;
  done?: boolean;
  index?: number;
  t: (k: string) => string;
}

export function TrackCard({
  trackId,
  title,
  description,
  questionCount,
  iconName,
  accentColor,
  done = false,
  index = 0,
  t,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const Icon: LucideIcon = getIconComponent(iconName) ?? Shield;

  return (
    <Link
      to="/game/$trackId"
      params={{ trackId }}
      style={{
        display: "block",
        animation: `gw-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${index * 70}ms`,
        textDecoration: "none",
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: done ? "oklch(0.97 0.01 150)" : "var(--gw-card)",
          border: `2px solid ${done ? "oklch(0.75 0.12 150)" : hovered ? "var(--gw-blue)" : "var(--gw-card-border)"}`,
          borderRadius: "20px",
          padding: "20px",
          transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
          transform: hovered && !done ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered && !done
            ? "0 10px 28px oklch(0.52 0.19 255 / 0.15)"
            : "0 2px 6px oklch(0.22 0.07 258 / 0.07)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Done badge */}
        {done && (
          <div style={{
            position: "absolute",
            top: "12px",
            insetInlineEnd: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "oklch(0.55 0.18 150)",
            borderRadius: "999px",
            padding: "2px 8px 2px 4px",
          }}>
            <CheckCircle2 style={{ width: 11, height: 11, color: "white" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "white", letterSpacing: "0.04em" }}>
              {t("categoryDone")}
            </span>
          </div>
        )}

        {/* Icon square */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: done
              ? "oklch(0.55 0.18 150 / 0.15)"
              : hovered
                ? (accentColor ?? "var(--gw-blue)")
                : accentColor
                  ? `${accentColor}20`
                  : "oklch(0.52 0.19 255 / 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
            transition: "background 0.2s ease",
            flexShrink: 0,
          }}
        >
          <Icon
            style={{
              width: 20,
              height: 20,
              color: done
                ? "oklch(0.45 0.16 150)"
                : hovered
                  ? "white"
                  : (accentColor ?? "var(--gw-blue)"),
            }}
          />
        </div>

        <p
          style={{
            fontWeight: 800,
            fontSize: "0.92rem",
            color: "var(--gw-ink)",
            letterSpacing: "-0.01em",
            marginBottom: "6px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "oklch(0.22 0.07 258 / 0.5)",
            fontWeight: 500,
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: "14px",
          }}
        >
          {description}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--gw-blue)",
              background: "oklch(0.52 0.19 255 / 0.1)",
              padding: "3px 9px",
              borderRadius: "999px",
            }}
          >
            {questionCount} {t("gameQuestions")}
          </span>
          <Play
            style={{
              width: 13,
              height: 13,
              color: hovered ? "var(--gw-amber-dark)" : "oklch(0.22 0.07 258 / 0.3)",
              fill: "currentColor",
              transition: "color 0.2s ease",
            }}
          />
        </div>
      </div>
    </Link>
  );
}
