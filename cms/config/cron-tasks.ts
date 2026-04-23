export default {
  '0 */2 * * *': async ({ strapi }) => {
    try {
      const result = await strapi.service('api::project.project' as any).syncProjects();
      strapi.log.info(
        `[Project Sync] Completed: ${result.synced_repos}/${result.total_repos} synced, ${result.failed_repos} failed`
      );
    } catch (error) {
      strapi.log.error('[Project Sync] Cron sync failed', error);
    }
  },
};
