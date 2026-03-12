<template>
  <article class="home">
    <div class="home_title base_title">
      {{ t('panel.main_page') }}
    </div>
    <div class="home_body">
      <div v-if="pending" class="home_state">
        Loading...
      </div>
      <div v-else-if="error" class="home_state">
        Failed to load home page
      </div>
      <div v-else class="home_body-row">
        <CmsMetaEditor v-model="metaContent" />
        <PanelBlockEditor :model-value="blocks" @update:model-value="updateContent" />
      </div>
      <button type="button" class="btn btn_submit" :disabled="pending || isSaving || !data" @click="savePage">
        {{ t('panel.submit') }}
      </button>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  pageKey: 'main_page',
  layout: 'panel',
});

const { t, locale } = useI18n();
const auth = useAuthStore();
type ImageLike = string | File | null | undefined;

type HomePagePayload = {
  id: number | null;
  title: string;
  slug: string;
  locale: string;
  status: string;
  description: string;
  meta_title: string;
  meta_description: string | null;
  og_image: ImageLike;
  content: {
    blocks: Array<Record<string, unknown>>;
  };
};

const createInitialForm = (): HomePagePayload => ({
  id: null,
  title: t('editor.home_title'),
  slug: 'home',
  locale: locale.value,
  status: 'published',
  description: '',
  meta_title: '',
  meta_description: null,
  og_image: null,
  content: {
    blocks: [],
  },
});
const initialForm = ref<HomePagePayload>(createInitialForm());

const normalizePayload = (value?: Partial<HomePagePayload> | null): HomePagePayload => ({
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

const { data, pending, error, refresh } = await useAsyncData<HomePagePayload>(
  'panel-home-page',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    const response = await $fetch<Partial<HomePagePayload>>('/internal/static/home', {
      params: { locale: locale.value },
      headers: auth.authHeader,
    });
    return normalizePayload(response);
  },
  {
    server: false,
    watch: [locale],
    default: () => createInitialForm(),
  },
);
const blocks = ref<Array<Record<string, unknown>>>([]);
const isSaving = ref(false);
watch(
  () => data.value.content.blocks,
  (next) => { blocks.value = Array.isArray(next) ? [...next] : []; },
  { immediate: true },
);

const updateContent = (newContent: Array<Record<string, unknown>>) => {
  blocks.value = [...newContent];
  data.value.content.blocks = [...newContent];
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

    const ogImage = await uploadImageIfNeeded(data.value.og_image);
    const contentWithUploads = await uploadFilesDeep({ blocks: blocks.value });
    const payload: HomePagePayload = {
      ...data.value,
      locale: locale.value,
      og_image: ogImage,
      content: contentWithUploads as HomePagePayload['content'],
    };
    await $fetch('/internal/static', {
      method: 'POST',
      body: payload,
      headers: auth.authHeader,
    });

    data.value.og_image = ogImage;
    data.value.content = payload.content;
    blocks.value = [...payload.content.blocks];
    await refresh();
  }
  catch (e) {
    console.error('Failed to save home page', e);
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
      description: { comp: 'Input', value: data.value.description },
      meta_title: { comp: 'Input', value: data.value.meta_title },
      meta_description: { comp: 'Input', value: data.value.meta_description },
      og_image: { comp: 'Image', value: data.value.og_image, caption: 'panel.img_placeholder_caption', name: 'panel.img_placeholder' },
    };
  },
  set: (val) => {
    data.value = {
      ...data.value,
      description: extractMetaValue<string>(val, 'description', data.value.description),
      meta_title: extractMetaValue<string>(val, 'meta_title', data.value.meta_title),
      meta_description: extractMetaValue<string | null>(val, 'meta_description', data.value.meta_description),
      og_image: extractMetaValue<ImageLike>(val, 'og_image', data.value.og_image),
    };
  },
});
</script>

<style lang="scss" scoped>
.home{
  &_state{
    color: $light-brown;
    padding: 6px 0;
  }
  &_body{
    .btn_submit{
      margin-top: 32px;
    }
    &-row{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }
}
</style>
