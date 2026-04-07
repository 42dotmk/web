/**
 * user-event controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-event.user-event', ({ strapi }) => ({
  async markInterested(ctx) {
    const { userId, eventId, isInterested } = ctx.request.body;

    if (!userId || !eventId || isInterested === undefined) {
      return ctx.badRequest('userId, eventId, and isInterested are required');
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
          isInterested,
        },
      });
    } else {
      result = await strapi.documents('api::user-event.user-event').create({
        data: {
          user: userId,
          event: eventId,
          isInterested,
          hasAttended: false,
        },
      });
    }

    ctx.body = result;
  },

  async markAttended(ctx) {
    const { userId, eventId, hasAttended } = ctx.request.body;

    if (!userId || !eventId || hasAttended === undefined) {
      return ctx.badRequest('userId, eventId, and hasAttended are required');
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
          hasAttended,
        },
      });
    } else {
      // Create new record
      result = await strapi.documents('api::user-event.user-event').create({
        data: {
          user: userId,
          event: eventId,
          isInterested: false,
          hasAttended,
        },
      });
    }

    ctx.body = result;
  },
}));
