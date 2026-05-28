import { AnalysisResult, ScoreCategory, ScoreTier } from "@/types";
import { TreeFile, FileContent } from "./github";

// ─── Agent file types ─────────────────────────────────────────────────────────

export const AGENT_FILE_CANDIDATES: Array<{
  paths: string[];
  label: string;
  typePoints: number;
}> = [
  // Vendor-neutral, recognized by Copilot + Codex + importable by Claude
  { paths: ["AGENTS.md"], label: "AGENTS.md", typePoints: 20 },
  // Tool-specific but Anthropic-official
  { paths: ["CLAUDE.md"], label: "CLAUDE.md", typePoints: 16 },
  // GitHub Copilot official path
  { paths: [".github/copilot-instructions.md"], label: ".github/copilot-instructions.md", typePoints: 16 },
  // Cursor current format
  { paths: [".cursor/rules"], label: ".cursor/rules/", typePoints: 13 },
  // Cursor legacy
  { paths: [".cursorrules"], label: ".cursorrules", typePoints: 10 },
  // Google Gemini / Windsurf
  { paths: ["GEMINI.md", ".windsurfrules"], label: "GEMINI.md / .windsurfrules", typePoints: 10 },
];

export interface AgentFileMeta {
  path: string;
  label: string;
  typePoints: number;
}

// ─── Content signal analysis ──────────────────────────────────────────────────

