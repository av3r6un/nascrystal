<template>
  <div class="socials wp-px0">
    <div class="socials_title">
      {{ t('blocks.socials.title') }}
    </div>
    <div class="socials_description">
      {{ t('blocks.socials.info') }}
    </div>
    <div class="socials_links">
      <a
        v-for="(ct, social) in settings.socials"
        :key="social"
        :href="ct.link"
        class="base_link socials_links-link"
      >
        <Icon :name="`nsc:${social}`" :size="24" />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const settings = useSettings();
</script>

<style lang="scss" scoped>
.socials{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  &_title{
    font-family: $title-font;
    font-size: 30px;
    font-weight: 600;
    color: $brown;
  }
  &_description{
    max-width: 420px;
    text-align: center;
    color: $light-brown;
  }
  &_links{
    display: flex;
    gap: 20px;
    &-link{
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
</style>
