import customRoutes from "./routes/custom-routes";
import userController from './controllers/user';

module.exports = (plugin) => {
  const userAttributes = plugin.contentTypes.user.schema.attributes;

  userAttributes.fcmToken = {
    type: 'string',
    private: true,
  };

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

  plugin.controllers.user.updateProfile = userController.updateProfile;
  plugin.controllers.user.saveFcmToken = userController.saveFcmToken;

  plugin.routes['content-api'].routes.push(...customRoutes.routes);

  return plugin;
};
