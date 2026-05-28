"use client";
import { useState } from "react";

interface Props {
  owner: string;
  repo: string;
  baseUrl: string;
}

type Format = "markdown" | "html" | "url";

export default function BadgeEmbed({ owner, repo, baseUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<Format>("markdown");

  const badgeUrl = `${baseUrl}/api/badge/${owner}/${repo}`;
  const resultsUrl = `${baseUrl}/results/${owner}/${repo}`;

  const snippets: Record<Format, string> = {
    markdown: `[![AgentReady Score](${badgeUrl})](${resultsUrl})`,
    html: `<a href="${resultsUrl}"><img src="${badgeUrl}" alt="AgentReady Score" /></a>`,
    url: badgeUrl,
  };

  const snippet = snippets[format];

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🏷️</span>
        <h3 className="font-semibold text-white/90">Embed Badge</h3>
      </div>

      {/* Live preview */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="AgentReady Score badge preview" height={20} />
        <span className="text-xs text-white/30">Live preview</span>
      </div>

      {/* Format tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {(["markdown", "html", "url"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              format === f
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="text-xs bg-black/40 border border-white/5 rounded-lg p-4 overflow-x-auto text-white/60 font-mono leading-relaxed">
          {snippet}
        </pre>
        <button
          onClick={copy}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-white/10 hover:bg-white/15 text-white/60 hover:text-white rounded transition-all"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
