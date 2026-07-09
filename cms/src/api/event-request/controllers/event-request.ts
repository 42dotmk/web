/**
 * event-request controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::event-request.event-request', ({ strapi }) => ({
  async approve(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const { id } = ctx.params;

        const request = (await strapi.documents('api::event-request.event-request').findOne({
      documentId: id,
      populate: { event: true } as never,
    })) as {
      documentId: string;
      status?: string;
      initiatorEmail?: string;
      eventName?: string;
      event?: { documentId: string } | null;
    } | null; 

    if (!request) {
      return ctx.notFound('Event request not found');
    }

    if (!request.event) {
      return ctx.badRequest('No linked draft event found');
    }

    if (request.status === 'approved') {
      return ctx.badRequest('Event request already approved');
    }

    try {
      await strapi.documents('api::event.event').publish({
        documentId: request.event.documentId,
      });

      await strapi.documents('api::event-request.event-request').update({
        documentId: id,
        data: { status: 'approved' } as Record<string, unknown>,
      });

      await strapi.plugins['email'].services.email.send({
        to: request.initiatorEmail,
        from: 'hello@42.mk',
        replyTo: 'hello@42.mk',
        subject: 'Your event has been approved! - 42.mk',
        html: `
          <p>Great news! Your event request "<strong>${request.eventName}</strong>" has been approved and is now published.</p>
          <p>You can view it on our platform.</p>
          <p>Best regards,<br/>42.mk Team</p>
        `,
      });

      ctx.body = { message: 'Event request approved' };
    } catch (error) {
      strapi.log.error('Error approving event request:', error);
      ctx.status = 500;
      ctx.body = { error: { message: 'Failed to approve event request' } };
    }
  },
}));
