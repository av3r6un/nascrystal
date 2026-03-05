<template>
  <div class="empty">
    <div class="empty_title">
      {{ $t('panel.empty_page') }}
    </div>
    <div class="empty_action">
      <a href="/panel" class="base_link btn btn_submit">
        {{ $t('error.go_home') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  pageKey: 'purchases',
  layout: 'panel',
});
</script>

<style>

</style>
