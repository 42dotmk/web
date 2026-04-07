/**
 * user-event router
 */

import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::user-event.user-event');
const customRoutes = [
  {
    method: 'POST',
    path: '/user-events/mark-interested',
    handler: 'user-event.markInterested',
  },
  {
    method: 'POST',
    path: '/user-events/mark-attended',
    handler: 'user-event.markAttended',
  },
];

export default {
  routes: [
    ...(typeof defaultRouter.routes === 'function' ? defaultRouter.routes() : defaultRouter.routes),
    ...customRoutes,
  ]
};
