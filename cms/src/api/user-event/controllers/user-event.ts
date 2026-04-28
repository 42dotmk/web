/**
 * user-event controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-event.user-event', ({ strapi }) => ({
  ...factories.createCoreController('api::user-event.user-event'),
  async changeStatus(ctx) {
    const { userId, eventId, attendanceStatus } = ctx.request.body;

    if (!userId || !eventId || attendanceStatus === undefined) {
      return ctx.badRequest('userId, eventId, and attendanceStatus are required');
    }

    const existingRecord = await strapi.db.query('api::user-event.user-event').findOne({
      where: {
        user: userId,
        event: eventId,
      },
    });

    let result;
    if (existingRecord) {
      result = await strapi.documents('api::user-event.user-event').update({
        documentId: existingRecord.documentId,
        data: {
          attendanceStatus,
        },
      });
    } else {
      result = await strapi.documents('api::user-event.user-event').create({
        data: {
          user: userId,
          event: eventId,
          attendanceStatus,
        },
      });
    }

    ctx.body = result;
  },
  async findByUser(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized();

    const userEvents = await strapi.db.query('api::user-event.user-event').findMany({
      where: { user: { id: userId } },
      populate: { event: true },
    });

    ctx.body = {
      data: userEvents.map((ue) => ({
        eventId: ue.event?.id ?? null,
        attendanceStatus: ue.attendanceStatus,
      })),
    };
  },
}));
