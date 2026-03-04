<template>
  <article class="home">
    <div class="home_title base_title">
      {{ t('panel.main_page.title') }}
    </div>
    <div class="home_body">
      <div class="home_body-row">
        <div class="home_section">
          <div class="home_section-title">
            {{ t('panel.main_page.hero_section') }}
          </div>
          <PanelNamedInput
            v-model="pageInfo.hero.title"
            :name="t('panel.title')"
            type="text"
            required
          />
          <PanelNamedInput
            v-model="pageInfo.hero.subtitle"
            :name="t('panel.subtitle')"
            required
          />
          <PanelNamedInput
            v-model="pageInfo.hero.button_text"
            :name="t('panel.main_page.button_text')"
            required
          />
          <PanelImageForm
            v-model="pageInfo.hero.image"
            :name="t('panel.main_page.background_image')"
            :caption="t('panel.img_placeholder_caption')"
          />
        </div>
        <div class="home_section">
          <div class="home_section-title">
            {{ t('panel.main_page.benefits_title') }}
          </div>
          <div v-for="(b, idx) in pageInfo.benefits" :key="idx" class="benefit_row">
            <PanelBenefitEditor v-model="pageInfo.benefits[idx]" @delete="() => clearBenefit(idx)" />
          </div>
          <div class="home_section-add">
            <button type="button" class="btn btn_add" @click="addBenefit">
              <Icon name="nsc:plus-small" :size="16" />
              {{ t('panel.button_add') }}
            </button>
          </div>
        </div>
      </div>
      <div class="home_body-row">
        <div v-if="isClient && pending" class="home_state">
          Loading...
        </div>
        <div v-else-if="isClient && error" class="home_state">
          Failed to load home page
        </div>
      </div>
      <div class="home_body-row">
        <div class="home_section">
          <div class="home_section-title">
            {{ t('panel.main_page.about') }}
          </div>
          <PanelNamedInput
            v-model="pageInfo.about.title"
            :name="t('panel.title')"
            required
          />
          <PanelNamedInput
            v-model="pageInfo.about.description"
            :name="t('panel.description')"
            required
          />
          <PanelNamedInput
            v-model="pageInfo.about.button_text"
            :name="t('panel.main_page.button_text')"
            required
          />
          <PanelImageForm
            v-model="pageInfo.about.image"
            :name="t('panel.img_placeholder')"
            :caption="t('panel.img_placeholder_caption')"
          />
        </div>
        <div class="home_section meta">
          <div class="home_section-title">
            {{ t('panel.static.forms.metatags') }}
          </div>
          <PanelNamedInput
            v-model="page.meta_title"
            :name="t('panel.title')"
            required
          />
          <PanelNamedInput
            v-model="page.meta_description"
            :name="t('panel.description')"
            required
          />
          <PanelImageForm
            v-model="page.og_image"
            :name="t('panel.img_placeholder')"
            :caption="t('panel.img_placeholder_caption')"
          />
        </div>
      </div>
      <div class="home_body-row">
        <div class="home_section">
          <PanelNamedCheckbox
            v-model="pageInfo.show_popular"
            :states="[true, false]"
            :title="t('panel.main_page.show_popular')"
            :description="t('panel.main_page.show_section_caption')"
          />
        </div>
      </div>
      <div class="home_body-row">
        <div class="home_section">
          <PanelNamedCheckbox
            v-model="pageInfo.show_categories"
            :states="[true, false]"
            :title="t('panel.main_page.show_categories')"
            :description="t('panel.main_page.show_section_caption')"
          />
        </div>
      </div>
      <div class="home_body-row">
        <div class="home_section">
          <PanelNamedCheckbox
            v-model="pageInfo.show_socials"
            :states="[true, false]"
            :title="t('panel.main_page.show_socials')"
            :description="t('panel.main_page.show_section_caption')"
          />
        </div>
      </div>
      <div class="home_body-row">
        <button type="button" class="btn btn_submit" :disabled="isSaving" @click="savePage">
          {{ t('panel.submit') }}
        </button>
      </div>
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
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

type ImageLike = string | File | null | undefined;
type Benefit = { text: string; icon: string; caption: string };
type HomePayload = {
  hero: {
    title: string;
    subtitle: string;
    button_text: string;
    image: ImageLike;
  };
  benefits: Benefit[];
  about: {
    title: string;
    description: string;
    button_text: string;
    image: ImageLike;
  };
  show_popular: boolean;
  show_categories: boolean;
  show_socials: boolean;
};

type HomePagePayload = {
  id: number | null;
  title: string;
  slug: string;
  locale: string;
  status: string;
  description: string;
  meta_title: string;
  meta_desription: string | null;
  og_image: ImageLike;
  content: {
    blocks: Array<Record<string, unknown>>;
  };
};

const initialForm = () => ({
  hero: {
    title: '',
    subtitle: '',
    button_text: '',
    image: null as ImageLike,
  },
  benefits: [
    { text: '', icon: '', caption: '' },
  ],
  about: {
    title: '',
    description: '',
    button_text: '',
    image: null as ImageLike,
  },
  show_popular: false,
  show_categories: true,
  show_socials: true,
});
const pageInfo = ref<HomePayload>(initialForm());
const page = reactive<HomePagePayload>({
  id: null,
  title: t('navbar.home'),
  slug: 'home',
  locale: locale.value,
  status: 'published',
  description: '',
  meta_title: '',
  meta_desription: null,
  og_image: null as ImageLike,
  content: {
    blocks: [],
  },
});
const isSaving = ref(false);

