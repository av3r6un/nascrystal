<template>
  <NuxtLayout name="undef">
    <article class="error">
      <h1 class="enourmous">
        {{ error.statusCode }}
      </h1>
      <span>{{ $t(`error.${error?.statusCode}`) }}</span>
      <NuxtLink to="/" class="base_link btn_submit big">
        {{ $t('error.go_home') }}
      </NuxtLink>
    </article>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { NuxtError } from '#app';

const props = defineProps({
  error: Object as () => NuxtError,
});
</script>

<style lang="scss" scoped>
.error{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 48px;
  span{
    font-size: 64px;
    font-family: $text-font;
    font-weight: 300;
    color: $light-brown;
  }
}
</style>
