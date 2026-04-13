/**
 * user-event router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/user-events/mark-interested',
      handler: 'user-event.markInterested',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/user-events/mark-attended',
      handler: 'user-event.markAttended',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
