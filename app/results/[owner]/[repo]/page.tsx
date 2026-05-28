import { notFound } from "next/navigation";
import Link from "next/link";
import { analyzeRepo } from "@/lib/analyze";
import ScoreGauge from "@/components/ScoreGauge";
import ReportCard from "@/components/ReportCard";
import BadgeEmbed from "@/components/BadgeEmbed";
import { headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} — AgentReady`,
    description: `AI agent readiness score for ${owner}/${repo}`,
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;

  let result;
  try {
    result = await analyzeRepo(owner, repo);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("not found")) notFound();

    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-400 font-medium mb-2">Analysis failed</p>
          <p className="text-white/40 text-sm">{message}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300"
          >
            ← Try another repo
          </Link>
        </div>
      </main>
    );
  }

  // Derive base URL for badge links
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${proto}://${host}`;

  const { score, tier, tierLabel, categories, topFindings, improvements } = result;
  const { fullName, description, stars, language, repoUrl } = result.repo;

  const TIER_COLOR: Record<string, string> = {
    elite: "text-emerald-400",
    ready: "text-green-400",
    developing: "text-orange-400",
    minimal: "text-red-400",
    "not-ready": "text-gray-400",
  };

  return (
    <main className="min-h-screen px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          <span>←</span> AgentReady
        </Link>

        {/* Repo header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-white hover:text-violet-300 transition-colors"
            >
              {fullName}
            </a>
            {description && (
              <p className="mt-1 text-sm text-white/40 max-w-lg">{description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {language && (
                <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                  {language}
                </span>
              )}
              <span className="text-xs text-white/30">⭐ {stars.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Score hero */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8">
          <ScoreGauge score={score} tier={tier} />

          <div className="flex-1 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/25 mb-1">
                AgentReady Score
              </div>
              <div className="text-5xl font-bold text-white">
                {score.toFixed(1)}
                <span className="text-xl text-white/25 font-normal">/10</span>
              </div>
              <div className={`text-lg font-semibold mt-1 ${TIER_COLOR[tier]}`}>
                {tierLabel}
              </div>
            </div>

            {/* Quick summary */}
            {topFindings.length > 0 && (
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Strengths</p>
                <ul className="space-y-1">
                  {topFindings.map((f) => (
                    <li key={f} className="text-sm text-emerald-400/80">{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {improvements.length > 0 && (
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Top improvements</p>
                <ul className="space-y-1">
                  {improvements.map((i) => (
                    <li key={i} className="text-sm text-white/40">{i}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Full report */}
        <div>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">
            Detailed Report
          </h2>
          <ReportCard categories={categories} />
        </div>

        {/* Badge embed */}
        <BadgeEmbed owner={owner} repo={repo} baseUrl={baseUrl} />

        {/* Footer */}
        <p className="text-center text-xs text-white/15 pb-4">
          Analyzed {new Date(result.analyzedAt).toLocaleString()} ·{" "}
          <Link href="/" className="hover:text-white/30 transition-colors">
            Analyze another repo
          </Link>
        </p>
      </div>
    </main>
  );
}
