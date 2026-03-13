type SocialValue = {
  link: string;
  text: string;
};

export type AppSettings = {
  general: {
    site_name: string;
    logo_url: string;
  };
  contacts: {
    phones: string[];
    emails: string[];
    whatsapp: string;
    address: string;
  };
  socials: {
    telegram: SocialValue;
    instagram: SocialValue;
    max: SocialValue;
  };
  seo: {
    title: string;
    description: string;
    og_image: string;
  };
  map: {
    link: string;
  };
  maintenance: boolean;
};

const initialSettings = (): AppSettings => ({
  general: {
    site_name: '',
    logo_url: '',
  },
  contacts: {
    phones: [''],
    emails: [''],
    whatsapp: '',
    address: '',
  },
  socials: {
    telegram: { link: '', text: '' },
    instagram: { link: '', text: '' },
    max: { link: '', text: '' },
  },
  seo: {
    title: '',
    description: '',
    og_image: '',
  },
  map: {
    link: '',
  },
  maintenance: false,
});

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
};

const parseJsonString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as unknown;
  }
  catch {
    return value;
  }
};

const asString = (value: unknown, fallback = '') => {
  return typeof value === 'string' ? value : fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [''];
  const normalized = value.filter(item => typeof item === 'string') as string[];
  return normalized.length > 0 ? normalized : [''];
};

const asSocial = (value: unknown): SocialValue => {
  const item = asRecord(parseJsonString(value));
  return {
    link: asString(item?.link),
    text: asString(item?.text),
  };
};

const asBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
};

const normalizeSettings = (value: unknown): AppSettings => {
  const root = asRecord(value) ?? {};
  const generalFromApi = asRecord(parseJsonString(root.general));
  const contactsFromApi = asRecord(parseJsonString(root.contacts));
  const socialsFromApi = asRecord(parseJsonString(root.socials));
  const seoFromApi = asRecord(parseJsonString(root.seo));
  const mapFromApi = asRecord(parseJsonString(root.map));

  return {
    general: {
      site_name: asString(generalFromApi?.site_name ?? root.site_name),
      logo_url: asString(generalFromApi?.logo_url ?? root.logo_url),
    },
    contacts: {
      phones: asStringArray(parseJsonString(contactsFromApi?.phones)),
      emails: asStringArray(parseJsonString(contactsFromApi?.emails)),
      whatsapp: asString(contactsFromApi?.whatsapp),
      address: asString(contactsFromApi?.address),
    },
    socials: {
      telegram: asSocial(socialsFromApi?.telegram),
      instagram: asSocial(socialsFromApi?.instagram),
      max: asSocial(socialsFromApi?.max),
    },
    seo: {
      title: asString(seoFromApi?.title),
      description: asString(seoFromApi?.description),
      og_image: asString(seoFromApi?.og_image),
    },
    map: {
      link: asString(mapFromApi?.link),
    },
    maintenance: asBoolean(root.maintenance),
  };
};

export default defineNuxtPlugin(async () => {
  const settings = useState<AppSettings>('global-settings', initialSettings);
  const loaded = useState<boolean>('global-settings-loaded', () => false);

  const refreshSettings = async () => {
    try {
      const payload = await $fetch<Record<string, unknown>>('/internal/settings', {
        method: 'GET',
      });
      settings.value = normalizeSettings(payload);
      loaded.value = true;
    }
    catch (error) {
      console.error('Failed to load global settings', error);
    }

    return settings.value;
  };

  if (!loaded.value) {
    await refreshSettings();
  }

  return {
    provide: {
      settings: readonly(settings),
      settingsLoaded: readonly(loaded),
      refreshSettings,
    },
  };
});
