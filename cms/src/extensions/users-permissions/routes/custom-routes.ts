
export default {
  routes: [
    {
      method: 'PUT',
      path: '/profile/update',
      handler: 'user.updateProfile',
      config: {
        prefix: '',
      },
    },
  ],
}
