export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.cron.add({
      cleanupPastEventInterest: {
        task: async ({ strapi }) => {
          const now = new Date();

          const pastEvents = await strapi.db.query('api::event.event').findMany({
            where: {
              start: {
                $lt: now,
              },
            },
            select: ['id'],
          });

          const pastEventIds = pastEvents.map(event => event.id);

          if (pastEventIds.length > 0) {
            const deleted = await strapi.db.query('api::user-event.user-event').deleteMany({
              where: {
                event: {
                  id: {
                    $in: pastEventIds,
                  },
                },
                hasAttended: false,
              },
            });

            strapi.log.info(`Cleaned up ${deleted.count || 0} user-event records for past events`);
          }
        },
        options: {
          rule: '0 2 * * *',
        },
      },
    });
  },
};
