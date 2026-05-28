export interface ScoringSignal {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  found: boolean;
  detail?: string;
}

export interface ScoreCategory {
  id: string;
  label: string;
  icon: string;
  subtitle?: string;
  score: number;
  maxScore: number;
  signals: ScoringSignal[];
}

export type ScoreTier = "elite" | "ready" | "developing" | "minimal" | "not-ready";

export interface RepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  defaultBranch: string;
  repoUrl: string;
}

export interface AnalysisResult {
  repo: RepoInfo;
  score: number;
  totalPoints: number;
  maxPoints: number;
  tier: ScoreTier;
  tierLabel: string;
  categories: ScoreCategory[];
  analyzedAt: string;
  topFindings: string[];
  improvements: string[];
}
