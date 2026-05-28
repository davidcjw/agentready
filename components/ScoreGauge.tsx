"use client";
import { ScoreTier } from "@/types";

const TIER_CONFIG: Record<ScoreTier, { color: string; glow: string; label: string }> = {
  elite: { color: "#10b981", glow: "0 0 40px rgba(16,185,129,0.5)", label: "Elite" },
  ready: { color: "#22c55e", glow: "0 0 40px rgba(34,197,94,0.4)", label: "Ready" },
  developing: { color: "#f97316", glow: "0 0 40px rgba(249,115,22,0.4)", label: "Developing" },
  minimal: { color: "#ef4444", glow: "0 0 40px rgba(239,68,68,0.4)", label: "Minimal" },
  "not-ready": { color: "#6b7280", glow: "0 0 40px rgba(107,114,128,0.3)", label: "Not Ready" },
};

interface Props {
  score: number;
  tier: ScoreTier;
}

export default function ScoreGauge({ score, tier }: Props) {
  const { color, glow, label } = TIER_CONFIG[tier];
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // Fill arc based on score (0-10)
  const progress = score / 10;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        style={{ filter: `drop-shadow(${glow})` }}
        className="relative"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          {/* Score text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="36"
            fontWeight="700"
            fontFamily="var(--font-geist-sans)"
          >
            {score.toFixed(1)}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="13"
            fontFamily="var(--font-geist-sans)"
          >
            out of 10
          </text>
        </svg>
      </div>
      <span
        className="px-4 py-1 rounded-full text-sm font-semibold tracking-wide"
        style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {label}
      </span>
    </div>
  );
}
