<template>
  <article class="about">
    <StaticRender :page="page" />
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'about',
});
const { locale, t, te } = useI18n();

const fallbackPage = {
  title: t('about_page.title'),
  description: t('about_page.description'),
  meta_title: t('about_page.title'),
  meta_description: t('about_page.description'),
  og_image: te('about_page.image') ? t('about_page.image') : null,
  content: null,
  error: t('about_page.error'),
};

const { data } = await useAsyncData<Record<string, unknown>>(
  'static-about',
  () => $fetch('/internal/static/about', {
    params: { locale: locale.value },
  }),
  {
    default: () => fallbackPage,
    watch: [locale],
  },
);

const page = computed(() => data.value ?? fallbackPage);
</script>
