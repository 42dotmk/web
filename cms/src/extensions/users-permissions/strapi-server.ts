module.exports = (plugin) => {
  const userAttributes = plugin.contentTypes.user.schema.attributes;

  userAttributes.fcmToken = {
    type: 'string',
    private: true,
  };

  return plugin;
};
