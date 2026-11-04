import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const response = await callFastApiAsNitro<{ body: unknown }>(event, '/api/delivery/modules');
  return response.body;
});
