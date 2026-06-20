import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Shield, type LucideIcon } from "lucide-react";
import { getIconComponent } from "@/lib/icons";

interface Props {
  trackId: string;
  title: string;
  description: string;
  questionCount: number;
  iconName?: string | null;
  index?: number;
  t: (k: string) => string;
}

export function TrackCard({
  trackId,
  title,
  description,
  questionCount,
  iconName,
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
          background: "var(--gw-card)",
          border: `2px solid ${hovered ? "var(--gw-blue)" : "var(--gw-card-border)"}`,
          borderRadius: "20px",
          padding: "20px",
          transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 10px 28px oklch(0.52 0.19 255 / 0.15)"
            : "0 2px 6px oklch(0.22 0.07 258 / 0.07)",
          cursor: "pointer",
        }}
      >
        {/* Icon square */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: hovered ? "var(--gw-blue)" : "oklch(0.52 0.19 255 / 0.12)",
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
              color: hovered ? "white" : "var(--gw-blue)",
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
