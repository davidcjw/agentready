import { NextRequest, NextResponse } from "next/server";
import { parseGitHubUrl } from "@/lib/github";
import { analyzeRepo } from "@/lib/analyze";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const result = await analyzeRepo(parsed.owner, parsed.repo);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
