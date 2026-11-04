type IntegrationModule = {
  code: string;
  name: string;
  type: string;
  enabled: boolean;
};

type IntegrationResponse = {
  items: Array<IntegrationModule>;
};

type ModulesBody = {
  status?: string;
  body: IntegrationResponse;
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header is required!' });
  }
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const { type, enabled } = getQuery(event);
  try {
    const response = await $fetch<ModulesBody>(`${baseUrl}/api/integrations/modules`, {
      method: 'GET',
      query: { type, enabled },
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: { Authorization: authHeader },
    });
    if (response.status !== 'success' || !response.body) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to load integration modules!' });
    }
    return response.body.items || [];
  }
  catch (error) {
    console.error('FastAPI integrations request failed!', error);
    throw createError({ statusCode: 502, statusMessage: 'Failed to load integration modules!' });
  }
});
