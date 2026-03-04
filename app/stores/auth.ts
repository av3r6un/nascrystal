type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const AUTH_STORAGE_KEY = 'panel_auth_session';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('');
  const refreshToken = ref('');
  const expiresAt = ref(0);
  const hydrated = ref(false);

  const isAuthenticated = computed(() => {
    if (!accessToken.value) return false;
    if (!expiresAt.value) return true;
    return Date.now() < expiresAt.value;
  });

  const hydrate = () => {
    if (!import.meta.client || hydrated.value) return;
    hydrated.value = true;

    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return;

    try {
      const parsed = JSON.parse(rawSession) as Partial<AuthSession>;
      if (
        typeof parsed.accessToken !== 'string'
        || typeof parsed.refreshToken !== 'string'
        || typeof parsed.expiresAt !== 'number'
      ) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      accessToken.value = parsed.accessToken;
      refreshToken.value = parsed.refreshToken;
      expiresAt.value = parsed.expiresAt;
    }
    catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const setSession = (session: AuthSession) => {
    accessToken.value = session.accessToken;
    refreshToken.value = session.refreshToken;
    expiresAt.value = session.expiresAt;

    if (import.meta.client) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  };

  const clearSession = () => {
    accessToken.value = '';
    refreshToken.value = '';
    expiresAt.value = 0;

    if (import.meta.client) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = async (email: string, password: string) => {
    const session = await $fetch<AuthSession>('/_nuxt/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    setSession(session);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token',
      });
    }

    const session = await $fetch<AuthSession>('/_nuxt/auth/refresh', {
      method: 'POST',
      body: { refreshToken: refreshToken.value },
    });

    setSession(session);
  };

  const ensureValidAccessToken = async () => {
    hydrate();

    if (!refreshToken.value) {
      clearSession();
      return false;
    }

    const isAccessValid = !!accessToken.value && (!expiresAt.value || Date.now() < (expiresAt.value - 5000));
    if (isAccessValid) return true;

    try {
      await refreshAccessToken();
      return true;
    }
    catch {
      clearSession();
      return false;
    }
  };

  const authHeader = computed(() => {
    return accessToken.value
      ? { Authorization: `Bearer ${accessToken.value}` }
      : {};
  });

  const logout = () => {
    clearSession();
  };

  return {
    accessToken,
    refreshToken,
    expiresAt,
    isAuthenticated,
    hydrate,
    login,
    refreshAccessToken,
    ensureValidAccessToken,
    authHeader,
    logout,
  };
});
