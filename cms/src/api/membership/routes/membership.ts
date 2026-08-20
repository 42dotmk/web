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
    {
      method: 'POST',
      path: '/memberships/create-checkout',
      handler: 'membership.createCheckoutSession',
      config: {
        prefix: '',
      },
    },
    {
      method: 'POST',
      path: '/memberships/portal',
      handler: 'membership.createPortalSession',
      config: {
        prefix: '',
      },
    },
    {
      method: 'POST',
      path: '/memberships/webhook',
      handler: 'membership.webhook',
      config: {
        prefix: '',
        auth: false,
      },
    },
  ],
};
