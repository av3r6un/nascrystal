import { callFastApiAsUser } from '@@/server/services/auth.service';

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
    const response = await callFastApiAsUser<FastApiPurchaseResponse>(event, `/api/purchases/${id}`, {
      method: 'PATCH',
      body,
      timeout: 65000,
    });

    return response.body;
  }
  catch (error) {
    const failure = error as { statusCode?: number; data?: { data?: { message?: string }; message?: string; errors?: { message?: string }[] } };
    const message = failure.data?.errors?.[0]?.message || failure.data?.data?.message || failure.data?.message;
    throw createError({
      statusCode: failure.statusCode || 502,
      statusMessage: 'Failed to update purchase',
      data: { message: message || 'Не удалось сохранить заказ и данные СДЭК' },
    });
  }
});
