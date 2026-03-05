import type { AppSettings } from '~/plugins/settings';

declare module '#app' {
  interface NuxtApp {
    $settings: Readonly<Ref<AppSettings>>;
    $settingsLoaded: Readonly<Ref<boolean>>;
    $refreshSettings: () => Promise<AppSettings>;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $settings: Readonly<Ref<AppSettings>>;
    $settingsLoaded: Readonly<Ref<boolean>>;
    $refreshSettings: () => Promise<AppSettings>;
  }
}

export {};
