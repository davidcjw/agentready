import { ScoreTier } from "@/types";

const TIER_COLORS: Record<ScoreTier, { bg: string; text: string }> = {
  elite: { bg: "#10b981", text: "#ffffff" },
  ready: { bg: "#22c55e", text: "#ffffff" },
  developing: { bg: "#f97316", text: "#ffffff" },
  minimal: { bg: "#ef4444", text: "#ffffff" },
  "not-ready": { bg: "#6b7280", text: "#ffffff" },
};

export function generateBadgeSvg(score: number, tier: ScoreTier, tierLabel: string): string {
  const { bg, text } = TIER_COLORS[tier];
  const scoreDisplay = score.toFixed(1);
  const label = "AgentReady";
  const value = `${scoreDisplay}/10 · ${tierLabel}`;

  // Approximate widths
  const labelWidth = label.length * 6.5 + 16;
  const valueWidth = value.length * 6.5 + 16;
  const totalWidth = Math.round(labelWidth + valueWidth);
  const labelX = Math.round(labelWidth / 2);
  const valueX = Math.round(labelWidth + valueWidth / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${Math.round(labelWidth)}" height="20" fill="#555"/>
    <rect x="${Math.round(labelWidth)}" width="${Math.round(valueWidth)}" height="20" fill="${bg}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="${text}" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelX}" y="15" fill="#010101" fill-opacity=".3" aria-hidden="true">${label}</text>
    <text x="${labelX}" y="14">${label}</text>
    <text x="${valueX}" y="15" fill="#010101" fill-opacity=".3" aria-hidden="true">${value}</text>
    <text x="${valueX}" y="14">${value}</text>
  </g>
</svg>`;
}
