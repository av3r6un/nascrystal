import { refreshUser } from '../../services/auth.service';

type RefreshPayload = {
  refreshToken: string;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<RefreshPayload>>(event);

  if (!isNonEmptyString(body.refreshToken)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token is required',
    });
  }

  const session = await refreshUser(event, body.refreshToken.trim());

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken ?? body.refreshToken.trim(),
    expiresAt: session.expiresAt,
  };
});
