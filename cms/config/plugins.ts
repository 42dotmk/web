export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'hello@42.mk',
        defaultReplyTo: 'hello@42.mk',
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 5 * 1024 * 1024,
      security: {
        allowedFileExtensions: [
          '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
          '.pdf', '.doc', '.docx', '.txt',
        ],
        blockedFileExtensions: [
          '.exe', '.dll', '.sh', '.bat', '.cmd', '.com',
          '.app', '.deb', '.rpm', '.dmg', '.pkg',
          '.js', '.ts', '.jsx', '.tsx', '.php', '.html',
        ],
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      },
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
      },
    },
  },
});
