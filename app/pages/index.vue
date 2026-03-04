<template>
  <article class="index">
    <div v-if="!page.content" class="index_error">
      {{ t('index_page.error') }}
    </div>
    <div v-else class="index_page">
      <div v-for="(b, idx) in page.content?.blocks" :key="idx" class="block">
        <div v-for="(content, name, i) in b" :key="i" :class="`index_${name}_wrapper`">
          <div v-if="name === 'hero'" class="index_banner">
            <img :src="content.image" alt="banner" class="base_image banner">
            <div class="index_banner-hero__wrapper">
              <div class="index_banner-hero">
                <div class="index_banner-title">
                  {{ content.title }}
                </div>
                <p class="index_banner-info">
                  {{ content.subtitle }}
                </p>
                <NuxtLink to="/catalog" class="base_link index_banner-cta">{{ content.button_text }}</NuxtLink>
              </div>
            </div>
          </div>
          <div v-else-if="name === 'benefits'" class="index_benefits">
            <div v-for="(benefit, index) in content" :key="index" class="index_benefits-benefit">
              <BulletCard :title="benefit.title ?? benefit.text ?? ''" :icon="benefit.icon" :info="benefit.caption" />
            </div>
          </div>
          <div v-else-if="name === 'about'" class="index_about">
            <div class="index_about-wrapper">
              <div class="index_about-image">
                <img
                  v-if="content.image"
                  :src="content.image"
                  class="base_link"
                >
                <div v-else class="index_about-image__blank">
                  <Icon name="nsc:diamond" :size="64" />
                </div>
              </div>
              <div class="index_about-info">
                <div class="index_about-title">
                  {{ content.title }}
                </div>
                <p class="index_about-story">
                  {{ content.description }}
                </p>
                <NuxtLink to="/about" class="index_about-cta base_link">
                  {{ content.button_text }}
                </NuxtLink>
              </div>
            </div>
          </div>
          <div v-else-if="name === 'show_categories'" class="index_categories">
            <div class="index_categories-title">
              {{ $t('categories.title') }}
            </div>
            <div class="index_categories-wrapper">
              <div v-for="(c, in_) in $tm('categories.list')" :key="in_" class="index_categories-category">
                <BulletCard
                  v-if="rt(c.title)"
                  :title="rt(c.title)"
                  :info="rt(c.info)"
                  :icon="rt(c.icon)"
                  reversed
                />
              </div>
            </div>
          </div>
          <div v-else-if="name === 'show_socials'" class="index_socials">
            <div class="index_socials-title">
              {{ $t('index_socials.title') }}
            </div>
            <div class="index_socials-description">
              {{ $t('index_socials.info') }}
            </div>
            <div class="index_socials-links">
              <a v-for="(link, linkidx) in $tm('index_socials.links')" :key="linkidx" :href="`${t(rt(link.selector))}`" class="base_link social_link">
                <Icon :name="`nsc:${rt(link.icon)}`" :size="24" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  alias: ['/home'],
  pageKey: 'home',
});

const { locale, t, rt } = useI18n();

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
