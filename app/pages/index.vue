<template>
  <article class="index">
    <div v-if="!page.content" class="index_error">
      {{ t('index_page.error') }}
    </div>
    <div v-else class="index_page">
      <CmsBlockRenderer v-if="page.content?.blocks" :blocks="page.content?.blocks" parent="index" />
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  alias: ['/home'],
  pageKey: 'home',
});

const { locale, t } = useI18n();
const settings = useSettings();

const fallbackPage = {
  title: t('index_page.title'),
  description: t('index_page.description'),
  meta_title: t('index_page.title'),
  meta_description: t('index_page.description'),
  og_image: t('index_page.image'),
  content: null,
  error: t('index_page.error'),
};

const { data } = await useAsyncData<Record<string, unknown>>(
  'static-home',
  () => $fetch('/internal/static/home', {
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
.index{
  &_banner{
    height: 700px;
    position: relative;
    user-select: none;
    .banner{
      position: absolute;
    }
    &:before{
      position: absolute;
      content: '';
      height: 100%;
      width: 100%;
      background: $blur;
      z-index: 1;
      backdrop-filter: blur(3px);
    }
    &-hero{
      height: 100%;
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 23px;
      &__wrapper{
        height: 100%;
        max-width: $wrapper-width;
        margin: $wrapper-pos;
        padding: $wrapper-px0;
      }
      @media (max-width: 500px) {
        align-items: center;
      }
    }
    &-title{
      font-family: $title-font;
      color: $brown;
      font-size: 60px;
      max-width: 600px;
      @media (max-width: 575px) {
        font-size: 40px;
      }
      @media (max-width: 500px) {
        text-align: center;
      }
    }
    &-info{
      font-size: 18px;
      color: $light-brown;
      text-shadow: 1px 1px 10px rgba(black, 0.3);
      @media (max-width: 500px) {
        text-align: center;
      }
    }
    &-cta{
      padding: 14px 32px;
      border-radius: 8px;
      background: $brown;
      color: $white;
      font-weight: 100;
      box-sizing: border-box;
      text-transform: uppercase;
    }
  }
  &_benefits{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    align-items: stretch;
    justify-items: center;
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
    padding-top: 112px;
    padding-bottom: 112px;
    gap: 24px;
    cursor: default;
    @media (max-width: 1240px) {
      padding-right: 12px;
      padding-left: 12px;
    }
    @media (max-width: 1180px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
  &_categories{
    background: $pinky;
    padding: 112px 0;
    &-title{
      font-family: $title-font;
      font-size: 36px;
      margin-bottom: 56px;
      text-align: center;
      color: $brown;
    }
    &-wrapper{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      align-items: stretch;
      justify-items: center;
      gap: 24px;
      max-width: $wrapper-width;
      margin: $wrapper-pos;
      padding: $wrapper-px0;
      @media (max-width: 1180px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }
  }
  &_about{
    background: $pinky;
    &-wrapper{
      max-width: $wrapper-width;
      margin: $wrapper-pos;
      padding: $wrapper-px0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 48px;
      padding-top: 112px;
      padding-bottom: 112px;
      @media (max-width: 1130px) {
        flex-direction: column;
        padding-top: 64px;
        padding-bottom: 64px;
      }
    }
    &-info{
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: flex-start;
      max-width: 550px;
    }
    &-title{
      font-family: $title-font;
      font-size: 30px;
      font-weight: 600;
      color: $brown;
    }
    &-story{
      color: $light-brown;
      font-size: 16px;
    }
    &-cta{
      color: #B49764;
      text-decoration: underline;
      font-size: 14px;
    }
    &-image{
      width: 584px;
      height: 438px;
      position: relative;
      border-radius: 8px;
      background: $semi-grey;
      &__blank{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        border-radius: inherit;
      }
      @media (max-width: 620px) {
        width: 95%;
        height: auto;
        aspect-ratio: 4 / 3;
      }
    }
  }
  &_socials{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px64;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    &-title{
      font-family: $title-font;
      font-size: 30px;
      font-weight: 600;
      color: $brown
    }
    &-description{
      max-width: 420px;
      text-align: center;
      color: $light-brown;
    }
    &-links{
      display: flex;
      gap: 20px;
      .social_link{
        height: 48px;
        width: 48px;
        border-radius: 8px;
        background: $brown;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
