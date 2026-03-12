<template>
  <article class="static" :class="finalSlug">
    <div class="static_title base_title">
      {{ page.title }}
    </div>
    <div v-if="page.description" class="static_description">
      {{ page.description }}
    </div>
    <div v-if="hasContent" class="static_content">
      <CmsBlockRenderer :blocks="pageBlocks" :parent="finalSlug" />
    </div>
    <div v-else class="static_content error">
      {{ page.error }}
      <NuxtLink to="/" class="base_link btn_submit big">
        {{ $t('error.go_home') }}
      </NuxtLink>
    </div>
  </article>
</template>

<script lang="ts" setup>
const { locale, t } = useI18n();
const route = useRoute();
const finalSlug = computed(() => route.params.slug ? route.params.slug.join('.') : 'static');
const staticPageKey = computed(() => `static-page-${finalSlug.value}-${locale.value}`);

const fallBack = {
  title: t('error.not_found'),
  description: null,
  meta_title: t('error.not_found'),
  meta_description: null,
  og_image: null,
};

const { data } = await useAsyncData<Record<string, unknown>>(
  staticPageKey,
  () => $fetch(`/internal/static/${finalSlug.value}`, {
    params: { locale: locale.value },
  }),
  {
    default: () => fallBack,
    watch: [finalSlug, locale],
  },
);
const page = computed(() => data.value ?? fallBack);

const hasContent = computed(() => Boolean(page.value?.content));
const pageBlocks = computed(() => page.value?.content?.blocks ?? []);
</script>

<style lang="scss" scoped>
.static{
  padding: 112px 0;
  &_description{
    text-align: center;
    font-size: 20px;
    text-align: center;
    color: $light-brown;
    max-width: 670px;
    margin: 0 auto;
    margin-top: 23px;
    @media screen {
      @media (max-width: 680px) {
        padding: 0 20px;
      }
    }
  }
  &_content{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px64;
    &.error{
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 103px 32px;
      .btn_submit{
        margin-top: 10px;
      }
    }
  }
}
</style>
