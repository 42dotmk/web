
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
    {
      method: 'POST',
      path: '/auth/fcmToken',
      handler: 'user.saveFcmToken',
      config: {
        prefix: '',
      },
    },
  ],
}
