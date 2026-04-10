<template>
  <article class="settings">
    <div class="settings_title base_title">
      {{ t('panel.settings.title') }}
    </div>
    <div class="settings_body">
      <div v-if="isClient && pending" class="settings_state">
        Loading...
      </div>
      <div v-else-if="isClient && error" class="settings_state">
        Failed to load settings
      </div>
      <div class="settings_body-row">
        <form class="settings_section panel_section" @submit.prevent="saveGeneral">
          <div class="settings_section-title">
            {{ t('panel.settings.general') }}
          </div>
          <CmsElementsInput
            v-model="settings.general.site_name"
            name="panel.settings.site_name"
            required
          />
          <CmsElementsImage
            v-model="settings.general.logo_url"
            name="panel.settings.logo"
            :caption="t('panel.img_placeholder_caption')"
          />
          <button type="submit" class="btn btn_submit">
            {{ t('panel.submit') }}
          </button>
        </form>
        <form class="settings_section panel_section" @submit.prevent="saveSocials">
          <div class="settings_section-title">
            {{ t('panel.settings.socials') }}
          </div>
          <CmsElementsEntity
            v-model="settings.socials.telegram"
            :name="t('panel.settings.tg_channel')"
            required
          />
          <CmsElementsEntity
            v-model="settings.socials.instagram"
            :name="t('panel.settings.instagram')"
          />
          <CmsElementsEntity
            v-model="settings.socials.max"
            :name="t('panel.settings.max')"
          />
          <button type="submit" class="btn btn_submit">
            {{ t('panel.submit') }}
          </button>
        </form>
      </div>
      <div class="settings_body-row">
        <form class="settings_section panel_section" @submit.prevent="saveContacts">
          <div class="settings_section-title">
            {{ t('panel.settings.contacts') }}
          </div>
          <CmsElementsInputList
            v-model="settings.contacts.phones"
            placeholder="+79000000000"
            :name="t('panel.settings.phones')"
          />
          <CmsElementsInputList
            v-model="settings.contacts.emails"
            type="email"
            :name="t('panel.settings.email')"
          />
          <CmsElementsInput
            v-model="settings.contacts.whatsapp"
            type="text"
            name="panel.settings.whatsapp"
          />
          <CmsElementsInput
            v-model="settings.contacts.address"
            type="text"
            name="panel.settings.address"
          />
          <button type="submit" class="btn btn_submit">
            {{ t('panel.submit') }}
          </button>
        </form>
        <form class="settings_section panel_section" @submit.prevent="saveMeta">
          <div class="settings_section-title">
            {{ t('panel.settings.seo') }}
          </div>
          <CmsElementsInput
            v-model="settings.seo.title"
            name="panel.settings.meta_title"
          />
          <CmsElementsInput
            v-model="settings.seo.description"
            name="panel.settings.meta_description"
          />
          <CmsElementsImage
            v-model="settings.seo.og_image"
            name="panel.settings.og_image"
          />
          <button type="submit" class="btn btn_submit">
            {{ t('panel.submit') }}
          </button>
        </form>
      </div>
      <div class="settings_body-row">
        <form class="settings_section panel_section" @submit.prevent="saveMap">
          <div class="settings_section-title">
            {{ t('panel.settings.map') }}
          </div>
          <CmsElementsInput
            v-model="settings.map.link"
            name="panel.settings.map_link"
          />
          <button type="submit" class="btn btn_submit">
            {{ t('panel.submit') }}
          </button>
        </form>
        <div class="settings_body-column">
          <div class="settings_section panel_section limit">
            <div class="settings_section-left">
              <div class="settings_section-title">
                {{ t('panel.settings.products_page_limit') }}
              </div>
              <div class="settings_section-caption">
                {{ t('panel.settings.products_page_caption') }}
              </div>
            </div>
            <div class="settings_section-right">
              <PanelSelection
                v-model="settings.products_page_limit"
                :options="pageLimitOptions"
                placeholder="panel.settings.limit_placeholder"
              />
            </div>
          </div>
          <div class="settings_section panel_section">
            <CmsElementsCheckbox
              v-model="settings.maintenance"
              title="panel.settings.maintenance"
              description="panel.settings.maintenance_caption"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  pageKey: 'settings',
  layout: 'panel',
});

const { t } = useI18n();
const auth = useAuthStore();
const { $refreshSettings } = useNuxtApp();
const isSaving = ref(false);
const isClient = ref(false);
const isApplyingRemote = ref(false);
const pageLimitOptions = ref(['5', '10', '25', '50', '100']);

onMounted(() => {
  isClient.value = true;
});

type CSettingsPayload = {
  phones: string[];
  emails: string[];
  whatsapp: string;
  address: string;
};

