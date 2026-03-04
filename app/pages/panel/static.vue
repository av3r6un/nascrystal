<template>
  <article class="panel_static">
    <div class="panel_static-title base_title">
      {{ t('panel.navbar.static_pages') }}
    </div>
    <PanelSelector v-model="selectedPage" :items="pages" show-add add-slug="new" />
    <div v-if="isClient && pending" class="panel_static-state">
      Loading...
    </div>
    <div v-else-if="isClient && error" class="panel_static-state">
      Failed to load static pages
    </div>
    <div class="panel_static-body">
      <PanelPageEditor v-model="pageItem" @save="savePage" />
    </div>
  </article>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  pageKey: 'static_pages',
  layout: 'panel',
});

const { t, locale } = useI18n();
const auth = useAuthStore();
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

const { data, pending, error, refresh } = await useAsyncData<Record<string, unknown>>(
  'panel-static-pages',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return await $fetch('/internal/static', {
      params: { locale: locale.value },
      headers: auth.authHeader,
    });
  },
  {
    server: false,
    watch: [locale],
    default: () => ({}),
  },
);
type StaticItem = {
  slug?: string;
  title?: string;
  [key: string]: unknown;
};

type PageItem = {
  id: number;
  status: string;
  locale: string;
  slug: string;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  og_image: string | File | null;
  content?: unknown;
};

const items = computed<PageItem[]>(() => (data.value?.items ?? []) as PageItem[]);

const pages = computed<Record<string, string>>(() => {
  const items = (data.value?.items ?? []) as StaticItem[];

  return items.reduce<Record<string, string>>((acc, item) => {
    if (item.slug !== 'home') {
      if (typeof item.slug !== 'string' || !item.slug) return acc;
      if (typeof item.title !== 'string' || !item.title) return acc;

      acc[item.slug] = item.title;
    }
    return acc;
  }, {});
});

const selectedPage = ref<string | null>(null);

const initialForm = () => ({
  id: null,
  status: 'draft',
  locale: locale.value,
  slug: '',
  title: '',
  description: null,
  meta_title: '',
  meta_description: null,
  og_image: null,
  content: null as unknown,
});

const mapItemToForm = (item: PageItem) => ({
  id: item.id ?? '',
  status: item.status ?? 'draft',
  locale: item.locale ?? locale.value,
  slug: item.slug ?? '',
  title: item.title ?? '',
  description: item.description ?? '',
  meta_title: item.meta_title ?? '',
  meta_description: item.meta_description ?? '',
  og_image: item.og_image ?? '',
  content: item.content ?? null,
});

const pageItem = ref(initialForm());
const isSaving = ref(false);

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

  return null;
};

watch([selectedPage, items], ([slug, allItems]) => {
  if (!slug || slug === 'new') {
    pageItem.value = initialForm();
    return;
  }

  const item = allItems.find(p => p.slug === slug);
  pageItem.value = item ? mapItemToForm(item) : initialForm();
}, { immediate: true });

const savePage = async () => {
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

    const ogImage = await uploadImageIfNeeded(pageItem.value.og_image);
    const payload = {
      ...pageItem.value,
      og_image: ogImage,
    };

    await $fetch('/internal/static', {
      method: 'POST',
      body: payload,
      headers: auth.authHeader,
    });

    pageItem.value.og_image = ogImage;
    await refresh();
  }
  catch (e) {
    console.error('Failed to save static page', e);
  }
  finally {
    isSaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.panel_static{
  max-width: 1024px;
  &-state{
    margin-top: 16px;
    color: $light-brown;
  }
  &-body{
    margin-top: 20px;
  }
  // &-json{
  //   margin-top: 16px;
  //   padding: 12px;
  //   border-radius: 8px;
  //   border: 1px solid $semi-grey;
  //   background: $light-pink;
  //   overflow: auto;
  // }
}
</style>
