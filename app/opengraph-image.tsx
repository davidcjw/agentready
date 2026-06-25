import { ImageResponse } from "next/og";

export const alt =
  "AgentReady — How ready is your repo for AI agent collaboration?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a14 0%, #15102e 55%, #0a0a14 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 104, fontWeight: 800 }}>
          <span style={{ color: "white" }}>Agent</span>
          <span style={{ color: "#a78bfa" }}>Ready</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 40,
            color: "#9ca3af",
          }}
        >
          How ready is your repo for AI agent collaboration?
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            letterSpacing: 6,
            color: "#6b7280",
          }}
        >
          0–10 SCORE · EMBEDDABLE BADGE · PER-SIGNAL REPORT
        </div>
      </div>
    ),
    { ...size },
  );
}