const { data, pending, error, refresh } = await useAsyncData<Record<string, unknown> | null>(
  'panel-home-page',
  async () => {
    const ok = await auth.ensureValidAccessToken();
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return await $fetch('/internal/static/home', {
      params: { locale: locale.value },
      headers: auth.authHeader,
    });
  },
  {
    server: false,
    watch: [locale],
    default: () => null,
  },
);

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
};

const getBlockValue = (blocks: unknown[], key: string) => {
  const block = blocks.find((item) => {
    const record = asRecord(item);
    return !!record && key in record;
  });

  const record = asRecord(block);
  return record?.[key];
};

watch(data, (value) => {
  const item = asRecord(value);
  if (!item) return;

  const content = asRecord(item.content) ?? {};
  const blocks = Array.isArray(content.blocks) ? content.blocks : [];

  const heroRaw = asRecord(getBlockValue(blocks, 'hero') ?? content.hero);
  const aboutRaw = asRecord(getBlockValue(blocks, 'about') ?? content.about);
  const showPopularRaw = getBlockValue(blocks, 'show_popular') ?? content.show_popular;
  const benefitsRaw = getBlockValue(blocks, 'benefits') ?? content.benefits;

  page.id = typeof item.id === 'number' ? item.id : null;
  page.title = typeof item.title === 'string' ? item.title : t('navbar.home');
  page.slug = typeof item.slug === 'string' ? item.slug : 'home';
  page.locale = typeof item.locale === 'string' ? item.locale : locale.value;
  page.status = typeof item.status === 'string' ? item.status : 'published';
  page.description = typeof item.description === 'string' ? item.description : '';
  page.meta_title = typeof item.meta_title === 'string' ? item.meta_title : '';
  page.meta_description = typeof item.meta_description === 'string' ? item.meta_description : null;
  page.og_image = typeof item.og_image === 'string' ? item.og_image : null;

  pageInfo.value.hero = {
    title: typeof heroRaw?.title === 'string' ? heroRaw.title : '',
    subtitle: typeof heroRaw?.subtitle === 'string' ? heroRaw.subtitle : '',
    button_text: typeof heroRaw?.button_text === 'string' ? heroRaw.button_text : '',
    image: typeof heroRaw?.image === 'string' ? heroRaw.image : null,
  };

  pageInfo.value.about = {
    title: typeof aboutRaw?.title === 'string' ? aboutRaw.title : '',
    description: typeof aboutRaw?.description === 'string' ? aboutRaw.description : '',
    button_text: typeof aboutRaw?.button_text === 'string' ? aboutRaw.button_text : '',
    image: typeof aboutRaw?.image === 'string' ? aboutRaw.image : null,
  };

  pageInfo.value.benefits = Array.isArray(benefitsRaw) && benefitsRaw.length > 0
    ? benefitsRaw
        .map(item => asRecord(item))
        .filter((item): item is Record<string, unknown> => !!item)
        .map(item => ({
          text: typeof item.text === 'string' ? item.text : '',
          icon: typeof item.icon === 'string' ? item.icon : '',
          caption: typeof item.caption === 'string' ? item.caption : '',
        }))
    : [{ text: '', icon: '', caption: '' }];

  pageInfo.value.show_popular = typeof showPopularRaw === 'boolean' ? showPopularRaw : false;
}, { immediate: true });

const addBenefit = () => pageInfo.value.benefits.push(initialForm().benefits[0]);

const clearBenefit = (index: number) => pageInfo.value.benefits.splice(index, 1);

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

  if (typeof image === 'string' && image.trim().length > 0) {
    return image;
  }

  return null;
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

    const heroImage = await uploadImageIfNeeded(pageInfo.value.hero.image);
    const aboutImage = await uploadImageIfNeeded(pageInfo.value.about.image);

    const metaOgImage = await uploadImageIfNeeded(page.og_image);
    const blocks: Array<Record<string, unknown>> = [
      {
        hero: {
          ...pageInfo.value.hero,
          image: heroImage,
        },
      },
      {
        benefits: pageInfo.value.benefits.map(item => ({ ...item })),
      },
      {
        show_categories: pageInfo.value.show_categories,
      },
      {
        show_popular: pageInfo.value.show_popular,
      },
      {
        about: {
          ...pageInfo.value.about,
          image: aboutImage,
        },
      },
      {
        show_socials: pageInfo.value.show_socials,
      },
    ];

    const payload: HomePagePayload = {
      ...page,
      og_image: metaOgImage,
      content: {
        blocks,
      },
    };

    await $fetch('/internal/static', {
      method: 'POST',
      body: payload,
      headers: auth.authHeader,
    });

    pageInfo.value.hero.image = heroImage;
    pageInfo.value.about.image = aboutImage;
    page.og_image = metaOgImage;
    await refresh();
  }
  catch (error) {
    console.error('Failed to save home page', error);
  }
  finally {
    isSaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.home{
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
        @media (max-width: 1024px) {
          flex-direction: column;
        }
      }
    }
  }
  &_section{
    width: 50%;
    padding: 23px;
    background: $light-pink;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: 8px;
    border: 1px solid $semi-grey;
    min-width: 326px;
    @media (max-width: 1024px) {
      width: 100%;
    }
    &-title{
      font: 600 20px $title-font;
      color: $brown;
    }
  }
}
</style>
