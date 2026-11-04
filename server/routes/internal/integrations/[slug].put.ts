import { integrationRequest } from '@@/server/utils/integration-request';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug || !/^[a-z0-9_-]+$/.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid integration code' });
  }
  return integrationRequest(event, 'PUT', await readBody(event), slug);
});
