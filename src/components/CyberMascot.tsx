type Pose = "neutral" | "celebrate" | "think";

interface Props {
  pose?: Pose;
  className?: string;
}

export function CyberMascot({ pose = "neutral", className = "" }: Props) {
  const isHappy = pose === "celebrate";
  const isThink = pose === "think";

  // Pupil positions shift by pose
  const lPupilX = isThink ? 64 : 61;
  const lPupilY = isThink ? 88 : 84;
  const rPupilX = isThink ? 100 : 99;
  const rPupilY = isThink ? 88 : 84;
  const pupilR = isHappy ? 5.5 : 7;

  return (
    <svg
      viewBox="0 0 160 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        {/* Head — 3-stop radial for a sphere highlight */}
        <radialGradient id="cm-head" cx="36%" cy="26%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="oklch(0.78 0.14 248)" />
          <stop offset="48%" stopColor="oklch(0.54 0.19 255)" />
          <stop offset="100%" stopColor="oklch(0.27 0.12 262)" />
        </radialGradient>

        {/* Ear — same hue, narrower range */}
        <radialGradient id="cm-ear" cx="30%" cy="26%" r="70%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="oklch(0.64 0.17 253)" />
          <stop offset="100%" stopColor="oklch(0.34 0.13 262)" />
        </radialGradient>

        {/* Body — amber / orange */}
        <radialGradient id="cm-body" cx="32%" cy="20%" r="78%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="oklch(0.90 0.12 80)" />
          <stop offset="100%" stopColor="oklch(0.61 0.155 64)" />
        </radialGradient>

        {/* Arms — slightly lighter orange */}
        <radialGradient id="cm-arm" cx="28%" cy="22%" r="75%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="oklch(0.87 0.12 78)" />
          <stop offset="100%" stopColor="oklch(0.60 0.145 64)" />
        </radialGradient>

        {/* Ground shadow */}
        <radialGradient id="cm-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.22 0.07 258)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="oklch(0.22 0.07 258)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Ground shadow ── */}
      <ellipse cx="80" cy="222" rx="50" ry="8" fill="url(#cm-shadow)" />

      {/* ── Left arm ── */}
      {!isHappy && (
        <rect
          x="8"
          y="154"
          width="36"
          height="54"
          rx="18"
          fill="url(#cm-arm)"
          transform={isThink ? undefined : undefined}
        />
      )}
      {isHappy && (
        <g transform="rotate(-32, 26, 154)">
          <rect x="8" y="100" width="36" height="54" rx="18" fill="url(#cm-arm)" />
        </g>
      )}

      {/* ── Right arm ── */}
      {!isHappy && !isThink && (
        <rect x="116" y="154" width="36" height="54" rx="18" fill="url(#cm-arm)" />
      )}
      {isHappy && (
        <g transform="rotate(32, 134, 154)">
          <rect x="116" y="100" width="36" height="54" rx="18" fill="url(#cm-arm)" />
        </g>
      )}
      {isThink && (
        <g transform="rotate(-68, 134, 154)">
          <rect x="116" y="102" width="36" height="54" rx="18" fill="url(#cm-arm)" />
        </g>
      )}

      {/* ── Body ── */}
      <rect x="40" y="140" width="80" height="68" rx="22" fill="url(#cm-body)" />

      {/* Top shine on body */}
      <ellipse cx="68" cy="148" rx="22" ry="7" fill="white" opacity="0.28" />

      {/* Body panel */}
      <rect
        x="58"
        y="160"
        width="44"
        height="34"
        rx="11"
        fill="oklch(0.52 0.13 63)"
        opacity="0.28"
      />

      {/* Center button */}
      <circle cx="80" cy="170" r="9" fill="oklch(0.88 0.12 80)" />
      <circle cx="80" cy="170" r="5.5" fill="white" opacity="0.75" />
      <circle cx="78" cy="168" r="2.2" fill="white" opacity="0.95" />

      {/* Status LEDs */}
      <circle
        cx="68"
        cy="183"
        r="4"
        fill={isHappy ? "oklch(0.62 0.22 148)" : "oklch(0.82 0.12 80)"}
      />
      <circle cx="80" cy="183" r="4" fill="oklch(0.82 0.12 80)" />
      <circle
        cx="92"
        cy="183"
        r="4"
        fill={isThink ? "oklch(0.60 0.19 255)" : "oklch(0.82 0.12 80)"}
      />

      {/* ── Collar / neck ring ── */}
      <ellipse cx="80" cy="143" rx="30" ry="13" fill="oklch(0.38 0.17 257)" />
      <ellipse cx="80" cy="141" rx="26" ry="10" fill="oklch(0.50 0.20 255)" />

      {/* ── Left ear ── */}
      <circle cx="22" cy="82" r="16" fill="url(#cm-ear)" />
      <circle cx="22" cy="82" r="9" fill="oklch(0.20 0.09 260)" />
      <circle cx="20" cy="80" r="4" fill="oklch(0.54 0.17 252)" />
      <circle cx="19" cy="79" r="1.6" fill="white" opacity="0.65" />

      {/* ── Right ear ── */}
      <circle cx="138" cy="82" r="16" fill="url(#cm-ear)" />
      <circle cx="138" cy="82" r="9" fill="oklch(0.20 0.09 260)" />
      <circle cx="136" cy="80" r="4" fill="oklch(0.54 0.17 252)" />
      <circle cx="135" cy="79" r="1.6" fill="white" opacity="0.65" />

      {/* ── Head sphere ── */}
      <circle cx="80" cy="85" r="58" fill="url(#cm-head)" />

      {/* Specular highlight — gives the sphere a shiny cap */}
      <ellipse
        cx="59"
        cy="55"
        rx="21"
        ry="13"
        fill="white"
        opacity="0.22"
        transform="rotate(-25, 59, 55)"
      />
      <ellipse
        cx="55"
        cy="51"
        rx="10"
        ry="6"
        fill="white"
        opacity="0.38"
        transform="rotate(-25, 55, 51)"
      />

      {/* ── Antenna ── */}
      <rect x="77" y="24" width="6" height="34" rx="3" fill="oklch(0.36 0.14 260)" />
      <circle cx="80" cy="20" r="11" fill="oklch(0.78 0.155 75)" />
      <circle cx="80" cy="20" r="6.5" fill="white" opacity={isHappy ? 1 : 0.65} />
      <circle cx="78" cy="18" r="2.5" fill="white" opacity="0.95" />
      {isHappy && (
        <circle
          cx="80"
          cy="20"
          r="17"
          fill="none"
          stroke="oklch(0.78 0.155 75)"
          strokeWidth="2"
          opacity="0.5"
          style={{ animation: "gw-pulse-ring 1s ease-out infinite" }}
        />
      )}

      {/* ── Face visor shadow (adds depth to the face plane) ── */}
      <ellipse cx="80" cy="91" rx="44" ry="37" fill="oklch(0.20 0.12 260)" opacity="0.18" />

      {/* ── Left eye — glow halo + white fill ── */}
      <rect
        x="43"
        y="71"
        width="36"
        height="26"
        rx="9"
        fill="oklch(0.70 0.18 255)"
        opacity="0.35"
      />
      <rect x="46" y="73" width="30" height="22" rx="7" fill="white" />
      <circle cx={lPupilX} cy={lPupilY} r={pupilR} fill="oklch(0.40 0.20 255)" />
      <circle cx={lPupilX + 2} cy={lPupilY - 2} r="2.4" fill="white" opacity="0.85" />

      {/* ── Right eye ── */}
      <rect
        x="81"
        y="71"
        width="36"
        height="26"
        rx="9"
        fill="oklch(0.70 0.18 255)"
        opacity="0.35"
      />
      <rect x="84" y="73" width="30" height="22" rx="7" fill="white" />
      <circle cx={rPupilX} cy={rPupilY} r={pupilR} fill="oklch(0.40 0.20 255)" />
      <circle cx={rPupilX + 2} cy={rPupilY - 2} r="2.4" fill="white" opacity="0.85" />

      {/* ── Mouth ── */}
      {isHappy && (
        <path
          d="M 62 108 Q 80 122 98 108"
          stroke="oklch(0.44 0.18 255)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {!isHappy && !isThink && (
        <path
          d="M 64 108 Q 80 115 96 108"
          stroke="oklch(0.44 0.18 255)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {isThink && (
        <path
          d="M 65 110 Q 80 107 95 110"
          stroke="oklch(0.44 0.18 255)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* ── Celebrate sparkles (4-point SVG stars) ── */}
      {isHappy && (
        <>
          <g transform="translate(146, 40)" style={{ animation: "gw-pop-in 0.3s ease both" }}>
            <path
              d="M0,-12 L2.4,-2.4 L12,0 L2.4,2.4 L0,12 L-2.4,2.4 L-12,0 L-2.4,-2.4 Z"
              fill="oklch(0.78 0.155 75)"
            />
          </g>
          <g
            transform="translate(151, 68)"
            style={{ animation: "gw-pop-in 0.35s ease 0.08s both" }}
          >
            <path
              d="M0,-8 L1.6,-1.6 L8,0 L1.6,1.6 L0,8 L-1.6,1.6 L-8,0 L-1.6,-1.6 Z"
              fill="oklch(0.78 0.155 75)"
              opacity="0.85"
            />
          </g>
          <g transform="translate(14, 50)" style={{ animation: "gw-pop-in 0.3s ease 0.12s both" }}>
            <path
              d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2 Z"
              fill="oklch(0.68 0.17 255)"
            />
          </g>
          <g transform="translate(8, 76)" style={{ animation: "gw-pop-in 0.4s ease 0.18s both" }}>
            <path
              d="M0,-6 L1.2,-1.2 L6,0 L1.2,1.2 L0,6 L-1.2,1.2 L-6,0 L-1.2,-1.2 Z"
              fill="oklch(0.78 0.155 75)"
              opacity="0.7"
            />
          </g>
        </>
      )}

      {/* ── Think bubbles ── */}
      {isThink && (
        <>
          <circle cx="140" cy="88" r="6" fill="oklch(0.87 0.06 248)" opacity="0.82" />
          <circle cx="148" cy="70" r="9.5" fill="oklch(0.87 0.06 248)" opacity="0.82" />
          <circle cx="154" cy="50" r="14" fill="oklch(0.87 0.06 248)" opacity="0.82" />
          <text
            x="154"
            y="55"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="oklch(0.40 0.19 255)"
          >
            ?
          </text>
        </>
      )}
    </svg>
  );
}
