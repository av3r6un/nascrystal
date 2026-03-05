import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const isPanelRoute = to.path.startsWith('/panel');
  const isLoginRoute = to.path === '/panel/login';
  const panelAuthPending = useState<boolean>(
    'panel-auth-pending',
    () => isPanelRoute && !isLoginRoute,
  );

  if (!isPanelRoute || isLoginRoute) {
    panelAuthPending.value = false;
    return;
  }
  if (import.meta.server) {
    panelAuthPending.value = true;
    return;
  }

  const auth = useAuthStore();
  panelAuthPending.value = true;

  try {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      return navigateTo('/panel/login', {
        replace: true,
        query: { from: to.fullPath },
      });
    }
  }
  finally {
    panelAuthPending.value = false;
  }
});
