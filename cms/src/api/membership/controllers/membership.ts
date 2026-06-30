import { factories } from '@strapi/strapi';

const UID = 'api::membership.membership';

export default factories.createCoreController(UID, ({ strapi }) => ({
  async me(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const memberships = await strapi.documents(UID).findMany({
      filters: { user: { documentId: ctx.state.user.documentId } },
      sort: { startDate: 'desc' },
      populate: [],
    });

    const active = memberships.find((m: any) => m.status === 'active');

    ctx.body = {
      memberships,
      active: active || null,
    };
  },
}));
