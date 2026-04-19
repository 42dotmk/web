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

    // Override the default Keycloak provider to fetch user info
    // from the Keycloak userinfo endpoint
    const registry = strapi
      .plugin('users-permissions')
      .service('providers-registry');

    const defaultKeycloakProvider = registry.get('keycloak');

    registry.add('keycloak', {
      ...defaultKeycloakProvider,
      async authCallback({ accessToken, providers, purest }) {
        const keycloak = purest({ provider: 'keycloak' });

        return keycloak
          .subdomain(providers.keycloak.subdomain)
          .get('protocol/openid-connect/userinfo')
          .auth(accessToken)
          .request()
          .then(({ body }) => ({
            username: body.preferred_username,
            email: body.email,
            firstName: body.given_name,
            lastName: body.family_name,
          }));
      },
    });

    strapi.documents.use(eventNotificationMiddleware());
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
