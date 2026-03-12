<template>
  <article class="panel_static">
    <div class="panel_static-title base_title">
      {{ t('panel.navbar.static_pages') }}
    </div>
    <div v-if="pending" class="panel_static-state">
      Loading...
    </div>
    <div v-else-if="error" class="panel_static-state">
      Failed to load static page
    </div>
    <div v-else class="panel_static-body">
      <PanelSelector v-model="selectedPage" :items="pages" show-add add-slug="new" />
      <CmsMetaEditor v-model="metaContent" />
      <PanelBlockEditor :model-value="blocks" @update:model-value="updateContent" />
      <button type="button" class="btn btn_submit" :disabled="pending || isSaving || !data" @click="savePage">
        {{ t('panel.submit') }}
      </button>
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

type ImageLike = string | File | null | undefined;

type StaticPagePayload = {
  id: number | null;
  title: string;
  slug: string;
  locale: string;
  status: string;
  description: string;
  meta_title: string;
  meta_description: string;
  og_image: ImageLike;
  content: {
    blocks: Array<Record<string, unknown>>;
  };
};
type StaticPagesResponse = {
  items: StaticPagePayload[];
};

const createInitialForm = (): StaticPagePayload => ({
  id: null,
  title: t('panel.static.title'),
  slug: '',
  locale: locale.value,
  status: 'draft',
  description: '',
  meta_title: '',
  meta_description: '',
  og_image: null,
  content: {
    blocks: [],
  },
});
const initialForm = ref<StaticPagePayload>(createInitialForm());

const normalizePayload = (value?: Partial<StaticPagePayload> | null): StaticPagePayload => ({
  ...initialForm.value,
  ...value,
  content: {
    blocks: Array.isArray(value?.content?.blocks)
      ? [...value.content.blocks]
      : [...initialForm.value.content.blocks],
  },
});
const asRecord = (value: unknown): Record<string, unknown> | null => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
};

const { data, pending, error, refresh } = await useAsyncData<StaticPagesResponse>(
  'panel-static-pages',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    const response = await $fetch<Record<string, unknown>>('/internal/static', {
      params: { locale: locale.value },
      headers: auth.authHeader,
    });
    const items = Array.isArray(response.items)
      ? response.items.map(item => normalizePayload(asRecord(item) as Partial<StaticPagePayload>))
      : [];

    return { items };
  },
  {
    server: false,
    watch: [locale],
    default: () => ({ items: [] }),
  },
);

const selectedPage = ref<string | null>('new');
const selectedPageData = ref<StaticPagePayload>(createInitialForm());
const blocks = ref<Array<Record<string, unknown>>>([]);
const isSaving = ref(false);

const items = computed<StaticPagePayload[]>(() => data.value?.items ?? []);

const pages = computed<Record<string, string>>(() => {
  return items.value.reduce<Record<string, string>>((acc, item) => {
    if (item.slug === 'home') return acc;
    if (!item.slug || !item.title) return acc;
    acc[item.slug] = item.title;
    return acc;
  }, {});
});

watch([selectedPage, items], ([slug, allItems]) => {
  if (!slug || slug === 'new') {
    selectedPageData.value = createInitialForm();
    return;
  }

  const current = allItems.find(item => item.slug === slug);
  selectedPageData.value = normalizePayload(current);
}, { immediate: true });

watch(
  () => selectedPageData.value.content.blocks,
  (next) => { blocks.value = Array.isArray(next) ? [...next] : []; },
  { immediate: true },
);

const updateContent = (newContent: Array<Record<string, unknown>>) => {
  blocks.value = [...newContent];
  selectedPageData.value = {
    ...selectedPageData.value,
    content: { blocks: [...newContent] },
  };
};

const uploadImageIfNeeded = async (image: ImageLike) => {
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

  if (typeof image === 'string' && image.trim().length > 0) return image;
  return null;
};
const uploadFilesDeep = async (value: unknown): Promise<unknown> => {
  if (value instanceof File) return await uploadImageIfNeeded(value);
  if (Array.isArray(value)) return await Promise.all(value.map(item => uploadFilesDeep(item)));
  if (typeof value === 'object' && value !== null) {
    const entries = await Promise.all(
      Object.entries(value).map(async ([k, v]) => [k, await uploadFilesDeep(v)] as const),
    );
    return Object.fromEntries(entries);
  }
  return value;
};
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

    const ogImage = await uploadImageIfNeeded(selectedPageData.value.og_image);
    const contentWithUploads = await uploadFilesDeep({ blocks: blocks.value });
    const payload: StaticPagePayload = {
      ...selectedPageData.value,
      locale: locale.value,
      og_image: ogImage,
      content: contentWithUploads as StaticPagePayload['content'],
    };
    await $fetch('/internal/static', {
      method: 'POST',
      body: payload,
      headers: auth.authHeader,
    });

    selectedPageData.value = {
      ...payload,
      og_image: ogImage,
      content: payload.content,
    };
    blocks.value = [...payload.content.blocks];
    if (payload.slug) selectedPage.value = payload.slug;
    await refresh();
  }
  catch (e) {
    console.error('Failed to save static page', e);
  }
  finally {
    isSaving.value = false;
  }
};

const extractMetaValue = <T>(value: unknown, key: string, fallback: T): T => {
  const source = asRecord(value);
  const field = asRecord(source?.[key]);
  const candidate = field?.value;
  return (candidate as T | undefined) ?? fallback;
};

const metaContent = computed({
  get: () => {
    return {
      slug: { comp: 'Input', value: selectedPageData.value.slug },
      title: { comp: 'Input', value: selectedPageData.value.title },
      description: { comp: 'Input', value: selectedPageData.value.description },
      meta_title: { comp: 'Input', value: selectedPageData.value.meta_title },
      meta_description: { comp: 'Input', value: selectedPageData.value.meta_description },
      status: { comp: 'Checkbox', value: selectedPageData.value.status, title: 'panel.static.new.draft', description: 'panel.static.new.draft_caption', states: ['draft', 'published'] },
      og_image: { comp: 'Image', value: selectedPageData.value.og_image, caption: 'panel.img_placeholder_caption', name: 'panel.img_placeholder' },
    };
  },
  set: (val) => {
    selectedPageData.value = {
      ...selectedPageData.value,
      slug: extractMetaValue<string>(val, 'slug', selectedPageData.value.slug),
      title: extractMetaValue<string>(val, 'title', selectedPageData.value.title),
      description: extractMetaValue<string>(val, 'description', selectedPageData.value.description),
      meta_title: extractMetaValue<string>(val, 'meta_title', selectedPageData.value.meta_title),
      meta_description: extractMetaValue<string>(val, 'meta_description', selectedPageData.value.meta_description),
      status: extractMetaValue<string>(val, 'status', selectedPageData.value.status),
      og_image: extractMetaValue<ImageLike>(val, 'og_image', selectedPageData.value.og_image),
    };
  },
});
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
    display: flex;
    flex-direction: column;
    gap: 23px;
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
