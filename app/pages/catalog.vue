<template>
  <article class="catalog">
    <div class="catalog_wrapper">
      <div class="catalog_title base_title a-left">
        {{ $t('navbar.catalog') }}
      </div>
      <div class="catalog_body">
        <div class="warning">
          {{ $t('catalog.warning') }}
        </div>
        <div class="go_home">
          <NuxtLink to="/" class="base_link btn_submit big">
            {{ $t('error.go_home') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'catalog',
});
</script>

<style lang="scss" scoped>
.catalog{
  padding: 112px 0;
  &_wrapper{
    max-width: $wrapper-width;
    margin: $wrapper-pos;
    padding: $wrapper-px0;
  }
  &_body{
    margin: 48px 0 150px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    .warning{
      text-align: center;
      margin-bottom: 15px;
      color: $light-brown;
    }
    .btn_submit.big{
      padding: 0 14px;
      box-sizing: border-box;
    }
  }
}
</style>
