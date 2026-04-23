import { factories } from "@strapi/strapi";

const PROJECT_UID = "api::project.project" as any;

const GITHUB_API_BASE = "https://api.github.com";
const COMMIT_ACTIVITY_RETRY_COUNT = 3;
const COMMIT_ACTIVITY_RETRY_DELAY_MS = 2000;
const REPO_SYNC_CONCURRENCY = 5;

type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  owner: {
    login: string;
  };
};

type GitHubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

type GitHubCommitActivityWeek = {
  week: number;
  total: number;
  days: number[];
};

const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];
  let index = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;

        results[currentIndex] = await mapper(items[currentIndex]);
      }
    },
  );

  await Promise.all(workers);
  return results;
};

export default factories.createCoreService(PROJECT_UID, ({ strapi }) => ({
  async syncProjects() {
    const githubToken = strapi.config.get<string>("server.githubToken");
    const githubOrg = strapi.config.get<string>("server.githubOrg") || "base42";

    if (!githubToken) {
      throw new Error("Missing GITHUB_TOKEN in environment");
    }

    const requestGitHub = async <T>(path: string): Promise<T> => {
      const response = await fetch(`${GITHUB_API_BASE}${path}`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubToken}`,
          "User-Agent": "base42-cms-project-sync",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(
          `GitHub request failed (${response.status}) for ${path}: ${bodyText}`,
        );
      }

      return (await response.json()) as T;
    };

    const requestCommitActivity = async (
      repoName: string,
    ): Promise<GitHubCommitActivityWeek[]> => {
      const path = `/repos/${githubOrg}/${repoName}/stats/commit_activity`;

      for (
        let attempt = 0;
        attempt <= COMMIT_ACTIVITY_RETRY_COUNT;
        attempt += 1
      ) {
        const response = await fetch(`${GITHUB_API_BASE}${path}`, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${githubToken}`,
            "User-Agent": "base42-cms-project-sync",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (response.status === 202 && attempt < COMMIT_ACTIVITY_RETRY_COUNT) {
          await sleep(COMMIT_ACTIVITY_RETRY_DELAY_MS);
          continue;
        }

        if (!response.ok) {
          const bodyText = await response.text();
          throw new Error(
            `Commit activity request failed (${response.status}) for ${repoName}: ${bodyText}`,
          );
        }

        return (await response.json()) as GitHubCommitActivityWeek[];
      }

      return [];
    };

    const repos = await requestGitHub<GitHubRepo[]>(
      `/orgs/${githubOrg}/repos?per_page=100&sort=pushed&direction=desc&type=public`,
    );

    const syncStartedAt = new Date().toISOString();
    let syncedCount = 0;
    let failedCount = 0;

    await mapWithConcurrency(repos, REPO_SYNC_CONCURRENCY, async (repo) => {
      try {
        const [pulls, issues, contributors, commitActivity] = await Promise.all(
          [
            requestGitHub<unknown[]>(
              `/repos/${githubOrg}/${repo.name}/pulls?state=open&per_page=100`,
            ),
            requestGitHub<unknown[]>(
              `/repos/${githubOrg}/${repo.name}/issues?labels=help-wanted&state=open&per_page=100`,
            ),
            requestGitHub<GitHubContributor[]>(
              `/repos/${githubOrg}/${repo.name}/contributors?per_page=10`,
            ),
            requestCommitActivity(repo.name),
          ],
        );

        const helpWantedCount = issues.filter(
          (issue) => !(issue as { pull_request?: unknown }).pull_request,
        ).length;

        const normalizedContributors = contributors.map((contributor) => ({
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          contributions: contributor.contributions,
        }));

        const data = {
          github_repo_id: String(repo.id),
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          owner_login: repo.owner.login,
          pushed_at: repo.updated_at,
          pr_count: pulls.length,
          help_wanted_count: helpWantedCount,
          contributors: normalizedContributors,
          commit_activity: commitActivity,
          last_synced_at: syncStartedAt,
        };

        const existingDraft = await strapi.documents(PROJECT_UID).findMany({
          filters: { github_repo_id: String(repo.id) },
          fields: ["documentId"],
          status: "draft",
        } as any);

        const existingPublished =
          existingDraft.length > 0
            ? []
            : await strapi.documents(PROJECT_UID).findMany({
                filters: { github_repo_id: String(repo.id) },
                fields: ["documentId"],
                status: "published",
              } as any);

        const existing = existingDraft[0] ?? existingPublished[0];

        if (existing) {
          await strapi.documents(PROJECT_UID).update({
            documentId: existing.documentId,
            data,
            status: "published",
          } as any);
        } else {
          await strapi.documents(PROJECT_UID).create({
            data,
            status: "published",
          } as any);
        }

        syncedCount += 1;
      } catch (error) {
        failedCount += 1;
        strapi.log.error(`Failed to sync repo ${repo.name}`, error);
      }
    });

    return {
      total_repos: repos.length,
      synced_repos: syncedCount,
      failed_repos: failedCount,
      synced_at: syncStartedAt,
    };
  },
}));
