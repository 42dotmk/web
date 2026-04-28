import { factories } from "@strapi/strapi";

const PROJECT_UID = "api::project.project" as any;

const PROJECT_PUBLIC_FIELDS = [
  "name",
  "description",
  "language",
  "stargazers_count",
  "owner_login",
  "pushed_at",
  "pr_count",
  "help_wanted_count",
  "contributors",
  "commit_activity",
  "last_synced_at",
] as const;

export default factories.createCoreController(PROJECT_UID, ({ strapi }) => ({
  async find(ctx) {
    const baseQuery = await this.sanitizeQuery(ctx);

    const sanitizedQuery = {
      ...baseQuery,
      fields: [...PROJECT_PUBLIC_FIELDS],
      sort: baseQuery.sort ?? ["stargazers_count:desc", "pushed_at:desc"],
      pagination: baseQuery.pagination ?? { pageSize: 100 },
    };

    const { results, pagination } = await strapi
      .service(PROJECT_UID)
      .find(sanitizedQuery);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },

  async sync(ctx) {
    const headerSecret = ctx.request.headers["x-project-sync-secret"];
    const configuredSecret = strapi.config.get("server.projectSyncSecret");

    if (!configuredSecret || headerSecret !== configuredSecret) {
      return ctx.unauthorized("Invalid sync secret");
    }

    const result = await strapi.service(PROJECT_UID).syncProjects();
    ctx.body = result;
  },
}));
