import { callFastApiAsNitro } from '../services/auth.service';

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<ContactPayload>>(event);

  if (!isNonEmptyString(body.name) || !isNonEmptyString(body.email) || !isNonEmptyString(body.message)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid contact form payload',
    });
  }

  try {
    const response = await callFastApiAsNitro(event, '/api/feedback/', {
      method: 'POST',
      body: {
        name: body.name.trim(),
        email: body.email.trim(),
        message: body.message.trim(),
      },
    });

    return response;
  }
  catch (error) {
    console.error('FastAPI contact request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to send feedback',
    });
  }
});
