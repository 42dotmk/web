/**
 * Event FCM Notification Middleware (Strapi v5 Document Service Middleware)
 * Sends push notifications when events are created or published
 */

const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export const sendEventNotifications = async (strapi, event) => {
  try {
    const firebaseAdmin = strapi.firebaseAdmin;

    if (!firebaseAdmin) {
      strapi.log.warn('Firebase Admin not initialized');
      return;
    }

    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: {
        fcmToken: {
          $notNull: true,
          $ne: '',
        },
      },
      fields: ['id', 'fcmToken'],
    });

    if (!users || users.length === 0) {
      strapi.log.info('No users with FCM tokens found');
      return;
    }

    const fcmTokens = users
      .map(user => user.fcmToken)
      .filter(token => token && token.trim() !== '');

    if (fcmTokens.length === 0) {
      strapi.log.info('No valid FCM tokens found');
      return;
    }

    const eventTitle = stripHtmlTags(event.title) || 'New Event';
    const eventSummary = event.summary || stripHtmlTags(event.description) || 'Check out our new event!';

    const truncatedSummary = eventSummary.length > 100
      ? eventSummary.substring(0, 100) + '...'
      : eventSummary;

    const message = {
      notification: {
        title: 'New Event in Base42: ' + eventTitle,
        body: truncatedSummary,
      },
      data: {
        eventId: (event.documentId || event.id).toString(),
        eventSlug: event.slug || '',
        type: 'new_event',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: fcmTokens,
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

    strapi.log.info(
      `FCM Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`
    );

    if (response.failureCount > 0) {
      const cleanupPromises = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          const userId = users[idx].id;
          const token = fcmTokens[idx];

          strapi.log.warn(`Failed to send to user ${userId}, token: ${token}, error: ${resp.error?.message}`);

          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            strapi.log.info(`Removing permanently invalid FCM token for user ${userId}`);
            cleanupPromises.push(
              strapi.entityService.update(
                'plugin::users-permissions.user',
                userId,
                { data: { fcmToken: null } }
              )
            );
          } else {
            strapi.log.warn(`Temporary error for user ${userId}, keeping token for retry`);
          }
        }
      });

      if (cleanupPromises.length > 0) {
        await Promise.allSettled(cleanupPromises);
      }
    }

  } catch (error) {
    strapi.log.error('Error sending FCM notifications:', error);
  }
};

export const eventNotificationMiddleware = () => {
  return async (context, next) => {
    if (context.uid !== 'api::event.event') {
      return await next();
    }

    const result = await next();

    if (context.action === 'publish' && (result?.documentId || result?.id)) {
      try {
        const locale = result?.locale || context.params?.locale || 'en';

        const publishedEvent = await strapi.documents('api::event.event').findOne({
          documentId: result.documentId || result.id,
          locale: locale,
          status: 'published',
        });

        if (publishedEvent?.publishedAt) {
          await sendEventNotifications(strapi, publishedEvent);
        }
      } catch (error) {
        strapi.log.error(`[Event Middleware] Error fetching published event:`, error);
      }
    } else if (context.action === 'create' && result?.publishedAt) {
      await sendEventNotifications(strapi, result);
    } else {
      strapi.log.info(`[Event Middleware] Notification NOT sent - Action: ${context.action}, Published: ${!!result?.publishedAt}`);
    }

    return result;
  };
};
