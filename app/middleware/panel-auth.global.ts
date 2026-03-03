import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const isPanelRoute = to.path.startsWith('/panel');
  const isLoginRoute = to.path === '/panel/login';

  if (!isPanelRoute || isLoginRoute) return;
  if (import.meta.server) return;

  const auth = useAuthStore();
  return auth.ensureValidAccessToken().then((ok) => {
    if (!ok) {
      return navigateTo('/panel/login');
    }
  });
});
