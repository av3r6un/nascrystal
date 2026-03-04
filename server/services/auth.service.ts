import type { H3Event } from 'h3';
import type { FetchOptions } from 'ofetch';

type Credentials = {
  email: string;
  password: string;
};

type ApiResponse<TBody> = {
  status?: string;
  body?: TBody;
};

type LoginBody = {
  tokens?: {
    accs_token?: string;
    rfsh_token?: string;
  };
  access_token?: string;
  token?: string;
  expires_in?: number;
};

type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

let nitroSession: AuthSession | null = null;
let nitroBootstrapDone = false;

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const getBaseUrl = (event?: H3Event) => {
  return useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
};

const buildUrl = (event: H3Event | undefined, path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl(event)}${normalizedPath}`;
};

const decodeJwtExpMs = (token: string): number | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  }
  catch {
    return null;
  }
};

const validateCredentials = (credentials: Credentials) => {
  if (!isNonEmptyString(credentials.email) || !isNonEmptyString(credentials.password)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    });
  }
};

const isSessionValid = (session: AuthSession | null) => {
  if (!session) return false;
  return session.expiresAt - 5000 > Date.now();
};

const getServiceCredentials = (): Credentials => {
  const email = process.env.NUXT_FASTAPI_SERVICE_EMAIL?.trim() ?? '';
  const password = process.env.NUXT_FASTAPI_SERVICE_PASSWORD?.trim() ?? '';

  if (!email || !password) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_FASTAPI_SERVICE_EMAIL and NUXT_FASTAPI_SERVICE_PASSWORD are required',
    });
  }

  return { email, password };
};

const parseSession = (response: ApiResponse<LoginBody>): AuthSession => {
  if (response.status !== 'success') {
    throw createError({
      statusCode: 502,
      statusMessage: 'FastAPI login response status is not success',
    });
  }

  const accessToken = response.body?.tokens?.accs_token
    ?? response.body?.access_token
    ?? response.body?.token;

  if (!isNonEmptyString(accessToken)) {
    throw createError({
      statusCode: 502,
      statusMessage: 'FastAPI login response does not include a token',
    });
  }

  const expiresAt = decodeJwtExpMs(accessToken) ?? Date.now() + (((response.body?.expires_in) ?? 3600) * 1000);
  const refreshToken = response.body?.tokens?.rfsh_token;

  return {
    accessToken,
    refreshToken: isNonEmptyString(refreshToken) ? refreshToken : undefined,
    expiresAt,
  };
};

const loginByCredentials = async (event: H3Event | undefined, credentials: Credentials) => {
  validateCredentials(credentials);

  const response = await $fetch<ApiResponse<LoginBody>>(buildUrl(event, '/api/auth/'), {
    method: 'POST',
    body: credentials,
  });

  return parseSession(response);
};

const registerByCredentials = async (event: H3Event | undefined, credentials: Credentials) => {
  validateCredentials(credentials);

  return await $fetch<ApiResponse<boolean>>(buildUrl(event, '/api/auth/register'), {
    method: 'POST',
    body: { ...credentials, role: 'internal' },
  });
};

const refreshByToken = async (event: H3Event | undefined, refreshToken: string) => {
  if (!isNonEmptyString(refreshToken)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token is required',
    });
  }

  const response = await $fetch<ApiResponse<LoginBody>>(buildUrl(event, '/api/auth/refresh'), {
    method: 'POST',
    body: {
      refresh_token: refreshToken,
      refreshToken,
    },
  });

  return parseSession(response);
};

export const bootstrapNitroAuth = async (event?: H3Event) => {
  if (nitroBootstrapDone) return;

  const credentials = getServiceCredentials();

  try {
    nitroSession = await loginByCredentials(event, credentials);
    nitroBootstrapDone = true;
    return;
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode !== 401 && statusCode !== 404) {
      throw error;
    }
  }

  try {
    await registerByCredentials(event, credentials);
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode !== 400 && statusCode !== 409) {
      throw error;
    }
  }

  nitroSession = await loginByCredentials(event, credentials);
  nitroBootstrapDone = true;
};

export const getNitroAccessToken = async (event?: H3Event, forceRefresh = false) => {
  if (!forceRefresh && isSessionValid(nitroSession)) {
    return nitroSession.accessToken;
  }

  const credentials = getServiceCredentials();
  nitroSession = await loginByCredentials(event, credentials);
  return nitroSession.accessToken;
};

export const callFastApiAsNitro = async <T>(
  event: H3Event,
  path: string,
  options: FetchOptions<'json'> = {},
): Promise<T> => {
  const requestWithToken = async (token: string) => {
    const headers = new Headers(options.headers as HeadersInit | undefined);
    headers.set('Authorization', `Bearer ${token}`);

    return await $fetch<T>(buildUrl(event, path), {
      ...options,
      headers,
    });
  };

  try {
    const token = await getNitroAccessToken(event);
    return await requestWithToken(token);
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode !== 401) throw error;

    const token = await getNitroAccessToken(event, true);
    return await requestWithToken(token);
  }
};

export const loginUser = async (event: H3Event, credentials: Credentials) => {
  return await loginByCredentials(event, credentials);
};

export const registerUser = async (event: H3Event, credentials: Credentials) => {
  return await registerByCredentials(event, credentials);
};

export const refreshUser = async (event: H3Event, refreshToken: string) => {
  return await refreshByToken(event, refreshToken);
};
