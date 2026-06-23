import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

type AppLogoProps = {
  variant?: "dark" | "light";
  showText?: boolean;
  to?: string;
};

export function AppLogo({ variant = "light", showText = true, to }: AppLogoProps) {
  const isDark = variant === "dark";

  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: 36,
        height: 36,
        background: isDark ? "oklch(1 0 0 / 0.12)" : "oklch(0.22 0.14 258)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Shield style={{ width: 18, height: 18, color: "white" }} />
      </div>
      {showText && (
        <span style={{
          fontWeight: 700,
          fontSize: "1rem",
          color: isDark ? "white" : "oklch(0.22 0.14 258)",
          letterSpacing: "-0.01em",
        }}>
          e-Wa3y
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }

  return inner;
}
