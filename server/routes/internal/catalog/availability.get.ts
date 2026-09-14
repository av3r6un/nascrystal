import { callFastApiAsNitro } from '@@/server/services/auth.service';

type AvailabilityBody = {
  available?: Record<string, string[]>;
  k9_category_ids?: string[];
};

type AvailabilityEnvelope = {
  status?: string;
  body?: AvailabilityBody;
};

export default defineEventHandler(async (event) => {
  const requestQuery = getQuery(event);
  const allowedKeys = ['category', 'fixation', 'cuts', 'size', 'color', 'form', '0', '1', '2', '3', '4'];
  const query = Object.fromEntries(
    allowedKeys
      .filter(key => requestQuery[key] !== undefined && requestQuery[key] !== '')
      .map(key => [key, requestQuery[key]]),
  );

  try {
    const response = await callFastApiAsNitro<AvailabilityEnvelope>(event, '/api/stock/availability', {
      method: 'GET',
      query,
    });
    return {
      available: response.body?.available ?? {},
      k9CategoryIds: response.body?.k9_category_ids ?? [],
    };
  }
  catch (error) {
    console.error('FastAPI catalog availability request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load catalog availability',
    });
  }
});
