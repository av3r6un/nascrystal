import { callFastApiAsNitro } from '@@/server/services/auth.service';

type PurchaseUpdatePayload = {
  [key: string]: unknown;
};

type FastApiPurchaseResponse = {
  body: unknown;
};

export default defineEventHandler(async (event) => {
  const id = getQuery(event).id;
  const body = await readBody<PurchaseUpdatePayload>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase ID is required',
    });
  }

  try {
    const response = await callFastApiAsNitro<FastApiPurchaseResponse>(event, `/api/purchases/${id}`, {
      method: 'PATCH',
      body,
      timeout: 65000,
    });

    return response.body;
  }
  catch (error) {
    console.error('FastAPI purchase update request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to update purchase',
    });
  }
});