function hasCodeBlocks(content: string): boolean {
  return /```/.test(content);
}

function hasBehavioralKeywords(content: string): boolean {
  // Explicit directives commonly used in agent instruction files
  return /\b(ALWAYS|NEVER|AVOID|PREFER|DO NOT|MUST NOT|SHOULD NOT|NEVER USE|ALWAYS USE|IMPORTANT:|NOTE:)\b/.test(content);
}

function hasTestBuildSection(content: string): boolean {
  const lower = content.toLowerCase();
  // Header containing test/build/run/lint/develop/setup
  if (/^#{1,4}\s.*(test|build|run|lint|format|develop|setup|install)/m.test(lower)) return true;
  // Or explicit test command strings anywhere in the file
  return /(npm (run )?test|yarn test|pnpm test|bun test|pytest|cargo test|go test|make test|jest|vitest|rspec|mocha|phpunit)/i.test(content);
}

function hasStructuredSections(content: string, min = 3): boolean {
  const headers = content.match(/^#{1,4}\s+.+/gm) ?? [];
  return headers.length >= min;
}

function hasArchitectureSection(content: string): boolean {
  return /^#{1,4}\s.*(structure|architecture|overview|directory|layout|organization|codebase)/im.test(content);
}

function hasSetupSection(content: string): boolean {
  return /^#{1,4}\s.*(install|setup|get.?start|quick.?start|prerequisite|requirement|develop)/im.test(content);
}

// ─── Per-category scorers ─────────────────────────────────────────────────────

function scoreAgentFile(
  meta: AgentFileMeta | null,
  content: string | null
): ScoreCategory {
  const MAX = 65;
  const MAX_TYPE = 20;
  const MAX_CONTENT = 45;

  if (!meta) {
    return {
      id: "agent-file",
      label: "AI Instruction File",
      icon: "🤖",
      subtitle: "None found",
      score: 0,
      maxScore: MAX,
      signals: [
        {
          id: "file-present",
          label: "Agent instruction file present",
          points: 0,
          maxPoints: MAX_TYPE,
          found: false,
          detail: "Add AGENTS.md, CLAUDE.md, or .github/copilot-instructions.md",
        },
        {
          id: "code-blocks",
          label: "Contains executable commands (code blocks)",
          points: 0,
          maxPoints: 15,
          found: false,
        },
        {
          id: "behavioral-keywords",
          label: "Explicit constraints (ALWAYS / NEVER / AVOID…)",
          points: 0,
          maxPoints: 12,
          found: false,
        },
        {
          id: "test-build",
          label: "Test / build commands documented",
          points: 0,
          maxPoints: 10,
          found: false,
        },
        {
          id: "structured",
          label: "Structured sections (3+ headers)",
          points: 0,
          maxPoints: 5,
          found: false,
        },
        {
          id: "architecture",
          label: "Architecture / directory overview",
          points: 0,
          maxPoints: 3,
          found: false,
        },
      ],
    };
  }

  const text = content ?? "";
  const tooShort = text.length < 300;

  const contentSignals = tooShort
    ? { codeBlocks: false, behavioral: false, testBuild: false, structured: false, arch: false }
    : {
        codeBlocks: hasCodeBlocks(text),
        behavioral: hasBehavioralKeywords(text),
        testBuild: hasTestBuildSection(text),
        structured: hasStructuredSections(text),
        arch: hasArchitectureSection(text),
      };

  const contentPts =
    (contentSignals.codeBlocks ? 15 : 0) +
    (contentSignals.behavioral ? 12 : 0) +
    (contentSignals.testBuild ? 10 : 0) +
    (contentSignals.structured ? 5 : 0) +
    (contentSignals.arch ? 3 : 0);

  const total = meta.typePoints + Math.min(contentPts, MAX_CONTENT);

  return {
    id: "agent-file",
    label: "AI Instruction File",
    icon: "🤖",
    subtitle: meta.label,
    score: total,
    maxScore: MAX,
    signals: [
      {
        id: "file-present",
        label: `File type: ${meta.label}`,
        points: meta.typePoints,
        maxPoints: MAX_TYPE,
        found: true,
        detail: meta.typePoints === 20 ? "Vendor-neutral — recognized by all major agents" : "Tool-specific instruction file",
      },
      {
        id: "code-blocks",
        label: "Contains executable commands (code blocks)",
        points: contentSignals.codeBlocks ? 15 : 0,
        maxPoints: 15,
        found: contentSignals.codeBlocks,
        detail: contentSignals.codeBlocks
          ? "Agents can copy-paste commands directly"
          : tooShort
          ? "File too short to evaluate"
          : "No ``` code blocks found — add exact test/build commands",
      },
      {
        id: "behavioral-keywords",
        label: "Explicit constraints (ALWAYS / NEVER / AVOID…)",
        points: contentSignals.behavioral ? 12 : 0,
        maxPoints: 12,
        found: contentSignals.behavioral,
        detail: contentSignals.behavioral
          ? "Directive language found"
          : tooShort
          ? "File too short to evaluate"
          : "No ALWAYS/NEVER/AVOID directives — agents respond well to explicit rules",
      },
      {
        id: "test-build",
        label: "Test / build commands documented",
        points: contentSignals.testBuild ? 10 : 0,
        maxPoints: 10,
        found: contentSignals.testBuild,
        detail: contentSignals.testBuild
          ? "Test or build commands found"
          : tooShort
          ? "File too short to evaluate"
          : "No test/build commands detected — agents need these to verify changes",
      },
      {
        id: "structured",
        label: "Structured sections (3+ headers)",
        points: contentSignals.structured ? 5 : 0,
        maxPoints: 5,
        found: contentSignals.structured,
        detail: contentSignals.structured
          ? "Well-organized with clear sections"
          : tooShort
          ? "File too short to evaluate"
          : "Fewer than 3 section headers — structure helps agents navigate instructions",
      },
      {
        id: "architecture",
        label: "Architecture / directory overview",
        points: contentSignals.arch ? 3 : 0,
        maxPoints: 3,
        found: contentSignals.arch,
        detail: contentSignals.arch
          ? "Codebase structure described"
          : tooShort
          ? "File too short to evaluate"
          : "No architecture section — a directory map reduces agent exploration",
      },
    ],
  };
}

