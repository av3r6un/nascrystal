import { callFastApiAsNitro } from '@@/server/services/auth.service';

type PurchaseItemPayload = {
  id?: unknown;
  properties?: unknown;
  quantity?: {
    value?: unknown;
    max?: unknown;
  };
};

type CustomerPayload = {
  name?: unknown;
  phone?: unknown;
  username?: string;
  email?: string;
};

type PurchasePayload = {
  customer?: CustomerPayload;
  delivery?: unknown;
  items?: PurchaseItemPayload[];
  price?: unknown;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isPositiveInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export default defineEventHandler(async (event) => {
  const body = await readBody<PurchasePayload>(event);

  if (
    !isNonEmptyString(body?.customer?.name)
    || !isNonEmptyString(body?.customer?.phone)
    || !isRecord(body.delivery)
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
        customer: {
          name: body.customer.name.trim(),
          phone: body.customer.phone.trim(),
          username: isNonEmptyString(body.customer.username) ? body.customer.username.trim() : undefined,
          email: isNonEmptyString(body.customer.email) ? body.customer.email.trim() : undefined,
        },
        delivery: body.delivery,
        items,
        price: body.price,
      },
    });

    return response?.body;
  }
  catch (error) {
    console.error('FastAPI purchase request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to create purchase',
    });
  }
});
