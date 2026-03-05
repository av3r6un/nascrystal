<template>
  <div class="panel_wrapper">
    <PanelMenu v-if="showPanelChrome" class="panel_menu" />
    <PanelHeader v-if="showPanelChrome" class="panel_header" />
    <main class="panel_content" :class="{ only_login: isSystemPage || hideProtectedContent }">
      <div v-if="hideProtectedContent" class="panel_loading" />
      <slot v-else />
    </main>
    <PanelMobileMenu v-if="showPanelChrome" class="panel_mobile-menu" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const { locale, t } = useI18n();
const pageKey = computed(() => route.meta.pageKey);
const normalizedPath = computed(() => route.path.replace(/\/+$/, ''));
const isSystemPage = computed(() => {
  if (normalizedPath.value.startsWith('/panel/login')) return true;
  return `${pageKey.value ?? ''}` === 'login';
});
const isProtectedPanelRoute = computed(() => route.path.startsWith('/panel') && !isSystemPage.value);
const panelAuthPending = useState<boolean>(
  'panel-auth-pending',
  () => isProtectedPanelRoute.value,
);
const hideProtectedContent = computed(() => isProtectedPanelRoute.value && panelAuthPending.value);
const showPanelChrome = computed(() => !isSystemPage.value && !hideProtectedContent.value);

const title = computed(() => t(`panel.navbar.${pageKey.value}`) || t('default.loading'));
useHead({
  htmlAttrs: { lang: locale },
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  title: () => title.value,
});
</script>

<style lang="scss" scoped>
.panel{
  &_loading{
    min-height: 40vh;
  }
  &_menu{
    position: fixed;
    width: 255px;
    box-sizing: border-box;
    transition: all .4s ease;
    @media screen {
      @media (max-width: 768px) {
        width: 80px;
      }
      @media (max-width: 477px) {
        display: none;
      }
    }
  }
  &_content{
    position: relative;
    left: 255px;
    width: calc(100% - 255px);
    transition: all .4s ease;
    padding: 32px;
    box-sizing: border-box;
    &.only_login{
      left: 0;
      width: 100%;
      top: 0;
    }
    @media (max-width: 768px) {
      left: 80px;
      width: calc(100% - 80px);
    }
    @media (max-width: 477px) {
      left: 0;
      width: 100%;
      max-height: calc(100% - 90px);
      padding-bottom: 90px;
    }
  }
  &_header{
    position: relative;
    left: 255px;
    width: calc(100% - 255px);
    top: 0;
    transition: all .4s ease;
    @media (max-width: 768px) {
      left: 80px;
      width: calc(100% - 80px);
    }
    @media (max-width: 477px) {
      border-left: 0.8px solid $semi-grey;
      left: 0;
      width: 100%;
    }
  }
  &_mobile-menu{
    bottom: -82px;
    position: fixed;
    visibility: hidden;
    width: calc(100% - 50px);
    // bottom: 16px;
    transition: all .4s ease;

    @media (max-width: 477px) {
      bottom: 16px;
      visibility: visible;
    }
    @media (max-width: 390px) {
      width: calc(100% - 32px);
    }
  }
}
</style>
