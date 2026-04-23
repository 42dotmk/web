export default {
  routes: [
    {
      method: 'POST',
      path: '/projects/sync',
      handler: 'project.sync',
      config: {
        auth: false,
      },
    },
  ],
};
