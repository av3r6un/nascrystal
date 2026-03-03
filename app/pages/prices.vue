<template>
  <article class="prices">
    <StaticRender :page="page" />
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'prices',
});
const { locale, t, te } = useI18n();

const fallbackPage = {
  title: t('prices_page.title'),
  description: null,
  meta_title: t('prices_page.title'),
  meta_description: t('prices_page.description'),
  og_image: te('prices_page.image') ? t('prices_page.image') : null,
  content: null,
  error: t('prices_page.error'),
};

const { data } = await useAsyncData<Record<string, unknown>>(
  'static-prices',
  () => $fetch('/api/static/prices', {
    params: { locale: locale.value },
  }),
  {
    default: () => fallbackPage,
    watch: [locale],
  },
);

const page = computed(() => data.value ?? fallbackPage);
</script>

<style lang="scss" scoped>
</style>
