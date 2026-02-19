<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const locale = 'ru';
const route = useRoute();
const config = useRuntimeConfig();
const appConfig = useAppConfig();
const seo = appConfig.seo as {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
};

const canonical = computed(() => `${config.public.siteUrl}${route.path}`);
const pageKey = computed(() => route.meta.pageKey);
const { t, te } = useI18n();

const title = computed(() => t(`navbar.${pageKey.value}`) || t('default.loading'));
const descr = computed(() => te(`${pageKey.value}_page.description`)
  ? t(`${pageKey.value}_page.description`)
  : seo.defaultDescription);

useHead({
  htmlAttrs: { lang: locale },
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  title: () => title.value,
});

useSeoMeta({
  title: () => title.value,
  ogTitle: () => `${title.value} | NAS Crystal`,
  description: () => descr.value,
  ogDescription: () => descr.value,
  ogType: 'website',
  ogUrl: canonical.value,
  ogImage: seo.ogImage,
});
</script>
