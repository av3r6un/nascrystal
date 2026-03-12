<template>
  <div>
    <Header />
    <main class="content">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
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
const fallbackSlug = computed(() => route.params.slug ? route.params.slug.join('.') : 'not_found');
const pageKey = computed(() => route.meta.pageKey ?? fallbackSlug.value);
const { t, te } = useI18n();

const title = computed(() => te(`navbar.${pageKey.value}`) ? t(`navbar.${pageKey.value}`) : t('error.not_found'));
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
