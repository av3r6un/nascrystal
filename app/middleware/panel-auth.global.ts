import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const isPanelRoute = to.path.startsWith('/panel');
  if (!isPanelRoute) return;

  const normalizedPath = to.path.replace(/\/+$/, '');
  const isLoginRoute = normalizedPath === '/panel/login' || to.meta.system === true;
  const panelAuthPending = useState<boolean>('panel-auth-pending', () => true);
  const auth = useAuthStore();

  if (import.meta.server) {
    panelAuthPending.value = true;
    return;
  }

  panelAuthPending.value = true;

  try {
    const valid = await auth.ensureValidAccessToken();

    if (!isLoginRoute && !valid) {
      return navigateTo({
        path: '/panel/login',
        query: { from: to.fullPath },
        replace: true,
      });
    }

    if (isLoginRoute && valid) {
      const from = `${to.query.from ?? '/panel'}`;
      const target = from.startsWith('/panel') && from.replace(/\/+$/, '') !== '/panel/login'
        ? from
        : '/panel';
      return navigateTo(target, { replace: true });
    }
  }
  finally {
    panelAuthPending.value = false;
  }
});
