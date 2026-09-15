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
  items?: PurchaseItemPayload[];
  price?: unknown;
};

type FastApiPurchaseResponse = {
  body?: CreatePurchaseBody;
};

type CreatePurchaseBody = Record<string, unknown>;

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isPositiveInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<PurchasePayload>(event);
  const idempotencyKey = getHeader(event, 'Idempotency-Key');

  if (
    !isNonEmptyString(body?.customer?.name)
    || !isNonEmptyString(body?.customer?.phone)
    || !isNonEmptyString(body?.customer?.email)
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
    const response = await callFastApiAsNitro<FastApiPurchaseResponse>(event, '/api/purchases/', {
      method: 'POST',
      body: {
        customer: {
          name: body.customer.name.trim(),
          phone: body.customer.phone.trim(),
          username: isNonEmptyString(body.customer.username) ? body.customer.username.trim() : undefined,
          email: isNonEmptyString(body.customer.email) ? body.customer.email.trim() : undefined,
        },
        items,
        price: body.price,
      },
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      timeout: 65000,
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
