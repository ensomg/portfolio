import { site } from "./site";

export type Project = {
  name: string;
  description: string | null;
  href: string;
  language: string | null;
  stars: number;
};

type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
};

/** How many fit on one screen without the page ever needing to scroll. */
export const MAX_PROJECTS = 6;

/**
 * Hand-picked entries from `site.projects` when there are any; otherwise the
 * most recently pushed public repos. Forks and archived repos are dropped —
 * they are not work anyone came here to see.
 */
export async function getProjects(): Promise<Project[]> {
  if (site.projects.length > 0) {
    return site.projects.slice(0, MAX_PROJECTS).map((project) => ({
      name: project.name,
      description: project.description ?? null,
      href: project.href,
      language: null,
      stars: 0,
    }));
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${site.github.handle}/repos?sort=pushed&per_page=30`,
      {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "ensomg.sh personal site" },
        next: { revalidate: 600 },
      },
    );
    if (!response.ok) throw new Error(String(response.status));

    const repos = (await response.json()) as GithubRepo[];
    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .slice(0, MAX_PROJECTS)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        href: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
      }));
  } catch {
    return [];
  }
}
