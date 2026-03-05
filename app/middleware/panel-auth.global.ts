import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const isPanelRoute = to.path.startsWith('/panel');
  const isLoginRoute = to.path === '/panel/login';

  if (!isPanelRoute || isLoginRoute) return;
  if (import.meta.server) return;

  const auth = useAuthStore();
  const ok = await auth.ensureValidAccessToken();
  if (!ok) {
    return navigateTo('/panel/login', {
      replace: true,
      query: { from: to.fullPath },
    });
  }
});
