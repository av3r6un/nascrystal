import type { AppSettings } from '~/plugins/settings';

export const useSettings = () => {
  return useNuxtApp().$settings as Readonly<Ref<AppSettings>>;
};

export const useSettingsLoaded = () => {
  return useNuxtApp().$settingsLoaded as Readonly<Ref<boolean>>;
};

export const useRefreshSettings = () => {
  return useNuxtApp().$refreshSettings as () => Promise<AppSettings>;
};
