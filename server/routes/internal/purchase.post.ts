import { callFastApiAsNitro } from '@@/server/services/auth.service';

type PurchaseUpdatePayload = {
  delivery?: {
    type?: unknown;
    address?: unknown;
    price?: unknown;
    cost?: unknown;
  };
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isFiniteNonNegativeNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
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

  const delivery = body?.delivery;
  const deliveryType = delivery?.type;
  const deliveryAddress = delivery?.address;
  const deliveryCost = delivery?.cost ?? delivery?.price;

  if (
    !isNonEmptyString(deliveryType)
    || !isNonEmptyString(deliveryAddress)
    || !isFiniteNonNegativeNumber(deliveryCost)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid purchase payload',
    });
  }

  try {
    const fastApiBody = {
      delivery: {
        type: deliveryType.trim(),
        address: deliveryAddress.trim(),
        cost: deliveryCost,
      },
    };

    const response = await callFastApiAsNitro(event, `/api/purchases/${id}`, {
      method: 'PATCH',
      body: fastApiBody,
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
