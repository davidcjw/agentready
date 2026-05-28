import { NextRequest, NextResponse } from "next/server";
import { analyzeRepo } from "@/lib/analyze";
import { generateBadgeSvg } from "@/lib/badge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;
    const result = await analyzeRepo(owner, repo);
    const svg = generateBadgeSvg(result.score, result.tier, result.tierLabel);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    const svg = generateBadgeSvg(0, "not-ready", "Error");
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