function scoreReadme(content: string | null): ScoreCategory {
  const MAX = 25;
  const text = content ?? "";
  const tooShort = text.length < 200;

  const signals = tooShort
    ? { codeBlocks: false, structured: false, setup: false, arch: false }
    : {
        codeBlocks: hasCodeBlocks(text),
        structured: hasStructuredSections(text, 3),
        setup: hasSetupSection(text),
        arch: hasArchitectureSection(text),
      };

  const pts =
    (signals.codeBlocks ? 8 : 0) +
    (signals.structured ? 7 : 0) +
    (signals.setup ? 5 : 0) +
    (signals.arch ? 5 : 0);

  const score = content === null ? 0 : Math.min(pts, MAX);

  return {
    id: "readme",
    label: "README",
    icon: "📖",
    subtitle: content === null ? "Not found" : undefined,
    score,
    maxScore: MAX,
    signals: [
      {
        id: "code-blocks",
        label: "Contains code examples / commands",
        points: signals.codeBlocks ? 8 : 0,
        maxPoints: 8,
        found: signals.codeBlocks,
        detail: signals.codeBlocks
          ? "Executable examples present"
          : content === null
          ? "README not found"
          : tooShort
          ? "README too short to evaluate"
          : "No code blocks — agents struggle to understand setup without runnable examples",
      },
      {
        id: "structured",
        label: "Structured with 3+ sections",
        points: signals.structured ? 7 : 0,
        maxPoints: 7,
        found: signals.structured,
        detail: signals.structured
          ? "Well-sectioned README"
          : content === null
          ? "README not found"
          : tooShort
          ? "README too short to evaluate"
          : "Fewer than 3 headers — a structured README is faster for agents to scan",
      },
      {
        id: "setup",
        label: "Setup / installation instructions",
        points: signals.setup ? 5 : 0,
        maxPoints: 5,
        found: signals.setup,
        detail: signals.setup
          ? "Installation or setup section found"
          : content === null
          ? "README not found"
          : tooShort
          ? "README too short to evaluate"
          : "No setup section found",
      },
      {
        id: "arch",
        label: "Architecture / project overview",
        points: signals.arch ? 5 : 0,
        maxPoints: 5,
        found: signals.arch,
        detail: signals.arch
          ? "Architecture or overview section found"
          : content === null
          ? "README not found"
          : tooShort
          ? "README too short to evaluate"
          : "No architecture section — helps agents understand the project structure",
      },
    ],
  };
}

