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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  async me(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const user = await strapi.documents('plugin::users-permissions.user').findOne({
      documentId: ctx.state.user.documentId,
      populate: ['role', 'profilePicture', 'memberships'],
    });

    if (!user) return ctx.notFound();

    const userSchema = strapi.contentType('plugin::users-permissions.user');
    const sanitizedUser = await strapi.contentAPI.sanitize.output(user, userSchema, {
      auth: ctx.state.auth ?? {},
    });
    ctx.body = sanitizedUser;
  },

  async volunteerApply(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const user = ctx.state.user;
    const body = ctx.request.body;

    if (!body || typeof body !== 'object') {
      ctx.status = 400;
      ctx.body = { error: { message: 'Invalid request body' } };
      return;
    }

    const { skills, message } = body;

    if (typeof skills !== 'string' || !skills.trim()) {
      ctx.status = 400;
      ctx.body = { error: { message: 'Skills must be a non-empty string' } };
      return;
    }
    if (typeof message !== 'string' || !message.trim()) {
      ctx.status = 400;
      ctx.body = { error: { message: 'Message must be a non-empty string' } };
      return;
    }

    const MAX_LEN = 5000;
    if (skills.length > MAX_LEN || message.length > MAX_LEN) {
      ctx.status = 400;
      ctx.body = { error: { message: 'Skills or message exceed maximum length' } };
      return;
    }

    const applicantName = (
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
      || user.username
    );
    const applicantEmail = user.email;

    const applicationHtml = `
      <p><strong>Name:</strong> ${escapeHtml(applicantName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(applicantEmail)}</p>
      <p><strong>Skills & Interests:</strong> ${escapeHtml(skills)}</p>
      <p><strong>Why they want to volunteer:</strong></p>
      <p>${escapeHtml(message)}</p>
    `;

    try {
      // Confirmation to the applicant
      await strapi.plugins['email'].services.email.send({
        to: applicantEmail,
        from: 'hello@42.mk',
        replyTo: 'hello@42.mk',
        subject: 'Your volunteer application has been received! - 42.mk',
        html: `Thank you for applying to volunteer at Base42! We'll review your application and get back to you soon.
        <br/><br/>
        Here's a copy of your application:
        <br/><br/>
        ${applicationHtml}
      `,
      });

      // Notification to admin
      await strapi.plugins['email'].services.email.send({
        to: 'hello@42.mk',
        from: 'hello@42.mk',
        replyTo: applicantEmail,
        subject: `New volunteer application from ${applicantName}`,
        html: `A new volunteer application has been submitted. Here are the details:
        <br/><br/>
        ${applicationHtml}
      `,
      });

      ctx.body = { ok: true, message: 'Volunteer application submitted successfully' };
    } catch (error) {
      strapi.log.error(`Volunteer application email failed: ${error}`);

      try {
        await strapi.plugins['email'].services.email.send({
          to: 'hello@42.mk',
          from: 'hello@42.mk',
          subject: '[ERROR] Volunteer application email failed',
          html: `<p>An error occurred while sending volunteer application emails.</p>
          <p><strong>Error:</strong> ${error.message || String(error)}</p>
          <p><strong>Stack:</strong></p>
          <pre>${error.stack || 'No stack trace available'}</pre>
          <p><strong>Applicant name:</strong> ${escapeHtml(applicantName)}</p>
          <p><strong>Applicant email:</strong> ${escapeHtml(applicantEmail)}</p>
        `,
        });
      } catch (emailError) {
        strapi.log.error('Failed to send error notification email:', emailError);
      }

      ctx.status = 500;
      ctx.body = {
        error: {
          message: 'Failed to submit volunteer application. Please try again later.',
        }
      };
    }
  },

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

      const userSchema = strapi.contentType('plugin::users-permissions.user');
      const sanitizedUser = await strapi.contentAPI.sanitize.output(updated, userSchema, {
        auth: ctx.state.auth ?? {},
      });
      ctx.body = sanitizedUser;
    } catch (error) {
      return ctx.internalServerError('Failed to update profile');
    }
  },

  async saveFcmToken(ctx) {
    if (!ctx.state.user) {
      return ctx.unauthorized('You must be logged in');
    }
    const token = ctx.request.body.token || ctx.request.body.fcmToken;

    if (!token) {
      strapi.log.warn(`No FCM token provided. Body: ${JSON.stringify(ctx.request.body)}`);
      return ctx.badRequest('FCM token is required');
    }

    await strapi.entityService.update(
      'plugin::users-permissions.user',
      ctx.state.user.id,
      { data: { fcmToken: token } }
    );

    ctx.body = { ok: true };
  },
};
