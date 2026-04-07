module.exports = (plugin) => {
  const userAttributes = plugin.contentTypes.user.schema.attributes;

  userAttributes.firstName = {
    type: 'string',
  };

  userAttributes.lastName = {
    type: 'string',
  };

  userAttributes.profilePicture = {
    type: 'media',
    allowedTypes: ['images'],
    multiple: false,
  };

  userAttributes.userEvents = {
    type: 'relation',
    relation: 'oneToMany',
    target: 'api::user-event.user-event',
    mappedBy: 'user',
  };

  return plugin;
};