type SSettingsPayload = {
  telegram: {
    link: string;
    text: string;
  };
  instagram: {
    link: string;
    text: string;
  };
  max: {
    link: string;
    text: string;
  };
};
type GSettingsPayload = {
  site_name: string;
  logo_url: string | File | null;
};

type MSettingsPayload = {
  title: string;
  description: string;
  og_image: string | File | null;
};

type NSettingsPayload = {
  link: string;
};

type SettingsPayload = {
  general: GSettingsPayload;
  contacts: CSettingsPayload;
  socials: SSettingsPayload;
  seo: MSettingsPayload;
  map: NSettingsPayload;
  maintenance: boolean;
  products_page_limit: string;
};

const initialForm = (): SettingsPayload => ({
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
    telegram: {
      link: '',
      text: '',
    },
    instagram: {
      link: '',
      text: '',
    },
    max: {
      link: '',
      text: '',
    },
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
  products_page_limit: '',
});

const settings = ref<SettingsPayload>(initialForm());

type SettingsResponse = Record<string, unknown>;

const { data, pending, error, refresh } = await useAsyncData<SettingsResponse>(
  'panel-settings',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return await $fetch('/internal/settings', {
      method: 'GET',
      headers: auth.authHeader,
    });
  },
  {
    server: false,
    default: () => ({}),
  },
);

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

const asSocial = (value: unknown) => {
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

const uploadImageIfNeeded = async (image: string | File | null | undefined) => {
  if (image instanceof File) {
    const formData = new FormData();
    formData.append('file', image);

    const response = await $fetch<{ path: string }>('/internal/upload', {
      method: 'POST',
      body: formData,
      headers: auth.authHeader,
    });

    return response.path;
  }

  if (typeof image === 'string' && image.trim().length > 0) {
    return image;
  }

  return '';
};

watch(data, (value) => {
  isApplyingRemote.value = true;
  const root = asRecord(value) ?? {};
  const generalFromApi = asRecord(parseJsonString(root.general));
  const contactsFromApi = asRecord(parseJsonString(root.contacts));
  const socialsFromApi = asRecord(parseJsonString(root.socials));
  const mapFromApi = asRecord(parseJsonString(root.map));
  const seoFromApi = asRecord(parseJsonString(root.seo));

  settings.value = {
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
    products_page_limit: asString(root.products_page_limit),
  };
  isApplyingRemote.value = false;
}, { immediate: true });

const updateSettings = async (name: string, payload: object | string | boolean) => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    await $fetch(`/internal/settings/${name}`, {
      method: 'POST',
      body: { value: payload },
      headers: auth.authHeader,
    });

    await refresh();
    await $refreshSettings();
  }
  catch (e) {
    console.error('Failed to save settings', e);
  }
  finally {
    isSaving.value = false;
  }
};

const saveGeneral = async () => {
  const logoUrl = await uploadImageIfNeeded(settings.value.general.logo_url);
  await updateSettings('site_name', settings.value.general.site_name);
  await updateSettings('logo_url', logoUrl);
  settings.value.general.logo_url = logoUrl;
};

const saveSocials = () => updateSettings('socials', settings.value.socials);
const saveContacts = () => updateSettings('contacts', settings.value.contacts);
const saveMap = () => updateSettings('map', settings.value.map);
const saveMeta = async () => {
  const ogImage = await uploadImageIfNeeded(settings.value.seo.og_image);
  await updateSettings('seo', {
    ...settings.value.seo,
    og_image: ogImage,
  });
  settings.value.seo.og_image = ogImage;
};

watch(() => settings.value.maintenance, (next, prev) => {
  if (next === prev) return;
  if (isApplyingRemote.value) return;
  if (pending.value) return;
  void updateSettings('maintenance', next);
});

watch(() => settings.value.products_page_limit, (next, prev) => {
  if (next === prev) return;
  if (isApplyingRemote.value) return;
  if (pending.value) return;
  void updateSettings('products_page_limit', next);
});
</script>

<style lang="scss" scoped>
.settings{
  &_state{
    color: $light-brown;
    padding: 6px 0;
  }
  &_body{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    width: 100%;
    &-row{
      width: 100%;
      display: flex;
      align-items: flex-start;
      gap: 32px;
      @media screen {
        @media (max-width: 1100px) {
          flex-direction: column;
        }
      }
    }
    &-column{
      display: flex;
      flex-direction: column;
      width: 50%;
      gap: 12px;
      .settings_section{
        width: 100%;
      }
    }
  }
  &_section{
    width: 50%;
    @media (max-width: 1100px) {
      width: 100%;
    }
    &-title{
      font: 600 20px $title-font;
      color: $brown;
    }
    &.limit{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .settings_section-title{
        font-size: 22px;
      }
      .settings_section-caption{
        font-size: 15px;
        color: $light-brown;
      }
      align-items: center;
    }
  }
}
</style>
