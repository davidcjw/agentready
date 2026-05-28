"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseGitHubUrl } from "@/lib/github";

const EXAMPLES = [
  "anthropics/claude-code",
  "vercel/next.js",
  "microsoft/vscode",
];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError("Enter a valid GitHub repository URL or owner/repo shorthand.");
      return;
    }

    setLoading(true);
    router.push(`/results/${parsed.owner}/${parsed.repo}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-10 text-center">
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20">
            🤖
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Agent<span className="text-violet-400">Ready</span>
            </h1>
            <p className="mt-2 text-white/40 text-sm">
              How ready is your repo for AI agent collaboration?
            </p>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com/owner/repo  or  owner/repo"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all font-mono text-sm"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-left px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 text-sm tracking-wide"
          >
            {loading ? "Analyzing…" : "Analyze Repository"}
          </button>
        </form>

        {/* Example repos */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-white/25 uppercase tracking-widest">Try an example</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setUrl(ex); setError(""); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/20 transition-all font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* What it checks */}
        <div className="w-full grid grid-cols-2 gap-3 text-left">
          {[
            { icon: "🤖", label: "AI instruction files", desc: "CLAUDE.md, AGENTS.md, Copilot, Cursor…" },
            { icon: "📖", label: "Documentation", desc: "README, CONTRIBUTING, architecture docs…" },
            { icon: "⚙️", label: "Code quality signals", desc: "Tests, CI/CD, linting, type checking…" },
            { icon: "🛡️", label: "Project hygiene", desc: ".gitignore, LICENSE, .env.example…" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs font-semibold text-white/70">{item.label}</div>
              <div className="text-xs text-white/30 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
