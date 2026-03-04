import { loginUser } from '@@/server/services/auth.service';

type LoginPayload = {
  email: string;
  password: string;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<LoginPayload>>(event);

  if (!isNonEmptyString(body.email) || !isNonEmptyString(body.password)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    });
  }

  const session = await loginUser(event, {
    email: body.email.trim(),
    password: body.password.trim(),
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  };
});
