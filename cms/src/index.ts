'use strict';
const admin = require('firebase-admin');
import fs from 'fs/promises';
import { eventNotificationMiddleware } from './middlewares/event-notifications';

const FIREBASE_FCM_CREDENTIALS_PATH = './base42-mobile-app-fcm-firebase-adminsdk.json';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    strapi.documents.use(eventNotificationMiddleware());

    strapi.plugin('users-permissions').controllers.auth.saveFcmToken = async (ctx) => {
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in');
      }
      const token = ctx.request.body.token || ctx.request.body.fcmToken;

      if (!token) {
        strapi.log.warn(`No FCM token provided. Body: ${JSON.stringify(ctx.request.body)}`);
        return ctx.badRequest('FCM token is required');
      }

      await strapi.entityService.update(
        'plugin::users-permissions.user',
        ctx.state.user.id,
        { data: { fcmToken: token } }
      );

      ctx.body = { ok: true };
    };

    strapi.plugin('users-permissions').routes['content-api'].routes.push({
      method: 'POST',
      path: '/auth/fcmToken',
      handler: 'auth.saveFcmToken',
      config: {
        prefix: '',
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      if (!admin.apps.length) {
        const serviceAccountJson = await fs.readFile(FIREBASE_FCM_CREDENTIALS_PATH, 'utf-8');
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        strapi.log.info('Firebase Admin SDK initialized successfully');
      }

      strapi.firebaseAdmin = admin;
    } catch (err) {
      strapi.log.error('Failed to initialize Firebase Admin SDK:', err);
    }
  },
};
