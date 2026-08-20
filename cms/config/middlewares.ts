export default [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  { name: 'global::stripe-webhook', config: {} },
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
