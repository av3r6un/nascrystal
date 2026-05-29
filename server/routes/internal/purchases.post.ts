import { callFastApiAsNitro } from '@@/server/services/auth.service';

type PurchaseItemPayload = {
  id?: unknown;
  properties?: unknown;
  quantity?: {
    value?: unknown;
    max?: unknown;
  };
};

type PurchasePayload = {
  delivery?: unknown;
  items?: PurchaseItemPayload[];
  name?: unknown;
  payment?: unknown;
  phone?: unknown;
  price?: unknown;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isPositiveInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<PurchasePayload>(event);

  if (
    !isNonEmptyString(body.name)
    || !isNonEmptyString(body.phone)
    || !isNonEmptyString(body.delivery)
    || !isNonEmptyString(body.payment)
    || !Array.isArray(body.items)
    || body.items.length === 0
    || typeof body.price !== 'number'
    || !Number.isFinite(body.price)
    || body.price < 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid purchase payload',
    });
  }

  const items = body.items.map((item) => {
    if (!isPositiveInteger(item.id) || !isPositiveInteger(item.quantity?.value)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid purchase item payload',
      });
    }

    return {
      id: item.id,
      properties: Array.isArray(item.properties)
        ? item.properties.filter((property): property is string => typeof property === 'string')
        : [],
      quantity: {
        value: item.quantity.value,
        max: typeof item.quantity.max === 'number' && Number.isInteger(item.quantity.max)
          ? item.quantity.max
          : undefined,
      },
    };
  });

  try {
    const response = await callFastApiAsNitro(event, '/api/purchases/', {
      method: 'POST',
      body: {
        name: body.name.trim(),
        phone: body.phone.trim(),
        delivery: body.delivery.trim(),
        payment: body.payment.trim(),
        items,
        price: body.price,
      },
    });

    return response;
  }
  catch (error) {
    console.error('FastAPI purchase request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to create purchase',
    });
  }
});
