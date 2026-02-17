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
}

const canonical = computed(() => `${config.public.siteUrl}${route.path}`);
useHead({
  htmlAttrs: { lang: locale },
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
});

useSeoMeta({
  title: seo.defaultTitle,
  ogTitle: seo.defaultTitle,
  description: seo.defaultDescription,
  ogDescription: seo.defaultDescription,
  ogType: 'website',
  ogUrl: canonical.value,
  ogImage: seo.ogImage,
});
</script>
