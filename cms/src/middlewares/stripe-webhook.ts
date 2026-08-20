import { PassThrough } from 'stream';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.path === '/api/memberships/webhook' && ctx.method === 'POST') {
      const chunks = [];
      for await (const chunk of ctx.req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks);
      ctx.state.rawBody = rawBody;

      const stream: any = new PassThrough();
      stream.push(rawBody);
      stream.push(null);
      stream.headers = ctx.req.headers;
      stream.httpVersion = ctx.req.httpVersion;
      stream.method = ctx.req.method;
      stream.url = ctx.req.url;

      ctx.req = stream;
    }
    await next();
  };
};
