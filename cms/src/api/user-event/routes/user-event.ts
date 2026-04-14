/**
 * user-event router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/user-events/change-status',
      handler: 'user-event.changeStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
