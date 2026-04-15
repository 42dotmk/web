interface UpdateProfileBody {
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: number;
}

const ALLOWED_FIELDS = ['username', 'firstName', 'lastName', 'profilePicture'];
const RESERVED_NAMES = ['admin', 'root', 'system', 'moderator', 'administrator'];
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const NAME_REGEX = /^[a-zA-Z\s\-'.]+$/;
const SANITIZE_REGEX = /[<>\"'&]/g;

function validateNameFields(fieldName: string, value: string, ctx: any) {
  if (typeof value !== 'string' || value.length === 0) {
    return ctx.badRequest(`${fieldName} cannot be empty`);
  } else if (value.length < 2) {
    return ctx.badRequest(`${fieldName} must be at least 2 characters`);
  } else if (value.length > 50) {
    return ctx.badRequest(`${fieldName} must be 50 characters or less`);
  } else if (!NAME_REGEX.test(value)) {
    return ctx.badRequest(`${fieldName} contains invalid characters`);
  }
}

function validateUsername(username: string, ctx: any) {
  if (!USERNAME_REGEX.test(username)) {
     return ctx.badRequest('Username must be 3-20 characters (lowercase letters, numbers, underscores only)');
  } else {
    if (RESERVED_NAMES.includes(username)) {
      return ctx.badRequest('This username is reserved');
    }
  }
}

function validateProfilePictureId(id: any, ctx: any) {
  if (typeof id !== 'number' || id <= 0 || isNaN(id)) {
    return ctx.badRequest('Invalid profile picture ID');
  }
}

export default {
  async updateProfile(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const body = ctx.request.body as UpdateProfileBody;
    const safeData = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    if (Object.keys(safeData).length === 0) {
      return ctx.badRequest('No valid fields to update');
    }

    if (safeData.username) {
      safeData.username = safeData.username.trim().toLowerCase();
      validateUsername(safeData.username, ctx);

      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { username: safeData.username },
      });
      if (existingUser && existingUser.id !== ctx.state.user.id) {
        return ctx.badRequest('Username is already taken');
      }
    }

    if (safeData.firstName) {
      safeData.firstName = safeData.firstName.trim();
      validateNameFields('First name', safeData.firstName, ctx);
      safeData.firstName = safeData.firstName.replace(SANITIZE_REGEX, '');
    }

    if (safeData.lastName) {
      safeData.lastName = safeData.lastName.trim();
      validateNameFields('Last name', safeData.lastName, ctx);
      safeData.lastName = safeData.lastName.replace(SANITIZE_REGEX, '');
    }

    if (typeof safeData.profilePicture === 'string' && safeData.profilePicture.trim() !== '') {
      safeData.profilePicture = parseInt(safeData.profilePicture, 10);
      validateProfilePictureId(safeData.profilePicture, ctx);

      try {
        const media = await strapi.db.query('plugin::upload.file').findOne({
          where: { id: safeData.profilePicture },
          select: ['id', 'name', 'mime', 'size'],
        });
        const maxSizeKB = 10 * 1024;

        if (!media) return ctx.badRequest('Profile picture not found');
        if (!media.mime.startsWith('image/')) return ctx.badRequest('Profile picture must be an image');
        if (media.size > maxSizeKB) return ctx.badRequest('Profile picture must be smaller than 10MB');
      } catch (error) {
        return ctx.internalServerError('Failed to validate profile picture');
      }
    }

    try {
      const updated = await strapi.documents('plugin::users-permissions.user').update({
        documentId: ctx.state.user.documentId,
        data: safeData,
      });

      const { password, resetPasswordToken, confirmationToken, ...safeUser } = updated;
      ctx.body = safeUser;
    } catch (error) {
      return ctx.internalServerError('Failed to update profile');
    }
  },
};
