import cronTasks from './cron-tasks';

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  githubToken: env('PROJECTS_TOKEN'),
  githubOrg: env('PROJECTS_ORG', 'base42'),
  projectSyncSecret: env('PROJECT_SYNC_SECRET'),
  cron: {
    enabled: true,
    tasks: {
      ...cronTasks,
    },
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
