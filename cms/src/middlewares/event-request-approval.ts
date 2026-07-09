export const eventRequestApprovalMiddleware = () => {
  return async (context, next) => {
    if (context.uid !== 'api::event.event') {
      return await next();
    }

    const result = await next();

    if (context.action === 'publish' && result?.documentId) {
      try {
        const request = await strapi.db.query('api::event-request.event-request').findOne({
          where: {
            event: { documentId: result.documentId },
          },
        });

        if (request && request.status !== 'approved') {
          await strapi.documents('api::event-request.event-request').update({
            documentId: request.documentId,
            data: { status: 'approved' } as Record<string, unknown>,
          });

          const reqDetails = await strapi.db.query('api::event-request.event-request').findOne({
            where: { documentId: request.documentId },
          });

          if (reqDetails?.initiatorEmail) {
            await strapi.plugins['email'].services.email.send({
              to: reqDetails.initiatorEmail,
              from: 'hello@42.mk',
              replyTo: 'hello@42.mk',
              subject: 'Your event has been approved! - 42.mk',
              html: `
                <p>Great news! Your event request "<strong>${reqDetails.eventName}</strong>" has been approved and is now published.</p>
                <p>You can view it on our platform.</p>
                <p>Best regards,<br/>42.mk Team</p>
              `,
            });
          }
        }
      } catch (error) {
        strapi.log.error('[Event Request Approval] Error syncing status after publish:', error);
      }
    }

    return result;
  };
};