const GITHUB_API = "https://api.github.com";

export interface GitHubRepo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  default_branch: string;
  html_url: string;
}

export interface TreeFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });
  if (res.status === 404) throw new Error("Repository not found");
  if (res.status === 403) throw new Error("GitHub API rate limit exceeded — try again in a minute");
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function fetchTree(owner: string, repo: string, branch: string): Promise<TreeFile[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: getHeaders(), next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.tree ?? []) as TreeFile[];
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<FileContent | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers: getHeaders(), next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  const data = await res.json();

  // File too large for inline content — GitHub omits `content` and provides download_url
  if (!data.content && data.download_url) {
    const rawRes = await fetch(data.download_url);
    if (!rawRes.ok) return null;
    const text = await rawRes.text();
    // Cap at 100KB to avoid blowing up context
    return { path, content: text.slice(0, 100_000), size: data.size ?? text.length };
  }

  if (!data.content) return null;
  const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  return { path, content, size: data.size ?? content.length };
}

// Find the first matching file from the tree (case-insensitive)
export function findFile(files: TreeFile[], candidates: string[]): TreeFile | null {
  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const found = files.find((f) => f.type === "blob" && f.path.toLowerCase() === lower);
    if (found) return found;
  }
  return null;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.trim().replace(/\.git$/, "").replace(/\/$/, "");

    // Bare "owner/repo" shorthand (no protocol or domain)
    if (/^[^/\s]+\/[^/\s]+$/.test(cleaned)) {
      const [owner, repo] = cleaned.split("/");
      return { owner, repo };
    }

    const u = new URL(cleaned.startsWith("http") ? cleaned : `https://${cleaned}`);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return token
    ? { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }
    : { "X-GitHub-Api-Version": "2022-11-28" };
}
