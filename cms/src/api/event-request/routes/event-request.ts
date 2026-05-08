/**
 * event-request router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/event-requests/:id/approve',
      handler: 'event-request.approve',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
