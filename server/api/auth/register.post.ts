import { registerUser } from '../../services/auth.service';

type RegisterPayload = {
  email: string;
  password: string;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<RegisterPayload>>(event);

  if (!isNonEmptyString(body.email) || !isNonEmptyString(body.password)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    });
  }

  await registerUser(event, {
    email: body.email.trim(),
    password: body.password.trim(),
  });

  return { success: true };
});