function scoreContributing(content: string | null): ScoreCategory {
  const MAX = 10;
  const text = content ?? "";
  const tooShort = text.length < 300;

  const signals = tooShort
    ? { codeBlocks: false, testBuild: false }
    : {
        codeBlocks: hasCodeBlocks(text),
        testBuild: hasTestBuildSection(text),
      };

  const pts = (signals.codeBlocks ? 6 : 0) + (signals.testBuild ? 4 : 0);
  const score = content === null ? 0 : Math.min(pts, MAX);

  return {
    id: "contributing",
    label: "CONTRIBUTING.md",
    icon: "🤝",
    subtitle: content === null ? "Not found" : undefined,
    score,
    maxScore: MAX,
    signals: [
      {
        id: "code-blocks",
        label: "Contains runnable commands",
        points: signals.codeBlocks ? 6 : 0,
        maxPoints: 6,
        found: signals.codeBlocks,
        detail: signals.codeBlocks
          ? "Commands present for agents to follow"
          : content === null
          ? "Add CONTRIBUTING.md with test/lint commands"
          : tooShort
          ? "File too short — expand with development workflow"
          : "No code blocks found",
      },
      {
        id: "test-build",
        label: "Test / build workflow documented",
        points: signals.testBuild ? 4 : 0,
        maxPoints: 4,
        found: signals.testBuild,
        detail: signals.testBuild
          ? "Test or build steps found"
          : content === null
          ? "Add CONTRIBUTING.md with test/lint commands"
          : tooShort
          ? "File too short to evaluate"
          : "No test/build section detected",
      },
    ],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tierFromScore(score: number): { tier: ScoreTier; label: string } {
  if (score >= 9) return { tier: "elite", label: "Elite" };
  if (score >= 7) return { tier: "ready", label: "Ready" };
  if (score >= 5) return { tier: "developing", label: "Developing" };
  if (score >= 3) return { tier: "minimal", label: "Minimal" };
  return { tier: "not-ready", label: "Not Ready" };
}

export function findBestAgentFile(files: TreeFile[]): AgentFileMeta | null {
  for (const candidate of AGENT_FILE_CANDIDATES) {
    for (const p of candidate.paths) {
      const lower = p.toLowerCase();
      // Exact match (e.g. AGENTS.md, CLAUDE.md, .cursorrules)
      const exact = files.find((f) => f.type === "blob" && f.path.toLowerCase() === lower);
      if (exact) return { path: exact.path, label: candidate.label, typePoints: candidate.typePoints };

      // Directory prefix match (e.g. .cursor/rules/*.mdc)
      if (!p.includes(".") || p.endsWith("/")) {
        const inDir = files.find(
          (f) => f.type === "blob" && f.path.toLowerCase().startsWith(lower)
        );
        if (inDir) return { path: inDir.path, label: candidate.label, typePoints: candidate.typePoints };
      }
    }
  }

  // Fallback: any .md file inside .claude/
  const claudeDir = files.find(
    (f) => f.type === "blob" && f.path.toLowerCase().startsWith(".claude/") && f.path.toLowerCase().endsWith(".md")
  );
  if (claudeDir) return { path: claudeDir.path, label: "CLAUDE.md (.claude/)", typePoints: 16 };

  return null;
}

// ─── Main scorer ──────────────────────────────────────────────────────────────

export function scoreRepo(
  owner: string,
  repo: string,
  repoData: { description: string | null; stargazers_count: number; language: string | null; html_url: string; default_branch: string },
  agentFileMeta: AgentFileMeta | null,
  agentFileContent: FileContent | null,
  readmeContent: FileContent | null,
  contributingContent: FileContent | null
): AnalysisResult {
  const agentCat = scoreAgentFile(agentFileMeta, agentFileContent?.content ?? null);
  const readmeCat = scoreReadme(readmeContent?.content ?? null);
  const contributingCat = scoreContributing(contributingContent?.content ?? null);

  const categories = [agentCat, readmeCat, contributingCat];
  const totalPoints = categories.reduce((s, c) => s + c.score, 0);
  const maxPoints = categories.reduce((s, c) => s + c.maxScore, 0);

  const rawScore = maxPoints > 0 ? (totalPoints / maxPoints) * 10 : 0;
  const score = Math.round(rawScore * 10) / 10;
  const { tier, label: tierLabel } = tierFromScore(score);

  // Top findings: signals that were found
  const topFindings: string[] = categories
    .flatMap((c) => c.signals.filter((s) => s.found && s.points >= 5).map((s) => `✓ ${s.label}`))
    .slice(0, 5);

  // Improvements: highest-impact missing signals
  const improvements: string[] = categories
    .flatMap((c) => c.signals.filter((s) => !s.found).map((s) => ({ ...s, catLabel: c.label })))
    .sort((a, b) => b.maxPoints - a.maxPoints)
    .slice(0, 5)
    .map((s) => `${s.label} (+${s.maxPoints} pts)`);

  return {
    repo: {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      description: repoData.description,
      stars: repoData.stargazers_count,
      language: repoData.language,
      defaultBranch: repoData.default_branch,
      repoUrl: repoData.html_url,
    },
    score,
    totalPoints,
    maxPoints,
    tier,
    tierLabel,
    categories,
    analyzedAt: new Date().toISOString(),
    topFindings,
    improvements,
  };
}
