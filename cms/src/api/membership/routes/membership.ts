export default {
  routes: [
    {
      method: 'GET',
      path: '/memberships/me',
      handler: 'membership.me',
      config: {
        prefix: '',
      },
    },
  ],
};
