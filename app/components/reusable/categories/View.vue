<template>
  <div class="categories">
    <div class="categories_title">
      {{ t('blocks.categories.title') }}
    </div>
    <div class="categories_wrapper wp-px0">
      <div v-for="(c, idx) in categories?.list" :key="idx" class="categories_category">
        <div class="categories_category-wrapper">
          <div class="categories_category-icon">
            <Icon :name="`nsc:${c.icon}`" :size="24" />
          </div>
          <div class="categories_category-title">
            {{ c.title }}
          </div>
          <div class="categories_category-info">
            {{ c.info }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t, tm } = useI18n();
const categories = tm('categories');
</script>

<style lang="scss" scoped>
.categories{
  background: $pinky;
  padding: 112px 0;
  &_title{
    text-align: center;
    font-size: 36px;
    font-family: $title-font;
    margin-bottom: 56px;
    color: $brown;
  }
  &_wrapper{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    align-items: stretch;
    justify-items: center;
    gap: 24px;
    @media (max-width: 1180px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
  &_category{
    &-wrapper{
      width: 286px;
      height: 200px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0 36px;
      box-sizing: border-box;
      background: $white;
    }
    &-icon{
      margin-bottom: 20px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $pinky;
    }
    &-title{
      color: $brown;
      font-family: $title-font;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    &-info{
      color: $light-brown;
      font-size: 14px;
      text-align: center;
    }
  }
}
</style>
