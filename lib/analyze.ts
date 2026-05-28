import { AnalysisResult } from "@/types";
import { fetchRepo, fetchTree, fetchFileContent, findFile } from "./github";
import { findBestAgentFile, scoreRepo } from "./scorer";

const README_CANDIDATES = ["README.md", "README.rst", "README.txt", "readme.md"];
const CONTRIBUTING_CANDIDATES = [
  "CONTRIBUTING.md",
  ".github/CONTRIBUTING.md",
  "docs/CONTRIBUTING.md",
  "contributing.md",
];

export async function analyzeRepo(owner: string, repo: string): Promise<AnalysisResult> {
  const repoData = await fetchRepo(owner, repo);
  const files = await fetchTree(owner, repo, repoData.default_branch);

  const agentFileMeta = findBestAgentFile(files);
  const readmeFile = findFile(files, README_CANDIDATES);
  const contributingFile = findFile(files, CONTRIBUTING_CANDIDATES);

  const [agentContent, readmeContent, contributingContent] = await Promise.all([
    agentFileMeta ? fetchFileContent(owner, repo, agentFileMeta.path) : Promise.resolve(null),
    readmeFile ? fetchFileContent(owner, repo, readmeFile.path) : Promise.resolve(null),
    contributingFile ? fetchFileContent(owner, repo, contributingFile.path) : Promise.resolve(null),
  ]);

  return scoreRepo(
    owner,
    repo,
    repoData,
    agentFileMeta,
    agentContent,
    readmeContent,
    contributingContent
  );
}
